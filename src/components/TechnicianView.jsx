// src/components/TechnicianView.jsx
export default function TechnicianView({ sensors }) {
  const { turbidity, pH, conductivity } = sensors

  const maintenanceLog = [
    { date: '2025-03-20', action: 'Carbon filter replacement', tech: 'J. Nkemelu', status: 'Completed' },
    { date: '2025-03-18', action: 'UV lamp inspection', tech: 'A. Fongod', status: 'Completed' },
    { date: '2025-03-15', action: 'Tank deep cleaning', tech: 'J. Nkemelu', status: 'Pending' },
    { date: '2025-03-10', action: 'Primary sensor calibration', tech: 'A. Fongod', status: 'Overdue' },
  ]

  const getStatusColor = (status) => {
    if (status === 'Completed') return 'text-green-400 bg-green-500/10'
    if (status === 'Pending') return 'text-amber-400 bg-amber-500/10'
    return 'text-red-400 bg-red-500/10'
  }

  const exportCSV = () => {
    const csv = [['Metric', 'Value'], ['Turbidity', `${turbidity} NTU`], ['pH', pH], ['Conductivity', `${conductivity} μS/cm`], ['Uptime', '99.8%'], ['Water Treated', '1,240 L'], ['UV Cycles', '8'], ['Valve Closures', '7']].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pureflow_export_${new Date().toISOString().slice(0,19)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      <div className="relative bg-gradient-to-br from-zinc-900/80 to-gray-950/80 border border-white/10 rounded-2xl p-4 shadow-[0_0_30px_rgba(59,130,246,0.05),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.01] rounded-2xl transition-transform duration-700 group-hover:translate-x-6" />

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex h-2 w-2">
            <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-30"></div>
            <div className="relative inline-flex h-2 w-2 rounded-full bg-blue-500 opacity-60"></div>
          </div>
          <h3 className="font-mono text-[10px] text-gray-500 uppercase tracking-wider">Technician overview</h3>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <div className="bg-black/20 rounded-xl p-2 border border-white/5">
            <div className="font-mono text-[7px] text-gray-500 uppercase">System uptime</div>
            <div className="font-mono text-base font-bold text-green-400">99.8%</div>
          </div>
          <div className="bg-black/20 rounded-xl p-2 border border-white/5">
            <div className="font-mono text-[7px] text-gray-500 uppercase">Water treated</div>
            <div className="font-mono text-base font-bold text-blue-400">1,240 L</div>
          </div>
          <div className="bg-black/20 rounded-xl p-2 border border-white/5">
            <div className="font-mono text-[7px] text-gray-500 uppercase">UV cycles</div>
            <div className="font-mono text-base font-bold text-amber-400">8</div>
          </div>
          <div className="bg-black/20 rounded-xl p-2 border border-white/5">
            <div className="font-mono text-[7px] text-gray-500 uppercase">Valve closures</div>
            <div className="font-mono text-base font-bold text-red-400">7</div>
          </div>
        </div>

        {/* Maintenance Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left font-mono text-[8px] text-gray-500 py-2">Date</th>
                <th className="text-left font-mono text-[8px] text-gray-500 py-2">Action</th>
                <th className="text-left font-mono text-[8px] text-gray-500 py-2">Technician</th>
                <th className="text-left font-mono text-[8px] text-gray-500 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceLog.map((item, idx) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="py-2 text-[9px] text-gray-400">{item.date}</td>
                  <td className="py-2 text-[9px] text-gray-400">{item.action}</td>
                  <td className="py-2 text-[9px] text-gray-400">{item.tech}</td>
                  <td className={`py-2 text-[9px] font-mono px-2 rounded-full inline-block ${getStatusColor(item.status)}`}>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Export Button */}
        <button onClick={exportCSV} className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition-all duration-300 text-[9px] font-mono hover:scale-[1.02]">
          📥 Export data (CSV)
        </button>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-white/5">
          <div className="text-[6px] font-mono text-gray-600 text-center">LAST SYNC • JUST NOW • AES-256 ENCRYPTED</div>
        </div>
      </div>
    </div>
  )
}