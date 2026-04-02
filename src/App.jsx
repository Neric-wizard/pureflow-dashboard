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

  let statusMessage = ''
  if (danger) {
    if (turbidity > 8) statusMessage = 'HIGH TURBIDITY'
    else if (pH < 6.5) statusMessage = 'PH TOO LOW'
    else if (pH > 8.5) statusMessage = 'PH TOO HIGH'
    else statusMessage = 'WATER ALERT'
  } else {
    if (turbidity > 4) statusMessage = 'MODERATE'
    else statusMessage = 'WATER QUALITY STABLE'
  }

  return (
    <header className="relative bg-gradient-to-r from-gray-950 via-zinc-950 to-gray-950 border-b border-white/5 backdrop-blur-2xl overflow-hidden">
      {/* Scanner beam */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-[-100%] w-1/3 h-full bg-gradient-to-r from-transparent via-blue-500/5 to-transparent skew-x-12 animate-scan"></div>
      </div>

      {/* Mesh gradients */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-600/10 rounded-full blur-[100px]"></div>

      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"></div>

      <div className="px-4 py-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 relative z-10">

        {/* Row 1: Logo + Mode Toggle (stack on mobile) */}
        <div className="flex flex-wrap items-center justify-between gap-3 w-full lg:w-auto">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-zinc-900 to-gray-950 border border-white/10 rounded-xl flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M9 2C9 2 3.5 8 3.5 11.5a5.5 5.5 0 0011 0C14.5 8 9 2 9 2z" fill="rgba(61,142,240,0.25)" stroke="#3d8ef0" strokeWidth="1.3"/>
                <path d="M6.5 12.5c.5 1.5 2 2 3 1.5" stroke="#1fd18a" strokeWidth="1.1" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 className="font-mono text-sm font-bold">
                <span className="text-white">Pure</span><span className="text-blue-400">FLOW</span>
              </h1>
              <p className="text-[8px] text-gray-500 hidden sm:block">SMART WATER STERILIZATION</p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-1 bg-zinc-900/50 rounded-full p-0.5 border border-white/10">
            <button
              className={`px-2 py-1 rounded-full text-[9px] font-medium transition ${
                mode === 'demo' ? 'bg-blue-500 text-white' : 'text-gray-400'
              }`}
              onClick={() => setMode('demo')}
            >
              🎮 Demo
            </button>
            <button
              className={`px-2 py-1 rounded-full text-[9px] font-medium transition ${
                mode === 'connect' ? 'bg-green-500 text-white' : 'text-gray-400'
              }`}
              onClick={() => setMode('connect')}
            >
              🔌 Test
            </button>
          </div>
        </div>

        {/* Row 2: Status Pill (full width on mobile) */}
        <div className="w-full lg:w-auto">
          {danger ? (
            <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full border border-red-500/50 bg-red-500/10 w-full">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
              <span className="font-mono text-[9px] font-bold text-red-400">{statusMessage}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 px-3 py-1 rounded-full border border-green-500/50 bg-green-500/10 w-full">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-mono text-[9px] font-bold text-green-400">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Row 3: MQTT + Location + Time + Role (wrap on mobile) */}
        <div className="flex flex-wrap items-center justify-center gap-2 w-full lg:w-auto">
          {/* MQTT */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-900/50 border border-white/10">
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-mono text-[7px] text-green-400">MQTT</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 font-mono text-[8px] uppercase bg-zinc-900/30 px-2 py-1 rounded-full">
            <span className="text-gray-500">📍BUEA</span>
            <span className="text-gray-500">/</span>
            <span className="text-gray-300">TANK_A1</span>
          </div>

          {/* Time */}
          <div className="font-mono text-[8px] text-gray-500 bg-zinc-900/30 px-2 py-1 rounded-full">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          {/* Role Toggle */}
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