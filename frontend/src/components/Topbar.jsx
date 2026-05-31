import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Archive, ChevronDown, Settings, LogOut, ShieldAlert, User, CreditCard, HelpCircle } from 'lucide-react';

export default function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef();
  const notifRef = useRef();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Format the path into a breadcrumb
  const path = location.pathname.split('/').filter(Boolean)[0] || 'dashboard';
  const currentPath = path.toUpperCase().replace('-', ' ');

  return (
    <div className="h-16 w-full border-b border-white/5 flex items-center justify-between px-6 lg:px-8 bg-[#0a0a0f]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Breadcrumb */}
      <div className="flex items-center text-xs font-semibold tracking-widest text-white/50">
        <Link to="/dashboard" className="text-white/30 hover:text-white/80 transition-colors">DASHBOARD</Link>
        <span className="mx-2 text-white/20">›</span>
        <span className="text-white/80">{currentPath === 'DASHBOARD' ? 'OVERVIEW' : currentPath}</span>
      </div>

      {/* Right Side Icons & Profile */}
      <div className="flex items-center gap-4 md:gap-6">
        <Link to="/history" title="Transaction Archive" className="text-white/40 hover:text-white transition-colors">
          <Archive className="w-5 h-5" />
        </Link>
        
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`relative transition-colors ${notificationsOpen ? 'text-white' : 'text-white/40 hover:text-white'}`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border-2 border-[#0a0a0f]" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-4 w-72 bg-[#111116] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-slide-down">
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h4 className="text-white font-semibold text-sm">Notifications</h4>
                <span className="text-xs text-indigo-400 font-medium">1 New</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <Link to="/alerts" onClick={() => setNotificationsOpen(false)} className="flex gap-3 p-4 hover:bg-white/5 transition-colors border-l-2 border-red-500">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium mb-0.5">High Risk Transaction</p>
                    <p className="text-white/40 text-xs">Blocked $4,500 charge from unknown device.</p>
                  </div>
                </Link>
              </div>
              <div className="p-3 border-t border-white/5 bg-white/[0.02] text-center">
                <Link to="/alerts" onClick={() => setNotificationsOpen(false)} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">View all alerts</Link>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-white/10" />

        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-3 px-2 py-1 -mr-2 rounded-lg transition-colors cursor-pointer ${profileOpen ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center overflow-hidden border border-indigo-500/30 shrink-0">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Admin'}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-semibold text-white/90 leading-none">{user?.name || 'Admin'}</div>
              <div className="text-xs text-white/40 mt-1 leading-none uppercase">{user?.role === 'admin' ? 'Administrator' : 'Analyst'}</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-white/40 ml-1 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-4 w-56 bg-[#111116] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-slide-down py-2">
              <div className="px-4 py-3 border-b border-white/5 mb-2 sm:hidden">
                <div className="text-sm font-semibold text-white/90">{user?.name || 'Admin'}</div>
                <div className="text-xs text-white/40">{user?.role === 'admin' ? 'Administrator' : 'Analyst'}</div>
              </div>
              
              <Link 
                to="/profile" 
                onClick={() => setProfileOpen(false)}
                className="w-full px-4 py-2 flex items-center gap-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <User className="w-4 h-4 text-white/40" /> My Profile
              </Link>
              <Link 
                to="/billing" 
                onClick={() => setProfileOpen(false)}
                className="w-full px-4 py-2 flex items-center gap-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <CreditCard className="w-4 h-4 text-white/40" /> Billing
              </Link>
              <Link 
                to="/support" 
                onClick={() => setProfileOpen(false)}
                className="w-full px-4 py-2 flex items-center gap-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-white/40" /> Help & Support
              </Link>

              <div className="my-2 border-t border-white/5" />

              <Link 
                to="/settings" 
                onClick={() => setProfileOpen(false)}
                className="w-full px-4 py-2 flex items-center gap-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings className="w-4 h-4 text-white/40" /> Account Settings
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full px-4 py-2 flex items-center gap-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
