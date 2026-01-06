// ... (keeping imports)
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Workflow, 
  Bot, 
  Settings, 
  Bell, 
  Plus, 
  Search, 
  Zap,
  Map,
  Cpu,
  X,
  PencilRuler,
  Sun,
  Moon,
  LogOut,
  User,
  Trash2,
  Check,
  PanelLeft,
  Terminal,
  MoreHorizontal,
  CircleHelp,
  FolderPlus,
  ChevronDown,
  Box,
  Layers,
  Menu // Added Menu icon for mobile
} from 'lucide-react';
import Dashboard from './views/Dashboard';
import PipelineView from './views/Pipeline';
import PulseView from './views/Pulse';
import ForgeView from './views/Forge';
import ArchitectView from './views/Architect';
import ProfileView from './views/Profile';
import SettingsView from './views/Settings';
import HelpView from './views/Help';
import { Tooltip, Toast, Notification, NotificationType } from './components/Shared';

// --- Types ---
export interface Project {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'active' | 'initializing';
  createdAt: number;
}

type View = 'dashboard' | 'pipeline' | 'pulse' | 'forge' | 'architect' | 'profile' | 'settings' | 'help';

const INITIAL_PROJECTS: Project[] = [
  { 
    id: 'default-01', 
    name: 'Main Cluster', 
    type: 'general', 
    description: 'Primary production environment', 
    status: 'active',
    createdAt: Date.now() 
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile Menu State
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Project State
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>(INITIAL_PROJECTS[0].id);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);

  // Search State
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Profile Dropdown State
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Notification State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);

  // New Project Modal State
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState('empty');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // Derived State
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Theme Toggle Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Close mobile menu when view changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentView]);

  const addNotification = (type: NotificationType, title: string, message: string) => {
    const newNotif: Notification = {
      id: Date.now().toString() + Math.random().toString(),
      type,
      title,
      message,
      timestamp: Date.now()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName,
      type: newProjectType,
      description: newProjectDesc,
      status: 'initializing',
      createdAt: Date.now()
    };

    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newProject.id);
    setIsNewProjectModalOpen(false);
    
    // Reset Form
    setNewProjectName('');
    setNewProjectType('empty');
    setNewProjectDesc('');
    
    // Switch View & Notify
    setCurrentView('dashboard');
    addNotification('success', 'Project Initialized', `Switched workspace to "${newProject.name}".`);
    
    // Simulate initialization finish
    setTimeout(() => {
       setProjects(prev => prev.map(p => p.id === newProject.id ? { ...p, status: 'active' } : p));
       addNotification('info', 'System Ready', `Resources for "${newProject.name}" are now online.`);
    }, 3000);
  };

  // Simulate System Events (only if on default project to avoid annoyance on empty ones)
  useEffect(() => {
    if (activeProject.id !== 'default-01') return; 

    const timer = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.85) {
        const types: NotificationType[] = ['info', 'warning', 'success'];
        const type = types[Math.floor(Math.random() * types.length)];
        const data = {
          info: { title: 'System Info', msgs: ['Backup completed', 'New agent initialized', 'Cache refreshed'] },
          warning: { title: 'Optimization Needed', msgs: ['High latency detected', 'Memory usage > 80%'] },
          error: { title: 'Critical Error', msgs: ['DB Connection lost'] }, 
          success: { title: 'Task Success', msgs: ['Deployment finished', 'Data sync complete'] }
        };
        const item = data[type];
        addNotification(type, item.title, item.msgs[Math.floor(Math.random() * item.msgs.length)]);
      }
    }, 25000);
    return () => clearInterval(timer);
  }, [activeProject.id]);

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Overview' },
    { id: 'pipeline', icon: Workflow, label: 'Pipelines' },
    { id: 'pulse', icon: Map, label: 'Pulse Map' },
    { id: 'architect', icon: PencilRuler, label: 'Architect' },
    { id: 'forge', icon: Zap, label: 'The Forge' },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-200 font-sans selection:bg-primary/30 selection:text-white transition-colors duration-300">
      
      {/* Toast Container - Fixed Z-index for top layer */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {notifications.slice(0, 3).map(notif => (
          <Toast key={notif.id} notification={notif} onClose={removeNotification} />
        ))}
      </div>

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center isolate px-4">
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={() => setIsNewProjectModalOpen(false)}
            ></div>
            <div className="relative w-full max-w-md bg-white dark:bg-[#131826] rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                <div className="p-6 border-b border-gray-200 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/[0.02]">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FolderPlus size={20} className="text-primary" /> 
                        Create New Project
                    </h3>
                    <button onClick={() => setIsNewProjectModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Project Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="e.g. Q4 Analytics Revamp"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Template</label>
                        <select 
                            value={newProjectType}
                            onChange={(e) => setNewProjectType(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                        >
                            <option value="empty">Empty Project</option>
                            <option value="ecommerce">E-commerce Analytics</option>
                            <option value="finance">Financial Fraud Detection</option>
                            <option value="iot">IoT Stream Processing</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description (Optional)</label>
                        <textarea 
                            className="w-full bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none h-24"
                            placeholder="Briefly describe the goals of this project..."
                            value={newProjectDesc}
                            onChange={(e) => setNewProjectDesc(e.target.value)}
                        ></textarea>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsNewProjectModalOpen(false)}
                            className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary-glow text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all active:scale-95"
                        >
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Notification Sidebar Panel Overlay */}
      {showNotificationsPanel && (
          <div className="fixed inset-0 z-[90] flex justify-end isolate">
              <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300" 
                onClick={() => setShowNotificationsPanel(false)}
              ></div>
              <div className="relative w-full max-w-sm bg-white dark:bg-[#131826] h-full shadow-2xl border-l border-gray-200 dark:border-white/5 flex flex-col animate-in slide-in-from-right duration-300">
                  <div className="p-5 border-b border-gray-200 dark:border-white/5 flex items-center justify-between shrink-0 bg-white/50 dark:bg-[#131826]/50 backdrop-blur-md">
                      <div className="flex items-center gap-2">
                          <Bell size={18} className="text-slate-900 dark:text-white" />
                          <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                          <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{notifications.length}</span>
                      </div>
                      <div className="flex gap-1">
                          {notifications.length > 0 && (
                            <Tooltip content="Clear All">
                                <button onClick={clearAllNotifications} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-slate-500 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </Tooltip>
                          )}
                          <button onClick={() => setShowNotificationsPanel(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                              <X size={18} />
                          </button>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                      {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                              <Bell size={32} className="opacity-20 mb-3" />
                              <p className="text-sm">No new notifications</p>
                          </div>
                      ) : (
                          notifications.map((notif) => (
                              <div key={notif.id} className="p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/5 hover:border-primary/30 transition-colors group relative">
                                  <div className="flex justify-between items-start mb-1">
                                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                          notif.type === 'info' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                          notif.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                          notif.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                          'bg-green-500/10 text-green-400 border-green-500/20'
                                      }`}>{notif.type}</span>
                                      <span className="text-[10px] text-slate-500 font-mono">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                                  </div>
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 mt-2">{notif.title}</h4>
                                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                                  
                                  <button 
                                    onClick={() => removeNotification(notif.id)}
                                    className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/10 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                      <Check size={14} />
                                  </button>
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 h-full bg-white dark:bg-[#0F1423] border-r border-gray-200 dark:border-white/5 
          transition-all duration-300 ease-in-out flex flex-col will-change-transform
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative 
          ${sidebarCollapsed ? 'md:w-[72px]' : 'md:w-64'}
          w-64
        `}
      >
        
        {/* Sidebar Header / Project Switcher */}
        <div className="h-16 flex items-center px-3 mb-2 border-b border-gray-200 dark:border-white/5 w-full shrink-0 relative">
          <div 
             className={`
                flex items-center gap-2 w-full p-1.5 rounded-lg transition-colors cursor-pointer select-none
                ${sidebarCollapsed ? 'md:justify-center' : 'hover:bg-gray-100 dark:hover:bg-white/5'}
             `}
             onClick={() => (!sidebarCollapsed || window.innerWidth < 768) && setIsProjectMenuOpen(!isProjectMenuOpen)}
          >
            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-glow-sm">
              <Cpu size={18} />
            </div>
            
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'md:w-0 md:opacity-0 md:hidden' : 'w-auto opacity-100 flex-1'}`}>
              <h1 className="font-display font-bold text-sm tracking-tight text-slate-900 dark:text-white truncate leading-tight">
                  {activeProject.name}
              </h1>
              <span className="text-[10px] text-slate-500 truncate font-mono">
                  {activeProject.status === 'initializing' ? 'Initializing...' : activeProject.type.toUpperCase()}
              </span>
            </div>

            {(!sidebarCollapsed || window.innerWidth < 768) && (
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isProjectMenuOpen ? 'rotate-180' : ''}`} />
            )}
          </div>

          {/* Project Dropdown Menu */}
          {isProjectMenuOpen && (!sidebarCollapsed || window.innerWidth < 768) && (
             <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProjectMenuOpen(false)}></div>
                <div className="absolute top-full left-2 right-2 z-50 mt-1 bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                    <div className="p-2 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-2">Switch Project</span>
                    </div>
                    <div className="p-1 max-h-48 overflow-y-auto custom-scrollbar">
                        {projects.map(p => (
                            <button 
                                key={p.id}
                                onClick={() => { setActiveProjectId(p.id); setIsProjectMenuOpen(false); setCurrentView('dashboard'); }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                                    activeProjectId === p.id 
                                    ? 'bg-primary/10 text-primary' 
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                            >
                                <div className="shrink-0 size-2 rounded-full bg-current"></div>
                                <div className="min-w-0">
                                    <div className="text-sm font-bold truncate">{p.name}</div>
                                    <div className="text-[10px] opacity-70 truncate">{p.type}</div>
                                </div>
                                {activeProjectId === p.id && <Check size={14} className="ml-auto" />}
                            </button>
                        ))}
                    </div>
                    <div className="p-2 border-t border-gray-200 dark:border-white/5">
                        <button 
                            onClick={() => { setIsProjectMenuOpen(false); setIsNewProjectModalOpen(true); }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <Plus size={16} /> Create Project
                        </button>
                    </div>
                </div>
             </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 w-full overflow-y-auto custom-scrollbar overflow-x-hidden">
          {navItems.map((item) => (
            <Tooltip key={item.id} content={sidebarCollapsed ? item.label : ''} side="right">
              <button
                onClick={() => setCurrentView(item.id as View)}
                className={`
                  group flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200 relative
                  ${currentView === item.id 
                    ? 'bg-primary/10 text-primary dark:text-white font-medium' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'}
                  ${sidebarCollapsed ? 'md:justify-center md:px-0' : ''}
                `}
              >
                <item.icon 
                  size={20} 
                  className={`shrink-0 transition-colors ${currentView === item.id ? 'text-primary' : 'group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} 
                />
                <span className={`text-sm whitespace-nowrap transition-all duration-300 ${sidebarCollapsed ? 'md:w-0 md:opacity-0 md:hidden' : 'w-auto opacity-100'}`}>
                    {item.label}
                </span>
                
                {/* Active Indicator */}
                {currentView === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                )}
              </button>
            </Tooltip>
          ))}
          
          {/* Section Divider */}
          <div className="my-4 border-t border-gray-200 dark:border-white/5 mx-2"></div>
          
          {/* Secondary Nav Items */}
          <Tooltip content={sidebarCollapsed ? "System Logs" : ""} side="right">
              <button className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200 text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200 ${sidebarCollapsed ? 'md:justify-center md:px-0' : ''}`}>
                  <Terminal size={20} className="shrink-0" />
                  <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${sidebarCollapsed ? 'md:w-0 md:opacity-0 md:hidden' : 'w-auto opacity-100'}`}>
                      System Logs
                  </span>
              </button>
          </Tooltip>
          
          <Tooltip content={sidebarCollapsed ? "Help & Support" : ""} side="right">
              <button 
                onClick={() => setCurrentView('help')}
                className={`
                    flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200 
                    ${currentView === 'help' ? 'bg-primary/10 text-primary dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'}
                    ${sidebarCollapsed ? 'md:justify-center md:px-0' : ''}
                `}
              >
                  <CircleHelp size={20} className="shrink-0" />
                  <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${sidebarCollapsed ? 'md:w-0 md:opacity-0 md:hidden' : 'w-auto opacity-100'}`}>
                      Help & Support
                  </span>
                  {currentView === 'help' && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                  )}
              </button>
          </Tooltip>
        </nav>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-white/5 relative bg-gray-50/50 dark:bg-black/10">
          
          {/* Popup Menu */}
          {isProfileOpen && (
            <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileOpen(false)}></div>
                <div 
                    className={`
                        absolute z-50 bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200
                        ${sidebarCollapsed 
                            ? 'left-full bottom-0 ml-3 w-56' 
                            : 'bottom-[calc(100%+8px)] left-0 w-full'
                        }
                    `}
                >
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Alex Chen</p>
                        <p className="text-xs text-slate-500 truncate">alex@vibedata.ai</p>
                    </div>
                    <div className="p-1">
                        <button 
                            onClick={() => { setCurrentView('profile'); setIsProfileOpen(false); }}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left"
                        >
                            <User size={16} /> Profile
                        </button>
                        <button 
                            onClick={() => { setCurrentView('settings'); setIsProfileOpen(false); }}
                            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-left"
                        >
                            <Settings size={16} /> Settings
                        </button>
                        <div className="h-px bg-gray-200 dark:bg-white/5 my-1 mx-2"></div>
                        <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left">
                            <LogOut size={16} /> Log Out
                        </button>
                    </div>
                </div>
            </>
          )}

          {/* User Button */}
          <Tooltip content={sidebarCollapsed ? "Profile" : ""} side="right">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`
                    flex items-center gap-3 w-full p-2 rounded-xl transition-all duration-200 group hover:bg-white dark:hover:bg-white/5 outline-none border border-transparent hover:border-gray-200 dark:hover:border-white/5
                    ${sidebarCollapsed ? 'md:justify-center' : ''}
                    ${isProfileOpen ? 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/5' : ''}
                `}
              >
                 <div className="size-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[1.5px] shrink-0 shadow-sm">
                    <img src="https://picsum.photos/100" alt="User" className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#0F1423]" />
                 </div>
                 <div className={`flex flex-col text-left overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'md:w-0 md:opacity-0 md:hidden' : 'w-auto opacity-100'}`}>
                     <span className="text-sm font-medium text-slate-900 dark:text-white truncate">Alex Chen</span>
                     <span className="text-xs text-slate-500 truncate">Workspace Admin</span>
                 </div>
                 {(!sidebarCollapsed || window.innerWidth < 768) && (
                     <MoreHorizontal size={16} className="ml-auto text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                 )}
              </button>
          </Tooltip>
        </div>
      </aside>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-gray-50 dark:bg-[#0B0F19] transition-colors duration-300">
        
        {/* Top Header - Sticky */}
        <header className="h-16 shrink-0 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md flex items-center justify-between px-4 z-30 sticky top-0 transition-colors duration-300">
          
          <div className="flex items-center gap-4">
            {/* Sidebar Trigger */}
            <Tooltip content="Toggle Menu" side="bottom">
                <button 
                    onClick={handleToggleSidebar}
                    className="p-2 -ml-2 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                    {/* Show different icon on mobile/desktop could be nice, but keeping generic for now */}
                    <div className="hidden md:block"><PanelLeft size={18} /></div>
                    <div className="md:hidden"><Menu size={18} /></div>
                </button>
            </Tooltip>

            {/* Breadcrumb / View Title */}
            <div className="flex items-center gap-2 text-sm">
                 <span className="text-slate-400 font-medium hidden lg:inline-block">VibeData</span>
                 <span className="text-slate-300 hidden lg:inline-block">/</span>
                 <h2 className="text-slate-900 dark:text-white font-display font-semibold tracking-tight capitalize truncate max-w-[150px] sm:max-w-none">{currentView.replace('-', ' ')}</h2>
                 
                 {currentView === 'pipeline' && (
                    <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                        <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Live
                    </div>
                 )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Command Bar (Desktop) */}
            <div 
                className={`
                    hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#131826] border border-gray-200 dark:border-white/5 rounded-lg transition-all duration-300
                    ${isSearchFocused ? 'ring-2 ring-primary/20 border-primary w-72 shadow-[0_0_15px_rgba(129,140,248,0.1)]' : 'w-48 lg:w-56 hover:border-gray-300 dark:hover:border-white/20'} 
                    group cursor-text
                `} 
                onClick={() => document.getElementById('global-search')?.focus()}
            >
               <Search size={14} className={`transition-colors ${isSearchFocused ? 'text-primary' : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
               <input 
                 id="global-search"
                 type="text" 
                 placeholder="Search..."
                 className="bg-transparent border-none text-sm text-slate-800 dark:text-white placeholder-slate-500 focus:ring-0 w-full p-0"
                 onFocus={() => setIsSearchFocused(true)}
                 onBlur={() => setIsSearchFocused(false)}
                 autoComplete="off"
               />
               <div className="flex items-center gap-1">
                   <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      <span className="text-xs">⌘</span>K
                   </kbd>
               </div>
            </div>

            {/* Mobile Search Icon */}
            <button className="md:hidden p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5">
                <Search size={18} />
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1 hidden md:block"></div>

            {/* Actions */}
            <div className="flex items-center gap-1">
                <Tooltip content={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} side="bottom">
                  <button 
                    className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    onClick={toggleTheme}
                  >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                </Tooltip>

                <Tooltip content="Notifications" side="bottom">
                  <button 
                    className={`relative p-2 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${showNotificationsPanel ? 'bg-gray-100 dark:bg-white/5 text-slate-900 dark:text-white' : ''}`}
                    onClick={() => setShowNotificationsPanel(!showNotificationsPanel)}
                  >
                    <Bell size={18} />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 size-2 bg-primary rounded-full ring-2 ring-white dark:ring-[#0B0F19]"></span>
                    )}
                  </button>
                </Tooltip>
            </div>

            {/* Primary Action */}
            <Tooltip content="New Project" side="bottom">
               <button 
                onClick={() => setIsNewProjectModalOpen(true)}
                className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary-glow text-white px-3 py-1.5 rounded-lg transition-all shadow-glow-sm active:scale-95"
               >
                 <Plus size={16} strokeWidth={2.5} />
                 <span className="text-sm font-bold">New</span>
               </button>
            </Tooltip>
          </div>
        </header>

        {/* View Rendering Container */}
        <div className="flex-1 overflow-hidden relative w-full">
            {/* Ambient Background Glow (Subtle) */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3 mix-blend-screen"></div>
            
            {/* View Content */}
            <div className="h-full w-full overflow-y-auto custom-scrollbar relative z-10">
                {currentView === 'dashboard' && <Dashboard project={activeProject} />}
                {currentView === 'pipeline' && <PipelineView project={activeProject} />}
                {currentView === 'pulse' && <PulseView project={activeProject} />}
                {currentView === 'architect' && <ArchitectView project={activeProject} />}
                {currentView === 'forge' && <ForgeView project={activeProject} />}
                {currentView === 'profile' && <ProfileView />}
                {currentView === 'settings' && <SettingsView />}
                {currentView === 'help' && <HelpView />}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;