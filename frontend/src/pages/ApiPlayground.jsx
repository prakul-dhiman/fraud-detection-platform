import React, { useState } from 'react';
import { Terminal, Key, Copy, CheckCircle, ExternalLink, Code2 } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'sonner';

export default function ApiPlayground() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const activeTab = 'curl'; // we can expand this to have python, node, etc.

  const fetchApiKey = async () => {
    setLoading(true);
    try {
      const res = await api.post('/keys');
      setApiKey(res.data.key || res.data.api_key || 'fs_live_xxxxxxxxxxxx');
      toast.success('API Key generated successfully');
    } catch (err) {
      toast.error('Failed to generate API Key');
      // Mock key for demo purposes if endpoint doesn't exist
      setApiKey('fs_live_' + Math.random().toString(36).substring(2, 15));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  const codeSnippet = `curl -X POST https://api.fraudshield.com/v1/predict \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 250.00,
    "time": 406,
    "features": [-3.04, -3.15, 1.08, 2.28, 1.35, -1.06, 0.32, -0.06]
  }'`;

  return (
    <div className="max-w-6xl space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">API Playground</h1>
          <p className="text-white/40 text-sm">Integrate FraudShield directly into your applications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: API Keys & Info */}
        <div className="space-y-6">
          <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-white">Authentication</h2>
            </div>
            <p className="text-sm text-white/50 mb-6">
              To authenticate API requests, you will need a valid API key. Include it in the <code className="bg-white/10 px-1 py-0.5 rounded text-white/80">Authorization</code> header as a Bearer token.
            </p>

            {apiKey ? (
              <div className="space-y-3">
                <label className="text-xs font-medium text-white/40 uppercase tracking-wider">Your API Key</label>
                <div className="flex items-center bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden">
                  <input
                    type="text"
                    readOnly
                    value={apiKey}
                    className="flex-1 bg-transparent text-emerald-400 font-mono text-sm px-4 py-3 outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(apiKey)}
                    className="px-4 py-3 text-white/50 hover:text-white hover:bg-white/5 transition-colors border-l border-white/10"
                  >
                    {copied ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={fetchApiKey}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <><Key className="w-4 h-4" /> Generate API Key</>
                )}
              </button>
            )}
          </div>

          <div className="bg-[#111116] border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-3 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" /> Endpoint Details
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-white/40">Base URL</span>
                <span className="font-mono text-white/80">api.fraudshield.com/v1</span>
              </li>
              <li className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-white/40">Rate Limit</span>
                <span className="text-white/80">100 req / minute</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-white/40">Format</span>
                <span className="font-mono text-white/80">JSON</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Code Playground */}
        <div className="lg:col-span-2">
          <div className="bg-[#111116] border border-white/5 rounded-2xl overflow-hidden h-full flex flex-col">
            <div className="flex items-center justify-between px-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex">
                <button className="px-4 py-3 text-sm font-medium text-indigo-400 border-b-2 border-indigo-500 flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> cURL
                </button>
              </div>
              <button onClick={() => copyToClipboard(codeSnippet)} className="text-white/40 hover:text-white p-2 transition-colors">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 bg-[#0a0a0f] flex-1 overflow-x-auto">
              <pre className="text-sm font-mono leading-relaxed text-gray-300">
                <code dangerouslySetInnerHTML={{ __html: codeSnippet.replace(
                  /("Authorization: Bearer |'YOUR_API_KEY'|fs_live_[\w]+)/g, 
                  '<span class="text-emerald-400">$1</span>'
                ).replace(
                  /(curl|-X POST|-H|-d)/g,
                  '<span class="text-indigo-400">$1</span>'
                ).replace(
                  /(https:\/\/[^\s]+)/g,
                  '<span class="text-blue-400">$1</span>'
                ) }}></code>
              </pre>
            </div>

            <div className="p-4 border-t border-white/5 bg-[#111116]">
              <h4 className="text-white/80 text-sm font-medium mb-3">Expected Response</h4>
              <pre className="text-xs font-mono bg-[#0a0a0f] border border-white/10 rounded-xl p-4 text-gray-400">
{`{
  "id": "tx_2a9f8b4c",
  "prediction": "FRAUD",
  "confidence": 0.985,
  "risk_score": 98.5,
  "processing_time_ms": 42
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
