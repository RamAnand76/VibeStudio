import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  Handle, 
  Position, 
  Node,
  Edge,
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  EdgeProps
} from '@xyflow/react';
import { 
  Database, FileJson, CheckCircle2, 
  AlertCircle, Activity, Server, Clock, X,
  Cpu, AlertTriangle, MousePointer2
} from 'lucide-react';
import { Tooltip } from '../components/Shared';
import { Project } from '../App';

// --- Types ---

type NodeStatus = 'healthy' | 'warning' | 'error';

interface NodeMetrics {
    throughput: number;
    latency: number;
    errorRate: number;
    cpu: number;
    memory: number;
}

interface NodeData {
  label: string;
  subLabel: string;
  type: 'source' | 'transform' | 'destination';
  status: NodeStatus;
  metrics: NodeMetrics;
  config: Record<string, string>;
  logs: string[];
}

// --- Custom Edge Component ---
// This creates the animated "data packet" flow effect
const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Base darker path */}
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: 2, stroke: '#1e293b' }} />
      
      {/* Animated Gradient Path */}
      <path
        d={edgePath}
        fill="none"
        stroke="url(#edge-gradient)"
        strokeWidth={2}
        className="react-flow__edge-path animate-dash"
        strokeDasharray="10 5"
        style={{
            animation: 'dash 1s linear infinite',
            opacity: 0.8
        }}
      />
      
      {/* Data Packet Particle */}
      <circle r="4" fill="#818cf8">
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* SVG Definition for Gradient */}
      <defs>
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="1" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
          </linearGradient>
      </defs>
    </>
  );
};

// --- Custom Node Component (The Card) ---

const CustomPipelineNode = ({ data, selected }: { data: NodeData, selected?: boolean }) => {
    const statusColors = {
        healthy: 'border-white/10 bg-[#131826]',
        warning: 'border-amber-500/50 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]',
        error: 'border-red-500/50 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]',
    };

    const statusIcons = {
        healthy: <CheckCircle2 size={14} className="text-emerald-400" />,
        warning: <AlertTriangle size={14} className="text-amber-400 animate-pulse" />,
        error: <AlertCircle size={14} className="text-red-400 animate-pulse" />,
    };

    const statusText = {
        healthy: 'text-emerald-400',
        warning: 'text-amber-400',
        error: 'text-red-400',
    };

    const formatNum = (n: number) => new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(n);

    // Icons based on type
    const Icon = data.type === 'transform' ? FileJson : Database;
    
    return (
        <div className="relative group">
            {/* Target Handle (Left) */}
            {data.type !== 'source' && (
                <Handle 
                    type="target" 
                    position={Position.Left} 
                    className="!w-4 !h-4 !bg-[#131826] !border-2 !border-slate-500 !-left-2 !top-1/2 !-translate-y-1/2 transition-colors hover:!border-primary" 
                />
            )}
            
            <div className={`
                w-72 p-0 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 overflow-hidden
                ${statusColors[data.status]}
                ${selected ? 'ring-2 ring-primary scale-105 shadow-2xl' : 'hover:border-primary/30'}
            `}>
                {/* Header Area */}
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-start">
                    <div className="flex gap-3">
                        <div className={`p-2 rounded-lg border ${selected ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-[#0B0F19] border-white/10 text-slate-300'}`}>
                            <Icon size={18} />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm tracking-tight leading-tight">{data.label}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{data.subLabel}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/5 bg-black/20">
                        {statusIcons[data.status]}
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${statusText[data.status]}`}>
                            {data.status}
                        </span>
                    </div>
                </div>

                {/* Metrics Content */}
                <div className="p-4 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Throughput</span>
                        <div className="flex items-baseline gap-1">
                             <span className="text-sm font-mono text-slate-200">{formatNum(data.metrics.throughput)}</span>
                             <span className="text-[10px] text-slate-500">/s</span>
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Latency</span>
                        <div className="flex items-baseline gap-1">
                             <span className={`text-sm font-mono ${data.metrics.latency > 150 ? 'text-amber-400' : 'text-slate-200'}`}>
                                {data.metrics.latency.toFixed(0)}
                             </span>
                             <span className="text-[10px] text-slate-500">ms</span>
                        </div>
                    </div>

                    <div className="col-span-2 space-y-1 mt-1">
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            <span>Load</span>
                            <span>{data.metrics.cpu}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${data.metrics.cpu > 80 ? 'bg-amber-500' : 'bg-primary'}`} 
                                style={{ width: `${data.metrics.cpu}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Source Handle (Right) */}
            {data.type !== 'destination' && (
                <Handle 
                    type="source" 
                    position={Position.Right} 
                    className="!w-4 !h-4 !bg-[#131826] !border-2 !border-primary !-right-2 !top-1/2 !-translate-y-1/2 shadow-[0_0_10px_rgba(129,140,248,0.5)]" 
                />
            )}
        </div>
    );
};

// --- Initial Data ---

const INITIAL_NODES: Node<NodeData>[] = [
  {
    id: 'postgres',
    type: 'pipelineNode',
    position: { x: 50, y: 200 },
    data: {
      type: 'source',
      label: 'Postgres_Source',
      subLabel: 'Primary DB',
      status: 'healthy',
      metrics: { throughput: 1240000, latency: 45, errorRate: 0.01, cpu: 32, memory: 45 },
      config: { "host": "production-db.internal", "port": "5432", "user": "etl_reader" },
      logs: ["[10:42:01] Connection pool established (5/10)"]
    }
  },
  {
    id: 'transform',
    type: 'pipelineNode',
    position: { x: 450, y: 200 },
    data: {
      type: 'transform',
      label: 'Transform_Raw',
      subLabel: 'Cleaning & Norm',
      status: 'healthy',
      metrics: { throughput: 850, latency: 120, errorRate: 0.0, cpu: 65, memory: 78 },
      config: { "engine": "Spark 3.4", "workers": "4" },
      logs: ["[10:42:06] Schema validation passed"]
    }
  },
  {
    id: 'snowflake',
    type: 'pipelineNode',
    position: { x: 850, y: 200 },
    data: {
      type: 'destination',
      label: 'Snowflake_Dest',
      subLabel: 'Analytics Warehouse',
      status: 'healthy',
      metrics: { throughput: 845, latency: 200, errorRate: 0.0, cpu: 20, memory: 30 },
      config: { "warehouse": "COMPUTE_WH", "schema": "EVENTS" },
      logs: ["[10:42:10] Transaction committed"]
    }
  }
];

const INITIAL_EDGES: Edge[] = [
    { id: 'e1-2', source: 'postgres', target: 'transform', type: 'custom', animated: true },
    { id: 'e2-3', source: 'transform', target: 'snowflake', type: 'custom', animated: true }
];

const PipelineView: React.FC<{ project: Project }> = ({ project }) => {
  const nodeTypes = useMemo(() => ({ pipelineNode: CustomPipelineNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);
  
  // Use a key to reset the flow when project changes
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const [selectedNodeData, setSelectedNodeData] = useState<NodeData | null>(null);

  // Initialize data based on project
  useEffect(() => {
    if (project.id === 'default-01') {
        setNodes(INITIAL_NODES);
        setEdges(INITIAL_EDGES);
    } else {
        setNodes([]);
        setEdges([]);
    }
  }, [project.id, setNodes, setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
      setSelectedNodeData(node.data as NodeData);
  }, []);

  const closeDetailPanel = () => setSelectedNodeData(null);

  // Simulation Loop
  useEffect(() => {
    // Only simulate if nodes exist
    if (nodes.length === 0) return;

    const interval = setInterval(() => {
      setNodes((nds) => nds.map((node) => {
        const newData = { ...node.data };
        const metrics = { ...newData.metrics };

        if (node.id === 'postgres') {
            metrics.throughput = 1240000 + Math.floor(Math.random() * 50000) - 25000;
            metrics.cpu = Math.min(100, Math.max(10, metrics.cpu + (Math.random() * 4 - 2)));
        } else if (node.id === 'transform') {
            metrics.throughput = 850 + Math.floor(Math.random() * 50) - 25;
            metrics.cpu = Math.min(100, Math.max(20, metrics.cpu + (Math.random() * 10 - 5)));
            
            if (Math.random() > 0.98) newData.status = 'warning';
            else if (Math.random() > 0.995) { newData.status = 'error'; metrics.errorRate = 5.2; }
            else if (Math.random() > 0.95 && newData.status !== 'healthy') { newData.status = 'healthy'; metrics.errorRate = 0; }
        } else if (node.id === 'snowflake') {
            metrics.throughput = 845 + Math.floor(Math.random() * 40) - 20;
        }

        return { ...node, data: { ...newData, metrics } };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [setNodes, nodes.length]);

  return (
    <div className="flex h-full p-4 lg:p-6 gap-6 relative">
      <div className="flex-1 rounded-xl border border-white/5 bg-[#131826] overflow-hidden relative shadow-inner flex flex-col">
        {/* Toolbar Overlay */}
        <div className="absolute top-4 left-4 z-10 flex gap-2 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0B0F19] border border-white/10 shadow-lg backdrop-blur-md pointer-events-auto">
               <div className="flex items-center gap-2">
                   <div className={`size-2 rounded-full ${project.id === 'default-01' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></div>
                   <span className="text-xs font-medium text-slate-300">Live Topology</span>
               </div>
            </div>
        </div>

        {/* React Flow Canvas */}
        <div className="w-full h-full bg-[#0B0F19] relative group">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onPaneClick={closeDetailPanel}
                fitView
                minZoom={0.5}
                maxZoom={2}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#1f2937" gap={20} size={1} />
                <Controls className="!bg-[#131826] !border-white/10 [&>button]:!fill-white [&>button]:!border-white/10 hover:[&>button]:!bg-white/10" />
            </ReactFlow>

            {/* Empty State Overlay */}
            {nodes.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="p-4 rounded-full bg-white/5 border border-white/5 mb-4 animate-bounce">
                        <MousePointer2 size={32} className="text-slate-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Pipelines Configured</h3>
                    <p className="text-slate-500 max-w-sm text-center">Use the Architect AI to generate a new pipeline or drag nodes from the sidebar to begin.</p>
                </div>
            )}
        </div>
      </div>

       {/* Floating Log Widget (Visible when no selection on large screens) */}
       {!selectedNodeData && nodes.length > 0 && (
            <div className="absolute bottom-6 right-6 w-96 rounded-xl border border-white/5 bg-[#131826] shadow-2xl overflow-hidden hidden xl:flex flex-col animate-in fade-in slide-in-from-bottom-4 z-30 pointer-events-none">
                <div className="p-3 border-b border-white/5 bg-[#0B0F19] flex justify-between items-center pointer-events-auto">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Live Events</span>
                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <div className="p-0 max-h-60 overflow-y-auto pointer-events-auto">
                    <LedgerItem agent="System" time="10:42:15" msg="Metrics aggregation interval matched." color="border-l-primary text-primary" />
                    <LedgerItem agent="Monitor" time="10:42:05" msg="Transform node latency spike detected (120ms)." color="border-l-amber-400 text-amber-400" bg="bg-amber-500/5" />
                    <LedgerItem agent="Forge" time="10:41:45" msg="Schema consensus reached for 'users_v2'." color="border-l-emerald-400 text-emerald-400" />
                </div>
            </div>
       )}

       {/* Slide-over Detail Panel */}
       {selectedNodeData && (
           <NodeDetailPanel node={selectedNodeData} onClose={closeDetailPanel} />
       )}
    </div>
  );
};

// --- Sub Components ---

const NodeDetailPanel = ({ node, onClose }: { node: NodeData, onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'config'>('overview');

    return (
        <div className="absolute top-4 right-4 bottom-4 w-full md:w-[480px] bg-[#131826]/95 backdrop-blur-xl border border-white/5 shadow-2xl z-40 flex flex-col rounded-xl overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-white/5 shrink-0 bg-[#0B0F19]">
                <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white text-base">{node.label}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 uppercase tracking-wider">{node.type}</span>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center px-2 border-b border-white/5 bg-[#0B0F19] shrink-0">
                {['overview', 'logs', 'config'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`
                            px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors
                            ${activeTab === tab ? 'border-primary text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className={`p-4 rounded-xl border ${node.status === 'healthy' ? 'bg-emerald-500/5 border-emerald-500/20' : node.status === 'warning' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                             <div className="flex items-center gap-3 mb-2">
                                {node.status === 'healthy' && <CheckCircle2 size={20} className="text-emerald-500" />}
                                {node.status === 'warning' && <AlertTriangle size={20} className="text-amber-500" />}
                                {node.status === 'error' && <AlertCircle size={20} className="text-red-500" />}
                                <span className={`font-bold uppercase tracking-wide text-sm ${node.status === 'healthy' ? 'text-emerald-500' : node.status === 'warning' ? 'text-amber-500' : 'text-red-500'}`}>
                                    System Status: {node.status}
                                </span>
                             </div>
                             <p className="text-sm text-slate-400 leading-relaxed">
                                {node.status === 'healthy' ? 'All systems operational. Performance within optimal parameters.' : 'Performance degradation detected. Automatic scaling engaged.'}
                             </p>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <MetricCard label="Throughput" value={node.metrics.throughput.toLocaleString()} unit="ops/s" icon={Activity} />
                            <MetricCard label="Latency" value={node.metrics.latency.toFixed(1)} unit="ms" icon={Clock} />
                            <MetricCard label="CPU Usage" value={node.metrics.cpu.toFixed(1)} unit="%" icon={Cpu} />
                            <MetricCard label="Memory" value={node.metrics.memory.toFixed(1)} unit="%" icon={Server} />
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                             <span className="text-xs font-mono text-slate-500">Live Tail</span>
                             <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                CONNECTED
                             </div>
                        </div>
                        <div className="bg-[#0B0F19] rounded-lg p-4 font-mono text-xs text-slate-300 border border-white/10 h-[400px] overflow-y-auto custom-scrollbar">
                            {node.logs.map((log, i) => (
                                <div key={i} className="mb-2 break-all hover:bg-white/5 p-1 rounded transition-colors">
                                    <span className="opacity-30 mr-2 select-none">$</span>
                                    {log}
                                </div>
                            ))}
                            <div className="animate-pulse text-primary mt-2">_</div>
                        </div>
                    </div>
                )}

                {activeTab === 'config' && (
                    <div className="space-y-4">
                        <div className="bg-[#0B0F19] rounded-xl border border-white/10 overflow-hidden">
                             {Object.entries(node.config || {}).map(([key, value], i) => (
                                 <div key={key} className={`flex justify-between p-3 text-sm ${i !== Object.keys(node.config).length - 1 ? 'border-b border-white/5' : ''}`}>
                                     <span className="text-slate-500 font-mono">{key}</span>
                                     <span className="text-white font-mono">{value}</span>
                                 </div>
                             ))}
                        </div>
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-primary text-xs flex gap-3">
                            <InfoIcon size={16} className="shrink-0 mt-0.5" />
                            <p>Configuration changes require a node restart to take effect. Managed by Terraform.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, unit, icon: Icon }: any) => (
    <div className="p-4 rounded-xl bg-[#0B0F19] border border-white/5 hover:border-white/10 transition-colors group">
        <div className="flex items-center gap-2 mb-2 text-slate-500 group-hover:text-primary transition-colors">
            <Icon size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-bold text-white">{value}</span>
            <span className="text-xs text-slate-500 font-mono">{unit}</span>
        </div>
    </div>
);

const LedgerItem = ({ agent, time, msg, color, bg = "" }: any) => (
  <div className={`border-b border-white/5 last:border-0 p-3 hover:bg-white/5 transition-colors cursor-pointer border-l-2 border-l-transparent hover:${color} ${bg}`}>
    <div className="flex justify-between mb-1">
       <span className={`font-bold text-xs ${color.split(' ')[1]}`}>{agent}</span>
       <span className="text-slate-500 text-[10px]">{time}</span>
    </div>
    <p className="text-slate-300 text-xs leading-relaxed truncate">{msg}</p>
  </div>
);

const InfoIcon = ({size, className}: any) => <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;

export default PipelineView;