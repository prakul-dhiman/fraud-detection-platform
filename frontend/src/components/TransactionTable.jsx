import React, { useState } from 'react';
import ShapChart from './ShapChart';

function ConfidenceBar({ value, isFraud }) {
  const color = isFraud ? '#ef4444' : '#10b981';
  const pct = Math.round((value || 0) * 100);
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: '6px', background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-medium" style={{ color, minWidth: '36px' }}>
        {pct}%
      </span>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function formatAmount(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function TransactionTable({ transactions = [], onRowClick }) {
  const [expandedRow, setExpandedRow] = useState(null);

  const handleRowClick = (tx, idx) => {
    setExpandedRow(expandedRow === idx ? null : idx);
    if (onRowClick) onRowClick(tx);
  };

  if (!transactions.length) {
    return (
      <div className="glass-card p-10 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-white/30 text-sm">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-dark w-full">
          <thead>
            <tr>
              <th>Time</th>
              <th>Amount</th>
              <th>Prediction</th>
              <th>Confidence</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => {
              const isFraud = tx.prediction === 1 || tx.prediction === 'fraud' || tx.is_fraud;
              const isExpanded = expandedRow === idx;
              return (
                <React.Fragment key={tx.id || idx}>
                  <tr
                    className={isFraud ? 'fraud-row' : ''}
                    onClick={() => handleRowClick(tx, idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Time */}
                    <td>
                      <span className="font-mono text-white/60 text-xs">
                        {tx.time != null ? Number(tx.time).toFixed(0) : '—'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td>
                      <span className="font-semibold text-white">
                        {formatAmount(tx.amount || tx.Amount)}
                      </span>
                    </td>

                    {/* Prediction badge */}
                    <td>
                      {isFraud ? (
                        <span className="badge-fraud">🚨 FRAUD</span>
                      ) : (
                        <span className="badge-safe">✓ LEGIT</span>
                      )}
                    </td>

                    {/* Confidence bar */}
                    <td style={{ minWidth: '140px' }}>
                      <ConfidenceBar value={tx.confidence || tx.fraud_probability} isFraud={isFraud} />
                    </td>

                    {/* Date */}
                    <td>
                      <span className="text-white/40 text-xs">{formatDate(tx.created_at || tx.date)}</span>
                    </td>

                    {/* Expand chevron */}
                    <td>
                      <span
                        className="text-white/30 text-xs transition-transform duration-200 inline-block"
                        style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      >
                        ▶
                      </span>
                    </td>
                  </tr>

                  {/* Expanded SHAP row */}
                  {isExpanded && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{
                          padding: '1rem 1.5rem',
                          background: 'rgba(99,102,241,0.04)',
                          borderTop: '1px solid rgba(99,102,241,0.1)',
                        }}
                      >
                        <div className="animate-slide-down">
                          {tx.shap_values || tx.shapValues ? (
                            <ShapChart
                              shapValues={tx.shap_values || tx.shapValues}
                              title="Feature Impact for this Transaction"
                            />
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-white/30 text-sm">No SHAP values available for this transaction</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
