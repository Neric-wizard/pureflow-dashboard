// src/components/AIPrediction.jsx
import { useState, useEffect } from 'react'

export default function AIPrediction({ sensors }) {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPrediction = async () => {
    if (!sensors) return
    
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pH: sensors.pH,
          turbidity: sensors.turbidity,
          conductivity: sensors.conductivity
        })
      })
      const data = await response.json()
      if (data.error) {
        setError(data.error)
      } else {
        setPrediction(data)
        setError(null)
      }
    } catch (err) {
      setError('API not running. Start with: python api.py')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPrediction()
  }, [sensors])

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'from-emerald-400 via-green-500 to-emerald-600'
    if (confidence >= 60) return 'from-blue-400 via-cyan-500 to-blue-600'
    if (confidence >= 40) return 'from-amber-400 via-yellow-500 to-amber-600'
    return 'from-red-400 via-rose-500 to-red-600'
  }

  const getConfidenceTextColor = (confidence) => {
    if (confidence >= 80) return 'text-emerald-400'
    if (confidence >= 60) return 'text-blue-400'
    if (confidence >= 40) return 'text-amber-400'
    return 'text-red-400'
  }

  const getRiskLevel = (confidence, contaminant) => {
    if (contaminant !== 'Clean / Safe') return 'HIGH RISK'
    if (confidence >= 80) return 'LOW RISK'
    if (confidence >= 60) return 'MEDIUM RISK'
    return 'HIGH RISK'
  }

  const getRiskColor = (confidence, contaminant) => {
    if (contaminant !== 'Clean / Safe') return 'text-red-400 bg-red-500/10 border-red-500/30'
    if (confidence >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    if (confidence >= 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    return 'text-red-400 bg-red-500/10 border-red-500/30'
  }

  return (
    <div className="group relative transition-all duration-500 hover:scale-[1.015]">
      
      {/* Ultra Premium Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/40 via-pink-500/40 to-indigo-500/40 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>

      <div className="relative bg-gradient-to-br from-[var(--bg-card)]/90 to-[var(--bg-surface)]/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_10px_60px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.05)]">
        
        {/* Animated Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-pulse"></div>

        {/* Glass Reflection */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/[0.04] via-transparent to-white/[0.02] rounded-3xl"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-2.5 w-2.5">
              <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-500 opacity-40"></div>
              <div className="relative inline-flex h-2.5 w-2.5 rounded-full bg-purple-500"></div>
            </div>
            <h3 className="font-mono text-[11px] text-[var(--text-muted)] uppercase tracking-widest">
              🤖 AI Water Intelligence
            </h3>
          </div>
          <div className="text-[9px] font-mono text-[var(--text-muted)] bg-white/5 px-3 py-1 rounded-full border border-white/10">
            Real-time
          </div>
        </div>

        {loading && (
          <div className="text-center py-10">
            <div className="inline-block w-10 h-10 border-[3px] border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] text-[var(--text-muted)] mt-4 tracking-wide">
              Running AI analysis...
            </p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 mb-3 backdrop-blur-md">
              <span className="text-red-400 text-sm">⚠️</span>
              <span className="text-[10px] text-red-400 font-mono">API Error</span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)]">{error}</p>
          </div>
        )}

        {prediction && !loading && (
          <div className="p-6 space-y-5">
            
            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-purple-900/30 via-transparent to-transparent rounded-2xl p-5 border border-purple-500/20 shadow-inner">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>

              <div className="relative flex items-start justify-between">
                <div>
                  <div className="font-mono text-[9px] text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                    AI PREDICTION
                  </div>

                  <div className="font-mono text-2xl font-extrabold text-purple-300 tracking-wide">
                    {prediction.contaminant}
                  </div>

                  <div className="mt-3 w-[140px]">
                    <div className="flex justify-between text-[9px] font-mono text-gray-400 mb-1">
                      <span>Confidence</span>
                      <span className={getConfidenceTextColor(prediction.confidence)}>
                        {prediction.confidence}%
                      </span>
                    </div>

                    <div className="h-2 bg-black/40 rounded-full overflow-hidden backdrop-blur-md">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${getConfidenceColor(prediction.confidence)} shadow-lg`}
                        style={{ width: `${prediction.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Risk Badge */}
                <div className={`px-4 py-1.5 rounded-full border backdrop-blur-md ${getRiskColor(prediction.confidence, prediction.contaminant)}`}>
                  <span className="font-mono text-[10px] font-bold tracking-wider">
                    {getRiskLevel(prediction.confidence, prediction.contaminant)}
                  </span>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'pH', value: prediction.input_values.pH },
                { label: 'Turbidity', value: prediction.input_values.turbidity + ' NTU' },
                { label: 'Conductivity', value: prediction.input_values.conductivity + ' μS/cm' }
              ].map((item, i) => (
                <div key={i} className="bg-white/[0.03] rounded-xl p-3 text-center border border-white/10 backdrop-blur-md hover:bg-white/[0.05] transition">
                  <div className="font-mono text-[8px] text-gray-500 uppercase">{item.label}</div>
                  <div className="font-mono text-base font-bold text-purple-300">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Alternatives */}
            {prediction.top_predictions && prediction.top_predictions.length > 0 && (
              <div className="bg-white/[0.03] rounded-xl p-4 border border-white/10 backdrop-blur-md">
                <div className="font-mono text-[8px] text-gray-400 uppercase tracking-wider mb-3">
                  📊 Alternative possibilities
                </div>

                <div className="space-y-2">
                  {prediction.top_predictions.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {item.contaminant}
                      </span>

                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-black/40 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{ width: `${item.confidence}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-[9px] text-purple-400">
                          {item.confidence}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-40"></div>
                  <div className="relative w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <span className="font-mono text-[8px] text-green-400 tracking-wider">
                  AI MODEL ACTIVE
                </span>
              </div>
              <div className="font-mono text-[7px] text-gray-500">
                Random Forest • v1.0
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}