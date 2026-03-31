import { useState, useEffect } from 'react'

function Header({ role, setRole, status, statusColor, statusText, time }) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2C9 2 3.5 8 3.5 11.5a5.5 5.5 0 0011 0C14.5 8 9 2 9 2z" fill="rgba(61,142,240,0.25)" stroke="#3d8ef0" strokeWidth="1.3"/>
            <path d="M6.5 12.5c.5 1.5 2 2 3 1.5" stroke="#1fd18a" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="font-mono text-sm font-bold">
            <span className="text-white">Pure</span><span className="text-blue-400">FLOW</span>
          </h1>
          <p className="text-[10px] text-gray-500">Smart water sterilization system</p>
        </div>
      </div>

      {/* Status Pill */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusColor}`}>
        <div className={`w-2 h-2 rounded-full ${status === 'danger' ? 'bg-red-500 animate-pulse' : status === 'warning' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
        <span className="font-mono text-xs font-bold">{statusText}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
          <span className="font-mono text-[10px] text-green-400">LIVE</span>
        </div>
        <div className="text-[10px] font-mono text-gray-500">
          Updated: {time.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}
        </div>
        <div className="flex bg-gray-800 rounded-lg p-0.5">
          <button 
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${role === 'household' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}
            onClick={() => setRole('household')}
          >
            Household
          </button>
          <button 
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${role === 'technician' ? 'bg-blue-500 text-white' : 'text-gray-400'}`}
            onClick={() => setRole('technician')}
          >
            Technician
          </button>
        </div>
      </div>
    </header>
  )
}

function App() {
  const [role, setRole] = useState('household')
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Temporary status for now — will come from Firebase later
  const status = 'danger' // 'danger', 'warning', 'safe'
  const statusColor = status === 'danger' ? 'border-red-500/50 bg-red-500/10' : status === 'warning' ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-green-500/50 bg-green-500/10'
  const statusText = status === 'danger' ? 'CONTAMINATION DETECTED' : status === 'warning' ? 'MODERATE — UV STANDBY' : 'ALL CLEAR — FLOW ALLOWED'

  return (
    <div className="min-h-screen bg-gray-950">
      <Header 
        role={role} 
        setRole={setRole} 
        status={status}
        statusColor={statusColor}
        statusText={statusText}
        time={time}
      />
      <main className="p-5">
        <div className="text-center text-gray-500 mt-20">
          <p>Dashboard components coming soon...</p>
          <p className="text-xs mt-2">Role: {role}</p>
        </div>
      </main>
    </div>
  )
}

export default App