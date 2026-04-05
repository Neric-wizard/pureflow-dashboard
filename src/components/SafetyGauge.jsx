// src/components/SafetyGauge.jsx
import { useState, useEffect } from 'react'

export default function SafetyGauge({ score, lastReading = 75 }) {
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  
  const [animatedScore, setAnimatedScore] = useState(0)
  const [prevScore, setPrevScore] = useState(0)
  const [previousScore, setPreviousScore] = useState(65)

  // ── Spring-like animation for score counting ──
  useEffect(() => {
    setPrevScore(animatedScore)
    const duration = 800
    const steps = 30
    const stepTime = duration / steps
    const diff = score - animatedScore
    let step = 0
    const timer = setInterval(() => {
      step++
      const eased = 1 - Math.pow(1 - (step / steps), 3)
      const newValue = prevScore + (diff * eased)
      setAnimatedScore(Math.round(newValue))
      if (step >= steps) {
        setAnimatedScore(score)
        clearInterval(timer)
      }
    }, stepTime)
    return () => clearInterval(timer)
  }, [score])

  useEffect(() => {
    setPreviousScore(prev => prev === 0 ? score : prev)
  }, [score])

  const trend = score > 75 ? 'up' : score > 50 ? 'stable' : 'down'
  const trendIcon = trend === 'up' ? '↗' : trend === 'stable' ? '→' : '↘'
  const trendText = trend === 'up' ? 'Improving' : trend === 'stable' ? 'Stable' : 'Declining'
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'stable' ? 'text-blue-400' : 'text-red-400'

  const baseColor =
    score >= 80 ? '#22c55e' :
    score >= 60 ? '#3b82f6' :
    score >= 40 ? '#eab308' : '#ef4444'

  const label =
    score >= 80 ? 'EXCELLENT' :
    score >= 60 ? 'GOOD' :
    score >= 40 ? 'WARNING' : 'CRITICAL'

  const scoreChange = score - previousScore
  const changeText = scoreChange > 0 ? `+${scoreChange} vs last week` : scoreChange < 0 ? `${scoreChange} vs last week` : 'Same as last week'
  const changeColor = scoreChange > 0 ? 'text-green-400' : scoreChange < 0 ? 'text-red-400' : 'text-gray-400'

  const smartInsight =
    score < 50 ? 'Immediate filtration recommended' :
    score < 70 ? 'Monitor turbidity levels closely' :
    'System operating optimally'

  const forecast = [
    { day: 'Today', risk: score < 50 ? 'HIGH' : score < 70 ? 'MEDIUM' : 'LOW',
      color: score < 50 ? '#ef4444' : score < 70 ? '#eab308' : '#22c55e' },
    { day: 'Tomorrow', risk: score < 40 ? 'HIGH' : score < 65 ? 'MEDIUM' : 'LOW',
      color: score < 40 ? '#ef4444' : score < 65 ? '#eab308' : '#22c55e' },
    { day: 'In 3 days', risk: score < 30 ? 'HIGH' : 'LOW',
      color: score < 30 ? '#ef4444' : '#22c55e' },
  ]

  const sparklineData = [65, 72, 68, 70, 75, 73, 78, 76, 80, score]
  const sparklinePoints = sparklineData.map((v, i) => `${(i / (sparklineData.length - 1)) * 50},${20 - (v / 100) * 15}`).join(' ')
  const areaPath = `M0,20 L${sparklinePoints} L50,20 Z`

  const turbidityContribution = score < 50 ? 60 : score < 70 ? 50 : 40
  const pHContribution = 100 - turbidityContribution

  return (
    <div 
      className="relative group"
      role="region"
      aria-label="Safety Score Gauge — System health indicator"
    >
      <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/10 via-cyan-400/10 to-transparent rounded-3xl blur-2xl opacity-0 group-hover:opacity-80 transition-all duration-700"></div>
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent animate-scanline" />
      </div>
      
      {/* Updated: Using CSS variables for theme switching */}
      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 shadow-[0_25px_60px_-15px_rgb(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl overflow-hidden">
        
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.01] rounded-3xl transition-transform duration-1000 group-hover:translate-x-6" />
        
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          <div className="absolute -inset-[100%] bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent rotate-12 transition-transform duration-1000 group-hover:translate-x-1/2" />
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        <div className="relative flex items-center gap-6 flex-wrap">
          
          {/* Circular gauge */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg width="80" height="80" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={score >= 80 ? '#22c55e' : score >= 60 ? '#3b82f6' : score >= 40 ? '#eab308' : '#ef4444'} />
                  <stop offset="100%" stopColor={score >= 80 ? '#16a34a' : score >= 60 ? '#2563eb' : score >= 40 ? '#ca8a04' : '#dc2626'} />
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r={radius} fill="none" stroke="#1e293b" strokeWidth="5"/>
              <circle cx="32" cy="32" r={radius - 1} fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="1 28" opacity="0.25"/>
              <circle cx="32" cy="32" r={radius - 1} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="1 28" strokeDashoffset="35" opacity="0.25"/>
              <circle cx="32" cy="32" r={radius - 1} fill="none" stroke="#22c55e" strokeWidth="1.5" strokeDasharray="1 28" strokeDashoffset="75" opacity="0.25"/>
              <circle cx="32" cy="32" r={radius} fill="none" stroke="url(#gaugeGradient)" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                className="transition-all duration-700 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"/>
              <circle cx="32" cy="32" r="8" fill="#111827" />
              <circle cx="32" cy="32" r="5" fill={baseColor} className="drop-shadow-[0_0_10px_currentColor] animate-pulse" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-xl font-bold tabular-nums transition-all duration-300" style={{ color: baseColor }}>
                {animatedScore}
              </span>
              <span className="text-[7px] text-[var(--text-muted)] -mt-1">/100</span>
            </div>
          </div>

          {/* Label + Trend + Historical Badge */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-[1px] uppercase">Safety index</span>
              <span className={`text-[9px] flex items-center gap-1 ${trendColor}`}>
                {trendIcon} {trendText}
              </span>
              <span className={`text-[8px] font-mono ${changeColor} bg-[var(--bg-surface)] px-1.5 py-0.5 rounded-full`}>
                {changeText}
              </span>
            </div>
            
            <span className="font-semibold text-2xl tracking-tighter text-[var(--text-primary)] mt-1" style={{ color: baseColor }}>
              {label}
            </span>
            
            <div className="mt-2 text-[9px] text-emerald-400/80 font-mono flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span>LIVE • JUST NOW</span>
              <span className="text-[7px] text-[var(--text-muted)] ml-2">REFRESH: 5HZ</span>
            </div>
          </div>

          {/* Mini Sparkline */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[8px] text-[var(--text-muted)] uppercase tracking-wider">24h trend</span>
            <svg width="72" height="28" viewBox="0 0 50 20" className="overflow-visible">
              <defs>
                <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={baseColor} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={baseColor} stopOpacity="0" />
                </linearGradient>
                <linearGradient id="sparkShine" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={baseColor} stopOpacity="0.6"/>
                  <stop offset="100%" stopColor={baseColor} stopOpacity="0.9"/>
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#sparklineGradient)" />
              <polyline points={sparklinePoints} fill="none" stroke="url(#sparkShine)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_3px_currentColor]"/>
            </svg>
          </div>

          {/* Gradient Divider */}
          <div className="w-px h-16 bg-gradient-to-b from-transparent via-[var(--border)] to-transparent flex-shrink-0 hidden sm:block" />

          {/* Risk Forecast */}
          <div className="flex gap-5">
            {forecast.map(({ day, risk, color }, idx) => (
              <div key={idx} className="flex flex-col items-center" role="group" aria-label={`${day} risk: ${risk}`}>
                <span className="font-mono text-[8px] text-[var(--text-muted)] mb-1.5 tracking-wider">{day.toUpperCase()}</span>
                
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <div className="absolute w-5 h-5 rounded-full" style={{ backgroundColor: color, opacity: 0.15, filter: 'blur(6px)' }}></div>
                  <div className="relative w-3 h-3 rounded-full border border-white/30 shadow-[0_0_4px_currentColor]" style={{ backgroundColor: color }}></div>
                </div>
                
                <span className="font-mono text-[9px] font-semibold mt-1.5 tracking-wider" style={{ color }}>
                  {risk}
                </span>
              </div>
            ))}
          </div>

          {/* Sensor Contribution Breakdown */}
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Score contributors</span>
            <div className="flex gap-3 text-[8px]">
              <span className="text-blue-400 tabular-nums">💧 Turbidity: {turbidityContribution}%</span>
              <span className="text-amber-400 tabular-nums">🧪 pH: {pHContribution}%</span>
            </div>
            <div className="w-28 h-1.5 bg-[var(--bg-surface2)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-amber-500 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" style={{ width: `${turbidityContribution}%` }}></div>
            </div>
          </div>

          {/* Smart Insight */}
          <div className="ml-auto text-right">
            <div className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">Insight</div>
            <div className="text-[10px] font-medium text-[var(--text-primary)] whitespace-nowrap">{smartInsight}</div>
            <div className="text-[7px] font-mono text-[var(--text-muted)] mt-1 opacity-50">SENSOR-ID: A1-0472 • FW v2.3.1</div>
          </div>
        </div>
      </div>
    </div>
  )
}