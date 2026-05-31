import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020204] text-white p-8 md:p-16">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/50 hover:text-white mb-12 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          Welcome to FraudShield. By accessing or using our platform, you agree to comply with and be bound by these Terms of Service.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Enterprise SLA</h2>
        <p className="text-white/60 leading-relaxed">
          FraudShield guarantees a 99.99% uptime for our API endpoints. In the event of an outage, enterprise customers are entitled to service credits as outlined in their specific Master Service Agreement.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Acceptable Use</h2>
        <p className="text-white/60 leading-relaxed">
          You agree to use our machine learning APIs exclusively for fraud detection and financial security purposes. Attempting to reverse-engineer our proprietary XGBoost models is strictly prohibited.
        </p>
        <p className="text-white/40 mt-12 text-sm">Last updated: May 2026</p>
      </div>
    </div>
  );
}
