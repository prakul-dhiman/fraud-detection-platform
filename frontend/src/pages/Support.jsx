import React from 'react';
import { HelpCircle, MessageCircle, PhoneCall, FileText, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function Support() {
  return (
    <div className="animate-fade-in max-w-5xl space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Help & Support</h1>
        <p className="text-white/40 text-sm">Get assistance from our fraud experts or browse the documentation</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div onClick={() => toast.info('Opening documentation...')} className="glass-card p-6 flex flex-col items-center text-center hover:bg-white/[0.04] transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Documentation</h3>
          <p className="text-white/50 text-sm mb-4 flex-1">Read our comprehensive guides on API integration and XAI interpretation.</p>
          <span className="text-indigo-400 text-sm font-medium flex items-center gap-1">Browse Docs <ExternalLink className="w-3 h-3" /></span>
        </div>

        <div onClick={() => toast.success('Connecting to a live analyst...')} className="glass-card p-6 flex flex-col items-center text-center hover:bg-white/[0.04] transition-colors cursor-pointer group border-indigo-500/20">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <MessageCircle className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Live Chat</h3>
          <p className="text-white/50 text-sm mb-4 flex-1">Chat directly with our tier-2 fraud analysts for immediate assistance.</p>
          <span className="text-indigo-400 text-sm font-medium">Start Chat</span>
        </div>

        <div onClick={() => toast.info('Initiating phone call to support...')} className="glass-card p-6 flex flex-col items-center text-center hover:bg-white/[0.04] transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PhoneCall className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Phone Support</h3>
          <p className="text-white/50 text-sm mb-4 flex-1">Enterprise customers get 24/7 access to our emergency hotline.</p>
          <span className="text-emerald-400 text-sm font-medium">1-800-FRAUD-AI</span>
        </div>
      </div>

      <div className="glass-card p-8">
        <h3 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {[
            { q: "How does the SHAP explainer work?", a: "SHAP (SHapley Additive exPlanations) uses game theory to determine exactly how much each transaction feature (like time, amount, or location) contributed to the final fraud probability." },
            { q: "What happens if a legitimate transaction is blocked?", a: "You can go to the Alert Center and mark the transaction as a 'False Positive'. This immediately feeds back into our model pipeline to retrain and adapt to your specific merchant patterns." },
            { q: "How long does bulk upload processing take?", a: "Our XGBoost cluster can process approximately 10,000 rows per second. A standard 150MB CSV file typically finishes analysis in under 45 seconds." }
          ].map((faq, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#0a0a0f] border border-white/5">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" /> {faq.q}
              </h4>
              <p className="text-white/50 text-sm pl-6 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
