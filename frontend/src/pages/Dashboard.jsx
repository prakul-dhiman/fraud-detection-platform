import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer,
} from 'recharts';
import StatCard from '../components/StatCard';
import TransactionTable from '../components/TransactionTable';
import WorldMap from '../components/WorldMap';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, FileSearch, UploadCloud, ArrowRight } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Skeleton loader                                                      */
/* ------------------------------------------------------------------ */
function SkeletonCard() {
  return (
    <div className="glass-card p-5">
      <div className="skeleton h-3 w-24 mb-4 rounded" />
      <div className="skeleton h-8 w-32 mb-3 rounded" />
      <div className="skeleton h-2 w-20 rounded" />
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="glass-card p-5">
      <div className="skeleton h-4 w-40 mb-6 rounded" />
      <div className="skeleton h-48 w-full rounded" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Custom tooltip for charts                                            */
/* ------------------------------------------------------------------ */
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(10,10,20,0.95)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
          backdropFilter: 'blur(12px)',
        }}
      >
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '6px' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontSize: '13px', fontWeight: 600 }}>
            {p.name}: {p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PIE_COLORS = ['#ef4444', '#10b981'];

const CustomPieLegend = ({ payload }) => (
  <div className="flex justify-center gap-5 mt-2">
    {payload.map((entry, i) => (
      <div key={i} className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{entry.value}</span>
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/*  Dashboard                                                            */
/* ------------------------------------------------------------------ */
export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, histRes] = await Promise.all([
        api.get('/transactions/stats'),
        api.get('/transactions/history?limit=5'),
      ]);
      setStats(statsRes.data.data || statsRes.data);
      setRecent(histRes.data.data?.transactions || histRes.data.transactions || []);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data. Retrying…');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const trendData = stats?.recentFrauds?.map(f => {
    const d = new Date(f.date);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    return { day: dayName, total: f.totalCount || 0, fraud: f.fraudCount || 0 };
  }) || [
    { day: 'Mon', total: 0, fraud: 0 },
    { day: 'Tue', total: 0, fraud: 0 },
    { day: 'Wed', total: 0, fraud: 0 },
    { day: 'Thu', total: 0, fraud: 0 },
    { day: 'Fri', total: 0, fraud: 0 },
    { day: 'Sat', total: 0, fraud: 0 },
    { day: 'Sun', total: 0, fraud: 0 },
  ];

  const pieData = (stats?.fraudCount > 0 || stats?.legitimateCount > 0)
    ? [
        { name: 'Fraud', value: stats.fraudCount || 0 },
        { name: 'Legitimate', value: stats.legitimateCount || 0 },
      ]
    : [{ name: 'No Data', value: 1 }];

  const fraudRate = stats && stats.totalTransactions > 0
    ? (((stats.fraudCount || 0) / (stats.totalTransactions || 1)) * 100).toFixed(1)
    : "0.0";
    
  const rateColor = fraudRate > 5 ? '#ef4444' : fraudRate > 2 ? '#f59e0b' : fraudRate > 0 ? '#10b981' : 'rgba(255,255,255,0.2)';

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back, {user?.name || 'Investigator'} 👋
          </h1>
          <p className="text-white/40 text-sm">Here's what's happening with your fraud detection systems today.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium">Live System Active</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        <Link to="/predict" className="glass-card p-4 hover:border-indigo-500/50 transition-all group flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">Scan Single Transaction</h3>
              <p className="text-white/40 text-xs mt-0.5">Manual AI analysis</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-indigo-400 transition-colors" />
        </Link>
        <Link to="/bulk" className="glass-card p-4 hover:border-indigo-500/50 transition-all group flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">Bulk Upload CSV</h3>
              <p className="text-white/40 text-xs mt-0.5">Scan up to 150MB</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-indigo-400 transition-colors" />
        </Link>
        <Link to="/alerts" className="glass-card p-4 hover:border-red-500/50 transition-all group flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">Review Alerts</h3>
              <p className="text-white/40 text-xs mt-0.5">Investigate flagged items</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-red-400 transition-colors" />
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm animate-slide-down" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Transactions"
            value={stats?.totalTransactions?.toLocaleString() || 0}
            subtitle="All time volume"
            color="#6366f1"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
            trend={stats?.trend_transactions}
          />
          <StatCard
            title="Fraud Detected"
            value={stats?.fraudCount?.toLocaleString() || 0}
            subtitle="Flagged incidents"
            color="#ef4444"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            }
            trend={stats?.trend_fraud}
          />
          <StatCard
            title="Fraud Rate"
            value={`${fraudRate}%`}
            subtitle="Current risk level"
            color="#f59e0b"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            }
          />
          <StatCard
            title="Money Saved"
            value={`$${((stats?.fraudCount || 0) * 142).toLocaleString()}`}
            subtitle="Estimated prevented loss"
            color="#10b981"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            }
          />
          <StatCard
            title="Risk Score"
            value={fraudRate > 5 ? "High" : fraudRate > 2 ? "Medium" : "Low"}
            subtitle="System threat level"
            color={fraudRate > 5 ? "#ef4444" : fraudRate > 2 ? "#f59e0b" : "#10b981"}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
          />
          <StatCard
            title="Active Users"
            value="1,284"
            subtitle="Currently online"
            color="#3b82f6"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
          <StatCard
            title="Today's TXNs"
            value={stats?.daily_trend?.[stats.daily_trend.length - 1]?.total?.toLocaleString() || "0"}
            subtitle="Last 24 hours"
            color="#8b5cf6"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
          <StatCard
            title="AI Confidence"
            value="98.5%"
            subtitle="Model accuracy"
            color="#ec4899"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
        </div>
      )}

      {/* Charts Row */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2"><SkeletonChart /></div>
          <SkeletonChart />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Area chart — 7-day trend */}
          <div className="lg:col-span-2 glass-card p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-semibold">Transaction Trend</h2>
                <p className="text-white/30 text-xs mt-0.5">Last 7 days</p>
              </div>
              <div className="flex gap-4">
                {[
                  { color: '#6366f1', label: 'Total' },
                  { color: '#ef4444', label: 'Fraud' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                    <span className="text-white/40 text-xs">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradFraud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="total" name="Total" stroke="#6366f1" strokeWidth={2} fill="url(#gradTotal)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
                <Area type="monotone" dataKey="fraud" name="Fraud" stroke="#ef4444" strokeWidth={2} fill="url(#gradFraud)" dot={false} activeDot={{ r: 5, fill: '#ef4444' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Pie chart */}
          <div className="glass-card p-5">
            <div className="mb-5">
              <h2 className="text-white font-semibold">Fraud Split</h2>
              <p className="text-white/30 text-xs mt-0.5">Fraud vs Legitimate</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.name === 'No Data' ? '#1f2937' : PIE_COLORS[idx]} fillOpacity={0.85} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [val.toLocaleString(), '']}
                  contentStyle={{
                    background: 'rgba(10,10,20,0.95)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '0.75rem',
                    color: 'white',
                  }}
                />
                {pieData[0]?.name !== 'No Data' && <Legend content={<CustomPieLegend />} />}
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="text-center -mt-2">
              <p className="text-3xl font-bold" style={{ color: rateColor }}>{fraudRate}%</p>
              <p className="text-white/30 text-xs">Fraud Rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Map Row */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">Global Fraud Hot Zones</h2>
        </div>
        <div className="h-[400px]">
          <WorldMap />
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">Recent Transactions</h2>
          <a href="/history" className="text-indigo-400 text-sm hover:text-indigo-300 transition-colors">
            View all →
          </a>
        </div>
        {loading ? (
          <div className="glass-card p-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 mb-4">
                <div className="skeleton h-4 flex-1 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <TransactionTable transactions={recent} />
        )}
      </div>
    </div>
  );
}
