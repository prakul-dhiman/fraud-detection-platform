import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Activity, Database, Server, Cpu, Globe } from 'lucide-react';

export default function SystemHealth() {
  const [health, setHealth] = useState({
    frontend: 'Operational', // Assuming frontend is operational if this renders
    backend: 'Checking...',
    db: 'Checking...',
    mlService: 'Checking...',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await axios.get('/api/health/system-health');
        // Expected response example: { backend: 'Operational', db: 'Operational', mlService: 'Operational' }
        setHealth((prev) => ({
          ...prev,
          backend: response.data?.backend || 'Operational',
          db: response.data?.db || 'Operational',
          mlService: response.data?.mlService || 'Operational',
        }));
      } catch (error) {
        setHealth((prev) => ({
          ...prev,
          backend: 'Degraded',
          db: 'Degraded',
          mlService: 'Degraded',
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    
    // Optional: Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Operational':
        return 'bg-emerald-500';
      case 'Checking...':
        return 'bg-yellow-500';
      case 'Degraded':
      case 'Down':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const services = [
    { name: 'Frontend', status: health.frontend, icon: Globe },
    { name: 'Backend API', status: health.backend, icon: Server },
    { name: 'Database', status: health.db, icon: Database },
    { name: 'ML Service', status: health.mlService, icon: Cpu },
  ];

  return (
    <div className="bg-[#12121a] border border-white/10 rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-white">
        <Activity className="w-5 h-5 text-indigo-400" />
        <h3 className="font-semibold text-lg">System Health</h3>
      </div>
      
      <div className="grid gap-4 flex-1">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-md">
                  <Icon className="w-4 h-4 text-white/70" />
                </div>
                <span className="text-sm font-medium text-white/90">{service.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50">{service.status}</span>
                <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(service.status)} ${service.status === 'Operational' ? 'animate-pulse' : ''}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
