import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { User, Lock, Phone, Mail, Save } from 'lucide-react';
import api from '../api/axios';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', formData);
      updateUser(res.data.data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setLoading(true);
    try {
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Account Settings</h1>
        <p className="text-white/40 text-sm">Manage your profile details and security preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'profile' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" /> Profile Details
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'security' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" /> Security & Password
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="glass-card p-6 md:p-8 animate-slide-up">
              <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="input-dark w-full pl-11"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="email"
                      disabled
                      value={formData.email}
                      className="input-dark w-full pl-11 opacity-50 cursor-not-allowed"
                      title="Email cannot be changed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="input-dark w-full pl-11"
                    />
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-white/10 flex justify-end">
                  <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="glass-card p-6 md:p-8 animate-slide-up">
              <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
              <form onSubmit={handlePasswordUpdate} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="input-dark w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="input-dark w-full"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="input-dark w-full"
                    required
                    minLength={8}
                  />
                </div>

                <div className="pt-4 mt-6 border-t border-white/10 flex justify-end">
                  <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
