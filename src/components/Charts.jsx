// src/components/Charts.jsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, ReferenceArea
} from 'recharts'
import { useState, useEffect } from 'react'

// ── Fixed 24hr time labels ─────────────────────────────────────
const TIME_LABELS = [
  '12 AM','2 AM','4 AM','6 AM','8 AM','10 AM',
  '12 PM','2 PM','4 PM','6 PM','8 PM','10 PM'
]

// ── Custom tooltip ─────────────────────────────────────────────
function CustomTooltip({ active, payload, label, unit, safeMin, safeMax }) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  const isSafe =
    safeMin != null && safeMax != null
      ? val >= safeMin && val <= safeMax
      : val < 4
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
      <div className="font-mono text-[9px] text-gray-500 mb-1">{label}</div>
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

export default function Charts({ sensors }) {
  const { turbidity = 12.3, pH = 6.1 } = sensors || {}

  // ── Historical data — last 12 readings (24 hrs) ──────────────
  const [turbHistory, setTurbHistory] = useState(() =>
    [8, 7, 9, 6, 5, 7, 10, 12, 11, 13, 12, 11].map((v, i) => ({
      time: TIME_LABELS[i],
      value: v,
    }))
  )

  const [phHistory, setPhHistory] = useState(() =>
    [7.1, 6.9, 7.0, 6.8, 6.5, 6.3, 6.2, 6.1, 6.3, 6.2, 6.1, 6.3].map((v, i) => ({
      time: TIME_LABELS[i],
      value: v,
    }))
  )

  // Append latest reading every time sensors update
  useEffect(() => {
    setTurbHistory(prev => {
      const next = [...prev.slice(1), {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: parseFloat(turbidity.toFixed(1)),
      }]
      return next
    })
  }, [turbidity])

  useEffect(() => {
    setPhHistory(prev => {
      const next = [...prev.slice(1), {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        value: parseFloat(pH.toFixed(2)),
      }]
      return next
    })
  }, [pH])

  // ── Chart badge helper ────────────────────────────────────────
  const turbBadge =
    turbidity > 8  ? { label: `${turbidity.toFixed(1)} NTU — Danger`,  cls: 'bg-red-500/10 text-red-400'   } :
    turbidity > 4  ? { label: `${turbidity.toFixed(1)} NTU — Warning`, cls: 'bg-amber-500/10 text-amber-400' } :
                     { label: `${turbidity.toFixed(1)} NTU — Safe`,    cls: 'bg-green-500/10 text-green-400' }

  const phBadge =
    pH < 6.5 || pH > 8.5
      ? { label: `pH ${pH.toFixed(1)} — Warning`, cls: 'bg-amber-500/10 text-amber-400' }
      : { label: `pH ${pH.toFixed(1)} — Safe`,    cls: 'bg-green-500/10 text-green-400' }

  // ── Dot color per point ───────────────────────────────────────
  function turbDotColor(val) {
    return val > 8 ? '#e84545' : val > 4 ? '#f0a000' : '#1fd18a'
  }
  function phDotColor(val) {
    return (val < 6.5 || val > 8.5) ? '#f0a000' : '#1fd18a'
  }

  // Custom dot that colors itself by value
  const TurbDot = ({ cx, cy, payload }) => (
    <circle cx={cx} cy={cy} r={3}
      fill={turbDotColor(payload.value)}
      stroke="none"/>
  )
  const PhDot = ({ cx, cy, payload }) => (
    <circle cx={cx} cy={cy} r={3}
      fill={phDotColor(payload.value)}
      stroke="none"/>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

      {/* ── Turbidity Chart ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">
              Turbidity — last 24 hrs
            </p>
            <p className="font-mono text-[8px] text-gray-600 mt-0.5">
              NTU · danger threshold: 8
            </p>
          </div>
          <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-md ${turbBadge.cls}`}>
            {turbBadge.label}
          </span>
        </div>

        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={turbHistory} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
            <XAxis
              dataKey="time"
              tick={{ fill: '#374151', fontSize: 8, fontFamily: 'JetBrains Mono' }}
              axisLine={false} tickLine={false}
              interval={2}
            />
            <YAxis
              domain={[0, 20]}
              tick={{ fill: '#374151', fontSize: 8, fontFamily: 'JetBrains Mono' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip unit="NTU" />}
              cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
            />
            {/* Safe zone shading */}
            <ReferenceArea y1={0} y2={4} fill="rgba(31,209,138,0.04)" fillOpacity={1}/>
            {/* Danger threshold line */}
            <ReferenceLine
              y={8}
              stroke="rgba(232,69,69,0.4)"
              strokeDasharray="4 3"
              label={{ value: 'Danger', position: 'right', fontSize: 8, fill: '#e84545', fontFamily: 'JetBrains Mono' }}
            />
            <ReferenceLine
              y={4}
              stroke="rgba(240,160,0,0.3)"
              strokeDasharray="4 3"
              label={{ value: 'Standby', position: 'right', fontSize: 8, fill: '#f0a000', fontFamily: 'JetBrains Mono' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3d8ef0"
              strokeWidth={1.5}
              dot={<TurbDot/>}
              activeDot={{ r: 4, fill: '#3d8ef0' }}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Threshold legend */}
        <div className="flex gap-3 mt-2 flex-wrap">
          {[
            { color: '#1fd18a', label: '< 4 NTU safe' },
            { color: '#f0a000', label: '4–8 standby' },
            { color: '#e84545', label: '> 8 danger' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }}/>
              <span className="font-mono text-[8px] text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── pH Chart ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">
              pH level — last 24 hrs
            </p>
            <p className="font-mono text-[8px] text-gray-600 mt-0.5">
              Safe range: 6.5 – 8.5
            </p>
          </div>
          <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-md ${phBadge.cls}`}>
            {phBadge.label}
          </span>
        </div>

        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={phHistory} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
            <XAxis
              dataKey="time"
              tick={{ fill: '#374151', fontSize: 8, fontFamily: 'JetBrains Mono' }}
              axisLine={false} tickLine={false}
              interval={2}
            />
            <YAxis
              domain={[5, 10]}
              tick={{ fill: '#374151', fontSize: 8, fontFamily: 'JetBrains Mono' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip unit="pH" safeMin={6.5} safeMax={8.5}/>}
              cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
            />
            {/* Safe zone shading */}
            <ReferenceArea y1={6.5} y2={8.5} fill="rgba(31,209,138,0.06)" fillOpacity={1}/>
            {/* Safe zone boundary lines */}
            <ReferenceLine
              y={8.5}
              stroke="rgba(240,160,0,0.3)"
              strokeDasharray="4 3"
              label={{ value: '8.5', position: 'right', fontSize: 8, fill: '#f0a000', fontFamily: 'JetBrains Mono' }}
            />
            <ReferenceLine
              y={6.5}
              stroke="rgba(240,160,0,0.3)"
              strokeDasharray="4 3"
              label={{ value: '6.5', position: 'right', fontSize: 8, fill: '#f0a000', fontFamily: 'JetBrains Mono' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#f0a000"
              strokeWidth={1.5}
              dot={<PhDot/>}
              activeDot={{ r: 4, fill: '#f0a000' }}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex gap-3 mt-2 flex-wrap">
          {[
            { color: '#1fd18a', label: 'Safe zone (6.5–8.5)' },
            { color: '#f0a000', label: 'Out of range' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }}/>
              <span className="font-mono text-[8px] text-gray-600">{label}</span>
            </div>
          ))}
          {/* Safe zone indicator */}
          <div className="flex items-center gap-1">
            <div className="w-3 h-1.5 rounded" style={{ background: 'rgba(31,209,138,0.2)' }}/>
            <span className="font-mono text-[8px] text-gray-600">shaded = safe</span>
          </div>
        </div>
      </div>

    </div>
  )
}