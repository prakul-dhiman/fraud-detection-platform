import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Lock, Activity, ChevronRight, BarChart2, Globe, Shield, CreditCard, Server } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020204] text-white overflow-hidden selection:bg-indigo-500/30 font-sans">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-900/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-900/20 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-[#020204]/80 backdrop-blur-2xl border-white/10' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">FraudShield</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#infrastructure" className="hover:text-white transition-colors">Infrastructure</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Sign In
            </button>
            <button onClick={() => navigate('/register')} className="text-sm font-semibold bg-white text-black px-5 py-2.5 rounded-full hover:scale-105 transition-transform">
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-40 pb-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300 mb-8 backdrop-blur-md font-medium shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-ping" />
                FraudShield 2.0 Enterprise is live
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-extrabold tracking-tighter mb-8 leading-[1.05]">
                Financial security, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                  engineered for scale.
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/50 max-w-3xl mx-auto mb-12 font-light">
                Stop fraudulent transactions instantly with our military-grade XGBoost AI engine. Designed for modern fintech, banks, and enterprise SaaS.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                <button 
                  onClick={() => navigate('/register')}
                  className="group flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-full font-bold text-lg transition-all w-full sm:w-auto shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)]"
                >
                  Get Started for Free
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full font-bold text-lg transition-all w-full sm:w-auto"
                >
                  View Live Demo
                </button>
              </div>
              
              {/* Massive Dashboard Mockup */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                className="relative mx-auto w-full max-w-[1200px] rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_0_150px_rgba(99,102,241,0.15)]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#020204] via-transparent to-transparent z-10" />
                <img 
                  src="/dashboard-mockup.png" 
                  alt="FraudShield Dashboard" 
                  className="w-full h-auto object-cover transform scale-100 hover:scale-[1.02] transition-transform duration-1000"
                />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Trusted By Banner */}
        <section className="py-10 border-y border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-sm font-medium text-white/40 mb-8 uppercase tracking-widest">Trusted by leading financial institutions</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale">
              {['VISA', 'MASTERCARD', 'STRIPE', 'PAYPAL', 'JPMORGAN', 'AMERICAN EXPRESS'].map(brand => (
                <span key={brand} className="text-2xl font-black tracking-tighter">{brand}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Animated Stats */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-3xl bg-white/[0.02] border border-white/5">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">$4B+</div>
              <div className="text-white/50 font-medium">Fraud Prevented in 2026</div>
            </div>
            <div className="text-center p-8 rounded-3xl bg-white/[0.02] border border-white/5">
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">&lt;10ms</div>
              <div className="text-white/50 font-medium">Average Prediction Latency</div>
            </div>
            <div className="text-center p-8 rounded-3xl bg-white/[0.02] border border-white/5">
              <div className="text-5xl font-black text-white mb-2">99.99%</div>
              <div className="text-white/50 font-medium">Platform Uptime SLA</div>
            </div>
          </div>
        </section>

        {/* Interactive Threat Map Section */}
        <section id="features" className="py-32 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20 text-indigo-400">
                  <Globe className="w-7 h-7" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">Global threat intelligence, mapped in real-time.</h2>
                <p className="text-xl text-white/50 leading-relaxed mb-8">
                  Watch as our global network detects and neutralizes fraud attempts across continents instantly. We analyze thousands of signals per transaction using SHAP-explained XGBoost models.
                </p>
                <ul className="space-y-4">
                  {['Geolocation Mismatch Detection', 'Velocity & Volume Analysis', 'Device Fingerprinting AI', 'IP Reputation Scoring'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-white/70">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">✓</div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/10">
                  <img src="/threat-map.png" alt="Global Threat Map" className="w-full h-auto object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Grid / Infrastructure Section */}
        <section id="infrastructure" className="py-32 px-6 relative bg-white/[0.01] border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col-reverse md:flex-row items-center gap-16">
              <div className="flex-1 w-full">
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-cyan-500/10 group">
                   <div className="absolute inset-0 bg-gradient-to-t from-[#020204] via-transparent to-transparent z-10 opacity-60" />
                  <img src="/data-grid.png" alt="Transaction Data Grid" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
              <div className="flex-1">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 border border-cyan-500/20 text-cyan-400">
                  <Server className="w-7 h-7" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">Massive scale. Microsecond precision.</h2>
                <p className="text-xl text-white/50 leading-relaxed mb-8">
                  Whether you are processing 10 transactions a day or 10,000 per second, our elastic infrastructure auto-scales to meet your demands. Upload bulk CSVs and process millions of rows instantly.
                </p>
                <button onClick={() => navigate('/register')} className="font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors text-lg">
                  Explore our infrastructure <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3-Column Features */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto text-center mb-20">
             <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Unrivaled security features</h2>
          </div>
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-indigo-400" />}
              title="Explainable AI (XAI)"
              description="Never guess why a transaction was blocked. Our SHAP implementation tells exactly which feature triggered the alert."
            />
            <FeatureCard 
              icon={<Lock className="w-8 h-8 text-purple-400" />}
              title="SOC2 & GDPR Compliant"
              description="Your data never leaves our zero-trust architecture. We adhere to the strictest global compliance frameworks."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-yellow-400" />}
              title="WebSockets Integration"
              description="Get instant push notifications the millisecond a fraudulent transaction hits your systems."
            />
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-32 px-6 bg-gradient-to-b from-transparent to-indigo-950/20 border-t border-white/5 relative z-10">
           <div className="max-w-4xl mx-auto text-center">
             <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Simple, transparent pricing</h2>
             <p className="text-xl text-white/50 mb-16">Start for free. Upgrade when you need more power.</p>
             
             <div className="grid md:grid-cols-2 gap-8 text-left">
               <div className="glass-card p-10 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <h3 className="text-2xl font-bold mb-2">Developer</h3>
                 <div className="text-5xl font-black mb-6">$0<span className="text-lg text-white/40 font-medium">/mo</span></div>
                 <ul className="space-y-4 mb-10 text-white/70">
                   <li>✓ 10,000 predictions / month</li>
                   <li>✓ Basic Dashboard Analytics</li>
                   <li>✓ Community Support</li>
                 </ul>
                 <button onClick={() => navigate('/register')} className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors border border-white/10">Start Free</button>
               </div>
               
               <div className="glass-card p-10 relative overflow-hidden group border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                 <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                 <h3 className="text-2xl font-bold mb-2 text-indigo-400">Enterprise</h3>
                 <div className="text-5xl font-black mb-6">Custom</div>
                 <ul className="space-y-4 mb-10 text-white/70">
                   <li>✓ Unlimited predictions</li>
                   <li>✓ Dedicated XGBoost Instances</li>
                   <li>✓ Case Management & Alert Center</li>
                   <li>✓ 24/7 Phone Support</li>
                 </ul>
                 <button onClick={() => navigate('/register')} className="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-colors">Contact Sales</button>
               </div>
             </div>
           </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto text-center glass-card p-16 rounded-[3rem] border border-indigo-500/20 bg-gradient-to-b from-indigo-900/20 to-transparent relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
             <h2 className="text-5xl font-bold tracking-tight mb-8 relative z-10">Ready to secure your platform?</h2>
             <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 relative z-10">Join thousands of companies using FraudShield to stop fraud before it happens.</p>
             <button onClick={() => navigate('/register')} className="relative z-10 bg-white text-black px-10 py-5 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)]">
               Create your free account
             </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-[#020204]">
          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span className="font-semibold text-white/80">FraudShield 2.0</span>
            </div>
            
            <div className="flex gap-8 text-sm text-white/40 mb-6 md:mb-0 relative z-10">
              <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms</button>
              <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy</button>
              <button onClick={() => navigate('/security')} className="hover:text-white transition-colors">Security</button>
              <button onClick={() => navigate('/status')} className="hover:text-white transition-colors">Status</button>
            </div>

            <div className="text-white/40 text-sm flex items-center gap-2 font-medium bg-white/5 px-4 py-2 rounded-full border border-white/10">
              Designed & Powered by <span className="text-white font-bold tracking-wide">Prakul</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all duration-300 relative overflow-hidden group">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-xl shadow-black/50">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 tracking-tight">{title}</h3>
      <p className="text-white/50 leading-relaxed text-lg">
        {description}
      </p>
    </div>
  );
}
