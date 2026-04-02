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
      <div 
        className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-600 via-cyan-400 via-emerald-400 to-blue-600 bg-[length:200%_100%] animate-gradient-flow"
        style={{ opacity: 0.5 + (gradientIntensity * 0.5) }}
      ></div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-[-100%] w-1/3 h-full bg-gradient-to-r from-transparent via-blue-500/5 to-transparent skew-x-12 animate-scan"></div>
      </div>

      <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]" style={{ opacity: meshIntensity }}></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-600/10 rounded-full blur-[100px]" style={{ opacity: meshIntensity }}></div>
      
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay" 
        style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`}}>
      </div>
      
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_0.5px,transparent_0.5px)] bg-[length:4px_4px] pointer-events-none"></div>
      
      {/* ===== RESPONSIVE CONTAINER ===== */}
      <div className="px-4 py-3 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 relative z-10">
        
        {/* Row 1: Logo + Mode Toggle (side by side on mobile) */}
        <div className="flex flex-wrap items-center justify-between gap-3 w-full xl:w-auto">
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/40 to-cyan-400/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative w-9 h-9 bg-gradient-to-br from-zinc-900 to-gray-950 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.05),_0_2px_4px_rgba(0,0,0,0.4)]">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="drop-shadow-sm">
                  <path d="M9 2C9 2 3.5 8 3.5 11.5a5.5 5.5 0 0011 0C14.5 8 9 2 9 2z" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 12.5c.5 1.5 2 2 3 1.5" stroke="#06b6d4" strokeWidth="1.3" strokeLinecap="round"/>
                  <circle cx="9" cy="9" r="1" fill="#3b82f6" fillOpacity="0.6"/>
                </svg>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-sans text-base font-semibold tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Pure<span className="text-blue-400">FLOW</span>
              </h1>
              <p className="text-[8px] text-gray-400 tracking-tight font-sans">SMART WATER STERILIZATION</p>
            </div>
            {/* Mobile logo text */}
            <div className="block sm:hidden">
              <h1 className="font-sans text-sm font-semibold tracking-tight">
                <span className="text-white">Pure</span><span className="text-blue-400">FLOW</span>
              </h1>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-1 bg-zinc-900/50 rounded-full p-0.5 border border-white/10">
            <button
              className={`px-2 py-1 rounded-full text-[9px] font-medium transition-all duration-300 ${
                mode === 'demo' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setMode('demo')}
            >
              🎮 Demo
            </button>
            <button
              className={`px-2 py-1 rounded-full text-[9px] font-medium transition-all duration-300 ${
                mode === 'connect' ? 'bg-green-500 text-white shadow-lg shadow-green-500/25' : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setMode('connect')}
            >
              🔌 Test
            </button>
          </div>
        </div>

        {/* Row 2: Status Pill (full width on mobile) */}
        <div className="w-full xl:w-auto">
          {danger ? (
            <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border border-red-500/50 bg-red-500/10">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-40"></div>
                <div className="relative w-1.5 h-1.5 rounded-full bg-red-500"></div>
              </div>
              <span className="font-mono text-[9px] font-semibold tracking-widest text-red-400">{statusMessage}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full border border-green-500/50 bg-green-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-mono text-[9px] font-semibold tracking-widest text-green-400">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Row 3: Health Gauge + Sensor Cards (hidden on mobile, visible on desktop) */}
        <div className="hidden xl:flex items-center gap-5">
          {/* Health Gauge */}
          <div className="relative w-10 h-10 group">
            {healthScore < 60 && <div className="absolute -top-1 -right-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-amber-500 animate-pulse z-20"/>}
            {healthScore < 40 && <div className="absolute -top-1 -right-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-rose-500 animate-pulse z-20"/>}
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
              <span className="text-[10px] font-mono font-bold tabular-nums text-white">{animatedHealth}</span>
            </div>
          </div>

          {/* Sensor Cards (simplified for header) */}
          <div className="flex gap-2">
            <div className="bg-zinc-900/30 border border-white/10 px-2 py-1 rounded-xl flex items-center gap-1">
              <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              <span className={`text-[9px] font-mono font-medium ${turbidity > 8 ? 'text-red-400' : turbidity > 4 ? 'text-amber-400' : 'text-blue-300'}`}>{turbidity.toFixed(1)}</span>
              <span className="text-[7px] text-gray-500">NTU</span>
            </div>
            <div className="bg-zinc-900/30 border border-white/10 px-2 py-1 rounded-xl flex items-center gap-1">
              <svg className="w-3 h-3 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <span className="text-[9px] font-mono font-medium text-amber-300">{pH.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Row 4: Right Section (wrap on mobile) */}
        <div className="flex flex-wrap items-center justify-center gap-2 w-full xl:w-auto">
          
          {/* MQTT */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-900/50 border border-white/10">
            <div className="relative">
              <div className={`absolute inset-0 ${connectionColor} rounded-full animate-ping opacity-40`}></div>
              <div className={`relative w-1 h-1 rounded-full ${connectionColor}`}></div>
            </div>
            <span className="font-mono text-[7px] font-bold text-green-400">MQTT</span>
          </div>

          {/* Location - simplified for mobile */}
          <div className="flex items-center gap-1 font-mono text-[8px] uppercase bg-zinc-900/30 px-2 py-1 rounded-full">
            <span className="text-gray-500">📍BUEA</span>
            <span className="text-gray-500">/</span>
            <span className="text-gray-300">TANK_A1</span>
          </div>

          {/* Time */}
          <div className="font-mono text-[8px] text-gray-400 bg-zinc-900/30 px-2 py-1 rounded-full">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          {/* Role Toggle - simplified */}
          <div className="flex bg-zinc-900/40 rounded-full p-0.5">
            <button
              className={`px-3 py-0.5 rounded-full text-[9px] font-medium transition ${
                role === 'household' ? 'bg-blue-500 text-white' : 'text-gray-400'
              }`}
              onClick={() => setRole('household')}
            >
              👤
            </button>
            <button
              className={`px-3 py-0.5 rounded-full text-[9px] font-medium transition ${
                role === 'technician' ? 'bg-blue-500 text-white' : 'text-gray-400'
              }`}
              onClick={() => setRole('technician')}
            >
              🔧
            </button>
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