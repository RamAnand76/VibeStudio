import React, { useState } from 'react';
import { 
  Book, Map, Zap, Workflow, LayoutDashboard, 
  Bot, ShieldQuestion, ChevronRight, PlayCircle
} from 'lucide-react';

const HelpView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>('intro');

  const sections = [
    {
      id: 'intro',
      title: 'Getting Started',
      icon: PlayCircle,
      content: (
        <div className="space-y-4">
          <p className="text-lg text-slate-300 leading-relaxed">
            Welcome to <strong className="text-white">VibeData Studio</strong>. Think of this application as a <span className="text-primary">Control Tower</span> for your data. 
          </p>
          <p className="text-slate-400 leading-relaxed">
            Just like an airport control tower watches planes land and take off, VibeData watches information move between your computer systems. 
            It helps you see if everything is running smoothly or if there are any "traffic jams" (errors) that need fixing.
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-4">
            <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
              <Zap size={16} /> Quick Tip
            </h4>
            <p className="text-sm text-slate-300">
              You don't need to be a coding expert to use this. Use the <strong>"Architect"</strong> AI chat to ask questions in plain English, like "How is my data doing today?"
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'The Dashboard',
      icon: LayoutDashboard,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-2">Your Morning Coffee View</h3>
          <p className="text-slate-400">
            The Dashboard is the first thing you see. It gives you a high-level summary of everything.
          </p>
          <ul className="space-y-3 mt-4">
            <FeaturePoint title="Stat Cards" desc="The big numbers at the top showing overall health." />
            <FeaturePoint title="Active Pipelines" desc="A list of ongoing tasks. Green means good, Red means stopped." />
            <FeaturePoint title="System Logs" desc="A running diary of what the computer is doing, updated in real-time." />
          </ul>
        </div>
      )
    },
    {
      id: 'pipelines',
      title: 'Pipelines',
      icon: Workflow,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-2">Visualizing the Flow</h3>
          <p className="text-slate-400">
            Imagine a factory conveyor belt. Data moves from a <strong>Source</strong> (where it comes from), goes through a <strong>Transform</strong> (where it gets cleaned up), and ends at a <strong>Destination</strong> (storage).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
             <div className="p-4 rounded-lg bg-white/5 border border-white/5 text-center">
                <div className="font-bold text-white mb-1">1. Source</div>
                <div className="text-xs text-slate-500">e.g., User Database</div>
             </div>
             <div className="p-4 rounded-lg bg-white/5 border border-white/5 text-center">
                <div className="font-bold text-white mb-1">2. Transform</div>
                <div className="text-xs text-slate-500">e.g., Remove Duplicates</div>
             </div>
             <div className="p-4 rounded-lg bg-white/5 border border-white/5 text-center">
                <div className="font-bold text-white mb-1">3. Destination</div>
                <div className="text-xs text-slate-500">e.g., Analytics Report</div>
             </div>
          </div>
          <p className="text-slate-400 mt-2">
            In the Pipeline view, you can see these connections as lines. If a line turns red, the conveyor belt is broken.
          </p>
        </div>
      )
    },
    {
      id: 'pulse',
      title: 'Pulse Map',
      icon: Map,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-2">3D Activity Scanner</h3>
          <p className="text-slate-400">
            The Pulse view is a futuristic, 3D map of your data activity. It looks cool, but it's also useful!
          </p>
          <ul className="space-y-3 mt-4">
            <FeaturePoint title="Peaks & Valleys" desc="High peaks mean lots of activity. Flat areas mean silence." />
            <FeaturePoint title="Clusters" desc="Groups of data points that belong together." />
            <FeaturePoint title="Navigation" desc="Click and drag to move around. Scroll to zoom in." />
          </ul>
        </div>
      )
    },
    {
      id: 'architect',
      title: 'AI Architect',
      icon: Bot,
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-2">Your Personal Assistant</h3>
          <p className="text-slate-400">
            The Architect is an Artificial Intelligence (AI) helper. Instead of clicking 50 buttons to change a setting, you can just tell the Architect what you want.
          </p>
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-white/10 mt-4">
             <p className="font-mono text-sm text-slate-300 mb-2">Try typing this:</p>
             <p className="text-white font-bold">"Add a new field called 'PhoneNumber' to the User database."</p>
          </div>
          <p className="text-slate-400 mt-2">
            The Architect will draft the changes for you, and you just have to click "Apply".
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-full overflow-hidden flex flex-col">
       <div className="mb-8 shrink-0">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Help & Instructions</h1>
          <p className="text-slate-400">A simplified guide to navigating the VibeData Studio platform.</p>
       </div>

       <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
          
          {/* Sidebar Navigation for Help */}
          <div className="w-full lg:w-72 shrink-0 space-y-2 overflow-y-auto custom-scrollbar">
             {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all border ${
                    activeSection === section.id 
                    ? 'bg-primary/10 border-primary/30 text-white shadow-glow-sm' 
                    : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                   <section.icon size={20} className={activeSection === section.id ? 'text-primary' : 'text-slate-500'} />
                   <span className="font-bold text-sm">{section.title}</span>
                   {activeSection === section.id && <ChevronRight size={16} className="ml-auto text-primary" />}
                </button>
             ))}
             
             <div className="mt-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                   <ShieldQuestion size={18} /> Need Human Help?
                </div>
                <p className="text-xs text-slate-400 mb-3">
                   Our support team is available 24/7 for critical system issues.
                </p>
                <button className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors">
                   Contact Support
                </button>
             </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 glass-panel rounded-2xl border border-white/10 bg-[#131826]/50 p-6 md:p-10 overflow-y-auto custom-scrollbar relative">
              <div className="max-w-3xl mx-auto">
                 {sections.map(section => (
                    activeSection === section.id && (
                       <div key={section.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                             <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white">
                                <section.icon size={32} />
                             </div>
                             <h2 className="text-2xl font-display font-bold text-white">{section.title}</h2>
                          </div>
                          {section.content}
                       </div>
                    )
                 ))}
              </div>
          </div>

       </div>
    </div>
  );
};

const FeaturePoint = ({ title, desc }: { title: string, desc: string }) => (
   <li className="flex gap-3 items-start">
      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
      <div>
         <strong className="text-slate-200 block text-sm">{title}</strong>
         <span className="text-slate-500 text-sm">{desc}</span>
      </div>
   </li>
);

export default HelpView;