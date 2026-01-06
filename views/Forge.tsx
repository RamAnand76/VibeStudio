import React, { useState } from 'react';
import { 
  ArrowRight, CheckCircle2, XCircle, Edit3, Zap, 
  AlertCircle, Play, Sliders, Layers, ChevronRight,
  Maximize2, RotateCcw, ThumbsUp, ThumbsDown,
  Sparkles, Split, Fingerprint
} from 'lucide-react';
import { Tooltip } from '../components/Shared';
import { Project } from '../App';

// --- Types ---

interface ModelOutput {
  id: string;
  model: string;
  score: number;
  text: string;
  status: 'chosen' | 'rejected' | 'pending';
  latency: number;
  tokens: number;
}

// --- Mock Data ---

const MOCK_OUTPUTS: ModelOutput[] = [
  {
    id: 'out-1',
    model: 'GPT-4 Turbo',
    score: 0.98,
    text: "Imagine a chef (the LLM) who has read every cookbook in the world. Alignment is the process of curating the menu to ensure safety and quality. It's not just about teaching the chef to cook, but teaching them to cook what the customer actually wants to eat, avoiding toxic ingredients.",
    status: 'chosen',
    latency: 420,
    tokens: 145
  },
  {
    id: 'out-2',
    model: 'Llama 3 70B',
    score: 0.85,
    text: "Alignment in LLMs is like a kitchen where the weights are the temperature. The customer is the loss function. When the chef cooks, they are minimizing the gradient descent of the flavor profile. Basically, if you don't align the stove properly, the food burns.",
    status: 'rejected',
    latency: 210,
    tokens: 112
  }
];

const ForgeView: React.FC<{ project: Project }> = ({ project }) => {
  const [activePrompt, setActivePrompt] = useState("Explain the concept of 'alignment' in large language models using a cooking metaphor.");
  const [isRunning, setIsRunning] = useState(false);
  
  const isDefault = project.id === 'default-01';

  if (!isDefault) {
      return (
          <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-[#0B0F19]">
              <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className="relative mx-auto size-20 flex items-center justify-center">
                      <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                      <div className="relative size-20 bg-white dark:bg-[#131826] border border-gray-200 dark:border-white/10 rounded-full flex items-center justify-center text-primary shadow-xl">
                          <Zap size={32} />
                      </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Initialize Forge Experiment</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                        The Forge allows you to run consensus experiments across multiple LLMs to verify data integrity and transformation logic.
                    </p>
                  </div>
                  <button className="w-full py-3 rounded-xl bg-primary hover:bg-primary-glow text-white font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                      <PlusIcon /> Create New Experiment
                  </button>
              </div>
          </div>
      );
  }

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0B0F19] overflow-hidden">
      
      {/* Header / Stats Bar */}
      <header className="h-16 px-6 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-[#0F1423] flex items-center justify-between shrink-0 z-20">
         <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-slate-900 dark:text-white font-display font-bold text-lg">
                <Layers className="text-primary" size={20} />
                Forge <span className="text-slate-400 font-normal">/ Consensus Engine</span>
             </div>
             <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-2"></div>
             <div className="flex items-center gap-4 text-xs font-mono">
                 <div className="flex items-center gap-2 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Systems Online</span>
                 </div>
                 <div className="px-2 py-1 rounded bg-primary/10 text-primary font-bold border border-primary/20">
                    Batch #8842-A
                 </div>
             </div>
         </div>
         <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                 <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Consensus Rate</div>
                 <div className="text-sm font-bold text-slate-900 dark:text-white">98.2%</div>
             </div>
             <div className="w-px h-8 bg-gray-200 dark:bg-white/10"></div>
             <button className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                 <Sliders size={18} />
             </button>
         </div>
      </header>

      {/* Main Content Split */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
         
         {/* Left Panel: Configuration & Prompt */}
         <div className="w-full lg:w-[400px] bg-white dark:bg-[#0F1423] border-r border-gray-200 dark:border-white/5 flex flex-col z-10 shadow-xl lg:shadow-none">
            
            {/* Prompt Editor */}
            <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        <Edit3 size={14} /> Input Prompt
                    </label>
                    <div className="relative group">
                        <textarea 
                            value={activePrompt}
                            onChange={(e) => setActivePrompt(e.target.value)}
                            className="w-full min-h-[200px] p-4 rounded-xl bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 text-sm text-slate-900 dark:text-slate-200 font-mono leading-relaxed resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-inner"
                        />
                        <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                             <span className="text-[10px] text-slate-400 font-mono">{activePrompt.length} chars</span>
                             <button className="p-1.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                                 <Maximize2 size={14} />
                             </button>
                        </div>
                    </div>
                </div>

                {/* Model Selection Configuration */}
                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <Split size={14} /> Participating Models
                    </label>
                    <div className="space-y-2">
                        <ModelSelector label="GPT-4 Turbo" provider="OpenAI" active />
                        <ModelSelector label="Claude 3 Opus" provider="Anthropic" active />
                        <ModelSelector label="Llama 3 70B" provider="Meta" active={false} />
                    </div>
                </div>

                {/* Parameter Sliders */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-white/5 space-y-4 mt-auto">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-medium">Temperature</span>
                            <span className="text-slate-900 dark:text-white font-mono">0.7</span>
                        </div>
                        <input type="range" className="w-full h-1 bg-gray-300 dark:bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full" />
                    </div>
                </div>
            </div>

            {/* Run Action */}
            <div className="p-6 border-t border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-[#0B0F19]/50 backdrop-blur">
                <button 
                    onClick={handleRun}
                    disabled={isRunning}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                    {isRunning && (
                         <div className="absolute inset-0 bg-white/20 -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                    )}
                    {isRunning ? <Loader size={20} className="animate-spin" /> : <Play size={20} fill="currentColor" />}
                    <span>{isRunning ? 'Synthesizing...' : 'Run Consensus'}</span>
                </button>
            </div>
         </div>

         {/* Right Panel: Results */}
         <div className="flex-1 bg-gray-50 dark:bg-[#0B0F19] flex flex-col min-w-0">
             
             {/* Visualization Header */}
             <div className="h-48 border-b border-gray-200 dark:border-white/5 relative overflow-hidden flex items-center justify-center shrink-0">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                  
                  {/* Consensus Visualizer */}
                  <div className="relative z-10 flex items-center gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="flex flex-col items-center gap-2">
                          <div className="size-16 rounded-2xl bg-white dark:bg-[#131826] border border-gray-200 dark:border-white/10 shadow-xl flex items-center justify-center text-primary font-bold text-xl relative">
                              98%
                              <div className="absolute -top-1 -right-1 size-3 bg-emerald-500 rounded-full border-2 border-[#131826]"></div>
                          </div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Similarity</span>
                      </div>
                      
                      <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-400 to-transparent relative">
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-gray-50 dark:bg-[#0B0F19] text-[10px] text-slate-500 font-mono">VS</div>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                          <div className="size-16 rounded-2xl bg-white dark:bg-[#131826] border border-gray-200 dark:border-white/10 shadow-xl flex items-center justify-center text-amber-500 font-bold text-xl">
                              0.4s
                          </div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Latency</span>
                      </div>
                  </div>
             </div>

             {/* Output Cards */}
             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
                 <div className="max-w-5xl mx-auto space-y-6">
                     <div className="flex items-center justify-between">
                         <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                             <Sparkles size={18} className="text-primary" /> Generated Outputs
                         </h3>
                         <div className="flex gap-2">
                             <button className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                                 Compare Diff
                             </button>
                         </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {MOCK_OUTPUTS.map((output, idx) => (
                            <OutputCard key={output.id} data={output} index={idx} />
                        ))}
                     </div>
                 </div>
             </div>
         </div>

      </div>
    </div>
  );
};

// --- Sub-components ---

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;

const Loader = ({size, className}: {size: number, className?: string}) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

const ModelSelector = ({ label, provider, active }: { label: string, provider: string, active: boolean }) => (
    <div 
        className={`
            flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 group
            ${active 
                ? 'bg-primary/5 border-primary/50 shadow-[0_0_15px_rgba(129,140,248,0.15)]' 
                : 'bg-gray-50 dark:bg-[#0B0F19] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'}
        `}
    >
        <div className="flex items-center gap-3">
            <div className={`size-4 rounded-full border flex items-center justify-center ${active ? 'border-primary bg-primary' : 'border-slate-400 bg-transparent'}`}>
                {active && <div className="size-1.5 rounded-full bg-white"></div>}
            </div>
            <div>
                <div className={`text-sm font-bold ${active ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}>{label}</div>
                <div className="text-[10px] text-slate-400">{provider}</div>
            </div>
        </div>
        {active && <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>}
    </div>
);

const OutputCard = ({ data, index }: { data: ModelOutput, index: number }) => {
    const isChosen = data.status === 'chosen';
    
    return (
        <div 
            className={`
                flex flex-col rounded-xl border transition-all duration-300 group
                ${isChosen 
                    ? 'bg-white dark:bg-[#131826] border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/20 z-10' 
                    : 'bg-gray-50/50 dark:bg-[#0F1423]/50 border-gray-200 dark:border-white/5 opacity-80 hover:opacity-100 hover:bg-white dark:hover:bg-[#131826] hover:border-white/10'}
            `}
            style={{ animationDelay: `${index * 150}ms` }}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${isChosen ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-200 dark:bg-white/10 text-slate-500'}`}>
                        <Fingerprint size={16} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{data.model}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <span>{data.latency}ms</span>
                            <span>•</span>
                            <span>{data.tokens} tokens</span>
                        </div>
                    </div>
                </div>
                {isChosen ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                        <CheckCircle2 size={12} /> CHOSEN
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold border border-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <XCircle size={12} /> REJECTED
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 flex-1">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-7 font-sans">
                    {data.text}
                </p>
            </div>

            {/* Actions Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/20 flex justify-between items-center rounded-b-xl">
                 <div className="flex gap-2">
                     <Tooltip content="Rate: Helpful">
                         <button className="p-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-slate-400 hover:text-emerald-500 transition-colors">
                             <ThumbsUp size={14} />
                         </button>
                     </Tooltip>
                     <Tooltip content="Rate: Unhelpful">
                         <button className="p-2 rounded hover:bg-gray-200 dark:hover:bg-white/10 text-slate-400 hover:text-red-500 transition-colors">
                             <ThumbsDown size={14} />
                         </button>
                     </Tooltip>
                 </div>
                 
                 <div className="flex items-center gap-2">
                     <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Score</div>
                     <div className={`font-mono font-bold text-sm ${data.score > 0.9 ? 'text-emerald-500' : 'text-amber-500'}`}>
                         {data.score.toFixed(2)}
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default ForgeView;