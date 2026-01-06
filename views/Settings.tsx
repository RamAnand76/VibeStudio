import React, { useState } from 'react';
import { 
  Bell, Lock, Monitor, Globe, Key, Moon, Sun, 
  Volume2, ShieldAlert, Smartphone, Save
} from 'lucide-react';
import { Tooltip } from '../components/Shared';

const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  // General State
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en');

  // Notifications State
  const [notifState, setNotifState] = useState({
      emailAlerts: true,
      pushNotifs: true,
      weeklyDigest: false,
      securityAlerts: true
  });

  // Security State
  const [apiKey, setApiKey] = useState('sk_live_51M...');
  const [showKey, setShowKey] = useState(false);

  const toggleNotif = (key: keyof typeof notifState) => {
      setNotifState(prev => ({...prev, [key]: !prev[key]}));
  };

  const handleSave = () => {
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          alert("Settings saved!");
      }, 800);
  };

  return (
    <div className="p-4 md:p-6 h-full overflow-hidden flex flex-col">
        <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 shrink-0 gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-white">Settings</h1>
                    <p className="text-slate-400 text-sm">Manage workspace configuration and preferences.</p>
                </div>
                <Tooltip content="Save Changes">
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-glow text-white shadow-glow transition-all font-bold text-sm w-full sm:w-auto justify-center"
                    >
                        {loading ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
                        Save Changes
                    </button>
                </Tooltip>
            </div>

            <div className="flex flex-col md:flex-row flex-1 gap-6 md:gap-8 overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0 no-scrollbar">
                    <NavButton id="general" icon={Monitor} label="General" active={activeTab === 'general'} onClick={setActiveTab} />
                    <NavButton id="notifications" icon={Bell} label="Notifications" active={activeTab === 'notifications'} onClick={setActiveTab} />
                    <NavButton id="security" icon={Lock} label="Security" active={activeTab === 'security'} onClick={setActiveTab} />
                    <NavButton id="api" icon={Key} label="API Keys" active={activeTab === 'api'} onClick={setActiveTab} />
                </div>

                {/* Content Area */}
                <div className="flex-1 glass-panel rounded-2xl border border-white/5 bg-[#131826]/50 overflow-y-auto custom-scrollbar p-6 md:p-8">
                    
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <SectionHeader title="Appearance" description="Customize how VibeData looks on your device." />
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <ThemeCard mode="light" icon={Sun} active={theme === 'light'} onClick={() => setTheme('light')} />
                                <ThemeCard mode="dark" icon={Moon} active={theme === 'dark'} onClick={() => setTheme('dark')} />
                                <ThemeCard mode="system" icon={Monitor} active={theme === 'system'} onClick={() => setTheme('system')} />
                            </div>

                            <div className="h-px bg-white/5 my-6"></div>

                            <SectionHeader title="Language & Region" description="Set your preferred language and time zone." />
                            <div className="max-w-md space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Language</label>
                                    <select 
                                        value={language} 
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full bg-[#0B0F19] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary/50 focus:ring-0"
                                    >
                                        <option value="en">English (US)</option>
                                        <option value="es">Español</option>
                                        <option value="fr">Français</option>
                                        <option value="jp">日本語</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Timezone</label>
                                    <select className="w-full bg-[#0B0F19] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-primary/50 focus:ring-0">
                                        <option>Pacific Time (PT)</option>
                                        <option>Eastern Time (ET)</option>
                                        <option>UTC</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                             <SectionHeader title="Notification Channels" description="Choose how you want to be notified." />
                             
                             <div className="space-y-4">
                                 <ToggleRow 
                                    icon={Globe} 
                                    label="Email Notifications" 
                                    desc="Receive daily summaries and critical alerts via email." 
                                    active={notifState.emailAlerts}
                                    onClick={() => toggleNotif('emailAlerts')}
                                 />
                                 <ToggleRow 
                                    icon={Smartphone} 
                                    label="Push Notifications" 
                                    desc="Real-time alerts on your mobile device." 
                                    active={notifState.pushNotifs}
                                    onClick={() => toggleNotif('pushNotifs')}
                                 />
                             </div>

                             <div className="h-px bg-white/5 my-6"></div>

                             <SectionHeader title="Alert Types" description="Configure which events trigger an alert." />
                             <div className="space-y-4">
                                 <ToggleRow 
                                    icon={Volume2} 
                                    label="Weekly Digest" 
                                    desc="A summary of workspace activity sent every Monday." 
                                    active={notifState.weeklyDigest}
                                    onClick={() => toggleNotif('weeklyDigest')}
                                 />
                                 <ToggleRow 
                                    icon={ShieldAlert} 
                                    label="Security Alerts" 
                                    desc="Immediate notification for suspicious activity." 
                                    active={notifState.securityAlerts}
                                    onClick={() => toggleNotif('securityAlerts')}
                                 />
                             </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <SectionHeader title="Authentication" description="Manage your password and 2FA settings." />
                            
                            <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-white font-bold text-sm">Two-Factor Authentication</h4>
                                    <p className="text-slate-400 text-xs mt-1">Add an extra layer of security to your account.</p>
                                </div>
                                <button className="px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold w-full sm:w-auto">Enabled</button>
                            </div>

                            <div className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-white font-bold text-sm">Password</h4>
                                    <p className="text-slate-400 text-xs mt-1">Last changed 3 months ago.</p>
                                </div>
                                <button className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold transition-colors w-full sm:w-auto">Change</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'api' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                             <SectionHeader title="API Keys" description="Manage access keys for the VibeData API." />

                             <div className="bg-[#0B0F19] rounded-xl border border-white/10 p-4">
                                 <div className="flex justify-between items-center mb-2">
                                     <span className="text-xs font-bold text-slate-500 uppercase">Secret Key (Production)</span>
                                     <div className="flex gap-2">
                                         <button onClick={() => setShowKey(!showKey)} className="text-xs text-primary hover:text-primary-glow">{showKey ? 'Hide' : 'Reveal'}</button>
                                         <button className="text-xs text-slate-400 hover:text-white">Revoke</button>
                                     </div>
                                 </div>
                                 <code className="block w-full p-3 bg-black/30 rounded border border-white/5 text-sm font-mono text-emerald-400 break-all">
                                     {showKey ? apiKey : 'sk_live_************************'}
                                 </code>
                                 <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                     <Lock size={12} /> This key has full administrative access.
                                 </p>
                             </div>

                             <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white text-sm transition-colors w-full sm:w-auto justify-center">
                                 <Key size={16} /> Generate New Key
                             </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    </div>
  );
};

// --- Sub-components ---

const NavButton = ({ id, icon: Icon, label, active, onClick }: any) => (
    <button 
        onClick={() => onClick(id)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap md:whitespace-normal shrink-0 ${
            active 
            ? 'bg-primary/10 text-primary border border-primary/20 shadow-glow-sm' 
            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
        }`}
    >
        <Icon size={18} />
        {label}
    </button>
);

const SectionHeader = ({ title, description }: any) => (
    <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-slate-400">{description}</p>
    </div>
);

const ThemeCard = ({ mode, icon: Icon, active, onClick }: any) => (
    <div 
        onClick={onClick}
        className={`
            cursor-pointer p-4 rounded-xl border flex flex-col items-center gap-3 transition-all
            ${active 
                ? 'bg-primary/10 border-primary text-primary shadow-glow-sm' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
            }
        `}
    >
        <Icon size={24} />
        <span className="text-xs font-bold uppercase tracking-wider capitalize">{mode}</span>
    </div>
);

const ToggleRow = ({ icon: Icon, label, desc, active, onClick }: any) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
        <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-white/5 text-slate-300">
                <Icon size={20} />
            </div>
            <div>
                <h4 className="text-white font-bold text-sm">{label}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
        </div>
        <button 
            onClick={onClick}
            className={`w-11 h-6 rounded-full relative transition-colors ${active ? 'bg-primary' : 'bg-slate-700'}`}
        >
            <div className={`absolute top-1 size-4 bg-white rounded-full shadow transition-transform ${active ? 'left-6' : 'left-1'}`}></div>
        </button>
    </div>
);

export default SettingsView;