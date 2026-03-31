// src/components/DecisionEngine.jsx
import { useState, useEffect } from 'react'

export default function DecisionEngine({ sensors }) {
  const { turbidity = 12.3, pH = 6.1 } = sensors || {}

  // UV mode logic
  const uvMode = turbidity > 8 ? 'FULL POWER' : turbidity > 4 ? 'STANDBY' : 'OFF'
  const uvColor = turbidity > 8 ? 'text-red-400' : turbidity > 4 ? 'text-amber-400' : 'text-green-400'
  const uvBg = turbidity > 8 ? 'bg-red-500/10 border-red-500/30' : turbidity > 4 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-green-500/10 border-green-500/30'
  
  let uvReason = ''
  if (turbidity > 8) uvReason = `Turbidity ${turbidity.toFixed(1)} NTU exceeds 8 NTU — max sterilization`
  else if (turbidity > 4) uvReason = `Turbidity ${turbidity.toFixed(1)} NTU in moderate range (4–8) — standby mode`
  else uvReason = `Turbidity ${turbidity.toFixed(1)} NTU below 4 — water is clear`

  // Output valve logic
  const secT = parseFloat((turbidity * 0.25).toFixed(1))
  const pHOk = pH >= 6.5 && pH <= 8.5
  const safe = secT < 4 && pHOk
  const valveStatus = safe ? 'OPEN' : 'CLOSED'
  const valveColor = safe ? 'text-green-400' : 'text-red-400'
  const valveBg = safe ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
  
  let valveReason = ''
  if (!safe) {
    if (turbidity > 8) valveReason = `High turbidity (${turbidity.toFixed(1)} NTU) — water unsafe`
    else if (!pHOk) valveReason = `pH out of range (${pH.toFixed(1)}) — water unsafe`
    else valveReason = `Treatment in progress — awaiting verification`
  } else {
    valveReason = `Water quality verified — safe to release`
  }

  // Simulated counters (will come from Firebase later)
  const [uvCycles, setUvCycles] = useState(8)
  const [valveOpens, setValveOpens] = useState(142)
  const [valveCloses, setValveCloses] = useState(7)
  const [waterTreated, setWaterTreated] = useState(1240)

  // Update counters when UV mode changes to FULL POWER
  useEffect(() => {
    if (uvMode === 'FULL POWER') {
      setUvCycles(prev => prev + 1)
    }
  }, [turbidity])

  // Update valve counters when status changes
  useEffect(() => {
    if (valveStatus === 'OPEN') {
      setValveOpens(prev => prev + 1)
    } else {
      setValveCloses(prev => prev + 1)
    }
  }, [safe])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
        <h3 className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">Decision engine</h3>
      </div>

      {/* UV Mode Card */}
      <div className={`rounded-lg p-3 mb-4 border ${uvBg}`}>
        <div className="font-mono text-[9px] text-gray-500 uppercase tracking-wider mb-1">UV mode — primary</div>
        <div className={`font-mono text-sm font-bold ${uvColor} mb-1`}>{uvMode}</div>
        <div className="text-[10px] text-gray-400 leading-relaxed">{uvReason}</div>
      </div>

      {/* UV Thresholds Reference */}
      <div className="bg-gray-800/50 rounded-lg p-3 mb-4 border border-gray-700">
        <div className="font-mono text-[9px] text-gray-500 uppercase tracking-wider mb-2">UV thresholds</div>
        <div className="space-y-1.5 text-[10px]">
          <div className="flex justify-between">
            <span className="text-gray-500">&lt; 4 NTU</span>
            <span className="font-mono text-green-400">UV OFF</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">4 – 8 NTU</span>
            <span className="font-mono text-amber-400">STANDBY</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">&gt; 8 NTU</span>
            <span className="font-mono text-red-400">FULL POWER</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-gray-700 mt-1">
            <span className="text-gray-500">pH out of range</span>
            <span className="font-mono text-amber-400">FLAG</span>
          </div>
        </div>
      </div>

      {/* Output Valve Card */}
      <div className={`rounded-lg p-3 mb-4 border ${valveBg}`}>
        <div className="font-mono text-[9px] text-gray-500 uppercase tracking-wider mb-1">Valve — final decision</div>
        <div className={`font-mono text-sm font-bold ${valveColor} mb-1`}>{valveStatus}</div>
        <div className="text-[10px] text-gray-400 leading-relaxed">{valveReason}</div>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
          <div className="font-mono text-[8px] text-gray-500 uppercase tracking-wider">UV cycles</div>
          <div className="font-mono text-lg font-bold text-blue-400">{uvCycles}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
          <div className="font-mono text-[8px] text-gray-500 uppercase tracking-wider">Valve opens</div>
          <div className="font-mono text-lg font-bold text-green-400">{valveOpens}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
          <div className="font-mono text-[8px] text-gray-500 uppercase tracking-wider">Valve closes</div>
          <div className="font-mono text-lg font-bold text-red-400">{valveCloses}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700">
          <div className="font-mono text-[8px] text-gray-500 uppercase tracking-wider">Water treated</div>
          <div className="font-mono text-lg font-bold text-green-400">{waterTreated}L</div>
        </div>
      </div>

      {/* Phase Note */}
      <div className="mt-4 pt-3 border-t border-gray-800">
        <div className="font-mono text-[8px] text-gray-500 uppercase tracking-wider mb-1">Phase note</div>
        <div className="text-[9px] text-gray-600 leading-relaxed">
          Rule-based threshold logic via ESP32. AI/ML upgrade planned for Phase 2.
        </div>
      </div>
    </div>
  )
}