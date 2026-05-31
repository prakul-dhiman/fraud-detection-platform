import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function Status() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020204] text-white p-8 md:p-16">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/50 hover:text-white mb-12 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>
      
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold tracking-tight">System Status</h1>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            All Systems Operational
          </div>
        </div>

        <div className="space-y-4">
          {[
            { name: 'API Gateway (US-East)', uptime: '100%' },
            { name: 'XGBoost Prediction Engine', uptime: '99.99%' },
            { name: 'Dashboard Web App', uptime: '100%' },
            { name: 'Real-time WebSockets', uptime: '100%' },
            { name: 'Database Clusters', uptime: '99.99%' },
          ].map((service) => (
            <div key={service.name} className="flex items-center justify-between p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-medium text-white/80">{service.name}</span>
              </div>
              <span className="text-white/40 text-sm font-mono">Uptime: {service.uptime}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
