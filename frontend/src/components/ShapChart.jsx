import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div
        style={{
          background: 'rgba(10,10,20,0.95)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '0.75rem',
          padding: '0.625rem 0.875rem',
          backdropFilter: 'blur(12px)',
        }}
      >
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginBottom: '2px' }}>
          {payload[0].payload.feature}
        </p>
        <p
          style={{
            color: val > 0 ? '#fca5a5' : '#6ee7b7',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          {val > 0 ? '+' : ''}{val.toFixed(4)}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '2px' }}>
          {val > 0 ? '↑ Pushes toward FRAUD' : '↓ Pushes toward LEGIT'}
        </p>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({ x, y, width, value, height }) => {
  const positive = value > 0;
  return (
    <text
      x={positive ? x + width + 4 : x + width - 4}
      y={y + height / 2}
      dy={4}
      textAnchor={positive ? 'start' : 'end'}
      fill={positive ? '#fca5a5' : '#6ee7b7'}
      fontSize={10}
      fontFamily="Inter"
    >
      {positive ? '+' : ''}{value.toFixed(3)}
    </text>
  );
};

export default function ShapChart({ shapValues = {}, title = 'Feature Impact (SHAP Values)' }) {
  const data = useMemo(() => {
    if (!shapValues || typeof shapValues !== 'object') return [];

    return Object.entries(shapValues)
      .map(([feature, value]) => ({
        feature,
        value: parseFloat(value) || 0,
        absValue: Math.abs(parseFloat(value) || 0),
      }))
      .sort((a, b) => b.absValue - a.absValue)
      .slice(0, 10)
      .reverse(); // reverse so largest is at top in horizontal chart
  }, [shapValues]);

  if (!data.length) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-white/30 text-sm">No SHAP values available</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.15)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          <p className="text-white/30 text-xs">Top 10 most influential features</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#ef4444' }} />
          <span className="text-white/50 text-xs">Pushes toward Fraud</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#10b981' }} />
          <span className="text-white/50 text-xs">Pushes toward Legit</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={data.length * 38 + 20}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis
            type="number"
            tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.toFixed(2)}
          />
          <YAxis
            type="category"
            dataKey="feature"
            width={70}
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11, fontFamily: 'Inter' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} label={<CustomLabel />}>
            {data.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={entry.value > 0 ? '#ef4444' : '#10b981'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
