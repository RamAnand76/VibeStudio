// ... (keeping imports)
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, CheckCircle2, 
  Terminal, ChevronDown, ChevronRight, 
  Activity, Zap, Box, History,
  Play, RefreshCw, Wand2,
  MoreHorizontal, Command, AlertCircle, ArrowUp, Loader2,
  GitCommit, GitPullRequest, ArrowRight, RotateCcw, Trash2, Plus, Minimize2,
  Rocket, Target, Newspaper, TrendingUp, Cpu, Wifi, Globe, Database
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { Tooltip } from '../components/Shared';
import { Project } from '../App';

// ... (Keeping Types and Mock Data same as before) ...
// --- Types ---

interface SchemaFieldData {
  name: string;
  type: string;
  active?: boolean;
}

interface SchemaVersion {
  id: string;
  timestamp: number;
  schema: SchemaFieldData[];
  description: string;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
  processingSteps?: { label: string; status: 'pending' | 'loading' | 'done' }[];
  isThinking?: boolean;
  // Proposal Data
  proposal?: {
    id: string;
    description: string;
    schema: SchemaFieldData[];
    status: 'pending' | 'accepted' | 'rejected';
  };
}

// --- Mock Data ---

const INITIAL_SCHEMA: SchemaFieldData[] = [
  { name: 'user_id', type: 'UUID' },
  { name: 'consent_status', type: 'BOOL', active: true },
  { name: 'vector_embedding', type: 'FLOAT[1536]' },
  { name: 'last_interaction', type: 'TIMESTAMP' }
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    role: 'ai',
    text: "VibeData Architect online. I've analyzed the schema. Shall we jam on the extraction constraints for the 'Medical Ethics' dataset?",
    timestamp: '02:23 pm',
    processingSteps: [
      { label: 'Initializing context window...', status: 'done' },
      { label: 'Schema v4.2 loaded.', status: 'done' },
      { label: 'Checking user permissions...', status: 'done' }
    ]
  }
];

// --- Helper Functions ---

const calculateDiff = (current: SchemaFieldData[], proposed: SchemaFieldData[]) => {
  const added: SchemaFieldData[] = [];
  const removed: SchemaFieldData[] = [];
  const modified: { old: SchemaFieldData; new: SchemaFieldData }[] = [];
  const unchanged: SchemaFieldData[] = [];

  const currentMap = new Map(current.map(f => [f.name, f]));
  const proposedMap = new Map(proposed.map(f => [f.name, f]));

  // Find Added & Modified & Unchanged
  proposed.forEach(p => {
    const c = currentMap.get(p.name);
    if (!c) {
      added.push(p);
    } else if (c.type !== p.type) {
      modified.push({ old: c, new: p });
    } else {
      unchanged.push(p);
    }
  });

  // Find Removed
  current.forEach(c => {
    if (!proposedMap.has(c.name)) {
      removed.push(c);
    }
  });

  return { added, removed, modified, unchanged };
};

// --- Component ---

const ArchitectView: React.FC<{ project: Project }> = ({ project }) => {
  // Chat State
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [processingExpanded, setProcessingExpanded] = useState<Record<string, boolean>>({});
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Schema State
  const [currentSchema, setCurrentSchema] = useState<SchemaFieldData[]>(INITIAL_SCHEMA);
  const [history, setHistory] = useState<SchemaVersion[]>([
    { id: 'v1.0', timestamp: Date.now() - 1000000, schema: INITIAL_SCHEMA, description: 'Initial Import' }
  ]);
  const [sidebarMode, setSidebarMode] = useState<'active' | 'history'>('active');

  // Scout Modal State
  const [isScoutOpen, setIsScoutOpen] = useState(false);

  // Project Effect
  useEffect(() => {
    if (project.id === 'default-01') {
      setMessages(INITIAL_MESSAGES);
      setCurrentSchema(INITIAL_SCHEMA);
      setHistory([{ id: 'v1.0', timestamp: Date.now() - 1000000, schema: INITIAL_SCHEMA, description: 'Initial Import' }]);
    } else {
      setMessages([{
        id: 'init',
        role: 'ai',
        text: `Architect online for project "${project.name}". How shall we structure your data today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
        processingSteps: [{ label: 'Initializing new project context...', status: 'done' }]
      }]);
      setCurrentSchema([]);
      setHistory([]);
    }
  }, [project.id]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const toggleProcessing = (id: string) => {
    setProcessingExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      if (!process.env.API_KEY) {
         throw new Error("Missing API Key");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemPrompt = `You are VibeData Architect. 
      Current Schema: ${JSON.stringify(currentSchema)}
      
      If the user requests a schema change, you MUST provide the 'proposed_schema' field in your JSON response containing the FULL new schema state.
      If no schema change is needed, omit 'proposed_schema'.
      Always provide 'steps' and 'response'.`;

      const historyContext = messages.slice(-6).map(m => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              response: { type: Type.STRING },
              proposed_schema: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: { 
                    name: {type: Type.STRING}, 
                    type: {type: Type.STRING}, 
                    active: {type: Type.BOOLEAN} 
                  },
                  required: ["name", "type"]
                } 
              }
            },
            required: ["steps", "response"],
          }
        },
        contents: [
          ...historyContext,
          { role: 'user', parts: [{ text: userMsg.text }] }
        ]
      });

      if (!response.text) {
        throw new Error("Empty response received from model");
      }

      let jsonResponse;
      try {
        const cleanText = response.text.replace(/```json\n?|```/g, '').trim();
        jsonResponse = JSON.parse(cleanText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, response.text);
        throw new Error("Malformed JSON response");
      }

      const steps = jsonResponse.steps || ["Processing..."];
      const aiText = jsonResponse.response || "Done.";
      
      const aiResponseId = (Date.now() + 1).toString();
      const newAiMsg: Message = {
        id: aiResponseId,
        role: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
        processingSteps: steps.map((s: string) => ({ label: s, status: 'done' })),
      };

      // Handle Schema Proposal
      if (jsonResponse.proposed_schema) {
         newAiMsg.proposal = {
            id: `prop-${aiResponseId}`,
            description: "Proposed Schema Updates",
            schema: jsonResponse.proposed_schema,
            status: 'pending'
         };
         // Auto expand processing for proposals to show gravity
         setProcessingExpanded(prev => ({ ...prev, [aiResponseId]: true }));
      }

      setMessages(prev => [...prev, newAiMsg]);

    } catch (error: any) {
      console.error("GenAI Error:", error);
      
      let friendlyText = "Neural handshake failed. Please retry.";
      let stepLabel = "Connection Error";

      if (error.message.includes("Missing API Key")) {
        friendlyText = "System Error: API Key is missing in environment configuration.";
        stepLabel = "Config Error";
      } else if (error.message.includes("Malformed JSON")) {
        friendlyText = "The Architect returned corrupted data. I'm attempting to restabilize the connection.";
        stepLabel = "Protocol Error";
      } else if (error.message.includes("Empty response")) {
        friendlyText = "The model returned an empty signal. The network might be congested.";
        stepLabel = "No Signal";
      } else if (error.status === 429 || error.toString().includes("429")) {
        friendlyText = "Cognitive capacity exceeded (Rate Limit). Please wait a moment before sending new instructions.";
        stepLabel = "Rate Limited";
      } else if (error.status === 401 || error.toString().includes("401")) {
         friendlyText = "Authentication failed. Please verify your API credentials.";
         stepLabel = "Auth Failed";
      } else if (error.status === 503 || error.toString().includes("503")) {
         friendlyText = "The model is currently overloaded. Please try again in a few seconds.";
         stepLabel = "Model Overloaded";
      }

      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'ai',
        text: friendlyText,
        timestamp: new Date().toLocaleTimeString().toLowerCase(),
        processingSteps: [{ label: stepLabel, status: 'done' }]
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleScoutComplete = (missionData: any) => {
    setIsScoutOpen(false);
    
    // Add System Message about extraction
    const scoutMsg: Message = {
        id: Date.now().toString(),
        role: 'ai',
        text: `Scout Mission Complete. Extracted data from target: "${missionData.target}". I've analyzed the raw structure and normalized entities.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
        processingSteps: [
            { label: 'Parsing unstructured HTML...', status: 'done' },
            { label: `Extracted 142 records from ${missionData.protocol}`, status: 'done' },
            { label: 'Generating schema proposal...', status: 'done' }
        ],
        proposal: {
            id: `prop-${Date.now()}`,
            description: "Auto-generated schema from Scout data",
            schema: [
                { name: 'article_title', type: 'STRING' },
                { name: 'published_date', type: 'TIMESTAMP' },
                { name: 'author_ref', type: 'UUID' },
                { name: 'sentiment_score', type: 'FLOAT' },
                { name: 'tags', type: 'ARRAY[STRING]' }
            ],
            status: 'pending'
        }
    };
    setMessages(prev => [...prev, scoutMsg]);
    // Auto expand the proposal processing steps
    setProcessingExpanded(prev => ({ ...prev, [scoutMsg.id]: true }));
  };

  const applyProposal = (msgId: string, proposal: NonNullable<Message['proposal']>) => {
     // 1. Add to history
     const newVersion: SchemaVersion = {
        id: `v${(history.length + 1).toFixed(1)}`,
        timestamp: Date.now(),
        schema: currentSchema, // Save old schema state
        description: `Pre-update: ${proposal.description}`
     };
     setHistory(prev => [newVersion, ...prev]);

     // 2. Update Current Schema
     setCurrentSchema(proposal.schema);

     // 3. Update Message Status
     setMessages(prev => prev.map(m => {
        if (m.id === msgId && m.proposal) {
            return { ...m, proposal: { ...m.proposal, status: 'accepted' } };
        }
        return m;
     }));
  };

  const discardProposal = (msgId: string) => {
    setMessages(prev => prev.map(m => {
        if (m.id === msgId && m.proposal) {
            return { ...m, proposal: { ...m.proposal, status: 'rejected' } };
        }
        return m;
    }));
  };

  const revertToVersion = (version: SchemaVersion) => {
      // Create a backup of current before reverting
      const backupVersion: SchemaVersion = {
          id: `backup-${Date.now()}`,
          timestamp: Date.now(),
          schema: currentSchema,
          description: "Auto-backup before Revert"
      };
      setHistory(prev => [backupVersion, ...prev]);
      setCurrentSchema(version.schema);
      
      const sysMsg: Message = {
          id: Date.now().toString(),
          role: 'ai',
          text: `Reverted schema to version ${version.id}.`,
          timestamp: new Date().toLocaleTimeString().toLowerCase(),
      };
      setMessages(prev => [...prev, sysMsg]);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full p-4 lg:p-6 gap-6 relative max-w-[1920px] mx-auto">
      
      {/* Scout Modal */}
      {isScoutOpen && (
          <ScoutModal 
            onClose={() => setIsScoutOpen(false)} 
            onComplete={handleScoutComplete} 
          />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-[60vh] lg:h-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between glass-panel p-4 rounded-xl mb-4 shrink-0">
           <div className="flex items-center gap-3">
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Architect</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 border border-gray-300 dark:border-white/5">BETA 0.9.4</span>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 dark:text-emerald-400">
                 <Activity size={14} className="animate-pulse" />
                 <span className="hidden sm:inline">System Status: Optimal</span>
              </div>
           </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 glass-panel rounded-xl relative overflow-hidden flex flex-col bg-white/50 dark:bg-transparent">
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6 pb-48">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex flex-col gap-2 max-w-3xl mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'self-end items-end ml-auto' : ''}`}
                >
                    <div className="flex items-center gap-2 mb-1">
                      {msg.role === 'ai' ? (
                          <>
                            <span className="text-xs font-bold text-primary tracking-wider uppercase">Architect AI</span>
                            <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                          </>
                      ) : (
                          <>
                            <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-white tracking-wider uppercase">You</span>
                          </>
                      )}
                    </div>
                    
                    <div className={`p-4 rounded-xl text-sm leading-relaxed border shadow-sm ${
                      msg.role === 'ai' 
                        ? 'rounded-tl-none bg-white dark:bg-white/5 border-gray-200 dark:border-white/5 text-slate-700 dark:text-slate-200' 
                        : 'rounded-tr-none bg-slate-100 dark:bg-[#1e1e1e] border-gray-200 dark:border-white/10 text-slate-800 dark:text-slate-200'
                    }`}>
                      {msg.text}
                    </div>

                    {/* Processing Steps */}
                    {msg.role === 'ai' && msg.processingSteps && msg.processingSteps.length > 0 && (
                      <div className="mt-1">
                          <button 
                            onClick={() => toggleProcessing(msg.id)}
                            className="flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors group select-none"
                          >
                            <div className={`transition-transform duration-200 ${processingExpanded[msg.id] ? 'rotate-0' : '-rotate-90'}`}>
                              <ChevronDown size={14} />
                            </div>
                            PROCESSING STEPS 
                            <span className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/5 text-[10px] border border-gray-300 dark:border-white/5 group-hover:bg-gray-300 dark:group-hover:bg-white/10 transition-colors">
                              {msg.processingSteps.length}
                            </span>
                          </button>
                          
                          <div className={`grid transition-all duration-300 ease-in-out ${processingExpanded[msg.id] ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden">
                              <div className="ml-5 mt-2 pl-4 border-l border-gray-200 dark:border-white/10 space-y-2 text-xs font-mono text-slate-400 pb-2">
                                {msg.processingSteps.map((step, idx) => (
                                    <div 
                                      key={idx}
                                      className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300 fill-mode-forwards"
                                      style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                      {step.status === 'done' ? (
                                          <CheckCircle2 size={10} className="text-emerald-500" />
                                      ) : (
                                          <div className="w-2.5 h-2.5 rounded-full border border-slate-500 border-t-transparent animate-spin"></div>
                                      )}
                                      <span className={step.status === 'done' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}>{step.label}</span>
                                    </div>
                                ))}
                              </div>
                            </div>
                          </div>
                      </div>
                    )}

                    {/* Schema Proposal Diff Card */}
                    {msg.proposal && (
                        <div className="mt-3 w-full max-w-xl">
                             <DiffCard 
                                current={currentSchema} 
                                proposed={msg.proposal.schema} 
                                status={msg.proposal.status}
                                onAccept={() => applyProposal(msg.id, msg.proposal!)}
                                onReject={() => discardProposal(msg.id)}
                             />
                        </div>
                    )}
                </div>
              ))}

              {isTyping && (
                 <div className="flex items-center gap-2 max-w-3xl animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-primary tracking-wider uppercase">Architect AI</span>
                    </div>
                    <div className="flex gap-1 ml-2">
                       <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.32s]" />
                       <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.16s]" />
                       <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    </div>
                 </div>
              )}
              
              <div ref={scrollRef} />
            </div>

            {/* Input Overlay */}
            <div className="absolute bottom-0 left-0 w-full p-6 pt-24 bg-gradient-to-t from-gray-50 via-gray-50 dark:from-[#0B0F19] dark:via-[#0B0F19] to-transparent z-20 pointer-events-none">
                <div className="max-w-4xl mx-auto w-full flex flex-col gap-4 pointer-events-auto">
                    
                    {/* Suggestions Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200 fill-mode-forwards">
                        {[
                          { icon: RefreshCw, label: "Refactor Schema" },
                          { icon: Box, label: "Generate Mock Data" },
                          { icon: Wand2, label: "Optimize Index" },
                          { icon: Sparkles, label: "Explain Pattern" }
                        ].map((chip) => (
                           <button 
                              key={chip.label}
                              onClick={() => setInputValue(chip.label)}
                              className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-white/80 dark:bg-[#1F2937]/80 hover:bg-white dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 backdrop-blur-md shadow-sm"
                           >
                              <chip.icon size={12} /> {chip.label}
                           </button>
                        ))}
                    </div>

                    {/* Input Component */}
                    <div className={`
                        flex items-center gap-2 p-1.5 rounded-[2rem] border bg-white dark:bg-[#0B0F19] transition-all duration-300 shadow-xl
                        ${inputValue.length > 0 
                            ? 'border-primary ring-1 ring-primary/20 shadow-[0_0_20px_rgba(129,140,248,0.15)]' 
                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'}
                        focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20
                    `}>
                        <button
                            onClick={() => setIsScoutOpen(true)}
                            className="ml-1 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <Tooltip content="Launch Scout Crawler" side="top">
                                <Rocket size={18} />
                            </Tooltip>
                        </button>

                        <div className="pl-2 pr-1 flex items-center justify-center h-full border-l border-white/10">
                            <span className="text-slate-400 font-mono text-sm tracking-tighter opacity-80">{'</>'}</span>
                        </div>
                        
                        <input 
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 bg-transparent border-none text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:ring-0 py-3 h-11"
                            placeholder="Describe the data transformation..."
                            autoComplete="off"
                        />
                        
                        <button 
                            onClick={handleSendMessage}
                            className={`
                            size-9 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 active:scale-90
                            ${inputValue.length > 0 
                                ? 'bg-primary text-[#0B0F19] shadow-lg hover:bg-primary-glow cursor-pointer' 
                                : 'bg-gray-100 dark:bg-[#1F2937] text-slate-400 cursor-not-allowed'}
                            `}
                            disabled={!inputValue.length || isTyping}
                        >
                            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} strokeWidth={2.5} />}
                        </button>
                    </div>

                    <div className="flex justify-center text-[10px] text-slate-400 dark:text-slate-600 font-mono">
                        <span>AI-Generated • Verify Schemas</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Right Sidebar (Responsive: Stacks on mobile) */}
      <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 animate-in fade-in slide-in-from-right-4 duration-500 delay-300">
         
         {/* Toggle Sidebar Mode */}
         <div className="flex p-1 bg-gray-200 dark:bg-white/5 rounded-lg border border-gray-300 dark:border-white/5">
            <button 
                onClick={() => setSidebarMode('active')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-2 ${sidebarMode === 'active' ? 'bg-white dark:bg-[#1F2937] text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                <Box size={14} /> Schema
            </button>
            <button 
                onClick={() => setSidebarMode('history')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-2 ${sidebarMode === 'history' ? 'bg-white dark:bg-[#1F2937] text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                <History size={14} /> History
            </button>
         </div>

         {/* Content Panels */}
         {sidebarMode === 'active' ? (
            <div className="glass-panel rounded-xl p-0 overflow-hidden flex flex-col bg-white dark:bg-transparent">
                <div className="p-4 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <GitCommit size={14} /> Active Structure
                    </h3>
                </div>
                <div className="p-2 space-y-1">
                    {currentSchema.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 italic">No schema defined for this project. Ask the Architect to create one.</div>
                    ) : (
                        currentSchema.map((field) => (
                            <SchemaField key={field.name} {...field} />
                        ))
                    )}
                </div>
            </div>
         ) : (
            <div className="glass-panel rounded-xl p-0 overflow-hidden flex flex-col bg-white dark:bg-transparent h-full max-h-[500px]">
                <div className="p-4 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <History size={14} /> Version Control
                    </h3>
                </div>
                <div className="p-2 space-y-2 overflow-y-auto custom-scrollbar">
                    {history.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 italic">No history available.</div>
                    ) : (
                        history.map((ver, idx) => (
                            <div key={ver.id} className="p-3 rounded-lg border border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{ver.id}</span>
                                            {idx === 0 && <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">LATEST</span>}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono">{new Date(ver.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <Tooltip content="Revert to this version">
                                        <button 
                                            onClick={() => revertToVersion(ver)}
                                            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <RotateCcw size={14} />
                                        </button>
                                    </Tooltip>
                                </div>
                                <p className="text-xs text-slate-500 leading-snug">{ver.description}</p>
                                <div className="mt-2 text-[10px] font-mono text-slate-400 bg-gray-100 dark:bg-black/20 p-1.5 rounded">
                                    {ver.schema.length} fields
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
         )}

         {/* Suggestion Card (Static for now) */}
         {currentSchema.length > 0 && (
             <div className="glass-panel rounded-xl p-5 border border-primary/20 bg-primary/5 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                   <Sparkles size={48} className="text-primary" />
                </div>
                <h4 className="flex items-center gap-2 text-xs font-bold text-primary mb-2 uppercase tracking-wide">
                   <Sparkles size={12} /> Optimization
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed opacity-90">
                   Consider partitioning by 'last_interaction' to improve query performance on historical analysis.
                </p>
             </div>
         )}

      </div>
    </div>
  );
};

// ... (Keeping Sub-Components same as before) ...
// --- Sub-Components ---

const ScoutModal = ({ onClose, onComplete }: { onClose: () => void, onComplete: (data: any) => void }) => {
    const [target, setTarget] = useState('wired.com/category/tech');
    const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle');
    const [logs, setLogs] = useState<{time: string, type: string, msg: string, color?: string}[]>([]);
    
    const runSimulation = () => {
        setStatus('running');
        setLogs([]);
        
        const steps = [
            { t: 500, msg: `Initializing neural pathways for Target: ${target}...`, type: 'SYS', color: 'text-slate-400' },
            { t: 1500, msg: `DNS Resolution successful. Connected to ${target.split('/')[0]}`, type: 'NET', color: 'text-emerald-400' },
            { t: 2500, msg: 'Crawling DOM structure... Found 42 article nodes.', type: 'EXE', color: 'text-white' },
            { t: 3500, msg: 'Extracting metadata (Title, Author, Date)...', type: 'NLP', color: 'text-purple-400' },
            { t: 4500, msg: 'Analyzing sentiment vectors...', type: 'AI', color: 'text-primary' },
            { t: 5500, msg: 'Data normalization complete. Structuring JSON...', type: 'SYS', color: 'text-slate-400' },
        ];

        let totalDelay = 0;
        steps.forEach((step, i) => {
            totalDelay += step.t;
            setTimeout(() => {
                const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
                setLogs(prev => [...prev, { time, type: step.type, msg: step.msg, color: step.color }]);
                
                if (i === steps.length - 1) {
                    setTimeout(() => {
                        onComplete({ target, protocol: 'HTTPS/Scraper' });
                    }, 1000);
                }
            }, totalDelay);
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center isolate px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-2xl bg-[#0B0F19] rounded-2xl border border-primary/30 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-primary/10 text-primary">
                            <Rocket size={18} />
                        </div>
                        <h3 className="font-bold text-white text-lg">Agent Scout // Web Crawler</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Minimize2 size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target URL / Datasource</label>
                            <div className="flex items-center gap-2 bg-[#131826] border border-white/10 rounded-lg p-1.5">
                                <Globe size={16} className="text-slate-500 ml-2" />
                                <input 
                                    type="text" 
                                    className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-600 focus:ring-0 w-full"
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    disabled={status === 'running'}
                                />
                            </div>
                        </div>
                        <button 
                            onClick={runSimulation}
                            disabled={status === 'running'}
                            className={`
                                self-end px-6 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all w-full sm:w-auto
                                ${status === 'running' 
                                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                                    : 'bg-primary hover:bg-primary-glow text-white active:scale-95'}
                            `}
                        >
                            {status === 'running' ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                            {status === 'running' ? 'Running...' : 'Initiate'}
                        </button>
                    </div>

                    {/* Terminal */}
                    <div className="bg-black/50 rounded-xl border border-white/10 h-64 overflow-hidden flex flex-col font-mono text-xs relative">
                        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                            <span className="text-slate-500">Live Execution Log</span>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                            </div>
                        </div>
                        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-2">
                            {status === 'idle' && (
                                <div className="text-slate-600 italic">Ready for mission parameters...</div>
                            )}
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-3 animate-in slide-in-from-left-2 duration-300">
                                    <span className="text-slate-600 shrink-0">[{log.time}]</span>
                                    <span className="font-bold shrink-0 w-8 text-center bg-white/5 rounded border border-white/10 text-[10px] py-0.5">{log.type}</span>
                                    <span className={log.color || 'text-slate-300'}>{log.msg}</span>
                                </div>
                            ))}
                            {status === 'running' && (
                                <div className="animate-pulse text-primary">_</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SchemaField = ({ name, type, active }: SchemaFieldData) => (
  <div className="flex items-center justify-between p-2 rounded hover:bg-gray-100 dark:hover:bg-white/5 group border border-transparent hover:border-gray-200 dark:hover:border-white/5 transition-colors">
    <div className="flex items-center gap-2">
       <div className={`size-1.5 rounded-full ${active !== false ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
       <span className="text-sm font-mono text-slate-700 dark:text-slate-300 font-medium">{name}</span>
    </div>
    <span className="text-[10px] font-mono text-slate-500 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/5">{type}</span>
  </div>
);

const DiffCard = ({ current, proposed, status, onAccept, onReject }: any) => {
    const { added, removed, modified, unchanged } = calculateDiff(current, proposed);
    const isPending = status === 'pending';
    const isAccepted = status === 'accepted';
    const isRejected = status === 'rejected';

    return (
        <div className={`
            rounded-xl border overflow-hidden transition-all duration-300
            ${isPending ? 'bg-white dark:bg-[#0B0F19] border-gray-200 dark:border-white/10 shadow-lg' : ''}
            ${isAccepted ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' : ''}
            ${isRejected ? 'bg-red-500/5 border-red-500/20 opacity-50 grayscale' : ''}
        `}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                <div className="flex items-center gap-2">
                    <GitPullRequest size={14} className={isPending ? 'text-primary' : isAccepted ? 'text-emerald-500' : 'text-red-500'} />
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-white">Schema Proposal</span>
                </div>
                {isAccepted && <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1"><CheckCircle2 size={12}/> Applied</span>}
                {isRejected && <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1"><AlertCircle size={12}/> Rejected</span>}
            </div>

            {/* Content */}
            <div className="p-3 space-y-1 max-h-60 overflow-y-auto custom-scrollbar font-mono text-xs">
                {added.length === 0 && removed.length === 0 && modified.length === 0 && (
                    <div className="text-slate-500 italic p-2 text-center">No structural changes detected.</div>
                )}
                
                {added.map(f => (
                    <div key={f.name} className="flex items-center gap-2 p-1.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Plus size={10} />
                        <span className="font-bold">{f.name}</span>
                        <span className="opacity-70 ml-auto">{f.type}</span>
                    </div>
                ))}
                
                {removed.map(f => (
                    <div key={f.name} className="flex items-center gap-2 p-1.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 decoration-slice line-through opacity-70">
                        <Trash2 size={10} />
                        <span>{f.name}</span>
                        <span className="opacity-70 ml-auto">{f.type}</span>
                    </div>
                ))}

                {modified.map(m => (
                    <div key={m.new.name} className="flex items-center gap-2 p-1.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <AlertCircle size={10} />
                        <span className="font-bold">{m.new.name}</span>
                        <div className="ml-auto flex items-center gap-1 opacity-80">
                            <span className="line-through opacity-50">{m.old.type}</span>
                            <ArrowRight size={10} />
                            <span>{m.new.type}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            {isPending && (
                <div className="flex border-t border-gray-200 dark:border-white/10 divide-x divide-gray-200 dark:divide-white/10">
                    <button 
                        onClick={onReject}
                        className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                        Reject
                    </button>
                    <button 
                        onClick={onAccept}
                        className="flex-1 py-2 text-xs font-bold text-primary hover:text-white hover:bg-primary transition-colors"
                    >
                        Accept Changes
                    </button>
                </div>
            )}
        </div>
    );
};

export default ArchitectView;