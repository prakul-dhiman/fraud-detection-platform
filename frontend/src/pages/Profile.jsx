import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axios';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || 'Lead Fraud Analyst');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put('/users/profile', { name, jobTitle });
      updateUser(res.data.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">My Profile</h1>
        <p className="text-white/40 text-sm">Manage your personal information and security preferences</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-indigo-500/20 mx-auto mb-4 flex items-center justify-center border-4 border-indigo-500/30 overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'Admin'}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{name || 'Administrator'}</h2>
            <p className="text-indigo-400 text-sm font-medium uppercase tracking-widest">{jobTitle}</p>
            
            <button onClick={() => toast.info('Avatar change feature coming soon!')} className="w-full mt-6 bg-white/5 hover:bg-white/10 text-white py-2 rounded-xl text-sm font-medium transition-colors border border-white/10">
              Change Avatar
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" /> Personal Information
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 uppercase mb-1">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 uppercase mb-1">Email Address</label>
                  <input type="email" disabled value={user?.email || ''} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-2.5 text-white opacity-50 cursor-not-allowed" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 uppercase mb-1">Job Title</label>
                <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="pt-4 flex justify-end">
                <button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-red-500/20">
            <h3 className="text-lg font-semibold text-red-400 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5" /> Danger Zone
            </h3>
            <p className="text-white/50 text-sm mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button onClick={() => toast.error('Account deletion is disabled in demo mode.')} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-6 py-2 rounded-xl text-sm font-medium transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
