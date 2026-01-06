import React, { useState } from 'react';
import { 
  User, Mail, Building, MapPin, Link as LinkIcon, 
  Camera, Save, Shield, Clock, Award, Activity 
} from 'lucide-react';
import { Tooltip } from '../components/Shared';

const ProfileView: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Alex',
    lastName: 'Chen',
    email: 'alex@vibedata.ai',
    role: 'Workspace Admin',
    company: 'VibeData Systems',
    location: 'San Francisco, CA',
    bio: 'Data architect passionate about high-scale distributed systems and AI orchestration. Building the future of observability.',
    website: 'https://vibedata.ai'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, this would trigger a global toast
      alert("Profile updated successfully!");
    }, 1000);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar">
      
      {/* Header Banner */}
      <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 border border-white/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute bottom-4 right-4 flex gap-2">
            <Tooltip content="Edit Cover Image">
                <button className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-white transition-colors">
                    <Camera size={18} />
                </button>
            </Tooltip>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mt-[-3rem] px-4 relative z-10">
        
        {/* Left Sidebar: Avatar & Stats */}
        <div className="w-full lg:w-80 flex flex-col gap-6">
           <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#131826]/80 flex flex-col items-center text-center shadow-xl">
              <div className="relative mb-4 group cursor-pointer">
                  <div className="size-32 rounded-full p-1 bg-gradient-to-tr from-primary to-purple-500">
                      <img 
                        src="https://picsum.photos/200" 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover border-4 border-[#131826]" 
                      />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={24} className="text-white" />
                  </div>
              </div>
              
              <h2 className="text-xl font-display font-bold text-white">{formData.firstName} {formData.lastName}</h2>
              <p className="text-sm text-slate-400 mb-4">{formData.role}</p>

              <div className="flex gap-2 w-full">
                  <button className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary-glow text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all">
                      Connect
                  </button>
                  <Tooltip content="Copy Profile Link">
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
                        <LinkIcon size={20} />
                    </button>
                  </Tooltip>
              </div>
           </div>

           {/* Stats Widget */}
           <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#131826]/80 space-y-4">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Activity size={14} /> Activity
               </h3>
               <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                       <div className="text-2xl font-mono font-bold text-white">482</div>
                       <div className="text-[10px] text-slate-400 uppercase tracking-wide">Commits</div>
                   </div>
                   <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                       <div className="text-2xl font-mono font-bold text-emerald-400">98%</div>
                       <div className="text-[10px] text-slate-400 uppercase tracking-wide">Uptime</div>
                   </div>
                   <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                       <div className="text-2xl font-mono font-bold text-primary">12</div>
                       <div className="text-[10px] text-slate-400 uppercase tracking-wide">Agents</div>
                   </div>
                   <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                       <div className="text-2xl font-mono font-bold text-amber-400">Lv. 4</div>
                       <div className="text-[10px] text-slate-400 uppercase tracking-wide">Access</div>
                   </div>
               </div>
           </div>
           
           {/* Badges */}
           <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#131826]/80 space-y-4">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Award size={14} /> Achievements
               </h3>
               <div className="flex flex-wrap gap-2">
                   <Tooltip content="Early Adopter">
                        <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold">OG Pilot</span>
                   </Tooltip>
                   <Tooltip content="Created > 10 Pipelines">
                        <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">Pipe Master</span>
                   </Tooltip>
                   <Tooltip content="99.9% Uptime Maintenance">
                        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">Stabilizer</span>
                   </Tooltip>
               </div>
           </div>
        </div>

        {/* Right Content: Forms */}
        <div className="flex-1 space-y-6">
            
            {/* General Info */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#131826]/80">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white">Personal Information</h3>
                        <p className="text-sm text-slate-400">Manage your public profile details.</p>
                    </div>
                    <Tooltip content="Save Changes">
                        <button 
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all font-bold text-sm"
                        >
                            {isLoading ? <Clock size={16} className="animate-spin" /> : <Save size={16} />}
                            Save
                        </button>
                    </Tooltip>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} icon={User} />
                    <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} icon={User} />
                    <InputField label="Email Address" name="email" value={formData.email} onChange={handleChange} icon={Mail} />
                    <InputField label="Role" name="role" value={formData.role} onChange={handleChange} icon={Shield} />
                    <InputField label="Company" name="company" value={formData.company} onChange={handleChange} icon={Building} />
                    <InputField label="Location" name="location" value={formData.location} onChange={handleChange} icon={MapPin} />
                </div>
                
                <div className="mt-6">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bio</label>
                    <textarea 
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="w-full bg-[#0B0F19] border border-white/10 rounded-xl p-4 text-sm text-white placeholder-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                    />
                </div>
            </div>
            
            {/* Preferences Stub */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#131826]/80 opacity-60 hover:opacity-100 transition-opacity">
                 <h3 className="text-lg font-bold text-white mb-2">Connected Accounts</h3>
                 <p className="text-sm text-slate-400 mb-6">Manage third-party connections.</p>
                 
                 <div className="space-y-3">
                     <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5">
                         <div className="flex items-center gap-3">
                             <div className="size-8 rounded bg-white text-black flex items-center justify-center font-bold">G</div>
                             <div>
                                 <div className="text-sm font-bold text-white">GitHub</div>
                                 <div className="text-xs text-slate-500">Connected as @alexc</div>
                             </div>
                         </div>
                         <button className="text-xs text-red-400 hover:text-red-300">Disconnect</button>
                     </div>
                     <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5">
                         <div className="flex items-center gap-3">
                             <div className="size-8 rounded bg-[#1DA1F2] text-white flex items-center justify-center font-bold">T</div>
                             <div>
                                 <div className="text-sm font-bold text-white">Twitter / X</div>
                                 <div className="text-xs text-slate-500">Not Connected</div>
                             </div>
                         </div>
                         <button className="text-xs text-primary hover:text-primary-glow">Connect</button>
                     </div>
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, icon: Icon }: any) => (
    <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Icon size={16} />
            </div>
            <input 
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-[#0B0F19] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
        </div>
    </div>
);

export default ProfileView;