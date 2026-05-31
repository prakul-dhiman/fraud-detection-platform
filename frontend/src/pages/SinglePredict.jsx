import React, { useState, useEffect } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Cell } from 'recharts';
import ShapChart from '../components/ShapChart';
import api from '../api/axios';

/* ------------------------------------------------------------------ */
/*  Demo data                                                            */
/* ------------------------------------------------------------------ */
const FRAUD_DEMO = {
  Time: 406, V1: -3.0, V2: 3.0, V3: -10.0, V4: 6.0,
  V5: -3.0, V6: -1.0, V7: -10.0, V8: 2.0, V9: -5.0,
  V10: -10.0, V11: 6.0, V12: -15.0, V13: 0.0, V14: -15.0,
  V15: 0.0, V16: -10.0, V17: -15.0, V18: -5.0, V19: 2.0,
  V20: 1.0, V21: 1.0, V22: 0.0, V23: 0.0, V24: 0.0,
  V25: 0.0, V26: 0.0, V27: 1.0, V28: 0.0, Amount: 999.0,
};

const LEGIT_DEMO = {
  Time: 2000, V1: 1.191857, V2: 0.266151, V3: 0.166480, V4: 0.448154,
  V5: 0.060018, V6: -0.082361, V7: -0.078803, V8: 0.085102, V9: -0.255425,
  V10: -0.166974, V11: 1.612726, V12: 1.065235, V13: 0.489095, V14: -0.143772,
  V15: 0.635558, V16: 0.463917, V17: -0.114805, V18: -0.183361, V19: -0.145783,
  V20: -0.069083, V21: -0.225775, V22: -0.638672, V23: 0.101288, V24: -0.339846,
  V25: 0.167170, V26: 0.125895, V27: -0.008983, V28: 0.014724, Amount: 2.69,
};

const FEATURES_CORE = ['Time', 'Amount'];
const FEATURES_G1 = Array.from({ length: 10 }, (_, i) => `V${i + 1}`);
const FEATURES_G2 = Array.from({ length: 10 }, (_, i) => `V${i + 11}`);
const FEATURES_G3 = Array.from({ length: 8 }, (_, i) => `V${i + 21}`);
const ALL_FEATURES = [...FEATURES_CORE, ...FEATURES_G1, ...FEATURES_G2, ...FEATURES_G3];

/* ------------------------------------------------------------------ */
/*  Animated Risk Meter                                                  */
/* ------------------------------------------------------------------ */
function RiskMeter({ riskLevel, isFraud }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    // Animate the risk level
    let start = 0;
    const end = Math.round(riskLevel || 0);
    const duration = 1000;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setAnimatedValue(Math.round(start + (end - start) * ease));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [riskLevel]);

  const getColor = (val) => {
    if (val < 20) return '#10b981'; // Green
    if (val < 50) return '#fbbf24'; // Yellow
    if (val < 80) return '#f97316'; // Orange
    return '#ef4444'; // Red
  };
  
  const color = getColor(animatedValue);
  const data = [{ value: animatedValue }];

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
        <circle
          cx="96" cy="96" r="76"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="96" cy="96" r="76"
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeDasharray="477.5"
          strokeDashoffset={477.5 - (477.5 * animatedValue) / 100}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <span className="text-4xl font-black tabular-nums transition-colors duration-300" style={{ color }}>
          {animatedValue}
        </span>
        <span className="text-white/40 text-[10px] uppercase font-bold tracking-widest mt-1">Risk Score</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Plain English Explanation                                            */
/* ------------------------------------------------------------------ */
function EnglishExplanation({ shapValues, isFraud }) {
  if (!shapValues || Object.keys(shapValues).length === 0) return null;
  
  // Sort shap values by magnitude
  const sortedFeatures = Object.entries(shapValues)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 3); // Top 3 most influential features
    
  if (sortedFeatures.length === 0) return null;

  return (
    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl mt-4">
      <h4 className="text-white/60 text-xs uppercase font-bold tracking-wider mb-2">
        AI Reasoning Summary
      </h4>
      <p className="text-white/80 text-sm leading-relaxed">
        The model flagged this transaction as 
        <strong className={isFraud ? 'text-red-400 font-semibold mx-1' : 'text-green-400 font-semibold mx-1'}>
          {isFraud ? 'High Risk' : 'Low Risk'}
        </strong>
        primarily because of the following factors: 
        {sortedFeatures.map(([feat, val], idx) => {
          const impact = val > 0 ? "increased" : "decreased";
          const featureName = feat === 'V14' ? 'V14 (Card Info)' : feat === 'V10' ? 'V10 (Time Pattern)' : feat;
          return (
            <span key={feat}>
              {idx > 0 && idx === sortedFeatures.length - 1 ? ' and ' : idx > 0 ? ', ' : ' '}
              the value of <strong>{featureName}</strong> significantly <em>{impact}</em> the risk score
            </span>
          );
        })}.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Result Section                                                       */
/* ------------------------------------------------------------------ */
function ResultSection({ result }) {
  const isFraud = result.prediction?.isFraud === true;
  const color = isFraud ? '#ef4444' : '#10b981';
  const glowClass = isFraud ? 'animate-pulse-glow-fraud' : 'animate-pulse-glow-safe';
  const shapData = result.prediction?.shapValues;

  return (
    <div className="space-y-6 animate-slide-up mt-8">
      {/* Main result banner */}
      <div
        className={`glass-card p-8 flex flex-col md:flex-row items-center gap-8 ${glowClass}`}
        style={{ border: `1px solid ${color}30` }}
      >
        <div className="flex-1 text-center md:text-left">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">
            Analysis Complete
          </p>
          <h2
            className="text-5xl font-black mb-3"
            style={{ color, textShadow: `0 0 40px ${color}50` }}
          >
            {isFraud ? 'FRAUD DETECTED' : 'LEGITIMATE'}
          </h2>
          <p className="text-white/60 text-base max-w-md">
            {isFraud
              ? 'Our AI has identified high-risk patterns in this transaction. It is strongly recommended to block or review this charge.'
              : 'This transaction matches normal spending behaviors and appears completely safe.'}
          </p>
        </div>

        {/* Circular Risk Meter */}
        <div className="flex-shrink-0">
          <RiskMeter riskLevel={result.riskScore ?? (result.prediction?.confidence * 100)} isFraud={isFraud} />
        </div>
      </div>

      {/* SHAP Chart & Explanation */}
      {shapData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 flex flex-col justify-center">
            <h3 className="text-white font-bold mb-4">Model Interpretability (XAI)</h3>
            <EnglishExplanation shapValues={shapData} isFraud={isFraud} />
          </div>
          <div className="glass-card p-6 min-h-[300px]">
            <ShapChart
              shapValues={shapData}
              title="Feature Contributions"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SinglePredict Page                                                   */
/* ------------------------------------------------------------------ */
export default function SinglePredict() {
  const [features, setFeatures] = useState(() =>
    ALL_FEATURES.reduce((acc, f) => ({ ...acc, [f]: '' }), {})
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (feature, value) => {
    setFeatures((prev) => ({ ...prev, [feature]: value }));
  };

  const fillDemo = (type) => {
    const data = type === 'fraud' ? FRAUD_DEMO : LEGIT_DEMO;
    setFeatures(
      ALL_FEATURES.reduce((acc, f) => ({ ...acc, [f]: String(data[f] ?? '') }), {})
    );
    setResult(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // Validate all filled
    const payload = {};
    for (const f of ALL_FEATURES) {
      const val = parseFloat(features[f]);
      if (isNaN(val)) {
        setError(`Please enter a valid number for feature: ${f}`);
        return;
      }
      payload[f] = val;
    }

    setLoading(true);
    try {
      const res = await api.post('/transactions/predict', payload);
      setResult(res.data.data.transaction);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFeatures(ALL_FEATURES.reduce((acc, f) => ({ ...acc, [f]: '' }), {}));
    setResult(null);
    setError('');
  };

  const renderFeatureGroup = (title, featureList) => (
    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl">
      <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {featureList.map((f) => (
          <div key={f}>
            <label className="block text-white/40 text-[10px] font-medium mb-1 uppercase tracking-wider">{f}</label>
            <input
              type="number"
              step="any"
              value={features[f]}
              onChange={(e) => handleChange(f, e.target.value)}
              className="input-dark text-xs w-full py-1.5 px-2"
              placeholder="0.0"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto">
      {/* Header & Quick Scenarios */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Smart Prediction Console</h1>
          <p className="text-white/40 text-sm">Manually evaluate transactions with real-time XAI insights</p>
        </div>
        
        <div className="glass-card p-3 flex items-center gap-3">
          <span className="text-white/40 text-xs uppercase font-bold tracking-widest px-2">Quick Scenarios</span>
          <button
            onClick={() => fillDemo('legit')}
            className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium transition-all"
          >
            ✓ Simulate Normal
          </button>
          <button
            onClick={() => fillDemo('fraud')}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium transition-all"
          >
            🚨 Simulate High Risk
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm animate-slide-down bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-white text-lg font-semibold">Transaction Features</h2>
            <button type="button" onClick={handleReset} className="text-white/40 hover:text-white/80 text-sm underline transition-colors">
              Clear All Fields
            </button>
          </div>
          
          {renderFeatureGroup('Core Variables', FEATURES_CORE)}
          {renderFeatureGroup('PCA Group 1 (V1 - V10)', FEATURES_G1)}
          {renderFeatureGroup('PCA Group 2 (V11 - V20)', FEATURES_G2)}
          {renderFeatureGroup('PCA Group 3 (V21 - V28)', FEATURES_G3)}

          {/* Action Buttons */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 px-8 py-3 text-lg"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Processing...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Run Analysis
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Result */}
      {result && !loading && <ResultSection result={result} />}
    </div>
  );
}
