// src/components/TechnicianView.jsx
export default function TechnicianView({ sensors }) {
  const { turbidity, pH, conductivity } = sensors

  // System health stats (simulated)
  const uptime = '99.8%'
  const waterTreated = '1,240 L'
  const uvCycles = 8
  const valveClosures = 7

  // Maintenance log
  const maintenanceLog = [
    { date: '2025-03-20', action: 'Carbon filter replacement', tech: 'J. Nkemelu', status: 'Completed' },
    { date: '2025-03-18', action: 'UV lamp inspection', tech: 'A. Fongod', status: 'Completed' },
    { date: '2025-03-15', action: 'Tank deep cleaning', tech: 'J. Nkemelu', status: 'Pending' },
    { date: '2025-03-10', action: 'Primary sensor calibration', tech: 'A. Fongod', status: 'Overdue' },
  ]

  const getStatusColor = (status) => {
    if (status === 'Completed') return 'text-green-400'
    if (status === 'Pending') return 'text-amber-400'
    return 'text-red-400'
  }

  const exportCSV = () => {
    const csv = [
      ['Metric', 'Value'],
      ['Turbidity', `${turbidity} NTU`],
      ['pH', pH],
      ['Conductivity', `${conductivity} μS/cm`],
      ['Uptime', uptime],
      ['Water Treated', waterTreated],
      ['UV Cycles', uvCycles],
      ['Valve Closures', valveClosures],
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pureflow_export_${new Date().toISOString().slice(0,19)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mt-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
        <h3 className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">Technician overview</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="font-mono text-[8px] text-gray-500 uppercase">System uptime</div>
          <div className="font-mono text-xl font-bold text-green-400">{uptime}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="font-mono text-[8px] text-gray-500 uppercase">Water treated</div>
          <div className="font-mono text-xl font-bold text-blue-400">{waterTreated}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="font-mono text-[8px] text-gray-500 uppercase">UV cycles</div>
          <div className="font-mono text-xl font-bold text-amber-400">{uvCycles}</div>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
          <div className="font-mono text-[8px] text-gray-500 uppercase">Valve closures</div>
          <div className="font-mono text-xl font-bold text-red-400">{valveClosures}</div>
        </div>
      </div>

      {/* Maintenance Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left font-mono text-[9px] text-gray-500 py-2">Date</th>
              <th className="text-left font-mono text-[9px] text-gray-500 py-2">Action</th>
              <th className="text-left font-mono text-[9px] text-gray-500 py-2">Technician</th>
              <th className="text-left font-mono text-[9px] text-gray-500 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceLog.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-800/50">
                <td className="py-2 text-xs text-gray-400">{item.date}</td>
                <td className="py-2 text-xs text-gray-400">{item.action}</td>
                <td className="py-2 text-xs text-gray-400">{item.tech}</td>
                <td className={`py-2 text-xs font-mono ${getStatusColor(item.status)}`}>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Export Button */}
      <button 
        onClick={exportCSV}
        className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition text-xs font-mono"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 2v5M4 5l2 2 2-2M2 9v1h8V9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
        </svg>
        Export data (CSV)
      </button>
    </div>
  )
}