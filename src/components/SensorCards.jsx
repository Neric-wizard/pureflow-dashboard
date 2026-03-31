// ── Threshold helpers ──────────────────────────────
function turbidityStatus(v) {
  if (v > 8)  return { label: '▲ Danger',  cls: 'bg-red-500/10 text-red-400',    color: '#e84545', bar: 'bg-red-500' }
  if (v > 4)  return { label: '▲ Warning', cls: 'bg-amber-500/10 text-amber-400', color: '#f0a000', bar: 'bg-amber-500' }
  return       { label: '▼ Safe',    cls: 'bg-green-500/10 text-green-400', color: '#1fd18a', bar: 'bg-green-500' }
}

function pHStatus(v) {
  if (v < 6.0 || v > 9.0) return { label: '▲ Critical', cls: 'bg-red-500/10 text-red-400',    color: '#e84545', bar: 'bg-red-500' }
  if (v < 6.5 || v > 8.5) return { label: '▲ Warning',  cls: 'bg-amber-500/10 text-amber-400', color: '#f0a000', bar: 'bg-amber-500' }
  return                    { label: '▼ Safe',     cls: 'bg-green-500/10 text-green-400', color: '#1fd18a', bar: 'bg-green-500' }
}

function tempStatus() {
  // Temperature is informational only
  return { label: '● Normal', cls: 'bg-blue-500/10 text-blue-400', color: '#3d8ef0', bar: 'bg-blue-500' }
}

function conductivityStatus(v) {
  // Safe drinking water: 50–500 μS/cm
  if (v > 500) return { label: '▲ High',   cls: 'bg-red-500/10 text-red-400',    color: '#e84545', bar: 'bg-red-500' }
  if (v > 400) return { label: '▲ Warning', cls: 'bg-amber-500/10 text-amber-400', color: '#f0a000', bar: 'bg-amber-500' }
  if (v < 50)  return { label: '▼ Low',    cls: 'bg-amber-500/10 text-amber-400', color: '#f0a000', bar: 'bg-amber-500' }
  return        { label: '▼ Normal', cls: 'bg-green-500/10 text-green-400', color: '#1fd18a', bar: 'bg-green-500' }
}
// ──────────────────────────────────────────────────

function SensorCard({ label, value, unit, sub, status, tooltip }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 relative overflow-hidden
                    hover:border-gray-700 transition-colors group">

      {/* Colored top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
        style={{ background: status.color }}
      />

      {/* Label with tooltip */}
      <div
        className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mb-2 cursor-help"
        title={tooltip}
      >
        {label}
        <span className="ml-1 text-gray-700 text-[8px]">(?)</span>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-1.5">
        <span
          className="font-mono text-2xl font-bold leading-none"
          style={{ color: status.color }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs text-gray-500 font-normal">{unit}</span>
        )}
      </div>

      {/* Badge */}
      <span className={`inline-block font-mono text-[9px] font-bold px-2 py-0.5 rounded-md ${status.cls}`}>
        {status.label}
      </span>

      {/* Sub-label */}
      {sub && (
        <p className="font-mono text-[8px] text-gray-600 mt-1.5">{sub}</p>
      )}
    </div>
  )
}

export default function SensorCards({ sensors }) {
  const { turbidity, pH, temperature, conductivity } = sensors

  const cards = [
    {
      label:  'Turbidity',
      value:  turbidity.toFixed(1),
      unit:   'NTU',
      sub:    '<4 safe · 4–8 standby · >8 full UV',
      status: turbidityStatus(turbidity),
      tooltip:'Turbidity measures water clarity. Safe: below 4 NTU',
    },
    {
      label:  'pH level',
      value:  pH.toFixed(1),
      unit:   '',
      sub:    'Safe range: 6.5 – 8.5',
      status: pHStatus(pH),
      tooltip:'pH measures acidity. Safe range: 6.5 to 8.5',
    },
    {
      label:  'Temperature',
      value:  temperature.toFixed(1),
      unit:   '°C',
      sub:    'Contextual reading',
      status: tempStatus(),
      tooltip:'Temperature affects bacterial growth rate',
    },
    {
      label:  'Conductivity',
      value:  Math.round(conductivity),
      unit:   'μS/cm',
      sub:    'Safe range: 50 – 500 μS/cm',
      status: conductivityStatus(conductivity),
      tooltip:'Conductivity measures dissolved salts. Safe: 50–500 μS/cm',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(card => (
        <SensorCard key={card.label} {...card} />
      ))}
    </div>
  )
}