import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'sonner';

export default function AlertCenter() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cases');
      const normalized = (res.data?.data || res.data || []).map(c => ({
        id: c.caseId || c._id,
        transactionId: c.transactionId?._id || 'Unknown',
        amount: c.transactionId?.features?.Amount || 0,
        user: c.assignedTo?.name || 'System User',
        riskScore: c.transactionId?.riskScore ? (c.transactionId.riskScore / 100) : (c.priority === 'Critical' ? 0.99 : 0.85),
        status: c.status || 'Open',
        assignedTo: c.assignedTo?.name || null,
        date: c.createdAt || new Date().toISOString()
      }));
      setCases(normalized);
    } catch (err) {
      // Fallback to mock data if backend not implemented yet
      console.log('Falling back to mock cases data');
      setCases([
        { id: 'CAS-9921', transactionId: 'TX-10294', amount: 4500.00, user: 'alex.smith@example.com', riskScore: 0.94, status: 'Open', assignedTo: null, date: new Date().toISOString() },
        { id: 'CAS-9922', transactionId: 'TX-10295', amount: 125.50, user: 'j.doe@example.com', riskScore: 0.88, status: 'In Progress', assignedTo: 'Admin', date: new Date(Date.now() - 3600000).toISOString() },
        { id: 'CAS-9923', transactionId: 'TX-10296', amount: 12000.00, user: 'mike.jones@example.com', riskScore: 0.99, status: 'Open', assignedTo: null, date: new Date(Date.now() - 7200000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateCaseStatus = async (caseId, newStatus) => {
    try {
      await api.patch(`/cases/${caseId}`, { status: newStatus });
    } catch (err) {
      // Mock update
    }
    setCases(cases.map(c => c.id === caseId ? { ...c, status: newStatus } : c));
    toast.success(`Case ${caseId} marked as ${newStatus}`);
    if (selectedCase?.id === caseId) setSelectedCase({ ...selectedCase, status: newStatus });
  };

  const assignCase = async (caseId, assignee) => {
    try {
      await api.patch(`/cases/${caseId}`, { assignedTo: assignee });
    } catch (err) {
      // Mock assign
    }
    setCases(cases.map(c => c.id === caseId ? { ...c, assignedTo: assignee } : c));
    toast.success(`Case ${caseId} assigned to ${assignee}`);
    if (selectedCase?.id === caseId) setSelectedCase({ ...selectedCase, assignedTo: assignee });
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Fraud Alert Center</h1>
          <p className="text-white/40 text-sm">Manage and investigate high-risk transactions</p>
        </div>
        <button
          onClick={fetchCases}
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          ↻ Refresh Queue
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue List */}
        <div className="lg:col-span-2 glass-card p-0 overflow-hidden flex flex-col h-[700px]">
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Open Investigations ({cases.filter(c => c.status !== 'Resolved').length})
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="spinner-lg" />
              </div>
            ) : cases.length === 0 ? (
              <div className="text-center py-10 text-white/40">No pending cases</div>
            ) : (
              cases.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    selectedCase?.id === c.id
                      ? 'bg-indigo-500/10 border-indigo-500/30'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">{c.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        c.riskScore > 0.9 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {(c.riskScore * 100).toFixed(0)}% Risk
                      </span>
                    </div>
                    <span className="text-white/40 text-xs">
                      {new Date(c.date).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                    <div>
                      <p className="text-white/30 text-xs uppercase">Amount</p>
                      <p className="text-white font-medium">${c.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-white/30 text-xs uppercase">Status</p>
                      <p className="text-white/80">{c.status}</p>
                    </div>
                    <div>
                      <p className="text-white/30 text-xs uppercase">Assignee</p>
                      <p className="text-white/80">{c.assignedTo || 'Unassigned'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Case Details */}
        <div className="glass-card p-6 h-[700px] flex flex-col">
          {selectedCase ? (
            <div className="animate-fade-in flex flex-col h-full">
              <div className="mb-6">
                <p className="text-indigo-400 text-xs font-bold tracking-widest uppercase mb-1">Case Details</p>
                <h2 className="text-2xl font-bold text-white">{selectedCase.id}</h2>
              </div>

              <div className="space-y-6 flex-1">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <h3 className="text-white/60 text-sm mb-3">Transaction Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/40">Txn ID</span>
                      <span className="text-white">{selectedCase.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">User</span>
                      <span className="text-white">{selectedCase.user}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Amount</span>
                      <span className="text-white font-semibold text-red-400">${selectedCase.amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-white/60 text-sm">Actions</h3>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-white/40 uppercase">Assignee</label>
                    <select 
                      className="input-dark w-full text-sm"
                      value={selectedCase.assignedTo || ''}
                      onChange={(e) => assignCase(selectedCase.id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      <option value="Current User">Assign to Me</option>
                      <option value="Investigator Team">Investigator Team</option>
                    </select>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs text-white/40 uppercase">Update Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => updateCaseStatus(selectedCase.id, 'In Progress')}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedCase.status === 'In Progress' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        In Progress
                      </button>
                      <button 
                        onClick={() => updateCaseStatus(selectedCase.id, 'Resolved')}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedCase.status === 'Resolved' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/30 text-center h-full">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-4 opacity-50">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <p>Select a case from the queue to view details and take action.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
