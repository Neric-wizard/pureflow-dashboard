// src/components/SystemStatus.jsx
export default function SystemStatus({ sensors }) {
  const { turbidity = 12.3, pH = 6.1 } = sensors || {}

  // UV mode based on turbidity
  const uvMode = turbidity > 8 ? 'FULL POWER' : turbidity > 4 ? 'STANDBY' : 'OFF'
  const uvColor = turbidity > 8 ? 'text-red-400' : turbidity > 4 ? 'text-amber-400' : 'text-green-400'
  const uvDot = turbidity > 8 ? 'bg-red-500' : turbidity > 4 ? 'bg-amber-500' : 'bg-green-500'

  // Output Valve status (ESP32-controlled safety valve)
  const pHOk = pH >= 6.5 && pH <= 8.5
  const secT = parseFloat((turbidity * 0.25).toFixed(1))
  const safe = secT < 4 && pHOk
  const valveStatus = safe ? 'OPEN' : 'CLOSED'
  const valveColor = safe ? 'text-green-400' : 'text-red-400'
  const valveDot = safe ? 'bg-green-500' : 'bg-red-500'
  const valveReason = safe ? 'Water quality verified' : turbidity > 8 ? 'High turbidity' : !pHOk ? 'pH out of range' : 'Treatment in progress'

  // Carbon filter life (simulated — will come from Firebase later)
  const carbonLife = 38
  const carbonColor = carbonLife < 30 ? 'bg-red-500' : carbonLife < 60 ? 'bg-amber-500' : 'bg-green-500'
  const carbonTextColor = carbonLife < 30 ? 'text-red-400' : carbonLife < 60 ? 'text-amber-400' : 'text-green-400'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
        <h3 className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">System status</h3>
      </div>

      <div className="space-y-3">
        {/* Chlorine chamber */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-400">Chlorine chamber</span>
          </div>
          <span className="font-mono text-xs text-green-400">PASSIVE</span>
        </div>

        {/* Tank storage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            <span className="text-xs text-gray-400">Tank storage</span>
          </div>
          <span className="font-mono text-xs text-blue-400">MIXING</span>
        </div>

        {/* Sediment filter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-400">Sediment filter</span>
          </div>
          <span className="font-mono text-xs text-green-400">OK</span>
        </div>

        {/* Carbon filter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
            <span className="text-xs text-gray-400">Carbon filter</span>
          </div>
          <span className={`font-mono text-xs ${carbonTextColor}`}>REPLACE SOON</span>
        </div>
        {/* Carbon filter progress bar */}
        <div className="ml-4 mt-1">
          <div className="flex justify-between text-[9px] font-mono text-gray-600 mb-1">
            <span>Filter life</span>
            <span>{carbonLife}%</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${carbonColor}`} style={{ width: `${carbonLife}%` }}></div>
          </div>
        </div>

        {/* UV sterilizer */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${uvDot}`}></div>
            <span className="text-xs text-gray-400">UV sterilizer</span>
          </div>
          <span className={`font-mono text-xs ${uvColor}`}>{uvMode}</span>
        </div>

        {/* Output Valve — ESP32-controlled safety valve */}
        <div className="flex items-center justify-between border-t border-gray-800 pt-2 mt-1">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${valveDot}`}></div>
            <span className="text-xs text-gray-400">Output valve (safety)</span>
          </div>
          <div className="text-right">
            <span className={`font-mono text-xs font-bold ${valveColor}`}>{valveStatus}</span>
            <div className="text-[8px] font-mono text-gray-600">{valveReason}</div>
          </div>
        </div>
      </div>
    </div>
  )
}