export default function SafetyGauge({ score }) {
  // Ring math
  const radius      = 22
  const circumference = 2 * Math.PI * radius  // ≈ 138.2
  const offset      = circumference - (score / 100) * circumference

  // Color based on score
  const color =
    score >= 80 ? '#1fd18a' :
    score >= 60 ? '#3d8ef0' :
    score >= 30 ? '#f0a000' : '#e84545'

  const label =
    score >= 80 ? 'EXCELLENT' :
    score >= 60 ? 'GOOD'      :
    score >= 30 ? 'WARNING'   : 'CRITICAL'

  // Forecast — estimated based on current score
  const forecast = [
    { day: 'Today',    risk: score < 50 ? 'HIGH'   : score < 70 ? 'MEDIUM' : 'LOW',
      color: score < 50 ? 'text-red-400' : score < 70 ? 'text-amber-400' : 'text-green-400' },
    { day: 'Tomorrow', risk: score < 40 ? 'HIGH'   : score < 65 ? 'MEDIUM' : 'LOW',
      color: score < 40 ? 'text-red-400' : score < 65 ? 'text-amber-400' : 'text-green-400' },
    { day: 'In 3 days',risk: score < 30 ? 'HIGH'   : 'LOW',
      color: score < 30 ? 'text-red-400' : 'text-green-400' },
  ]

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-5 flex-wrap">

      {/* Circular gauge */}
      <div className="relative w-14 h-14 flex-shrink-0">
        <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle cx="28" cy="28" r={radius}
            fill="none" stroke="#1e293b" strokeWidth="5"/>
          {/* Score arc */}
          <circle cx="28" cy="28" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-sm font-bold" style={{ color }}>
            {score}
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <span className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">
          Safety score
        </span>
        <span className="font-mono text-sm font-bold" style={{ color }}>
          {label}
        </span>
        <span className="font-mono text-[9px] text-gray-600">
          0 – 100 scale
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-gray-800 flex-shrink-0 hidden sm:block" />

      {/* Risk forecast */}
      <div className="flex gap-5">
        {forecast.map(({ day, risk, color: fc }) => (
          <div key={day} className="flex flex-col items-center gap-1">
            <span className="font-mono text-[9px] text-gray-600 uppercase">{day}</span>
            <span className={`font-mono text-[10px] font-bold ${fc}`}>{risk}</span>
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="ml-auto text-[9px] font-mono text-gray-700 text-right hidden md:block">
        Rule-based score<br />No AI · Phase 2 planned
      </div>
    </div>
  )
}