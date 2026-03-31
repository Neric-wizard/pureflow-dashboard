// src/components/Charts.jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function Charts({ data }) {
  // data should be array of { time, turbidity, pH }
  const chartData = data || []

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs">
          <p className="text-gray-400 font-mono mb-1">{label}</p>
          <p className="text-blue-400">Turbidity: {payload[0]?.value} NTU</p>
          <p className="text-amber-400">pH: {payload[1]?.value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Turbidity Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-[9px] text-gray-500 uppercase tracking-wider">Turbidity trend</div>
            <div className="text-xs text-gray-400">Last 24 hours (NTU)</div>
          </div>
          <div className="text-xs font-mono">
            <span className="text-blue-400">Current: {chartData[chartData.length - 1]?.turbidity || '--'} NTU</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={{ stroke: '#374151' }}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={{ stroke: '#374151' }}
              domain={[0, 20]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={4} stroke="#f0a000" strokeDasharray="3 3" label={{ value: 'Warning', fill: '#f0a000', fontSize: 9 }} />
            <ReferenceLine y={8} stroke="#e84545" strokeDasharray="3 3" label={{ value: 'Danger', fill: '#e84545', fontSize: 9 }} />
            <Line 
              type="monotone" 
              dataKey="turbidity" 
              stroke="#3d8ef0" 
              strokeWidth={2}
              dot={{ r: 2, fill: '#3d8ef0' }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-between mt-2 text-[9px] text-gray-600 font-mono">
          <span>✓ Safe: &lt;4 NTU</span>
          <span>⚠️ Warning: 4-8 NTU</span>
          <span>🔴 Danger: &gt;8 NTU</span>
        </div>
      </div>

      {/* pH Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-[9px] text-gray-500 uppercase tracking-wider">pH trend</div>
            <div className="text-xs text-gray-400">Last 24 hours</div>
          </div>
          <div className="text-xs font-mono">
            <span className="text-amber-400">Current: {chartData[chartData.length - 1]?.pH || '--'}</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={{ stroke: '#374151' }}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={{ stroke: '#374151' }}
              domain={[5, 9]}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={6.5} stroke="#f0a000" strokeDasharray="3 3" label={{ value: 'Min safe', fill: '#f0a000', fontSize: 9 }} />
            <ReferenceLine y={8.5} stroke="#f0a000" strokeDasharray="3 3" label={{ value: 'Max safe', fill: '#f0a000', fontSize: 9 }} />
            <Line 
              type="monotone" 
              dataKey="pH" 
              stroke="#f0a000" 
              strokeWidth={2}
              dot={{ r: 2, fill: '#f0a000' }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex justify-between mt-2 text-[9px] text-gray-600 font-mono">
          <span>✓ Safe: 6.5 – 8.5</span>
          <span>⚠️ Warning: outside range</span>
        </div>
      </div>
    </div>
  )
}