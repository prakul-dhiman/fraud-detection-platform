import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, User, Phone, Mail, Map, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'profile', title: 'Profile', icon: User },
  { id: 'phone', title: 'Phone Verify', icon: Phone },
  { id: 'email', title: 'Email Verify', icon: Mail },
  { id: 'tour', title: 'Tour', icon: Map },
  { id: 'ready', title: 'Ready', icon: Check },
];

export default function OnboardingWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      if (onComplete) onComplete();
      else navigate('/dashboard');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
        {/* Progress Header */}
        <div className="p-6 border-b border-white/5 bg-white/[0.01]">
          <div className="flex justify-between items-center mb-6 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10 -translate-y-1/2" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -z-10 -translate-y-1/2 transition-all duration-500 ease-in-out" 
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex flex-col items-center gap-2 bg-[#0a0a0f] px-2">
                  <div 
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                      isActive ? "border-indigo-500 bg-indigo-500/10 text-indigo-400" : 
                      isCompleted ? "border-indigo-500 bg-indigo-500 text-white" : 
                      "border-white/10 bg-white/5 text-white/30"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">{STEPS[currentStep].title}</h2>
            <p className="text-white/40 text-sm mt-1">Step {currentStep + 1} of {STEPS.length}</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 relative min-h-[300px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col"
            >
              {currentStep === 0 && <WelcomeStep />}
              {currentStep === 1 && <ProfileStep />}
              {currentStep === 2 && <PhoneStep />}
              {currentStep === 3 && <EmailStep />}
              {currentStep === 4 && <TourStep />}
              {currentStep === 5 && <ReadyStep />}
            </motion.div>
          </AnimatePresence>

          {/* Footer Controls */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/5">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-2 rounded-full text-white/50 hover:text-white hover:bg-white/5 disabled:opacity-0 transition-all font-medium"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3 rounded-full font-medium transition-all"
            >
              {currentStep === STEPS.length - 1 ? 'Go to Dashboard' : 'Continue'}
              {currentStep !== STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
const WelcomeStep = () => (
  <div className="text-center my-auto space-y-4">
    <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <Sparkles className="w-8 h-8" />
    </div>
    <h3 className="text-3xl font-bold text-white">Welcome to FraudShield</h3>
    <p className="text-white/50 text-lg max-w-md mx-auto">
      Let's get your enterprise account set up in just a few steps. We'll have you protecting transactions in no time.
    </p>
  </div>
);

const ProfileStep = () => (
  <div className="space-y-6 my-auto">
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/70">Full Name</label>
      <input type="text" placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/70">Company Name</label>
      <input type="text" placeholder="Acme Corp" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
    </div>
  </div>
);

const PhoneStep = () => (
  <div className="space-y-6 my-auto text-center">
    <p className="text-white/50 mb-6">Enter your phone number for two-factor authentication.</p>
    <div className="space-y-2 max-w-sm mx-auto">
      <input type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-center text-lg tracking-wide" />
    </div>
    <button className="text-indigo-400 text-sm hover:text-indigo-300">Send verification code</button>
  </div>
);

const EmailStep = () => (
  <div className="space-y-6 my-auto text-center">
    <p className="text-white/50 mb-6">We've sent a magic link to your email. Click it or enter the code below.</p>
    <div className="flex justify-center gap-3">
      {[1,2,3,4,5,6].map(i => (
        <input key={i} type="text" maxLength={1} className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl text-white font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
      ))}
    </div>
    <button className="text-indigo-400 text-sm hover:text-indigo-300">Resend email</button>
  </div>
);

const TourStep = () => (
  <div className="text-center my-auto space-y-4">
    <div className="w-full h-40 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-2xl flex items-center justify-center mb-6">
      <Map className="w-12 h-12 text-white/30" />
    </div>
    <h3 className="text-xl font-bold text-white">Quick Platform Tour</h3>
    <p className="text-white/50">
      Familiarize yourself with the dashboard. We'll show you how to monitor live transactions, manage rules, and handle alerts.
    </p>
  </div>
);

const ReadyStep = () => (
  <div className="text-center my-auto space-y-4">
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", bounce: 0.5 }}
      className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6"
    >
      <Check className="w-10 h-10" />
    </motion.div>
    <h3 className="text-3xl font-bold text-white">You're All Set!</h3>
    <p className="text-white/50 text-lg max-w-md mx-auto">
      Your workspace is configured and ready to go. Let's start detecting fraud.
    </p>
  </div>
);
