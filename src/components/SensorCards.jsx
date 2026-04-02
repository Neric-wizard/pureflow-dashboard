// src/components/SensorCards.jsx
import { useState, useEffect } from 'react'

function turbidityStatus(v) {
  if (v > 8)  return { label: '▲ Danger',  cls: 'bg-red-500/20 text-red-400', color: '#ef4444', icon: '💧' }
  if (v > 4)  return { label: '▲ Warning', cls: 'bg-amber-500/20 text-amber-400', color: '#eab308', icon: '💧' }
  return       { label: '▼ Safe',    cls: 'bg-green-500/20 text-green-400', color: '#22c55e', icon: '💧' }
}

function pHStatus(v) {
  if (v < 6.0 || v > 9.0) return { label: '▲ Critical', cls: 'bg-red-500/20 text-red-400', color: '#ef4444', icon: '🧪' }
  if (v < 6.5 || v > 8.5) return { label: '▲ Warning',  cls: 'bg-amber-500/20 text-amber-400', color: '#eab308', icon: '🧪' }
  return                    { label: '▼ Safe',     cls: 'bg-green-500/20 text-green-400', color: '#22c55e', icon: '🧪' }
}

function tempStatus() {
  return { label: '● Normal', cls: 'bg-blue-500/20 text-blue-400', color: '#3b82f6', icon: '🌡️' }
}

function conductivityStatus(v) {
  if (v > 500) return { label: '▲ High',   cls: 'bg-red-500/20 text-red-400', color: '#ef4444', icon: '⚡' }
  if (v > 400) return { label: '▲ Warning', cls: 'bg-amber-500/20 text-amber-400', color: '#eab308', icon: '⚡' }
  if (v < 50)  return { label: '▼ Low',    cls: 'bg-amber-500/20 text-amber-400', color: '#eab308', icon: '⚡' }
  return        { label: '▼ Normal', cls: 'bg-green-500/20 text-green-400', color: '#22c55e', icon: '⚡' }
}

function SensorCard({ label, value, unit, sub, status, tooltip, trend, trendValue }) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const [prevValue, setPrevValue] = useState(0)

  // Animate value changes
  useEffect(() => {
    const numValue = parseFloat(value)
    setPrevValue(animatedValue)
    const duration = 500
    const steps = 20
    const stepTime = duration / steps
    const diff = numValue - animatedValue
    let step = 0
    const timer = setInterval(() => {
      step++
      const eased = 1 - Math.pow(1 - (step / steps), 3)
      const newValue = prevValue + (diff * eased)
      setAnimatedValue(newValue)
      if (step >= steps) {
        setAnimatedValue(numValue)
        clearInterval(timer)
      }
    }, stepTime)
    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="group relative">
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      {/* Card with better spacing */}
      <div className="relative bg-gradient-to-br from-zinc-900/80 to-gray-950/80 border border-white/10 rounded-2xl p-5 shadow-[0_0_30px_rgba(59,130,246,0.05),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl overflow-hidden">
        
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-current to-transparent opacity-50" style={{ color: status.color }} />
        
        {/* Glass reflection overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.01] rounded-2xl transition-transform duration-700 group-hover:translate-x-6" />

        {/* Label with icon */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base opacity-70">{status.icon}</span>
            <div className="font-mono text-[10px] text-gray-400 uppercase tracking-[0.5px] cursor-help group/label" title={tooltip}>
              {label}
              <span className="ml-1 text-gray-600 text-[8px] group-hover/label:text-gray-400 transition">(?)</span>
            </div>
          </div>
          
          {/* Trend badge */}
          {trend !== null && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-mono font-medium transition-all
              ${trend > 0 ? 'text-emerald-400 bg-emerald-500/10' : 
                trend < 0 ? 'text-rose-400 bg-rose-500/10' : 'text-gray-400 bg-gray-500/10'}`}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} 
              <span className="tabular-nums">{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>

        {/* Value with live pulse dot */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-3xl font-bold tracking-[-0.04em] tabular-nums leading-none transition-all duration-300" style={{ color: status.color }}>
            {typeof animatedValue === 'number' ? animatedValue.toFixed(unit === 'NTU' ? 1 : unit === '°C' ? 1 : 0) : value}
          </span>
          {unit && <span className="font-mono text-xs text-gray-400 tracking-wide">{unit}</span>}
          
          {/* Live pulse dot */}
          <div className="relative flex h-2 w-2">
            <div className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-30`} style={{ backgroundColor: status.color }}></div>
            <div className={`relative inline-flex h-2 w-2 rounded-full opacity-60`} style={{ backgroundColor: status.color }}></div>
          </div>
        </div>

        {/* Status badge */}
        <span className={`inline-flex items-center gap-1.5 font-mono text-[9px] font-semibold px-3 py-1 rounded-full border ${status.cls.replace('bg-', 'border-')} border-opacity-30 shadow-sm`}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.color }} />
          {status.label}
        </span>

        {/* Sub-label */}
        {sub && <p className="font-mono text-[8px] text-gray-500 mt-2 leading-relaxed">{sub}</p>}
      </div>
    </div>
  )
}

export default function SensorCards({ sensors }) {
  const { turbidity, pH, temperature, conductivity } = sensors

  // Simulate previous values for trend
  const previousTurbidity = 10.5
  const previouspH = 6.8
  const turbidityTrend = ((turbidity - previousTurbidity) / previousTurbidity) * 100
  const pHTrend = ((pH - previouspH) / previouspH) * 100

  const cards = [
    { 
      label: 'Turbidity', 
      value: turbidity.toFixed(1), 
      unit: 'NTU', 
      sub: '<4 safe · 4–8 standby · >8 full UV', 
      status: turbidityStatus(turbidity), 
      tooltip: 'Turbidity measures water clarity. Safe: below 4 NTU',
      trend: turbidityTrend,
      trendValue: turbidityTrend.toFixed(1)
    },
    { 
      label: 'pH level', 
      value: pH.toFixed(1), 
      unit: '', 
      sub: 'Safe range: 6.5 – 8.5', 
      status: pHStatus(pH), 
      tooltip: 'pH measures acidity. Safe range: 6.5 to 8.5',
      trend: pHTrend,
      trendValue: pHTrend.toFixed(1)
    },
    { 
      label: 'Temperature', 
      value: temperature.toFixed(1), 
      unit: '°C', 
      sub: 'Contextual reading', 
      status: tempStatus(), 
      tooltip: 'Temperature affects bacterial growth rate',
      trend: null,
      trendValue: null
    },
    { 
      label: 'Conductivity', 
      value: Math.round(conductivity), 
      unit: 'μS/cm', 
      sub: 'Safe range: 50 – 500 μS/cm', 
      status: conductivityStatus(conductivity), 
      tooltip: 'Conductivity measures dissolved salts. Safe: 50–500 μS/cm',
      trend: null,
      trendValue: null
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => <SensorCard key={card.label} {...card} />)}
    </div>
  )
}