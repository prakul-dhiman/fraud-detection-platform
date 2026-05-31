import React, { useState } from 'react';
import { CreditCard, CheckCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function Billing() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('Enterprise Tier');
  const [price, setPrice] = useState('$4,999');

  const handleUpgrade = () => {
    if (plan === 'Custom Enterprise') return toast.info('You are already on the highest tier.');
    setLoading(true);
    setTimeout(() => {
      setPlan('Custom Enterprise');
      setPrice('$9,999');
      setLoading(false);
      toast.success('Successfully upgraded to Custom Enterprise!');
    }, 1500);
  };

  const handleCancel = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.error('Cancellation request submitted to your account manager.');
    }, 1500);
  };

  return (
    <div className="animate-fade-in max-w-5xl space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Billing & Subscription</h1>
        <p className="text-white/40 text-sm">Manage your plan, payment methods, and invoices</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 bg-gradient-to-br from-indigo-900/20 to-transparent border-indigo-500/20">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
                  Current Plan
                </div>
                <h2 className="text-2xl font-bold text-white">{plan}</h2>
                <p className="text-white/50 text-sm mt-1">Unlimited predictions, dedicated models, API access.</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white">{price}<span className="text-lg text-white/40">/mo</span></div>
                <p className="text-white/40 text-xs mt-1">Next billing: Oct 1, 2026</p>
              </div>
            </div>
            
            <div className="w-full bg-black/40 rounded-full h-2 mb-2 border border-white/5 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <p className="text-xs text-white/40">4.5M / 10M API requests used this billing cycle</p>

            <div className="mt-8 flex gap-4">
              <button onClick={handleUpgrade} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                {loading && plan !== 'Custom Enterprise' ? 'Processing...' : 'Upgrade Plan'}
              </button>
              <button onClick={handleCancel} disabled={loading} className="bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors border border-white/10 disabled:opacity-50">
                Cancel Subscription
              </button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Payment Method</h3>
            <div className="flex items-center justify-between p-4 bg-[#0a0a0f] border border-white/10 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white/60" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">•••• •••• •••• 4242</p>
                  <p className="text-white/40 text-xs">Expires 12/28</p>
                </div>
              </div>
              <button onClick={() => toast.info('Edit payment method functionality coming soon.')} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                Edit
              </button>
            </div>
            <button onClick={() => toast.info('Opening payment gateway...')} className="mt-4 text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2">
              + Add new payment method
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Billing History</h3>
            <div className="space-y-4">
              {[
                { date: 'Sep 1, 2026', amount: '$4,999.00', status: 'Paid' },
                { date: 'Aug 1, 2026', amount: '$4,999.00', status: 'Paid' },
                { date: 'Jul 1, 2026', amount: '$4,999.00', status: 'Paid' },
              ].map((inv, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                  <div>
                    <p className="text-white text-sm font-medium">{inv.date}</p>
                    <p className="text-emerald-400 text-xs flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3 h-3" /> {inv.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm">{inv.amount}</p>
                    <p className="text-indigo-400 text-xs hover:underline mt-0.5">PDF</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => toast.success('Downloading full invoice history...')} className="w-full mt-6 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl text-sm font-medium transition-colors border border-white/10">
              View All Invoices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
