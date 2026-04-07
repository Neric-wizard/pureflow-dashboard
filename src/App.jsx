import { useState, useEffect } from 'react'
import SafetyGauge from './components/SafetyGauge'
import SensorCards from './components/SensorCards'
import SystemStatus from './components/SystemStatus'
import IsoPipeline from './components/IsoPipeline'
import DecisionEngine from './components/DecisionEngine'
import Charts from './components/Charts'
import TechnicianView from './components/TechnicianView'
import AIPrediction from './components/AIPrediction'
import { listenToSensorData } from './services/firebase'

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

function Header({ role, setRole, sensors, mode, setMode, autoRefresh, setAutoRefresh }) {
  const [time, setTime] = useState(new Date())
  const [prevHealthScore, setPrevHealthScore] = useState(100)
  const [animatedHealth, setAnimatedHealth] = useState(100)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const { turbidity = 12.3, pH = 6.1 } = sensors || {}
  const danger = turbidity > 8 || pH < 6.5 || pH > 8.5

  let healthScore = 100
  if (turbidity > 8) healthScore -= 40
  else if (turbidity > 4) healthScore -= 20
  if (pH < 6.5 || pH > 8.5) healthScore -= 25
  healthScore = Math.max(0, Math.min(100, healthScore))

  const gradientIntensity = healthScore / 100
  const meshIntensity = 0.1 + (gradientIntensity * 0.05)

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

  const previousTurbidity = turbidityHistory[turbidityHistory.length - 2] || turbidity
  const turbidityTrend = turbidity - previousTurbidity
  const trendPercent = ((turbidityTrend / previousTurbidity) * 100).toFixed(1)
  const trendDirection = turbidityTrend > 0 ? '▲' : turbidityTrend < 0 ? '▼' : '→'
  const trendColor = turbidityTrend > 0 ? 'text-rose-400' : turbidityTrend < 0 ? 'text-emerald-400' : 'text-gray-500'

  const latency = 24
  const connectionColor = latency < 50 ? 'bg-emerald-500' : latency < 100 ? 'bg-yellow-500' : 'bg-red-500'

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
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-600 via-cyan-400 via-emerald-400 to-blue-600 bg-[length:200%_100%] animate-gradient-flow"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-[-100%] w-1/3 h-full bg-gradient-to-r from-transparent via-blue-500/5 to-transparent skew-x-12 animate-scan"></div>
      </div>
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-600/10 rounded-full blur-[100px]"></div>
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
        style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`}}>
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_0.5px,transparent_0.5px)] bg-[length:4px_4px] pointer-events-none"></div>

      <div className="px-6 py-3 flex items-center justify-between gap-3 relative z-10">

        {/* Logo - Image Logo */}
        <div className="relative group cursor-pointer flex-shrink-0 animate-slide-up [animation-delay:0ms]">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-400/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
          <img
            src="/logo.png"
            alt="PureFLOW"
            className="relative h-20 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]"
          />
        </div>

        {/* ── AUTO-REFRESH TOGGLE BUTTON ── */}
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-mono transition-all duration-300 ${
            autoRefresh 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}
          title={autoRefresh ? 'Auto-refresh ON — click to pause' : 'Auto-refresh OFF — click to resume'}
        >
          {autoRefresh ? '🔴 LIVE' : '⏸️ PAUSED'}
        </button>

        {/* ── DESKTOP: Mode Toggle (hidden on mobile) ── */}
        <div className="hidden md:flex items-center gap-2 rounded-full p-0.5 border bg-zinc-900/50 border-white/10 animate-slide-up [animation-delay:50ms]">
          <button
            className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-300 ${mode === 'demo' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setMode('demo')}
          >
            🎮 Demo Mode
          </button>
          <button
            className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-300 ${mode === 'connect' ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setMode('connect')}
          >
            🔌 Connectivity Test
          </button>
        </div>

        {/* ── DESKTOP: Middle Section (hidden on mobile) ── */}
        <div className="hidden md:flex items-center gap-5 animate-slide-up [animation-delay:100ms]">
          {/* Circular Health Gauge */}
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
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="url(#healthGradient)" strokeWidth="3" strokeDasharray={`${healthScore}, 100`} strokeLinecap="round" className="transition-all duration-700"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-mono font-bold tabular-nums transition-all duration-500 text-white">{animatedHealth}</span>
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

          {/* Sensor Cards */}
          <div className="flex gap-2">
            <div className="group relative">
              <div className="transition-all duration-500 hover:border-blue-500/60 hover:shadow-blue-500/20 hover:-translate-y-0.5 px-3 py-1.5 rounded-2xl backdrop-blur-md flex items-center gap-2 bg-zinc-900/30 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),_0_4px_8px_rgba(0,0,0,0.2)]">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
                <div className="flex items-center gap-1.5">
                  <svg className="w-8 h-3" viewBox="0 0 40 12" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="turbidityGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={turbidity > 8 ? '#ef4444' : '#3b82f6'} stopOpacity="0.5"/>
                        <stop offset="100%" stopColor={turbidity > 8 ? '#ef4444' : '#3b82f6'} stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d={sparklinePath} fill="none" stroke={turbidity > 8 ? '#ef4444' : '#3b82f6'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d={fillPath} fill="url(#turbidityGradient2)"/>
                    <circle cx="40" cy={12 - (Math.min(turbidity, maxTurbidity) / maxTurbidity) * 12} r="2" fill={turbidity > 8 ? '#ef4444' : '#3b82f6'} className="animate-pulse"/>
                  </svg>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-mono font-medium ${turbidity > 8 ? 'text-red-400' : turbidity > 4 ? 'text-amber-400' : 'text-blue-300'}`}>{turbidity.toFixed(1)}</span>
                      <span className="text-[9px] text-gray-400">NTU</span>
                    </div>
                    <div className={`text-[8px] font-mono ${trendColor} flex items-center gap-0.5`}>
                      <span>{trendDirection}</span>
                      <span>{Math.abs(parseFloat(trendPercent))}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="group relative">
              <div className="transition-all duration-500 hover:border-amber-500/60 hover:shadow-amber-500/20 hover:-translate-y-0.5 px-3 py-1.5 rounded-2xl backdrop-blur-md flex items-center gap-2 bg-zinc-900/30 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),_0_4px_8px_rgba(0,0,0,0.2)]">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div className="flex flex-col">
                  <div className="flex items-center gap-0.5">
                    <span className={`text-xs font-mono font-medium ${pH < 6.5 || pH > 8.5 ? 'text-rose-400' : 'text-amber-300'}`}>{pH.toFixed(1)}</span>
                    <span className="text-[9px] text-gray-400">pH</span>
                  </div>
                  <div className="text-[8px] text-emerald-400 flex items-center gap-0.5">
                    <span>▲</span><span>0.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── DESKTOP: Right Section (hidden on mobile) ── */}
        <div className="hidden md:flex items-center gap-2 animate-slide-up [animation-delay:200ms]">
          <div className="relative group">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-white/10 backdrop-blur-sm cursor-pointer">
              <div className="relative">
                <div className={`absolute inset-0 ${connectionColor} rounded-full animate-ping opacity-40`}></div>
                <div className={`relative w-1.5 h-1.5 rounded-full ${connectionColor}`}></div>
              </div>
              <span className="font-mono text-[8px] font-bold text-green-400 tracking-wider">MQTT</span>
            </div>
            <div className="absolute top-full right-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <div className="bg-zinc-900/95 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-md shadow-xl whitespace-nowrap">
                <div className="text-[9px] font-mono text-gray-400">Connection Details</div>
                <div className={`text-[10px] ${latency < 50 ? 'text-green-400' : latency < 100 ? 'text-yellow-400' : 'text-rose-400'}`}>● Latency: {latency}ms</div>
                <div className="text-[10px] text-green-400">● Uptime: 99.98%</div>
                <div className="text-[10px] text-green-400">● Signal: -42 dBm</div>
              </div>
            </div>
          </div>
          <div className="hidden xl:flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-tighter px-3 py-1.5 rounded-full bg-zinc-900/30 border-white/5">
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
          <div className="hidden xl:flex items-center gap-1.5 font-mono text-[8px] text-gray-400 tracking-wide bg-zinc-900/30 px-3 py-1.5 rounded-full border-white/5">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="relative">
            <div className="flex bg-zinc-900/60 rounded-full p-0.5 backdrop-blur-md border border-white/10">
              <div
                className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out shadow-lg shadow-blue-500/25"
                style={{ transform: `translateX(${togglePosition === 0 ? '0%' : '100%'})`, width: 'calc(50% - 2px)' }}
              ></div>
              <button
                className={`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-medium transition-all duration-300 ${role === 'household' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setRole('household')}
              >
                Household
              </button>
              <button
                className={`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-medium transition-all duration-300 ${role === 'technician' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
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

        {/* Mobile: Status dot + Hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${danger ? 'bg-red-500 animate-ping' : 'bg-green-500 animate-pulse'}`}></div>
          <button
            onClick={() => setMobileOpen(prev => !prev)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900/60 border border-white/10 backdrop-blur-md transition-all duration-200 active:scale-95"
          >
            {mobileOpen ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {mobileOpen && (
        <div className="md:hidden relative z-10 border-t border-white/5 bg-zinc-950/90 backdrop-blur-xl px-4 py-4 flex flex-col gap-4">
          <div>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">Mode</p>
            <div className="flex items-center gap-2 bg-zinc-900/50 rounded-full p-0.5 border border-white/10 w-fit">
              <button
                className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-300 ${mode === 'demo' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setMode('demo')}
              >
                🎮 Demo
              </button>
              <button
                className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-300 ${mode === 'connect' ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setMode('connect')}
              >
                🔌 Test
              </button>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">System Status</p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <defs>
                    <linearGradient id="healthGradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={healthScore >= 80 ? '#22c55e' : healthScore >= 60 ? '#3b82f6' : healthScore >= 40 ? '#eab308' : '#ef4444'} />
                      <stop offset="100%" stopColor={healthScore >= 80 ? '#16a34a' : healthScore >= 60 ? '#2563eb' : healthScore >= 40 ? '#ca8a04' : '#dc2626'} />
                    </linearGradient>
                  </defs>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#27272a" strokeWidth="3"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="url(#healthGradientMobile)" strokeWidth="3" strokeDasharray={`${healthScore}, 100`} strokeLinecap="round" className="transition-all duration-700"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-mono font-bold text-white">{animatedHealth}</span>
                </div>
              </div>
              {danger ? (
                <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-red-950/80 to-zinc-950 border border-red-500/30 backdrop-blur-md">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-40"></div>
                    <div className="relative w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  </div>
                  <span className="font-mono text-[10px] font-semibold tracking-widest text-red-400">{statusMessage}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-green-950/50 to-zinc-950 border border-green-500/30 backdrop-blur-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-mono text-[10px] font-semibold tracking-widest text-green-400">{statusMessage}</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">Sensors</p>
            <div className="flex gap-2 flex-wrap">
              <div className="bg-zinc-900/30 border border-white/10 px-3 py-1.5 rounded-2xl backdrop-blur-md flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
                <span className={`text-xs font-mono font-medium ${turbidity > 8 ? 'text-red-400' : turbidity > 4 ? 'text-amber-400' : 'text-blue-300'}`}>{turbidity.toFixed(1)}</span>
                <span className="text-[9px] text-gray-400">NTU</span>
                <span className={`text-[8px] font-mono ${trendColor}`}>{trendDirection}{Math.abs(parseFloat(trendPercent))}%</span>
              </div>
              <div className="bg-zinc-900/30 border border-white/10 px-3 py-1.5 rounded-2xl backdrop-blur-md flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className={`text-xs font-mono font-medium ${pH < 6.5 || pH > 8.5 ? 'text-rose-400' : 'text-amber-300'}`}>{pH.toFixed(1)}</span>
                <span className="text-[9px] text-gray-400">pH</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">Connection</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/50 border border-white/10 backdrop-blur-sm w-fit">
                <div className="relative">
                  <div className={`absolute inset-0 ${connectionColor} rounded-full animate-ping opacity-40`}></div>
                  <div className={`relative w-1.5 h-1.5 rounded-full ${connectionColor}`}></div>
                </div>
                <span className="font-mono text-[8px] font-bold text-green-400 tracking-wider">MQTT · {latency}ms · -42 dBm</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-tighter bg-zinc-900/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5 w-fit">
                <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                {['CAMEROON', 'SW', 'BUEA', 'TANK_A1'].map((loc, i, arr) => (
                  <span key={loc} className={i === arr.length - 1 ? 'text-gray-300' : 'text-gray-500'}>{loc}{i < arr.length - 1 ? ' · ' : ''}</span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[8px] text-gray-400 tracking-wide bg-zinc-900/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5 w-fit">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>
          <div>
            <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1.5">Role</p>
            <div className="relative w-fit">
              <div className="flex bg-zinc-900/60 rounded-full p-0.5 backdrop-blur-md border border-white/10">
                <div
                  className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out shadow-lg shadow-blue-500/25"
                  style={{ transform: `translateX(${togglePosition === 0 ? '0%' : '100%'})`, width: 'calc(50% - 2px)' }}
                ></div>
                <button
                  className={`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-medium transition-all duration-300 ${role === 'household' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setRole('household')}
                >
                  Household
                </button>
                <button
                  className={`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-medium transition-all duration-300 ${role === 'technician' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
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
      )}
    </header>
  )
}

export default function App() {
  const [role, setRole] = useState('household')
  const [mode, setMode] = useState('demo')
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  // ── Firebase real data ──
  const [firebaseSensors, setFirebaseSensors] = useState(null)
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false)
  
  // Simulated data for demo mode
  const [simSensors, setSimSensors] = useState(generateSimData())
  
  // Connectivity mode: turbidity from Firebase (simulated for now)
  const [fbTurbidity, setFbTurbidity] = useState(5.0)
  
  // Listen to Firebase real-time data
  useEffect(() => {
    const unsubscribe = listenToSensorData((data) => {
      console.log('📡 Firebase real data:', data)
      setFirebaseSensors(data)
      setIsFirebaseConnected(true)
    })
    
    return () => unsubscribe && unsubscribe()
  }, [])
  
  // Combine sensors based on mode
  let sensors
  
  if (mode === 'demo') {
    sensors = simSensors
  } else if (mode === 'connect') {
    sensors = {
      turbidity: fbTurbidity,
      pH: safeStaticData.pH,
      temperature: safeStaticData.temperature,
      conductivity: safeStaticData.conductivity,
    }
  } else {
    // Real mode (when ESP32 is connected)
    sensors = firebaseSensors || {
      turbidity: 0,
      pH: 7.0,
      temperature: 25,
      conductivity: 300,
    }
  }

  // ── Dynamic Page Title ──
  useEffect(() => {
    const danger = sensors.turbidity > 8 || sensors.pH < 6.5 || sensors.pH > 8.5
    if (danger) {
      document.title = '⚠️ ALERT | PureFLOW'
    } else {
      document.title = 'PureFLOW | Smart Water Sterilization'
    }
  }, [sensors])

  // ── Auto-refresh simulation (Demo mode only) ──
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      if (mode === 'demo') {
        setSimSensors(generateSimData())
      }
    }, 8000)
    return () => clearInterval(interval)
  }, [mode, autoRefresh])

  // ── Connectivity mode simulation ──
  useEffect(() => {
    const interval = setInterval(() => {
      if (mode === 'connect') {
        const newTurbidity = parseFloat((5 + (Math.random() * 10 - 5)).toFixed(1))
        setFbTurbidity(Math.max(1, Math.min(15, newTurbidity)))
        console.log('📡 ESP32 → Firebase → Turbidity:', newTurbidity.toFixed(1), 'NTU')
      }
    }, 8000)
    return () => clearInterval(interval)
  }, [mode])

  const safetyScore = calcSafetyScore(sensors)

  return (
    <div className="min-h-screen bg-gray-950">
      <Header 
        role={role} 
        setRole={setRole} 
        sensors={sensors} 
        mode={mode} 
        setMode={setMode}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
      />
      <main className="p-4 flex flex-col gap-3">
        <SafetyGauge score={safetyScore} />
        <SensorCards sensors={sensors} />

        <div className="grid grid-cols-1 lg:grid-cols-[185px_1fr_208px] gap-3">
          <SystemStatus sensors={sensors} />
          <IsoPipeline sensors={sensors} />
          <DecisionEngine sensors={sensors} />
        </div>

        <Charts sensors={sensors} />

        <AIPrediction sensors={sensors} />
        
        {role === 'technician' && <TechnicianView sensors={sensors} />}
      </main>
    </div>
  )
}