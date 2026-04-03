// src/components/DecisionEngine.jsx
import { useState, useEffect } from 'react'

export default function DecisionEngine({ sensors }) {
  const { turbidity = 12.3, pH = 6.1 } = sensors || {}

  const uvMode = turbidity > 8 ? 'FULL POWER' : turbidity > 4 ? 'STANDBY' : 'OFF'
  const uvColor = turbidity > 8 ? '#ef4444' : turbidity > 4 ? '#eab308' : '#22c55e'
  const uvTextColor = turbidity > 8 ? 'text-red-400' : turbidity > 4 ? 'text-amber-400' : 'text-green-400'
  const uvBg = turbidity > 8 ? 'bg-red-500/10 border border-red-500/30' : turbidity > 4 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-green-500/10 border border-green-500/30'
  
  let uvReason = ''
  if (turbidity > 8) uvReason = `Turbidity ${turbidity.toFixed(1)} NTU exceeds 8 NTU — max sterilization`
  else if (turbidity > 4) uvReason = `Turbidity ${turbidity.toFixed(1)} NTU in moderate range (4–8) — standby mode`
  else uvReason = `Turbidity ${turbidity.toFixed(1)} NTU below 4 — water is clear`

  const secT = parseFloat((turbidity * 0.25).toFixed(1))
  const pHOk = pH >= 6.5 && pH <= 8.5
  const safe = secT < 4 && pHOk
  const valveStatus = safe ? 'OPEN' : 'CLOSED'
  const valveColor = safe ? '#22c55e' : '#ef4444'
  const valveTextColor = safe ? 'text-green-400' : 'text-red-400'
  const valveBg = safe ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'
  
  let valveReason = ''
  if (!safe) {
    if (turbidity > 8) valveReason = `High turbidity (${turbidity.toFixed(1)} NTU) — water unsafe`
    else if (!pHOk) valveReason = `pH out of range (${pH.toFixed(1)}) — water unsafe`
    else valveReason = `Treatment in progress — awaiting verification`
  } else {
    valveReason = `Water quality verified — safe to release`
  }

  const [uvCycles, setUvCycles] = useState(8)
  const [valveOpens, setValveOpens] = useState(142)
  const [valveCloses, setValveCloses] = useState(7)
  const [prevUvMode, setPrevUvMode] = useState(uvMode)
  const [prevValveStatus, setPrevValveStatus] = useState(valveStatus)

  useEffect(() => {
    if (uvMode === 'FULL POWER' && prevUvMode !== 'FULL POWER') setUvCycles(prev => prev + 1)
    setPrevUvMode(uvMode)
  }, [uvMode, prevUvMode])

  useEffect(() => {
    if (valveStatus !== prevValveStatus) {
      if (valveStatus === 'OPEN') setValveOpens(prev => prev + 1)
      else setValveCloses(prev => prev + 1)
    }
    setPrevValveStatus(valveStatus)
  }, [valveStatus, prevValveStatus])

  return (
    <div className="group relative">
      {/* Glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      <div className="relative bg-gradient-to-br from-zinc-900/80 to-gray-950/80 border border-white/10 rounded-2xl p-4 shadow-[0_0_30px_rgba(59,130,246,0.05),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl overflow-hidden">
        
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        
        {/* Glass reflection overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.01] rounded-2xl transition-transform duration-700 group-hover:translate-x-6" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-30"></div>
              <div className="relative inline-flex h-2 w-2 rounded-full bg-blue-500 opacity-60"></div>
            </div>
            <h3 className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">Decision engine</h3>
          </div>
          
          <div className="flex items-center gap-1.5 px-2 py-0.5 text-[8px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">
            <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></div>
            LIVE
          </div>
        </div>

        {/* UV Mode Card */}
        <div className={`rounded-xl p-3 mb-3 transition-all duration-500 ${uvBg}`}>
          <div className="flex items-center justify-between mb-1">
            <div className="font-mono text-[8px] text-gray-500 uppercase tracking-wider">UV mode — primary</div>
            {turbidity > 8 && (
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            )}
          </div>
          <div className={`font-mono text-sm font-bold ${uvTextColor} mb-1`}>{uvMode}</div>
          <div className="text-[9px] text-gray-400 leading-relaxed">{uvReason}</div>
        </div>

        {/* UV Thresholds */}
        <div className="bg-black/20 rounded-xl p-2 mb-3 border border-white/5">
          <div className="font-mono text-[8px] text-gray-500 uppercase tracking-wider mb-2">UV thresholds</div>
          <div className="space-y-1 text-[9px]">
            <div className="flex justify-between"><span className="text-gray-500">&lt; 4 NTU</span><span className="font-mono text-green-400">UV OFF</span></div>
            <div className="flex justify-between"><span className="text-gray-500">4 – 8 NTU</span><span className="font-mono text-amber-400">STANDBY</span></div>
            <div className="flex justify-between"><span className="text-gray-500">&gt; 8 NTU</span><span className="font-mono text-red-400">FULL POWER</span></div>
            <div className="flex justify-between pt-1 border-t border-white/10 mt-1"><span className="text-gray-500">pH out of range</span><span className="font-mono text-amber-400">FLAG</span></div>
          </div>
        </div>

        {/* Output Valve Card */}
        <div className={`rounded-xl p-3 mb-3 transition-all duration-500 ${valveBg}`}>
          <div className="font-mono text-[8px] text-gray-500 uppercase tracking-wider mb-1">Valve — final decision</div>
          <div className={`font-mono text-sm font-bold ${valveTextColor} mb-1`}>{valveStatus}</div>
          <div className="text-[9px] text-gray-400 leading-relaxed">{valveReason}</div>
        </div>

        {/* Counters Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/20 rounded-xl p-2 border border-white/5">
            <div className="font-mono text-[7px] text-gray-500 uppercase tracking-wider">UV cycles</div>
            <div className="font-mono text-base font-bold text-blue-400">{uvCycles}</div>
          </div>
          <div className="bg-black/20 rounded-xl p-2 border border-white/5">
            <div className="font-mono text-[7px] text-gray-500 uppercase tracking-wider">Valve opens</div>
            <div className="font-mono text-base font-bold text-green-400">{valveOpens}</div>
          </div>
          <div className="bg-black/20 rounded-xl p-2 border border-white/5">
            <div className="font-mono text-[7px] text-gray-500 uppercase tracking-wider">Valve closes</div>
            <div className="font-mono text-base font-bold text-red-400">{valveCloses}</div>
          </div>
          <div className="bg-black/20 rounded-xl p-2 border border-white/5">
            <div className="font-mono text-[7px] text-gray-500 uppercase tracking-wider">Water treated</div>
            <div className="font-mono text-base font-bold text-green-400">1,240L</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-white/5">
          <div className="text-[7px] font-mono text-gray-600 leading-relaxed">
            Rule-based threshold logic via ESP32. AI/ML upgrade planned for Phase 2.
          </div>
        </div>
      </div>
    </div>
  )
}