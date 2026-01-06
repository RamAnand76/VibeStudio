import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

// --- Tooltip ---
interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, side = 'top' }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        let top = 0;
        let left = 0;
        const gap = 8; // space between trigger and tooltip

        // Calculate position based on side
        if (side === 'top') {
            top = rect.top - gap;
            left = rect.left + rect.width / 2;
        } else if (side === 'bottom') {
            top = rect.bottom + gap;
            left = rect.left + rect.width / 2;
        } else if (side === 'right') {
            top = rect.top + rect.height / 2;
            left = rect.right + gap;
        } else if (side === 'left') {
             top = rect.top + rect.height / 2;
             left = rect.left - gap;
        }

        // Adjust for scroll
        setCoords({ top: top + window.scrollY, left: left + window.scrollX });
    }
  };

  const handleMouseEnter = () => {
    updatePosition();
    setVisible(true);
  };

  // Update position on scroll/resize while visible
  useEffect(() => {
    if (visible) {
        window.addEventListener('scroll', updatePosition);
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }
  }, [visible]);

  // Portal target (document.body)
  const tooltipElement = visible ? createPortal(
    <div 
        className="fixed z-[9999] px-2.5 py-1.5 text-[10px] font-medium text-white bg-gray-900 border border-white/10 rounded-md shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-200"
        style={{ 
            top: coords.top - window.scrollY, // Fixed position relative to viewport
            left: coords.left - window.scrollX,
            transform: side === 'top' ? 'translate(-50%, -100%)' : 
                       side === 'bottom' ? 'translate(-50%, 0)' :
                       side === 'left' ? 'translate(-100%, -50%)' :
                       'translate(0, -50%)' 
        }}
    >
        {content}
        {/* Tiny Arrow */}
        <div className={`absolute w-2 h-2 bg-gray-900 border-l border-b border-white/10 rotate-45 
            ${side === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2 border-t-0 border-r-0 border-l border-b' : ''}
            ${side === 'bottom' ? '-top-1 left-1/2 -translate-x-1/2 border-b-0 border-l-0 border-t border-r' : ''}
            ${side === 'left' ? '-right-1 top-1/2 -translate-y-1/2 border-l-0 border-b-0 border-t border-r' : ''}
            ${side === 'right' ? '-left-1 top-1/2 -translate-y-1/2 border-t-0 border-r-0 border-l border-b' : ''}
        `}></div>
    </div>,
    document.body
  ) : null;

  return (
    <div 
      ref={triggerRef}
      className="relative inline-flex items-center justify-center"
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {tooltipElement}
    </div>
  );
};

// --- Notification Toast ---
export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
}

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const styles = {
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
    warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-100 shadow-[0_0_15px_rgba(234,179,8,0.1)]',
    error: 'border-red-500/30 bg-red-500/10 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
    success: 'border-green-500/30 bg-green-500/10 text-green-100 shadow-[0_0_15px_rgba(34,197,94,0.1)]',
  };
  
  const icons = {
    info: <Info size={18} className="text-blue-400" />,
    warning: <AlertTriangle size={18} className="text-yellow-400" />,
    error: <AlertCircle size={18} className="text-red-400" />,
    success: <CheckCircle size={18} className="text-green-400" />,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border backdrop-blur-md min-w-[320px] max-w-sm animate-in slide-in-from-right-full fade-in duration-300 pointer-events-auto shadow-xl ${styles[notification.type]}`}>
      <div className="shrink-0 mt-0.5">{icons[notification.type]}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-xs font-display uppercase tracking-wide opacity-90 mb-0.5">{notification.title}</h4>
        <p className="text-xs font-mono opacity-80 leading-relaxed break-words">{notification.message}</p>
      </div>
      <button onClick={() => onClose(notification.id)} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity p-0.5 hover:bg-white/10 rounded">
        <X size={14} />
      </button>
    </div>
  );
};

const X = ({size}: {size: number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);