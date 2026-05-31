import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020204] text-white p-8 md:p-16">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/50 hover:text-white mb-12 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          At FraudShield, data privacy is engineered into our architecture from the ground up. We process millions of transactions without storing personally identifiable information (PII) permanently.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Data Processing</h2>
        <p className="text-white/60 leading-relaxed">
          When you submit a transaction for scoring, the payload is immediately encrypted, scored against our models, and purged from our active memory within 48 hours unless explicitly flagged for manual investigation in your Alert Center.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Compliance</h2>
        <p className="text-white/60 leading-relaxed">
          We are fully compliant with GDPR, CCPA, and SOC 2 Type II standards.
        </p>
        <p className="text-white/40 mt-12 text-sm">Last updated: May 2026</p>
      </div>
    </div>
  );
}
