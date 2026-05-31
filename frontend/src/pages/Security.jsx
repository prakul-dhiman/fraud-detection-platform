import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Server } from 'lucide-react';

export default function Security() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020204] text-white p-8 md:p-16">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/50 hover:text-white mb-12 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>
      <div className="max-w-3xl mx-auto space-y-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Platform Security</h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Security isn't just a feature at FraudShield—it's our core product. Our entire infrastructure is built on zero-trust principles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 border-indigo-500/20">
            <Lock className="w-8 h-8 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Encryption at Rest & Transit</h3>
            <p className="text-white/50 text-sm">All data is encrypted using AES-256 at rest and TLS 1.3 in transit. Key rotation occurs automatically every 30 days.</p>
          </div>
          <div className="glass-card p-8 border-emerald-500/20">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Continuous Penetration Testing</h3>
            <p className="text-white/50 text-sm">We employ independent third-party security firms to conduct white-box penetration testing on our APIs monthly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
