import React, { useEffect, useRef, useState } from 'react';
import { 
  Maximize2, Layers, Focus, Mic, 
  ArrowUp, Activity, Zap, BarChart3, LayoutTemplate
} from 'lucide-react';
import { Tooltip } from '../components/Shared';
import { Project } from '../App';

const PulseView: React.FC<{ project: Project }> = ({ project }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [frequency, setFrequency] = useState(45);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Camera State Refs for Performance (no re-renders on every frame move)
  const viewState = useRef({ 
    x: 0, 
    y: 0, 
    zoom: 1,
    isDragging: false,
    lastMouse: { x: 0, y: 0 }
  });

  // Handle Mouse/Touch Interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    viewState.current.isDragging = true;
    viewState.current.lastMouse = { x: e.clientX, y: e.clientY };
    if(containerRef.current) containerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!viewState.current.isDragging) return;
    const dx = e.clientX - viewState.current.lastMouse.x;
    const dy = e.clientY - viewState.current.lastMouse.y;
    
    // Pan logic
    viewState.current.x += dx;
    viewState.current.y += dy;
    
    viewState.current.lastMouse = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    viewState.current.isDragging = false;
    if(containerRef.current) containerRef.current.releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomSensitivity = 0.001;
    const newZoom = viewState.current.zoom - e.deltaY * zoomSensitivity;
    // Clamp zoom
    viewState.current.zoom = Math.min(Math.max(0.2, newZoom), 5);
  };

  // Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      if (!canvas || !ctx) return;
      
      const isDark = document.documentElement.classList.contains('dark');
      
      // Clear
      ctx.fillStyle = isDark ? '#0B0F19' : '#f8fafc'; // Slate-50 for light mode
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const cols = 60;
      const rows = 50;
      const spacing = 40;
      const fov = 400;

      // Camera Props
      const cam = viewState.current;

      // Generate Grid Points
      const gridPoints: {x: number, y: number, z: number, alpha: number}[][] = [];
      
      for (let r = 0; r < rows; r++) {
         const rowPoints = [];
         for (let c = 0; c <= cols; c++) {
             // Grid Coordinates centered
             const xx = (c - cols/2) * spacing * 1.5;
             const zz = 200 + r * spacing * 1.5; // Depth
             
             // Noise/Terrain Function
             const noiseX = c * 0.15;
             const noiseY = (r * 0.1) - (time * 0.5); // Movement
             
             // Peaks
             const peak1 = Math.max(0, 400 - Math.sqrt(Math.pow(c - cols*0.35, 2) + Math.pow(r - rows*0.4, 2)) * 40);
             const peak2 = Math.max(0, 300 - Math.sqrt(Math.pow(c - cols*0.7, 2) + Math.pow(r - rows*0.6, 2)) * 30);
             
             // Rolling
             const rolling = Math.sin(noiseX) * Math.cos(noiseY) * 60;
             
             // Frequency distortion
             const freqEffect = Math.sin((c*0.5) + time*2) * (frequency / 2);
             
             const yy = 400 - (peak1 + peak2 + rolling + freqEffect);

             // Perspective Projection + Camera Transform
             // We apply scale (zoom) and translation (pan) here
             const scale = (fov / (fov + zz)) * cam.zoom;
             
             // Apply Pan X/Y to the projected 2D coordinates
             const x2d = (w/2) + (xx * scale) + cam.x;
             const y2d = (h/2) + (yy * scale) - 100 + cam.y; 
             
             // Distance Fog
             const alpha = Math.max(0, Math.min(1, (1 - (r / rows)) * 1.5));
             
             rowPoints.push({ x: x2d, y: y2d, z: zz, alpha });
         }
         gridPoints.push(rowPoints);
      }

      // Draw Grid Lines
      ctx.lineWidth = 1;
      
      for (let r = 0; r < rows; r++) {
          for (let c = 0; c <= cols; c++) {
              const p = gridPoints[r][c];
              
              // Skip if out of bounds (approx) for performance
              if (p.x < -200 || p.x > w + 200 || p.y < -200 || p.y > h + 200) continue;

              const alpha = p.alpha;
              // Theme aware stroke color
              // Dark: Purple 500 (#a855f7), Light: Purple 600 (#9333ea)
              const rCol = isDark ? 168 : 147;
              const gCol = isDark ? 85 : 51;
              const bCol = isDark ? 247 : 234;
              
              ctx.strokeStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${alpha * 0.4})`;

              // Horizontal
              if (c < cols - 1) {
                  const pRight = gridPoints[r][c+1];
                  ctx.beginPath();
                  ctx.moveTo(p.x, p.y);
                  ctx.lineTo(pRight.x, pRight.y);
                  ctx.stroke();
              }
              
              // Vertical
              if (r < rows - 1) {
                  const pDown = gridPoints[r+1][c];
                  ctx.beginPath();
                  ctx.moveTo(p.x, p.y);
                  ctx.lineTo(pDown.x, pDown.y);
                  ctx.stroke();
              }
          }
      }
      
      time += 0.015;
      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [frequency]);

  return (
    <div 
        ref={containerRef}
        className="relative h-full w-full overflow-hidden bg-gray-50 dark:bg-[#0B0F19] select-none cursor-move touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
    >
      
      {/* 3D Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* --- HUD Layers --- */}
      {/* Note: In a real app, HUD elements would likely track 3D positions. 
          Here we keep them as 'screen space' overlays for the 'Scanner' feel. */}

      {/* Floating Labels */}
      <div className="absolute top-[35%] left-[28%] pointer-events-none animate-[pulse-slow_4s_infinite]">
         <div className="bg-[#a855f7]/20 border border-[#a855f7]/50 text-[#a855f7] px-3 py-1 rounded text-xs font-mono font-bold backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#a855f7] rounded-full animate-pulse"></span>
            Cluster: {project.id === 'default-01' ? 'Q3 Finance' : project.name}
         </div>
         <div className="h-16 w-px bg-gradient-to-b from-[#a855f7]/50 to-transparent mx-auto"></div>
      </div>

      <div className="absolute top-[45%] right-[35%] opacity-80 pointer-events-none">
         <div className="bg-slate-800/40 border border-slate-600/50 text-slate-300 px-3 py-1 rounded text-xs font-mono backdrop-blur-md flex items-center gap-2">
            Log Anomalies
         </div>
         <div className="h-10 w-px bg-gradient-to-b from-slate-600/50 to-transparent mx-auto"></div>
      </div>

      {/* Left Panel: Live Metrics */}
      <div className="absolute top-6 left-6 w-72 glass-panel rounded-2xl p-6 border dark:bg-[#0F1423]/80 animate-in slide-in-from-left-4 fade-in duration-700 pointer-events-auto">
         <div className="flex items-center gap-2 mb-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            <BarChart3 size={14} /> Live Metrics
         </div>

         <div className="space-y-6">
            <div>
               <div className="flex justify-between items-end mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Data Density</span>
                  <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">+12%</span>
               </div>
               <div className="text-3xl font-display font-bold text-slate-900 dark:text-white">1.2M <span className="text-sm font-normal text-slate-500">pts</span></div>
            </div>
            
            <div className="h-px bg-gray-200 dark:bg-white/5"></div>

            <div>
               <div className="flex justify-between items-end mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Peak Cluster</span>
                  <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400">Stable</span>
               </div>
               <div className="text-xl font-display font-bold text-slate-900 dark:text-white truncate">{project.id === 'default-01' ? 'Q3 Finance' : project.name}</div>
            </div>

            <div className="h-px bg-gray-200 dark:bg-white/5"></div>

            <div>
               <div className="flex justify-between items-end mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Anomaly Score</span>
                  <span className="text-xs font-bold text-amber-500 dark:text-amber-400">Warning</span>
               </div>
               <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white tracking-wider">0.042</div>
               <div className="w-full bg-gray-200 dark:bg-white/10 h-1 rounded-full mt-3 overflow-hidden">
                   <div className="h-full bg-amber-400 w-[42%] rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"></div>
               </div>
            </div>
         </div>
      </div>

      {/* Right Top Controls */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-4 animate-in slide-in-from-right-4 fade-in duration-700 pointer-events-auto">
         
         {/* Top Toolbar */}
         <div className="flex items-center gap-1 p-1 rounded-lg bg-white/90 dark:bg-[#0F1423]/90 border border-gray-200 dark:border-white/10 backdrop-blur-md">
            <ControlButton icon={Focus} label="Focus" />
            <ControlButton icon={Layers} label="Layers" active />
            <ControlButton icon={LayoutTemplate} label="Layout" />
            <ControlButton icon={Maximize2} label="Fullscreen" />
         </div>

         {/* Frequency Control Panel */}
         <div className="w-72 glass-panel rounded-2xl p-5 border border-purple-500/20 dark:bg-[#0F1423]/80 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
             <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-2">
                     <Activity size={16} className="text-purple-600 dark:text-purple-400" />
                     <span className="text-sm font-bold text-slate-900 dark:text-white">Vibe Freq.</span>
                 </div>
                 <span className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">{frequency}Hz</span>
             </div>

             <div className="mb-6 relative h-6 flex items-center">
                 <div className="absolute w-full h-1 bg-gray-200 dark:bg-white/10 rounded-full"></div>
                 <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={frequency}
                    onChange={(e) => setFrequency(Number(e.target.value))}
                    className="w-full absolute z-10 opacity-0 cursor-pointer h-full"
                 />
                 <div 
                    className="absolute h-1 bg-purple-500 rounded-full" 
                    style={{ width: `${(frequency - 10) * (100/90)}%` }}
                 ></div>
                 <div 
                    className="absolute size-4 bg-white rounded-full shadow-[0_0_10px_rgba(147,51,234,0.3)] cursor-pointer hover:scale-125 transition-transform border border-purple-100 dark:border-none"
                    style={{ left: `${(frequency - 10) * (100/90)}%`, transform: 'translateX(-50%)' }}
                 ></div>
             </div>

             <div className="flex justify-between items-center text-xs">
                 <span className="text-slate-500 font-mono">10Hz</span>
                 <span className="text-slate-500 font-mono">100Hz</span>
             </div>

             <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5 flex justify-between items-center">
                 <span className="text-xs text-slate-500 dark:text-slate-400">Temp: Cool</span>
                 <div className="flex gap-1">
                     <span className="size-2 rounded-full bg-sky-400"></span>
                     <span className="size-2 rounded-full bg-sky-400/50"></span>
                     <span className="size-2 rounded-full bg-sky-400/20"></span>
                 </div>
             </div>
         </div>
      </div>

      {/* Bottom Center Search Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[600px] animate-in slide-in-from-bottom-8 fade-in duration-700 pointer-events-auto">
         <div className={`
             relative flex items-center gap-2 p-1.5 pl-5 rounded-full 
             bg-white/90 dark:bg-[#0F1423]/90 backdrop-blur-xl border transition-all duration-300
             ${isSearchFocused 
                 ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)] ring-2 ring-purple-500/20' 
                 : 'border-gray-200 dark:border-white/10 hover:border-purple-400/40 shadow-lg'
             }
         `}>
             <div className={`transition-colors duration-300 ${isSearchFocused ? 'text-purple-500 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'} animate-pulse shrink-0`}>
                 <Zap size={18} fill="currentColor" />
             </div>
             
             <input 
                type="text"
                placeholder="Ask VibeData to highlight clusters..."
                className="flex-1 bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 h-10 px-2 selection:bg-purple-500/30"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
             />

             <div className="flex items-center gap-2 pr-1">
                 <Tooltip content="Voice Input" side="top">
                    <button className="size-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <Mic size={18} />
                    </button>
                 </Tooltip>
                 <button className={`
                    h-9 px-5 rounded-full text-white text-sm font-bold shadow-[0_0_15px_rgba(147,51,234,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2
                    ${isSearchFocused ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-600/90 hover:bg-purple-600'}
                 `}>
                     <ArrowUp size={16} />
                     Pulse
                 </button>
             </div>
         </div>
      </div>

      {/* Bottom Right Info */}
      <div className="absolute bottom-6 right-6 text-[10px] font-mono text-slate-500 text-right opacity-60 pointer-events-none">
          <div>LOC: <span className="text-purple-600 dark:text-purple-400">45.201, -12.004</span></div>
          <div className="mt-1">ZOOM: {viewState.current.zoom.toFixed(1)}x</div>
      </div>

    </div>
  );
};

const ControlButton = ({ icon: Icon, active, label }: { icon: any, active?: boolean, label: string }) => (
    <Tooltip content={label} side="bottom">
        <button className={`
            p-2 rounded-md transition-colors
            ${active ? 'bg-gray-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'}
        `}>
            <Icon size={18} />
        </button>
    </Tooltip>
);

export default PulseView;