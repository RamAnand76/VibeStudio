import React from 'react';
import { Rocket, Target, Newspaper, TrendingUp, Cpu, Wifi, Loader2 } from 'lucide-react';
import { Tooltip } from '../components/Shared';
import { Project } from '../App';

const ScoutView: React.FC<{ project: Project }> = ({ project }) => {
  const isDefault = project.id === 'default-01';

  return (
    <div className="p-8 h-full overflow-y-auto bg-obsidian-light relative">
       {/* Background Effects */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

       <div className="max-w-6xl mx-auto flex flex-col gap-8 relative z-10">
          <header className="flex justify-between items-end">
              <div>
                  <h2 className="text-white text-4xl font-display font-black tracking-tight">The Scout</h2>
                  <p className="text-slate-500 text-lg font-light mt-1">Deploy autonomous agents for data acquisition missions.</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-obsidian border border-accent/30 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                  <span className={`w-2 h-2 rounded-full ${isDefault ? 'bg-accent animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'bg-slate-500'}`}></span>
                  <span className={`text-xs font-mono tracking-widest uppercase ${isDefault ? 'text-accent' : 'text-slate-500'}`}>{isDefault ? 'System Online' : 'Standby'}</span>
              </div>
          </header>

          {/* Mission Input */}
          <section className="flex flex-col gap-5 p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent p-[1px]">
             <div className="flex flex-col gap-5 p-6 rounded-2xl bg-obsidian/90 backdrop-blur-xl border border-glass-border shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                 
                 <div className="flex flex-col gap-3 relative z-10">
                     <label className="text-primary text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                         <Target size={18} /> Mission Parameters
                     </label>
                     <div className="flex gap-4 items-start">
                         <div className="flex-1 relative">
                             <textarea 
                                className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-base text-white placeholder-slate-600 focus:border-primary focus:ring-0 min-h-[120px] resize-none font-mono leading-relaxed transition-all shadow-inner"
                                placeholder={isDefault ? "Target: Wired.com/tech\nObjective: Scrape news & summarize top 5 trends..." : "Enter mission target and objective..."}
                                defaultValue={isDefault ? "Target: Wired.com/tech\nObjective: Scrape news & summarize top 5 trends..." : ""}
                             ></textarea>
                             <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                 <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></span>
                                 <span className="text-[10px] text-accent/60 font-mono tracking-widest">AWAITING_INPUT</span>
                             </div>
                         </div>
                         <Tooltip content="Launch Mission" side="bottom">
                            <button className="shrink-0 h-[120px] w-36 bg-gradient-to-br from-primary to-violet-700 text-white rounded-xl flex flex-col items-center justify-center gap-2 border border-primary/50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-glow group">
                                <Rocket size={32} className="group-hover:-translate-y-1 transition-transform" />
                                <span className="font-bold text-sm tracking-wide">INITIATE</span>
                            </button>
                         </Tooltip>
                     </div>
                 </div>

                 <div className="flex gap-3 relative z-10">
                     <span className="text-xs text-slate-500 py-1.5 self-center mr-2 font-mono uppercase tracking-wide opacity-70">Protocols:</span>
                     <ProtocolButton icon={Newspaper} label="Scrape Tech News" />
                     <ProtocolButton icon={TrendingUp} label="Monitor Pricing" />
                     <ProtocolButton icon={Cpu} label="Analyze Sentiment" />
                 </div>
             </div>
          </section>

          {/* Neural Terminal */}
          <section className="flex-1 min-h-[300px] rounded-2xl overflow-hidden glass-panel relative shadow-2xl border border-accent/20 flex flex-col">
             <div className="h-10 bg-[#050505] border-b border-white/10 flex items-center justify-between px-4 shrink-0">
                 <div className="flex items-center gap-4">
                     <div className="flex gap-1.5">
                         <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                         <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                     </div>
                     <span className="text-xs font-mono text-accent font-bold tracking-[0.2em] shadow-glow-secondary">NEURAL TERMINAL // <span className="text-white opacity-50">NODE-01</span></span>
                 </div>
                 {isDefault && (
                     <div className="flex items-center gap-2 px-2 py-0.5 bg-accent/5 rounded text-[10px] font-mono text-accent border border-accent/20">
                         <div className="animate-spin"><Wifi size={10} /></div>
                         NEURAL SYNC ACTIVE
                     </div>
                 )}
             </div>

             <div className="flex-1 p-6 font-mono text-sm overflow-y-auto bg-[#0a0a0a] relative">
                 <div className="flex flex-col gap-3 relative z-10">
                     <div className="flex justify-between items-center text-slate-600 text-[10px] uppercase tracking-wider mb-2 border-b border-white/5 pb-2">
                         <span>Session: #{isDefault ? '8821-AF' : 'INIT-NEW'}</span>
                         <span>Encrypted: AES-256</span>
                     </div>
                     
                     {isDefault ? (
                        <>
                             <TerminalLine time="10:42:01" type="SYS" msg="Initializing neural pathways for Mission #8821..." color="text-slate-400" />
                             <TerminalLine time="10:42:04" type="ACK" msg="Target identified: wired.com/category/tech" color="text-white" highlight="text-green-400" />
                             
                             <div className="flex gap-4 items-start group mt-2">
                                 <span className="text-slate-600 shrink-0 text-xs mt-0.5">[10:42:08]</span>
                                 <span className="text-primary font-bold shrink-0 text-xs mt-0.5 border border-primary/30 px-1 rounded bg-primary/5">EXE</span>
                                 <div className="flex flex-col gap-1 w-full max-w-md">
                                     <span className="text-slate-200">CRAWLING URL...</span>
                                     <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden mt-1">
                                         <div className="h-full bg-gradient-to-r from-primary to-accent w-full rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                                     </div>
                                     <span className="text-[10px] text-accent/80 text-right font-bold">DATA STREAM ESTABLISHED</span>
                                 </div>
                             </div>

                             <div className="flex gap-4 items-start mt-2 bg-white/5 p-3 rounded border-l-2 border-accent">
                                 <span className="text-slate-600 shrink-0 text-xs mt-0.5">[10:42:12]</span>
                                 <div className="flex flex-col gap-1 w-full">
                                     <span className="text-white font-medium">READING PDF: 'Q3_Report_Final.pdf'</span>
                                     <div className="flex gap-0.5 h-4 items-end opacity-70">
                                         {[40, 70, 50, 90, 60, 30, 80].map((h, i) => (
                                             <div key={i} className="w-1 bg-accent animate-pulse" style={{height: `${h}%`, animationDelay: `${i * 0.1}s`}}></div>
                                         ))}
                                     </div>
                                 </div>
                             </div>
                             
                             <div className="flex gap-4 items-start mt-1 pl-3">
                                 <span className="text-slate-600 shrink-0 text-xs mt-0.5">[10:42:15]</span>
                                 <span className="text-slate-500">GROUNDING RAW TRUTH... (Analyzing entities)<span className="animate-pulse ml-1 text-accent">_</span></span>
                             </div>
                        </>
                     ) : (
                        <div className="flex flex-col items-center justify-center h-48 opacity-50 space-y-2">
                            <Loader2 size={24} className="text-primary animate-spin" />
                            <span className="text-slate-500 text-xs">Awaiting launch command...</span>
                        </div>
                     )}
                 </div>
             </div>
          </section>
       </div>
    </div>
  );
};

const ProtocolButton = ({ icon: Icon, label }: any) => (
  <Tooltip content={`Activate Protocol: ${label}`} side="top">
    <button className="px-3 py-1.5 rounded-lg bg-panel hover:bg-primary/20 border border-white/5 hover:border-primary/40 text-xs text-slate-300 hover:text-white font-medium transition-all flex items-center gap-2 group">
        <Icon size={14} className="text-accent group-hover:text-primary transition-colors" /> {label}
    </button>
  </Tooltip>
);

const TerminalLine = ({ time, type, msg, color, highlight }: any) => (
  <div className="flex gap-4 items-start">
      <span className="text-slate-600 shrink-0 text-xs mt-0.5">[{time}]</span>
      <span className={`${highlight || 'text-slate-500'} font-bold shrink-0 text-xs mt-0.5 border border-white/10 px-1 rounded bg-white/5`}>{type}</span>
      <span className={color}>{msg}</span>
  </div>
);

export default ScoutView;