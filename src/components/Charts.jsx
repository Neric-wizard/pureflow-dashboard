// src/components/Charts.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, ReferenceArea } from 'recharts'
import { useState, useEffect } from 'react'

const TIME_LABELS = ['12 AM','2 AM','4 AM','6 AM','8 AM','10 AM','12 PM','2 PM','4 PM','6 PM','8 PM','10 PM']

function CustomTooltip({ active, payload, label, unit, safeMin, safeMax }) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  const isSafe = safeMin != null && safeMax != null ? val >= safeMin && val <= safeMax : val < 4
  return (
    <div className="bg-zinc-900/95 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-md shadow-xl">
      <div className="font-mono text-[9px] text-gray-400 mb-1">{label}</div>
      <div className={`font-mono text-sm font-bold ${isSafe ? 'text-green-400' : val < (safeMin ?? 4) ? 'text-amber-400' : 'text-red-400'}`}>
        {typeof val === 'number' ? val.toFixed(1) : val}
        <span className="text-xs font-normal text-gray-500 ml-1">{unit}</span>
      </div>
      <div className={`font-mono text-[8px] mt-0.5 ${isSafe ? 'text-green-600' : 'text-red-500'}`}>
        {isSafe ? '● within safe range' : '● outside safe range'}
      </div>
    </div>
  )
}

// Custom dot renderer with anomaly badge for peak
const renderCustomDot = (dangerThreshold, isMaxPoint, isDanger) => (props) => {
  const { cx, cy, payload, index } = props
  const value = payload.value
  const isPeak = isMaxPoint && isDanger && value === isMaxPoint
  
  if (isPeak) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#fff" strokeWidth={1.5} className="animate-pulse" />
        <text x={cx + 8} y={cy - 4} fontSize={7} fill="#ef4444" fontFamily="JetBrains Mono" fontWeight="bold">⚠️</text>
      </g>
    )
  }
  return <circle cx={cx} cy={cy} r={3} fill={value > dangerThreshold ? '#ef4444' : '#3b82f6'} />
}

// Calculate trend direction from last 3 values
const calculateTrend = (data) => {
  if (data.length < 3) return null
  const last3 = data.slice(-3)
  const avg = last3.reduce((a, b) => a + b, 0) / 3
  const first = last3[0]
  if (avg > first) return { direction: 'rising', icon: '▲', color: 'text-red-400' }
  if (avg < first) return { direction: 'falling', icon: '▼', color: 'text-green-400' }
  return { direction: 'stable', icon: '→', color: 'text-gray-500' }
}

export default function Charts({ sensors }) {
  const { turbidity = 12.3, pH = 6.1 } = sensors || {}

  const [turbHistory, setTurbHistory] = useState(() => 
    [8, 7, 9, 6, 5, 7, 10, 12, 11, 13, 12, 11].map((v, i) => ({ time: TIME_LABELS[i], value: v }))
  )
  const [phHistory, setPhHistory] = useState(() => 
    [7.1, 6.9, 7.0, 6.8, 6.5, 6.3, 6.2, 6.1, 6.3, 6.2, 6.1, 6.3].map((v, i) => ({ time: TIME_LABELS[i], value: v }))
  )

  useEffect(() => {
    setTurbHistory(prev => [...prev.slice(1), { 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      value: parseFloat(turbidity.toFixed(1)) 
    }])
  }, [turbidity])

  useEffect(() => {
    setPhHistory(prev => [...prev.slice(1), { 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      value: parseFloat(pH.toFixed(2)) 
    }])
  }, [pH])

  // Calculate stats for turbidity
  const turbValues = turbHistory.map(d => d.value)
  const turbMin = Math.min(...turbValues).toFixed(1)
  const turbMax = Math.max(...turbValues).toFixed(1)
  const turbAvg = (turbValues.reduce((a, b) => a + b, 0) / turbValues.length).toFixed(1)
  const turbTrend = calculateTrend(turbValues)
  
  // Calculate stats for pH
  const phValues = phHistory.map(d => d.value)
  const phMin = Math.min(...phValues).toFixed(1)
  const phMax = Math.max(...phValues).toFixed(1)
  const phAvg = (phValues.reduce((a, b) => a + b, 0) / phValues.length).toFixed(1)
  const phTrend = calculateTrend(phValues)

  // Find max point for anomaly detection
  const turbMaxValue = Math.max(...turbValues)
  const isTurbDanger = turbMaxValue > 8
  const phMaxValue = Math.max(...phValues)
  const isPhDanger = phMaxValue > 8.5 || phMaxValue < 6.5

  const turbBadge = turbidity > 8 ? { label: `${turbidity.toFixed(1)} NTU — Danger`, cls: 'bg-red-500/20 text-red-400' } 
    : turbidity > 4 ? { label: `${turbidity.toFixed(1)} NTU — Warning`, cls: 'bg-amber-500/20 text-amber-400' } 
    : { label: `${turbidity.toFixed(1)} NTU — Safe`, cls: 'bg-green-500/20 text-green-400' }

  const phBadge = pH < 6.5 || pH > 8.5 
    ? { label: `pH ${pH.toFixed(1)} — Warning`, cls: 'bg-amber-500/20 text-amber-400' } 
    : { label: `pH ${pH.toFixed(1)} — Safe`, cls: 'bg-green-500/20 text-green-400' }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      
      {/* Turbidity Chart */}
      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
        <div className="relative bg-gradient-to-br from-zinc-900/80 to-gray-950/80 border border-white/10 rounded-2xl p-4 shadow-[0_0_30px_rgba(59,130,246,0.05),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">Turbidity trend</p>
              <p className="font-mono text-[7px] text-gray-600 mt-0.5">Last 24 hours · NTU</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-full ${turbBadge.cls}`}>
                {turbBadge.label}
              </span>
              {turbTrend && (
                <span className={`font-mono text-[9px] ${turbTrend.color}`}>
                  {turbTrend.icon} {turbTrend.direction}
                </span>
              )}
            </div>
          </div>

          {/* Period Stats Bar */}
          <div className="flex justify-between gap-2 mb-3 text-[8px] font-mono text-gray-500 bg-black/20 rounded-lg px-2 py-1.5">
            <span>Min: <span className="text-blue-300">{turbMin}</span></span>
            <span>Max: <span className={turbMaxValue > 8 ? 'text-red-400' : 'text-blue-300'}>{turbMax}</span></span>
            <span>Avg: <span className="text-gray-300">{turbAvg}</span></span>
          </div>

          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={turbHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="time" tick={{ fill: '#374151', fontSize: 7, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval={2}/>
              <YAxis domain={[0, 20]} tick={{ fill: '#374151', fontSize: 7, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip unit="NTU" />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}/>
              <ReferenceArea y1={0} y2={4} fill="rgba(34,197,94,0.05)" />
              <ReferenceLine y={8} stroke="rgba(239,68,68,0.4)" strokeDasharray="4 3" label={{ value: 'Danger', position: 'right', fontSize: 7, fill: '#ef4444', fontFamily: 'JetBrains Mono' }}/>
              <ReferenceLine y={4} stroke="rgba(245,158,11,0.3)" strokeDasharray="4 3" label={{ value: 'Standby', position: 'right', fontSize: 7, fill: '#f59e0b', fontFamily: 'JetBrains Mono' }}/>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={1.5} 
                dot={renderCustomDot(8, turbMaxValue, isTurbDanger)}
                activeDot={{ r: 4, fill: '#3b82f6' }} 
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="flex gap-3 mt-2 flex-wrap">
            {[{ color: '#22c55e', label: '< 4 NTU safe' }, { color: '#f59e0b', label: '4–8 standby' }, { color: '#ef4444', label: '> 8 danger' }].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{ background: color }}/><span className="font-mono text-[7px] text-gray-600">{label}</span></div>
            ))}
          </div>
        </div>
      </div>

      {/* pH Chart */}
      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-orange-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
        <div className="relative bg-gradient-to-br from-zinc-900/80 to-gray-950/80 border border-white/10 rounded-2xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.05),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
          
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">pH level trend</p>
              <p className="font-mono text-[7px] text-gray-600 mt-0.5">Last 24 hours · Safe range: 6.5 – 8.5</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-full ${phBadge.cls}`}>
                {phBadge.label}
              </span>
              {phTrend && (
                <span className={`font-mono text-[9px] ${phTrend.color}`}>
                  {phTrend.icon} {phTrend.direction}
                </span>
              )}
            </div>
          </div>

          {/* Period Stats Bar */}
          <div className="flex justify-between gap-2 mb-3 text-[8px] font-mono text-gray-500 bg-black/20 rounded-lg px-2 py-1.5">
            <span>Min: <span className="text-amber-300">{phMin}</span></span>
            <span>Max: <span className={isPhDanger ? 'text-red-400' : 'text-amber-300'}>{phMax}</span></span>
            <span>Avg: <span className="text-gray-300">{phAvg}</span></span>
          </div>

          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={phHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="time" tick={{ fill: '#374151', fontSize: 7, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval={2}/>
              <YAxis domain={[5, 10]} tick={{ fill: '#374151', fontSize: 7, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip unit="pH" safeMin={6.5} safeMax={8.5}/>} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}/>
              <ReferenceArea y1={6.5} y2={8.5} fill="rgba(34,197,94,0.06)" />
              <ReferenceLine y={8.5} stroke="rgba(245,158,11,0.3)" strokeDasharray="4 3" label={{ value: '8.5', position: 'right', fontSize: 7, fill: '#f59e0b', fontFamily: 'JetBrains Mono' }}/>
              <ReferenceLine y={6.5} stroke="rgba(245,158,11,0.3)" strokeDasharray="4 3" label={{ value: '6.5', position: 'right', fontSize: 7, fill: '#f59e0b', fontFamily: 'JetBrains Mono' }}/>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#f59e0b" 
                strokeWidth={1.5} 
                dot={renderCustomDot(8.5, phMaxValue, isPhDanger)}
                activeDot={{ r: 4, fill: '#f59e0b' }} 
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="flex gap-3 mt-2 flex-wrap">
            {[{ color: '#22c55e', label: 'Safe zone (6.5–8.5)' }, { color: '#f59e0b', label: 'Out of range' }].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{ background: color }}/><span className="font-mono text-[7px] text-gray-600">{label}</span></div>
            ))}
            <div className="flex items-center gap-1"><div className="w-3 h-1.5 rounded" style={{ background: 'rgba(34,197,94,0.2)' }}/><span className="font-mono text-[7px] text-gray-600">shaded = safe</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}