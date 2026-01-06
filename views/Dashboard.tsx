import React, { useState, useMemo } from 'react';
import { Bot, Activity, HardDrive, Zap, Search, Database, Terminal, ArrowUpRight, Filter, Download, MoreHorizontal, Calendar, Loader2 } from 'lucide-react';
import { Tooltip } from '../components/Shared';
import { Project } from '../App';

// Mock Data Structure
interface LogData {
  id: string;
  time: string;
  type: 'INFO' | 'WARN' | 'ERROR' | 'EXEC';
  agent: string;
  message: string;
}

const INITIAL_LOGS: LogData[] = [
  { id: '1', time: "10:42:15", type: "INFO", agent: "Alpha-1", message: 'Initializing Agent "Alpha-1"...' },
  { id: '2', time: "10:42:16", type: "INFO", agent: "Alpha-1", message: "Connection established to Warehouse." },
  { id: '3', time: "10:42:18", type: "EXEC", agent: "Alpha-1", message: 'Querying schema "public.users"...' },
  { id: '4', time: "10:42:19", type: "INFO", agent: "Alpha-1", message: "Returned 14,502 rows." },
  { id: '5', time: "10:43:01", type: "WARN", agent: "Monitor", message: "High latency detected on node-3." },
  { id: '6', time: "10:43:05", type: "INFO", agent: "System", message: "Retrying connection..." },
  { id: '7', time: "10:43:10", type: "ERROR", agent: "Beta-2", message: "Failed to parse JSON response." },
  { id: '8', time: "10:43:15", type: "EXEC", agent: "System", message: "Running cleanup routine." },
];

const Dashboard: React.FC<{ project: Project }> = ({ project }) => {
  // Filter State
  const [logs] = useState<LogData[]>(INITIAL_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const isDefaultProject = project.id === 'default-01';

  // Filter Logic
  const filteredLogs = useMemo(() => {
    if (!isDefaultProject) return [];
    return logs.filter(log => {
      const matchesSearch = 
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
        log.agent.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'ALL' || log.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [logs, searchQuery, selectedType, isDefaultProject]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INFO': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'WARN': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'ERROR': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'EXEC': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  if (!isDefaultProject) {
      return (
          <div className="p-6 md:p-8 max-w-[1920px] mx-auto space-y-8 h-full flex flex-col justify-center items-center">
              <div className="text-center space-y-4 max-w-md">
                  <div className="relative mx-auto size-24 mb-4">
                      <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75"></div>
                      <div className="relative size-24 bg-[#131826] border border-primary/30 rounded-full flex items-center justify-center text-primary shadow-glow">
                          <Loader2 size={40} className="animate-spin" />
                      </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Initializing {project.name}...</h2>
                  <p className="text-slate-400">
                      VibeData is provisioning resources for your new workspace. 
                      Agents are scanning the provided configuration and setting up the observability pipeline.
                  </p>
                  
                  <div className="bg-[#131826] border border-white/5 rounded-xl p-4 w-full text-left mt-6 space-y-3">
                      <StepItem status="done" label="Workspace Created" />
                      <StepItem status="done" label="Identity & Access Management Configured" />
                      <StepItem status="processing" label="Provisioning Compute Nodes..." />
                      <StepItem status="pending" label="Deploying Agent Scouts" />
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="p-6 md:p-8 max-w-[1920px] mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-display font-bold text-white">Workspace Overview</h1>
                <p className="text-slate-400 text-sm mt-1">Project: <span className="text-white font-medium">{project.name}</span> • System performance is optimal.</p>
            </div>
            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/5 bg-[#131826] hover:bg-white/5 text-sm text-slate-300 transition-colors">
                    <Calendar size={16} />
                    <span>Last 24 Hours</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/5 bg-[#131826] hover:bg-white/5 text-sm text-slate-300 transition-colors">
                    <Download size={16} />
                    <span>Export Report</span>
                </button>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Active Agents" 
            value="4" 
            change="+1"
            trend="up"
            icon={Bot} 
            color="text-primary" 
          />
          <StatCard 
            title="Pipeline Uptime" 
            value="99.9%" 
            change="Stable"
            trend="neutral"
            icon={Activity} 
            color="text-emerald-400" 
          />
          <StatCard 
            title="Data Processed" 
            value="2.4 TB" 
            change="+12%"
            trend="up"
            icon={HardDrive} 
            color="text-purple-400" 
          />
          <StatCard 
            title="API Latency" 
            value="42ms" 
            change="-5ms"
            trend="down" // down is good for latency
            isInverseTrend
            icon={Zap} 
            color="text-amber-400" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* AI Action Widget */}
            <div className="rounded-xl border border-white/5 bg-[#131826] overflow-hidden">
                <div className="p-1">
                    <div className="relative bg-gradient-to-r from-primary/10 to-transparent rounded-lg p-6 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                <Zap size={20} />
                            </div>
                            <div>
                                <h3 className="text-white font-medium text-lg">AI Orchestrator</h3>
                                <p className="text-slate-400 text-xs">Execute complex tasks using natural language.</p>
                            </div>
                        </div>
                        
                        <div className="relative">
                            <textarea 
                                className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-4 text-base text-white placeholder-slate-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none font-sans" 
                                placeholder="Describe a task... e.g. 'Create a pipeline to sync Postgres users to Snowflake every hour'" 
                                rows={3}
                            ></textarea>
                            <div className="absolute bottom-3 right-3">
                                <button className="bg-primary hover:bg-primary-glow text-white rounded-lg p-2 transition-colors shadow-lg">
                                    <ArrowUpRight size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <QuickAction icon={Database} label="Connect DB" />
                            <QuickAction icon={Terminal} label="New Script" />
                            <QuickAction icon={Bot} label="Deploy Agent" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Pipelines Table */}
            <div className="rounded-xl border border-white/5 bg-[#131826] overflow-hidden flex flex-col">
              <div className="p-5 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-white font-display font-medium">Active Pipelines</h3>
                <button className="p-1.5 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors">
                    <MoreHorizontal size={20} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/[0.02] text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Pipeline Name</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Source</th>
                      <th className="px-6 py-4">Latency</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    <PipelineRow name="etl_customer_sync" status="Running" source="Postgres" latency="45ms" />
                    <PipelineRow name="clickstream_analytics" status="Running" source="Kafka" latency="120ms" />
                    <PipelineRow name="daily_reports" status="Idle" source="Snowflake" latency="-" />
                    <PipelineRow name="sentiment_analysis" status="Error" source="Twitter API" latency="-" />
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column: Logs */}
          <div className="rounded-xl border border-white/5 bg-[#131826] flex flex-col h-[600px]">
            <div className="p-5 border-b border-white/5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Terminal size={18} className="text-slate-400" />
                    <h3 className="text-white font-medium">System Logs</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs text-emerald-500 font-medium">Live</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        className="w-full bg-[#0B0F19] border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-primary/50 focus:ring-0" 
                        placeholder="Search logs..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="p-2 border border-white/10 rounded-lg bg-[#0B0F19] text-slate-400 hover:text-white hover:border-white/20 transition-colors">
                    <Filter size={14} />
                </button>
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {['ALL', 'INFO', 'WARN', 'ERROR', 'EXEC'].map(type => (
                      <button 
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all whitespace-nowrap ${
                            selectedType === type 
                            ? 'bg-white/10 text-white border-white/20' 
                            : 'text-slate-500 border-transparent hover:bg-white/5'
                          }`}
                      >
                          {type}
                      </button>
                  ))}
               </div>
            </div>
            
            <div className="flex-1 p-2 overflow-y-auto custom-scrollbar bg-[#0B0F19]/50">
              <div className="space-y-1">
                {filteredLogs.map(log => (
                    <div key={log.id} className="group flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-xs font-mono border border-transparent hover:border-white/5 cursor-pointer">
                      <div className="text-slate-600 shrink-0 w-16">{log.time}</div>
                      <div className={`px-1.5 py-0.5 rounded border text-[10px] font-bold self-start ${getTypeColor(log.type)}`}>
                          {log.type}
                      </div>
                      <div className="flex-1 min-w-0">
                          <span className="text-slate-500 mr-2">[{log.agent}]</span>
                          <span className="text-slate-300">{log.message}</span>
                      </div>
                    </div>
                ))}
                {filteredLogs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-2">
                        <Search size={24} />
                        <span className="text-xs">No logs found</span>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

// Sub-components

const StepItem = ({ status, label }: { status: 'done' | 'processing' | 'pending', label: string }) => (
    <div className="flex items-center gap-3">
        <div className={`
            size-5 rounded-full flex items-center justify-center shrink-0 border
            ${status === 'done' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : ''}
            ${status === 'processing' ? 'bg-primary/20 border-primary text-primary' : ''}
            ${status === 'pending' ? 'bg-slate-800 border-slate-700 text-slate-600' : ''}
        `}>
            {status === 'done' && <CheckIcon size={12} />}
            {status === 'processing' && <Loader2 size={12} className="animate-spin" />}
        </div>
        <span className={`text-sm ${status === 'pending' ? 'text-slate-600' : 'text-slate-300'}`}>{label}</span>
    </div>
);

const CheckIcon = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

const StatCard = ({ title, value, change, trend, icon: Icon, color, isInverseTrend }: any) => {
    const isPositive = trend === 'up';
    const trendColor = isInverseTrend 
        ? (isPositive ? 'text-rose-400' : 'text-emerald-400')
        : (isPositive ? 'text-emerald-400' : (trend === 'down' ? 'text-rose-400' : 'text-slate-400'));

    return (
        <div className="p-6 rounded-xl border border-white/5 bg-[#131826] hover:border-white/10 transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-white/5 ${color} group-hover:bg-white/10 transition-colors`}>
                    <Icon size={20} />
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full bg-white/5 ${trendColor}`}>
                    {change}
                </div>
            </div>
            <div>
                <div className="text-2xl font-bold text-white font-display tracking-tight">{value}</div>
                <div className="text-sm text-slate-500 font-medium mt-1">{title}</div>
            </div>
        </div>
    );
};

const QuickAction = ({ icon: Icon, label }: any) => (
    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium text-slate-300 transition-colors">
        <Icon size={14} />
        {label}
    </button>
);

const PipelineRow = ({ name, status, source, latency }: any) => {
    const statusConfig = {
        Running: { color: 'bg-emerald-500', text: 'text-emerald-400' },
        Idle: { color: 'bg-slate-500', text: 'text-slate-400' },
        Error: { color: 'bg-rose-500', text: 'text-rose-400' },
    };
    // @ts-ignore
    const { color, text } = statusConfig[status] || statusConfig.Idle;

    return (
        <tr className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
            <td className="px-6 py-4 font-medium text-white group-hover:text-primary transition-colors">{name}</td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className={`size-1.5 rounded-full ${color} ${status === 'Running' ? 'animate-pulse' : ''}`}></span>
                    <span className={`text-xs font-medium ${text}`}>{status}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-slate-400">{source}</td>
            <td className="px-6 py-4 text-slate-400 font-mono text-xs">{latency}</td>
            <td className="px-6 py-4 text-right">
                <button className="p-1.5 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors">
                    <ArrowUpRight size={16} />
                </button>
            </td>
        </tr>
    );
};

export default Dashboard;