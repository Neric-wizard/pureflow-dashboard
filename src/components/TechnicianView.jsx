// src/components/TechnicianView.jsx
import { useState } from 'react'

export default function TechnicianView({ sensors }) {
  const { turbidity, pH, conductivity, temperature } = sensors
  
  // ── PIN Gate State ──
  const [pinEntered, setPinEntered] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [pinError, setPinError] = useState(false)
  
  const correctPin = '1234' // Hardcoded for demo — change or move to env
  
  const handlePinSubmit = (e) => {
    e.preventDefault()
    if (pinEntered === correctPin) {
      setIsAuthorized(true)
      setPinError(false)
    } else {
      setPinError(true)
      setPinEntered('')
    }
  }

  // ── Maintenance Log with Countdown ──
  const maintenanceLog = [
    { date: '2025-03-20', action: 'Carbon filter replacement', tech: 'J. Johnson', status: 'Completed' },
    { date: '2025-03-18', action: 'UV lamp inspection', tech: 'A. James', status: 'Completed' },
    { date: '2025-03-15', action: 'Tank deep cleaning', tech: 'J. Ramson', status: 'Pending' },
    { date: '2025-03-10', action: 'Primary sensor calibration', tech: 'A. ', status: 'Overdue' },
  ]
  
  // Calculate days until next maintenance (for Pending/Overdue items)
  const calculateDaysRemaining = (dateStr, status) => {
    if (status === 'Completed') return null
    const dueDate = new Date(dateStr)
    const today = new Date()
    const diffTime = dueDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
  
  const getStatusColor = (status) => {
    if (status === 'Completed') return 'text-green-400 bg-green-500/10'
    if (status === 'Pending') return 'text-amber-400 bg-amber-500/10'
    return 'text-red-400 bg-red-500/10'
  }
  
  // ── Sensor Health Bars ──
  // Safe ranges: Turbidity <4 NTU, pH 6.5-8.5, Conductivity 50-500 μS/cm
  const getTurbidityPercent = () => {
    const value = Math.min(turbidity, 15)
    return (value / 15) * 100
  }
  const getTurbidityColor = () => {
    if (turbidity > 8) return 'bg-red-500'
    if (turbidity > 4) return 'bg-amber-500'
    return 'bg-green-500'
  }
  
  const getPHPercent = () => {
    // pH range 0-14, map to percentage
    return (pH / 14) * 100
  }
  const getPHColor = () => {
    if (pH < 6.5 || pH > 8.5) return 'bg-red-500'
    return 'bg-green-500'
  }
  
  const getConductivityPercent = () => {
    const value = Math.min(conductivity, 1000)
    return (value / 1000) * 100
  }
  const getConductivityColor = () => {
    if (conductivity > 500) return 'bg-red-500'
    if (conductivity > 400) return 'bg-amber-500'
    if (conductivity < 50) return 'bg-amber-500'
    return 'bg-green-500'
  }

  // ── Export CSV ──
  const exportCSV = () => {
    const csv = [
      ['Metric', 'Value'],
      ['Turbidity', `${turbidity} NTU`],
      ['pH', pH],
      ['Conductivity', `${conductivity} μS/cm`],
      ['Temperature', `${temperature} °C`],
      ['Uptime', '99.8%'],
      ['Water Treated', '1,240 L'],
      ['UV Cycles', '8'],
      ['Valve Closures', '7'],
    ].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pureflow_export_${new Date().toISOString().slice(0,19)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── PIN Gate Screen ──
  if (!isAuthorized) {
    return (
      <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-red-500/20 rounded-2xl blur-xl"></div>
        <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-[0_0_30px_rgba(59,130,246,0.05),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
          
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-3">🔒</div>
            <h3 className="font-mono text-sm font-bold text-[var(--text-primary)] mb-1">Technician Access</h3>
            <p className="text-[10px] text-[var(--text-muted)] mb-4">Enter 4-digit PIN to continue</p>
            
            <form onSubmit={handlePinSubmit} className="flex flex-col items-center gap-3">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pinEntered}
                onChange={(e) => setPinEntered(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-32 text-center text-2xl font-mono font-bold bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl py-2 text-[var(--text-primary)] focus:outline-none focus:border-blue-500"
                placeholder="****"
                autoFocus
              />
              {pinError && (
                <p className="text-[9px] text-red-400">Invalid PIN. Try again.</p>
              )}
              <button
                type="submit"
                className="px-5 py-1.5 rounded-full text-[10px] font-medium bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:scale-105 transition-all duration-300"
              >
                Unlock
              </button>
            </form>
            
            <div className="mt-4 text-[7px] font-mono text-[var(--text-muted)]">Default PIN: 1234</div>
          </div>
        </div>
      </div>
    )
  }

  // ── Authorized Technician View ──
  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 shadow-[0_0_30px_rgba(59,130,246,0.05),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.01] rounded-2xl transition-transform duration-700 group-hover:translate-x-6" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-30"></div>
              <div className="relative inline-flex h-2 w-2 rounded-full bg-blue-500 opacity-60"></div>
            </div>
            <h3 className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Technician overview</h3>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 text-[8px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">
            <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></div>
            AUTHORIZED
          </div>
        </div>

        {/* Stats Grid — 5 metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
          {/* Turbidity */}
          <div className="bg-black/20 rounded-xl p-2 border border-[var(--border)]">
            <div className="font-mono text-[7px] text-[var(--text-muted)] uppercase">Turbidity</div>
            <div className="font-mono text-base font-bold" style={{ color: turbidity > 8 ? '#ef4444' : turbidity > 4 ? '#eab308' : '#22c55e' }}>
              {typeof turbidity === 'number' ? turbidity.toFixed(1) : turbidity} NTU
            </div>
            <div className="mt-1 h-1 bg-[var(--bg-surface2)] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${getTurbidityColor()}`} style={{ width: `${getTurbidityPercent()}%` }}></div>
            </div>
          </div>
          
          {/* pH */}
          <div className="bg-black/20 rounded-xl p-2 border border-[var(--border)]">
            <div className="font-mono text-[7px] text-[var(--text-muted)] uppercase">pH</div>
            <div className="font-mono text-base font-bold" style={{ color: pH < 6.5 || pH > 8.5 ? '#ef4444' : '#22c55e' }}>
              {typeof pH === 'number' ? pH.toFixed(1) : pH}
            </div>
            <div className="mt-1 h-1 bg-[var(--bg-surface2)] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${getPHColor()}`} style={{ width: `${getPHPercent()}%` }}></div>
            </div>
          </div>
          
          {/* Conductivity */}
          <div className="bg-black/20 rounded-xl p-2 border border-[var(--border)]">
            <div className="font-mono text-[7px] text-[var(--text-muted)] uppercase">Conductivity</div>
            <div className="font-mono text-base font-bold" style={{ color: conductivity > 500 ? '#ef4444' : conductivity > 400 ? '#eab308' : '#22c55e' }}>
              {Math.round(conductivity)} μS/cm
            </div>
            <div className="mt-1 h-1 bg-[var(--bg-surface2)] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${getConductivityColor()}`} style={{ width: `${getConductivityPercent()}%` }}></div>
            </div>
          </div>
          
          {/* Temperature */}
          <div className="bg-black/20 rounded-xl p-2 border border-[var(--border)]">
            <div className="font-mono text-[7px] text-[var(--text-muted)] uppercase">Temperature</div>
            <div className="font-mono text-base font-bold text-blue-400">
              {typeof temperature === 'number' ? temperature.toFixed(1) : temperature} °C
            </div>
          </div>
          
          {/* Uptime */}
          <div className="bg-black/20 rounded-xl p-2 border border-[var(--border)]">
            <div className="font-mono text-[7px] text-[var(--text-muted)] uppercase">System uptime</div>
            <div className="font-mono text-base font-bold text-green-400">99.8%</div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-black/20 rounded-xl p-2 border border-[var(--border)]">
            <div className="font-mono text-[7px] text-[var(--text-muted)] uppercase">Water treated</div>
            <div className="font-mono text-base font-bold text-blue-400">1,240 L</div>
          </div>
          <div className="bg-black/20 rounded-xl p-2 border border-[var(--border)]">
            <div className="font-mono text-[7px] text-[var(--text-muted)] uppercase">Valve closures</div>
            <div className="font-mono text-base font-bold text-red-400">7</div>
          </div>
        </div>

        {/* Maintenance Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left font-mono text-[8px] text-[var(--text-muted)] py-2">Date</th>
                <th className="text-left font-mono text-[8px] text-[var(--text-muted)] py-2">Action</th>
                <th className="text-left font-mono text-[8px] text-[var(--text-muted)] py-2">Technician</th>
                <th className="text-left font-mono text-[8px] text-[var(--text-muted)] py-2">Status</th>
                <th className="text-left font-mono text-[8px] text-[var(--text-muted)] py-2">Due in</th>
               </tr>
            </thead>
            <tbody>
              {maintenanceLog.map((item, idx) => {
                const daysRemaining = calculateDaysRemaining(item.date, item.status)
                return (
                  <tr key={idx} className="border-b border-[var(--border)]">
                    <td className="py-2 text-[9px] text-[var(--text-secondary)]">{item.date}</td>
                    <td className="py-2 text-[9px] text-[var(--text-secondary)]">{item.action}</td>
                    <td className="py-2 text-[9px] text-[var(--text-secondary)]">{item.tech}</td>
                    <td className={`py-2 text-[9px] font-mono px-2 rounded-full inline-block ${getStatusColor(item.status)}`}>{item.status}</td>
                    <td className="py-2 text-[9px] font-mono">
                      {daysRemaining !== null ? (
                        <span className={daysRemaining <= 0 ? 'text-red-400' : daysRemaining <= 3 ? 'text-amber-400' : 'text-green-400'}>
                          {daysRemaining <= 0 ? 'Overdue' : `${daysRemaining} days`}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Export Button */}
        <button onClick={exportCSV} className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition-all duration-300 text-[9px] font-mono hover:scale-[1.02]">
          📥 Export data (CSV)
        </button>

        {/* Raw Sensor Dump Panel */}
        <details className="mt-4 pt-3 border-t border-[var(--border)]">
          <summary className="text-[8px] font-mono text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-primary)] transition-colors">
            🔧 Raw sensor data (JSON)
          </summary>
          <pre className="mt-2 text-[7px] font-mono text-[var(--text-muted)] bg-black/30 p-2 rounded-lg overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(sensors, null, 2)}
          </pre>
        </details>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-[var(--border)]">
          <div className="text-[6px] font-mono text-[var(--text-muted)] text-center">LAST SYNC • JUST NOW • AES-256 ENCRYPTED</div>
        </div>
      </div>
    </div>
  )
}