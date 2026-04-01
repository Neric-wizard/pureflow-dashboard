import { useState, useEffect } from 'react'
import SafetyGauge from './components/SafetyGauge'
import SensorCards from './components/SensorCards'
import SystemStatus from './components/SystemStatus'
import IsoPipeline from './components/IsoPipeline'
import DecisionEngine from './components/DecisionEngine'
import Charts from './components/Charts'
import TechnicianView from './components/TechnicianView'

// ── Simulated sensor data ──────────────────────────
function generateSimData() {
  return {
    turbidity:    parseFloat((8 + (Math.random() * 8 - 4)).toFixed(1)),
    pH:           parseFloat((6.8 + (Math.random() * 0.8 - 0.4)).toFixed(1)),
    temperature:  parseFloat((29 + (Math.random() * 2 - 1)).toFixed(1)),
    conductivity: parseFloat((320 + (Math.random() * 200 - 100)).toFixed(0)),
  }
}

// ── Safe static values for other sensors in Connectivity mode ──
const safeStaticData = {
  turbidity: 2.5,
  pH: 7.2,
  temperature: 25,
  conductivity: 300,
}

function calcSafetyScore(d) {
  let score = 100
  if (d.turbidity > 8)              score -= 40
  else if (d.turbidity > 4)         score -= 20
  if (d.pH < 6.5 || d.pH > 8.5)    score -= 25
  if (d.conductivity > 500)         score -= 15
  return Math.max(0, Math.min(100, score))
}
// ──────────────────────────────────────────────────

function Header({ role, setRole, sensors, mode, setMode }) {
  const [time, setTime] = useState(new Date())
  const [prevHealthScore, setPrevHealthScore] = useState(100)
  const [animatedHealth, setAnimatedHealth] = useState(100)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const { turbidity = 12.3, pH = 6.1 } = sensors || {}
  const danger = turbidity > 8 || pH < 6.5 || pH > 8.5

  // ── Health Score ──
  let healthScore = 100
  if (turbidity > 8) healthScore -= 40
  else if (turbidity > 4) healthScore -= 20
  if (pH < 6.5 || pH > 8.5) healthScore -= 25
  healthScore = Math.max(0, Math.min(100, healthScore))

  // Dynamic gradient intensity based on health score
  const gradientIntensity = healthScore / 100
  const meshIntensity = 0.1 + (gradientIntensity * 0.05)

  // Animate health score changes
  useEffect(() => {
    setPrevHealthScore(animatedHealth)
    const duration = 500
    const steps = 20
    const stepTime = duration / steps
    const diff = healthScore - animatedHealth
    let step = 0
    const timer = setInterval(() => {
      step++
      const newValue = prevHealthScore + (diff * (step / steps))
      setAnimatedHealth(Math.round(newValue))
      if (step >= steps) {
        setAnimatedHealth(healthScore)
        clearInterval(timer)
      }
    }, stepTime)
    return () => clearInterval(timer)
  }, [healthScore])

  const gradientColor = 
    healthScore >= 80 ? '#22c55e' : 
    healthScore >= 60 ? '#3b82f6' : 
    healthScore >= 40 ? '#eab308' : '#ef4444'

  // ── Smart Status Message ──
  let statusMessage = ''
  if (danger) {
    if (turbidity > 8) statusMessage = 'HIGH TURBIDITY'
    else if (pH < 6.5) statusMessage = 'PH TOO LOW'
    else if (pH > 8.5) statusMessage = 'PH TOO HIGH'
    else statusMessage = 'WATER ALERT'
  } else {
    if (turbidity > 4) statusMessage = 'MODERATE — MONITORING'
    else statusMessage = 'WATER QUALITY STABLE'
  }

  // ── Real Sparkline with Historical Data ──
  const [turbidityHistory] = useState(() => {
    const base = [8.2, 7.9, 8.1, 9.5, 10.2, 12.3, 11.8, 10.5, 9.8, 9.2]
    return base.map(v => Math.min(20, Math.max(0, v)))
  })
  
  const maxTurbidity = 15
  const sparklinePoints = turbidityHistory.map((v, i) => {
    const x = (i / (turbidityHistory.length - 1)) * 40
    const y = 12 - (v / maxTurbidity) * 12
    return { x, y }
  })
  
  const sparklinePath = `M${sparklinePoints.map(p => `${p.x},${p.y}`).join(' L')}`
  const fillPath = `${sparklinePath} L40,12 L0,12 Z`

  // ── 24h Trend Calculation ──
  const previousTurbidity = turbidityHistory[turbidityHistory.length - 2] || turbidity
  const turbidityTrend = turbidity - previousTurbidity
  const trendPercent = ((turbidityTrend / previousTurbidity) * 100).toFixed(1)
  const trendDirection = turbidityTrend > 0 ? '▲' : turbidityTrend < 0 ? '▼' : '→'
  const trendColor = turbidityTrend > 0 ? 'text-rose-400' : turbidityTrend < 0 ? 'text-emerald-400' : 'text-gray-500'

  // ── Connection quality based on simulated latency ──
  const latency = 24
  const connectionColor = latency < 50 ? 'bg-emerald-500' : latency < 100 ? 'bg-yellow-500' : 'bg-red-500'

  // ── Role toggle sliding animation state ──
  const [togglePosition, setTogglePosition] = useState(role === 'household' ? 0 : 1)

  useEffect(() => {
    setTogglePosition(role === 'household' ? 0 : 1)
  }, [role])

  return (
    <header 
      className="relative bg-gradient-to-r from-gray-950 via-zinc-950 to-gray-950 border-b border-white/5 backdrop-blur-2xl overflow-hidden transition-colors duration-500"
      style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59,130,246,${meshIntensity}), transparent 50%), radial-gradient(circle at 80% 80%, rgba(6,182,212,${meshIntensity}), transparent 50%)`
      }}
    >
      {/* Animated Gradient Border */}
      <div 
        className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-600 via-cyan-400 via-emerald-400 to-blue-600 bg-[length:200%_100%] animate-gradient-flow"
        style={{ opacity: 0.5 + (gradientIntensity * 0.5) }}
      ></div>
      
      {/* Scanner Beam */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-[-100%] w-1/3 h-full bg-gradient-to-r from-transparent via-blue-500/5 to-transparent skew-x-12 animate-scan"></div>
      </div>

      {/* Mesh Gradients */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" style={{ opacity: meshIntensity }}></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-600/10 rounded-full blur-[100px]" style={{ opacity: meshIntensity }}></div>
      
      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" 
        style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`}}>
      </div>
      
      {/* Grain texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_0.5px,transparent_0.5px)] bg-[length:4px_4px] pointer-events-none"></div>
      
      <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3 relative z-10">
        
        {/* ===== LOGO SECTION with Enhanced Blue Water Icon ===== */}
        <div className="flex items-center gap-3 group cursor-pointer relative animate-slide-up [animation-delay:0ms]">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 to-cyan-400/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-zinc-900 to-gray-950 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_0_2px_4px_rgba(0,0,0,0.4)]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none" className="drop-shadow-sm">
                <path d="M9 2C9 2 3.5 8 3.5 11.5a5.5 5.5 0 0011 0C14.5 8 9 2 9 2z" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.5 12.5c.5 1.5 2 2 3 1.5" stroke="#06b6d4" strokeWidth="1.3" strokeLinecap="round"/>
                <circle cx="9" cy="9" r="1" fill="#3b82f6" fillOpacity="0.6"/>
              </svg>
            </div>
          </div>
          <div>
            <h1 className="font-sans text-lg font-semibold tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-cyan-300 transition-all duration-300">
              Pure<span className="text-blue-400">FLOW</span>
            </h1>
            <p className="text-[10px] text-gray-400 tracking-tight font-sans">SMART WATER STERILIZATION</p>
          </div>
        </div>

        {/* ===== MODE TOGGLE - Demo / Connectivity ===== */}
        <div className="flex items-center gap-2 bg-zinc-900/50 rounded-full p-0.5 border border-white/10 animate-slide-up [animation-delay:50ms]">
          <button
            className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-300 ${
              mode === 'demo' 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setMode('demo')}
          >
            🎮 Demo Mode
          </button>
          <button
            className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-300 ${
              mode === 'connect' 
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setMode('connect')}
          >
            🔌 Connectivity Test
          </button>
        </div>

        {/* ===== MIDDLE SECTION ===== */}
        <div className="flex items-center gap-5 animate-slide-up [animation-delay:100ms]">
          
          {/* Circular Health Gauge with Hover Glow */}
          <div className="relative w-10 h-10 group">
            {healthScore < 60 && (
              <div className="absolute -top-1 -right-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-amber-500 animate-pulse z-20"/>
            )}
            {healthScore < 40 && (
              <div className="absolute -top-1 -right-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-rose-500 animate-pulse z-20"/>
            )}
            <svg className="w-10 h-10 -rotate-90 transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" viewBox="0 0 36 36">
              <defs>
                <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={healthScore >= 80 ? '#22c55e' : healthScore >= 60 ? '#3b82f6' : healthScore >= 40 ? '#eab308' : '#ef4444'} />
                  <stop offset="100%" stopColor={healthScore >= 80 ? '#16a34a' : healthScore >= 60 ? '#2563eb' : healthScore >= 40 ? '#ca8a04' : '#dc2626'} />
                </linearGradient>
              </defs>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#27272a" strokeWidth="3"/>
              <path 
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                fill="none" 
                stroke="url(#healthGradient)"
                strokeWidth="3"
                strokeDasharray={`${healthScore}, 100`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-mono font-bold tabular-nums transition-all duration-500 text-white">
                {animatedHealth}
              </span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
              <div className="bg-zinc-900/95 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-md shadow-xl whitespace-nowrap">
                <div className="text-[9px] font-mono text-gray-400">System Health Index</div>
                <div className="text-xs font-mono font-bold" style={{ color: gradientColor }}>{healthScore}%</div>
                <div className="text-[8px] text-gray-500 mt-0.5">Based on turbidity + pH</div>
              </div>
            </div>
          </div>

          {/* Status Pill */}
          {danger ? (
            <div className="relative group">
              <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 animate-pulse"></div>
              <div className="relative flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-red-950/80 to-zinc-950 border border-red-500/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_0_2px_4px_rgba(0,0,0,0.4)]">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-40"></div>
                  <div className="relative w-1.5 h-1.5 rounded-full bg-red-500"></div>
                </div>
                <span className="font-mono text-[10px] font-semibold tracking-widest text-red-400 tabular-nums">{statusMessage}</span>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <div className="absolute inset-0 bg-green-500/10 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-green-950/50 to-zinc-950 border border-green-500/30 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_0_2px_4px_rgba(0,0,0,0.4)]">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-mono text-[10px] font-semibold tracking-widest text-green-400 tabular-nums">{statusMessage}</span>
              </div>
            </div>
          )}

          {/* Mini Glass Cards with Enhanced Glassmorphism */}
          <div className="flex gap-2">
            {/* Turbidity Card */}
            <div className="group relative">
              <div className="bg-zinc-900/30 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),_0_4px_8px_rgba(0,0,0,0.2)] transition-all duration-500 hover:border-blue-500/60 hover:shadow-blue-500/20 hover:-translate-y-0.5 px-3 py-1.5 rounded-2xl backdrop-blur-md flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
                <div className="flex items-center gap-1.5">
                  <svg className="w-8 h-3" viewBox="0 0 40 12" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="turbidityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={turbidity > 8 ? '#ef4444' : '#3b82f6'} stopOpacity="0.5"/>
                        <stop offset="100%" stopColor={turbidity > 8 ? '#ef4444' : '#3b82f6'} stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d={sparklinePath} fill="none" stroke={turbidity > 8 ? '#ef4444' : '#3b82f6'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d={fillPath} fill="url(#turbidityGradient)"/>
                    <circle cx="40" cy={12 - (Math.min(turbidity, maxTurbidity) / maxTurbidity) * 12} r="2" fill={turbidity > 8 ? '#ef4444' : '#3b82f6'} className="animate-pulse"/>
                  </svg>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-mono font-medium ${turbidity > 8 ? 'text-red-400' : turbidity > 4 ? 'text-amber-400' : 'text-blue-300'}`}>
                        {turbidity.toFixed(1)}
                      </span>
                      <span className="text-[9px] text-gray-400">NTU</span>
                    </div>
                    <div className={`text-[8px] font-mono ${trendColor} flex items-center gap-0.5`}>
                      <span>{trendDirection}</span>
                      <span>{Math.abs(parseFloat(trendPercent))}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
                <div className="bg-zinc-900/95 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-md shadow-xl">
                  <div className="text-[10px] font-mono text-gray-400">Turbidity</div>
                  <div className="text-xs font-mono font-bold text-blue-300">{turbidity.toFixed(1)} NTU</div>
                  <div className="text-[9px] text-rose-400 mt-1">⚠️ Above 8 NTU = Unsafe</div>
                  <div className="text-[8px] text-emerald-400 mt-0.5">24h change: {trendDirection} {Math.abs(parseFloat(trendPercent))}%</div>
                </div>
              </div>
            </div>

            {/* pH Card */}
            <div className="group relative">
              <div className="bg-zinc-900/30 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),_0_4px_8px_rgba(0,0,0,0.2)] transition-all duration-500 hover:border-amber-500/60 hover:shadow-amber-500/20 hover:-translate-y-0.5 px-3 py-1.5 rounded-2xl backdrop-blur-md flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div className="flex flex-col">
                  <div className="flex items-center gap-0.5">
                    <span className={`text-xs font-mono font-medium ${pH < 6.5 || pH > 8.5 ? 'text-rose-400' : 'text-amber-300'}`}>
                      {pH.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-gray-400">pH</span>
                  </div>
                  <div className="text-[8px] text-emerald-400 flex items-center gap-0.5">
                    <span>▲</span>
                    <span>0.2%</span>
                  </div>
                </div>
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
                <div className="bg-zinc-900/95 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-md shadow-xl">
                  <div className="text-[10px] font-mono text-gray-400">pH Level</div>
                  <div className="text-xs font-mono font-bold text-amber-300">{pH.toFixed(1)}</div>
                  <div className="text-[9px] text-rose-400 mt-1">⚠️ Safe range: 6.5 – 8.5</div>
                  <div className="text-[8px] text-emerald-400 mt-0.5">24h trend: +0.2 pH</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== RIGHT SECTION ===== */}
        <div className="flex items-center gap-2 animate-slide-up [animation-delay:200ms]">
          
          {/* Live Indicator */}
          <div className="relative group">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-white/10 backdrop-blur-sm cursor-pointer">
              <div className="relative">
                <div className={`absolute inset-0 ${connectionColor} rounded-full animate-ping opacity-40`}></div>
                <div className={`relative w-1.5 h-1.5 rounded-full ${connectionColor}`}></div>
              </div>
              <span className="font-mono text-[8px] font-bold text-green-400 tracking-wider">MQTT</span>
            </div>
            <div className="absolute top-full right-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <div className="bg-zinc-900/95 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-md shadow-xl">
                <div className="text-[9px] font-mono text-gray-400">Connection Details</div>
                <div className={`text-[10px] ${latency < 50 ? 'text-green-400' : latency < 100 ? 'text-yellow-400' : 'text-rose-400'}`}>
                  ● Latency: {latency}ms
                </div>
                <div className="text-[10px] text-green-400">● Uptime: 99.98%</div>
                <div className="text-[10px] text-green-400">● Signal: -42 dBm</div>
              </div>
            </div>
          </div>

          {/* Location with Icon */}
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-tighter bg-zinc-900/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
            <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {['CAMEROON', 'SW', 'BUEA', 'TANK_A1'].map((loc, i, arr) => (
              <button key={loc} className="hover:text-blue-400 transition-colors cursor-pointer">
                <span className={i === arr.length - 1 ? 'text-gray-300' : 'text-gray-500'}>{loc}</span>
              </button>
            ))}
            <span className="flex h-1 w-1 rounded-full bg-blue-500 animate-pulse ml-1"></span>
          </div>

          {/* Timestamp with Icon */}
          <div className="flex items-center gap-1.5 font-mono text-[8px] text-gray-400 tracking-wide bg-zinc-900/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>

          {/* Role Toggle with Sliding Pill */}
          <div className="relative">
            <div className="flex bg-zinc-900/60 rounded-full p-0.5 backdrop-blur-md border border-white/10">
              <div 
                className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out shadow-lg shadow-blue-500/25"
                style={{ transform: `translateX(${togglePosition === 0 ? '0%' : '100%'})`, width: 'calc(50% - 2px)' }}
              ></div>
              <button
                className={`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-medium transition-all duration-300 ${
                  role === 'household' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setRole('household')}
              >
                Household
              </button>
              <button
                className={`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-medium transition-all duration-300 ${
                  role === 'technician' ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setRole('technician')}
              >
                Technician
                {role === 'technician' && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-[8px] font-bold text-white">3</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default function App() {
  const [role, setRole] = useState('household')
  const [mode, setMode] = useState('demo') // 'demo' or 'connect'
  
  // Demo mode: all sensors simulated
  const [simSensors, setSimSensors] = useState(generateSimData())
  
  // Connectivity mode: turbidity from Firebase (simulated for now)
  // Later: replace with actual Firebase read
  const [fbTurbidity, setFbTurbidity] = useState(5.0)
  
  // Combine sensors based on mode
  const sensors = mode === 'demo' 
    ? simSensors 
    : {
        turbidity: fbTurbidity,
        pH: safeStaticData.pH,
        temperature: safeStaticData.temperature,
        conductivity: safeStaticData.conductivity,
      }

  // Simulate live data every 5 seconds (Demo mode)
  useEffect(() => {
    const interval = setInterval(() => {
      if (mode === 'demo') {
        setSimSensors(generateSimData())
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [mode])

  // Simulate Firebase data for Connectivity mode (changes every 5 sec)
  // Later: replace with actual Firebase listener
  useEffect(() => {
    const interval = setInterval(() => {
      if (mode === 'connect') {
        // Simulate ESP32 sending turbidity values
        // Real values would come from Firebase
        const newTurbidity = parseFloat((5 + (Math.random() * 10 - 5)).toFixed(1))
        setFbTurbidity(Math.max(1, Math.min(15, newTurbidity)))
        console.log('📡 ESP32 → Firebase → Turbidity:', newTurbidity.toFixed(1), 'NTU')
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [mode])

  const safetyScore = calcSafetyScore(sensors)

  return (
    <div className="min-h-screen bg-gray-950">
      <Header role={role} setRole={setRole} sensors={sensors} mode={mode} setMode={setMode} />
      <main className="p-4 flex flex-col gap-3">
        <SafetyGauge score={safetyScore} />
        <SensorCards sensors={sensors} />

        <div className="grid grid-cols-1 lg:grid-cols-[185px_1fr_208px] gap-3">
          <SystemStatus sensors={sensors} />
          <IsoPipeline sensors={sensors} />
          <DecisionEngine sensors={sensors} />
        </div>

        <Charts sensors={sensors} />
        {role === 'technician' && <TechnicianView sensors={sensors} />}
      </main>
    </div>
  )
}