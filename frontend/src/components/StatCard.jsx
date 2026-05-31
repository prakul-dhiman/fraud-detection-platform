import React, { useEffect, useRef, useState } from 'react';

const TREND_UP = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TREND_DOWN = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

function useCountUp(target, duration = 1200) {
  const [current, setCurrent] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (typeof target !== 'number') return;
    startRef.current = null;
    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
}

export default function StatCard({ title, value, subtitle, icon, color = '#6366f1', trend }) {
  // Parse numeric value for count-up animation
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
  const isPercentage = typeof value === 'string' && value.includes('%');
  const prefix = typeof value === 'string' && value.startsWith('$') ? '$' : '';
  const animated = useCountUp(numericValue);

  const displayValue = typeof value === 'number'
    ? animated.toLocaleString()
    : isPercentage
    ? `${animated}%`
    : prefix
    ? `${prefix}${animated.toLocaleString()}`
    : value;

  const trendPositive = trend?.direction === 'up';
  const trendColor = trendPositive ? '#10b981' : '#ef4444';

  return (
    <div
      className="glass-card-hover p-5 animate-slide-up"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Glow orb */}
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          right: '-20px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: color,
          opacity: 0.06,
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">
            {title}
          </p>
          <div className="text-3xl font-bold text-white leading-tight animate-count-up">
            {displayValue}
          </div>
        </div>
        {/* Icon circle */}
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl text-white flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${color}30, ${color}10)`,
            border: `1px solid ${color}30`,
            color,
          }}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {subtitle && (
          <p className="text-white/40 text-xs">{subtitle}</p>
        )}
        {trend && (
          <div
            className="flex items-center gap-1 text-xs font-semibold ml-auto"
            style={{ color: trendColor }}
          >
            {trendPositive ? TREND_UP : TREND_DOWN}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
