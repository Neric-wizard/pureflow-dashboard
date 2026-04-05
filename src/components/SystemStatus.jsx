// src/components/SystemStatus.jsx
import { useState, useEffect } from 'react'

export default function SystemStatus({ sensors }) {
  const { turbidity = 12.3, pH = 6.1 } = sensors || {}

  const uvMode = turbidity > 8 ? 'FULL POWER' : turbidity > 4 ? 'STANDBY' : 'OFF'
  const uvColor = turbidity > 8 ? '#ef4444' : turbidity > 4 ? '#eab308' : '#22c55e'
  const uvTextColor = turbidity > 8 ? 'text-red-400' : turbidity > 4 ? 'text-amber-400' : 'text-green-400'
  const uvBg = turbidity > 8 ? 'bg-red-500/10 border border-red-500/30' : turbidity > 4 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-green-500/10 border border-green-500/30'

  const pHOk = pH >= 6.5 && pH <= 8.5
  const secT = parseFloat((turbidity * 0.25).toFixed(1))
  const safe = secT < 4 && pHOk
  const valveStatus = safe ? 'OPEN' : 'CLOSED'
  const valveColor = safe ? '#22c55e' : '#ef4444'
  const valveTextColor = safe ? 'text-green-400' : 'text-red-400'
  const valveReason = safe ? 'Safe' : turbidity > 8 ? 'High turbidity' : !pHOk ? 'pH out' : 'Treatment'

  const carbonLife = 38
  const carbonColor = carbonLife < 30 ? '#ef4444' : carbonLife < 60 ? '#eab308' : '#22c55e'
  const carbonTextColor = carbonLife < 30 ? 'text-red-400' : carbonLife < 60 ? 'text-amber-400' : 'text-green-400'

  const items = [
    { label: 'Chlorine chamber', value: 'Operating', dot: '#22c55e', valueColor: 'text-green-400', icon: '💧' },
    { label: 'Tank storage', value: 'Active mixing', dot: '#3b82f6', valueColor: 'text-blue-400', icon: '🧪' },
    { label: 'Sediment filter', value: 'OK', dot: '#22c55e', valueColor: 'text-green-400', icon: '🔧' },
    { label: 'Carbon filter', value: 'Replace soon', dot: '#eab308', valueColor: carbonTextColor, icon: '🔧' },
  ]

  return (
    <div className="group relative">
      {!safe && (
        <div className="absolute -inset-1 bg-red-500/10 rounded-2xl blur-xl animate-pulse"></div>
      )}
      
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      {/* Updated: Using CSS variables for theme switching */}
      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 shadow-[0_0_30px_rgba(59,130,246,0.05),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.01] rounded-2xl transition-transform duration-700 group-hover:translate-x-6" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-30"></div>
              <div className="relative inline-flex h-2 w-2 rounded-full bg-blue-500 opacity-60"></div>
            </div>
            <h3 className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">System status</h3>
          </div>
          
          <div className="flex items-center gap-1.5 px-2 py-0.5 text-[8px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">
            <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></div>
            LIVE
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm opacity-70">{item.icon}</span>
                <span className="text-[11px] text-[var(--text-secondary)]">{item.label}</span>
              </div>
              <span className={`font-mono text-[10px] font-semibold ${item.valueColor}`}>{item.value}</span>
            </div>
          ))}

          <div className="mt-2">
            <div className="flex justify-between text-[8px] font-mono text-[var(--text-muted)] mb-1">
              <span>Filter life</span>
              <span className="tabular-nums" style={{ color: carbonColor }}>{carbonLife}%</span>
            </div>
            <div className="h-1.5 bg-[var(--bg-surface2)] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${carbonLife}%`, backgroundColor: carbonColor }}></div>
            </div>
          </div>

          <div className="border-t border-[var(--border)] my-2"></div>

          {/* UV Sterilizer Block */}
          <div className={`relative rounded-xl p-2.5 transition-all duration-500 ${uvBg}`}>
            {turbidity > 8 && (
              <div className="absolute inset-0 bg-red-500/5 rounded-xl blur-md animate-pulse"></div>
            )}
            <div className="relative flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base flex-shrink-0">☀️</span>
                <div>
                  <div className="text-[10px] font-medium text-[var(--text-primary)]">UV Sterilizer</div>
                  <div className="text-[7px] text-[var(--text-muted)]">Ultraviolet disinfection</div>
                </div>
              </div>
              <span className={`font-mono text-[10px] font-bold tracking-wider ${uvTextColor} flex-shrink-0 text-right`}>
                {uvMode}
              </span>
            </div>
          </div>

          {/* Output Valve Block */}
          <div className={`relative rounded-xl p-2.5 transition-all duration-500 ${!safe ? 'bg-red-500/5 border border-red-500/20' : 'bg-[var(--bg-surface)] border border-[var(--border)]'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {safe ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={valveColor} strokeWidth="2.5" className="drop-shadow-[0_0_3px_rgba(34,197,94,0.5)] flex-shrink-0">
                    <path d="M7 10V7a5 5 0 0 1 10 0v3m-10 0h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={valveColor} strokeWidth="2.5" className="drop-shadow-[0_0_3px_rgba(239,68,68,0.5)] flex-shrink-0">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
                <div>
                  <div className="text-[10px] font-medium text-[var(--text-primary)]">Output Valve</div>
                  <div className="text-[7px] text-[var(--text-muted)]">Safety interlock</div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`font-mono text-[10px] font-bold tracking-wider ${valveTextColor} whitespace-nowrap`}>{valveStatus}</span>
                <div className="text-[7px] font-mono text-[var(--text-muted)] max-w-[100px] truncate">{valveReason}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[var(--border)]">
          <div className="flex flex-wrap justify-between gap-1 text-[6px] font-mono text-[var(--text-muted)]">
            <span>LAST UPDATED • JUST NOW</span>
            <span>AES-256 ENCRYPTED</span>
          </div>
        </div>
      </div>
    </div>
  )
}