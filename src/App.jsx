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

function calcSafetyScore(d) {
  let score = 100
  if (d.turbidity > 8)              score -= 40
  else if (d.turbidity > 4)         score -= 20
  if (d.pH < 6.5 || d.pH > 8.5)    score -= 25
  if (d.conductivity > 500)         score -= 15
  return Math.max(0, Math.min(100, score))
}
// ──────────────────────────────────────────────────

function Header({ role, setRole, sensors }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const danger = sensors.turbidity > 8 || sensors.pH < 6.5 || sensors.pH > 8.5

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2C9 2 3.5 8 3.5 11.5a5.5 5.5 0 0011 0C14.5 8 9 2 9 2z" fill="rgba(61,142,240,0.25)" stroke="#3d8ef0" strokeWidth="1.3"/>
            <path d="M6.5 12.5c.5 1.5 2 2 3 1.5" stroke="#1fd18a" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="font-mono text-sm font-bold">
            <span className="text-white">Pure</span><span className="text-blue-400">FLOW</span>
          </h1>
          <p className="text-[10px] text-gray-500">Smart water sterilization system</p>
        </div>
      </div>

      {danger ? (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/50 bg-red-500/10">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="font-mono text-xs font-bold text-red-400">CONTAMINATION DETECTED</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/50 bg-green-500/10">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-mono text-xs font-bold text-green-400">ALL CLEAR — FLOW ALLOWED</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span className="font-mono text-[10px] text-green-400">LIVE</span>
        </div>
        <div className="text-[10px] font-mono text-gray-500">
          Updated: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="flex bg-gray-800 rounded-lg p-0.5">
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${role === 'household' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}
            onClick={() => setRole('household')}
          >
            Household
          </button>
          <button
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${role === 'technician' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}
            onClick={() => setRole('technician')}
          >
            Technician
          </button>
        </div>
      </div>
    </header>
  )
}

export default function App() {
  const [role, setRole] = useState('household')
  const [sensors, setSensors] = useState(generateSimData())
  const [chartHistory, setChartHistory] = useState([])

  // Simulate live data — every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => setSensors(generateSimData()), 5000)
    return () => clearInterval(interval)
  }, [])

  // Update chart history when sensors change
  useEffect(() => {
    setChartHistory(prev => {
      const newEntry = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        turbidity: sensors.turbidity,
        pH: sensors.pH
      }
      const updated = [...prev, newEntry]
      return updated.slice(-24) // Keep last 24 entries
    })
  }, [sensors])

  const safetyScore = calcSafetyScore(sensors)

  return (
    <div className="min-h-screen bg-gray-950">
      <Header role={role} setRole={setRole} sensors={sensors} />
      <main className="p-4 flex flex-col gap-3">
        <SafetyGauge score={safetyScore} />
        <SensorCards sensors={sensors} />
        <IsoPipeline sensors={sensors} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SystemStatus sensors={sensors} />
          <DecisionEngine sensors={sensors} />
        </div>
        <Charts data={chartHistory} />
        <Charts data={chartHistory} />
{role === 'technician' && <TechnicianView sensors={sensors} />}
      </main>
    </div>
  )
}