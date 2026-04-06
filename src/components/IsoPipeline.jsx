// src/components/IsoPipeline.jsx
// ─────────────────────────────────────────────────────────────────
// 12-stage 3D isometric pipeline with premium glassmorphism
// Confirmed flow order:
// Inlet → Sediment → Chlorine → Tank → Manual Valve →
// Carbon → Sensors → Decision → UV → Sampling → Output Valve → Supply
// ─────────────────────────────────────────────────────────────────

import { useMemo } from 'react'

function uvMode(turbidity) {
  if (turbidity > 8) return 'FULL'
  if (turbidity >= 4) return 'STANDBY'
  return 'OFF'
}

function decisionColor(mode) {
  if (mode === 'FULL') return { fill: '#1a0808', stroke: 'rgba(232,69,69,0.6)', text: '#e84545', sub: '#803030', subText: 'UV Full Power' }
  if (mode === 'STANDBY') return { fill: '#1a1200', stroke: 'rgba(240,160,0,0.6)', text: '#f0a000', sub: '#806000', subText: 'UV Standby' }
  return { fill: '#071a10', stroke: 'rgba(31,209,138,0.6)', text: '#1fd18a', sub: '#1a6b40', subText: 'UV Off' }
}

function outputValveStatus(safe) {
  if (safe) return { text: 'OPEN', color: '#1fd18a', fill: '#071a10', stroke: 'rgba(31,209,138,0.6)' }
  return { text: 'CLOSED', color: '#e84545', fill: '#1a0808', stroke: 'rgba(232,69,69,0.6)' }
}

function supplyColor(safe) {
  return safe
    ? { fill: '#071a10', stroke: 'rgba(31,209,138,0.6)', text: '#1fd18a', sub: '#1a6b40', subText: 'Safe water flowing' }
    : { fill: '#1a1200', stroke: 'rgba(240,160,0,0.6)', text: '#f0a000', sub: '#806000', subText: 'Valve closed — unsafe' }
}

// Stage status tags and tooltips
const stageInfo = {
  1: { name: 'Water Inlet', status: 'INFLOW', tooltip: 'Raw water enters from source', description: 'Initial water intake from municipal supply or well' },
  2: { name: 'Sediment Filter', status: 'FILTERING', tooltip: 'Removes dirt, sand, rust', description: '5-micron sediment filter — catches physical particles' },
  3: { name: 'Chlorine Chamber', status: 'TREATING', tooltip: 'Disinfection with chlorine', description: 'Kills bacteria and microorganisms' },
  4: { name: 'Tank Storage', status: 'MIXING', tooltip: 'Storage and contact time', description: 'Allows chlorine time to disinfect' },
  5: { name: 'Manual Valve', status: 'STANDBY', tooltip: 'Hand-operated isolation valve', description: 'For maintenance — manually operated' },
  6: { name: 'Carbon Filter', status: 'FILTERING', tooltip: 'Removes chlorine, taste, odor', description: 'Activated carbon improves taste and smell' },
  7: { name: 'Sensors', status: 'MONITORING', tooltip: 'Measures turbidity, pH, conductivity', description: 'Real-time water quality monitoring' },
  8: { name: 'Decision Point', status: 'ACTIVE', tooltip: 'ESP32 logic decision', description: 'Determines UV activation based on sensor data' },
  9: { name: 'UV Sterilizer', status: 'ACTIVE', tooltip: 'Ultraviolet disinfection', description: 'UV-C light kills remaining microorganisms' },
  10: { name: 'Sampling', status: 'VERIFYING', tooltip: 'Secondary sensor check', description: 'Confirms water quality after UV treatment' },
  11: { name: 'Output Valve', status: 'SAFETY', tooltip: 'ESP32-controlled safety valve', description: 'Blocks unsafe water from reaching home' },
  12: { name: 'Household Supply', status: 'DISPENSING', tooltip: 'Clean water to taps', description: 'Safe drinking water ready for use' },
}

export default function IsoPipeline({ sensors }) {
  const { turbidity = 12.3, pH = 6.1, temperature = 29.1, conductivity = 320 } = sensors || {}

  // Memoized calculations for performance
  const pipelineState = useMemo(() => {
    const mode = uvMode(turbidity)
    const secT = parseFloat((turbidity * 0.25).toFixed(1))
    const pHOk = pH >= 6.5 && pH <= 8.5
    const safe = secT < 4 && pHOk
    const reduction = ((turbidity - secT) / turbidity * 100).toFixed(0)
    return { mode, secT, pHOk, safe, reduction }
  }, [turbidity, pH])

  const { mode, secT, safe, reduction } = pipelineState
  const dc = decisionColor(mode)
  const ov = outputValveStatus(safe)
  const sc = supplyColor(safe)

  const uvBadge = mode === 'FULL' ? 'FULL PWR' : mode === 'STANDBY' ? 'STANDBY' : 'OFF'
  const uvBadgeFill = mode === 'FULL' ? 'rgba(232,69,69,0.2)' : mode === 'STANDBY' ? 'rgba(240,160,0,0.2)' : 'rgba(31,209,138,0.2)'
  const uvBadgeStroke = mode === 'FULL' ? 'rgba(232,69,69,0.5)' : mode === 'STANDBY' ? 'rgba(240,160,0,0.5)' : 'rgba(31,209,138,0.5)'
  const uvBadgeColor = mode === 'FULL' ? '#e84545' : mode === 'STANDBY' ? '#f0a000' : '#1fd18a'
  const uvSubText = mode === 'FULL' ? 'Full power active' : mode === 'STANDBY' ? 'Standby mode' : 'Off — water clear'

  // Flow animation speed based on water safety
  const flowSpeed = safe ? '0.6s' : '1s'

  // Arrow marker for pipes
  const arrowMarker = (color, id) => (
    <marker id={`arrow-${id}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill={color} />
    </marker>
  )

  return (
    <div className="group relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      <div className="relative bg-gradient-to-br from-zinc-900/80 to-gray-950/80 border border-white/10 rounded-2xl p-4 shadow-[0_0_30px_rgba(59,130,246,0.05),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/[0.02] via-transparent to-white/[0.01] rounded-2xl transition-transform duration-700 group-hover:translate-x-6" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="relative flex h-2 w-2">
                <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-30"></div>
                <div className="relative inline-flex h-2 w-2 rounded-full bg-blue-500 opacity-60"></div>
              </div>
              <p className="font-mono text-[9px] text-gray-500 uppercase tracking-wider">
                Live water treatment pipeline · 12 stages
              </p>
            </div>
            <p className="text-[8px] text-gray-600 mt-0.5 ml-4">
              Water inlet → household supply · Confirmed flow
            </p>
          </div>
        </div>

        {/* Before/After Water Quality Comparison */}
        <div className="mb-3 p-2 bg-black/20 rounded-lg border border-white/5">
          <div className="flex items-center justify-between text-[8px] font-mono">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-gray-500">Inlet:</span>
                <span className={`ml-1 ${turbidity > 8 ? 'text-red-400' : turbidity > 4 ? 'text-amber-400' : 'text-green-400'}`}>
                  {turbidity.toFixed(1)} NTU
                </span>
              </div>
              <span className="text-gray-600">→</span>
              <div>
                <span className="text-gray-500">Outlet:</span>
                <span className={`ml-1 ${secT < 4 ? 'text-green-400' : 'text-amber-400'}`}>
                  {secT.toFixed(1)} NTU
                </span>
              </div>
              <div className="text-emerald-400">
                ↓ {reduction}% reduction
              </div>
            </div>
            <div className="text-gray-600">
              {safe ? '✅ Water safe for consumption' : '⚠️ Treatment in progress'}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-2 flex-wrap mb-3">
          {[
            { color: '#e84545', label: 'Contaminated' },
            { color: '#3d8ef0', label: 'Treating' },
            { color: '#1fd18a', label: 'Safe' },
            { color: '#f0a000', label: 'Filtering' },
            { color: '#a78bfa', label: 'Manual valve' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
              <span className="font-mono text-[7px] text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {/* SVG Pipeline */}
        <div className="overflow-x-auto">
          <svg style={{ minWidth: '700px', width: '100%' }} viewBox="0 0 720 580" fill="none">
            
            {/* Arrow markers */}
            <defs>
              {arrowMarker('rgba(232,69,69,0.7)', 'red')}
              {arrowMarker('rgba(61,142,240,0.7)', 'blue')}
              {arrowMarker('rgba(31,209,138,0.7)', 'green')}
              {arrowMarker('rgba(240,160,0,0.7)', 'amber')}
            </defs>
            
            {/* Stage 1: Water Inlet */}
            <g className="animate-fade-in-up hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 cursor-help" style={{ animationDelay: '0ms' }}>
              <polygon points="60,40 120,20 180,40 120,60" fill="#0a1830" stroke="rgba(61,142,240,0.5)" strokeWidth="0.8"/>
              <polygon points="60,40 120,60 120,90 60,70" fill="#071020" stroke="rgba(61,142,240,0.3)" strokeWidth="0.8"/>
              <polygon points="120,60 180,40 180,70 120,90" fill="#0c1a35" stroke="rgba(61,142,240,0.4)" strokeWidth="0.8"/>
              <text x="120" y="43" textAnchor="middle" fontSize="7" fill="#3d8ef0" fontFamily="JetBrains Mono,monospace" fontWeight="700">① INLET</text>
              <text x="120" y="54" textAnchor="middle" fontSize="6" fill="#3d5a80" fontFamily="DM Sans,sans-serif">Raw water</text>
              <rect x="70" y="73" width="36" height="10" rx="2" fill="#1fd18a/10" stroke="#1fd18a/30" strokeWidth="0.5"/>
              <text x="88" y="80" textAnchor="middle" fontSize="5" fill="#1fd18a" fontFamily="JetBrains Mono,monospace">{stageInfo[1].status}</text>
              <title>{stageInfo[1].tooltip}\n{stageInfo[1].description}</title>
            </g>

            {/* pipe → Sediment - with arrow and blue gradient */}
            <rect x="180" y="35" width="38" height="8" rx="2" fill="url(#waterFlowRed)" stroke="rgba(232,69,69,0.25)" strokeWidth="0.5"/>
            <rect x="180" y="35" width="38" height="8" rx="2" fill="none" stroke="rgba(232,69,69,0.7)" strokeWidth="0.5" strokeDasharray="4 3" className="flow-red" style={{ animationDuration: flowSpeed }} markerEnd="url(#arrow-red)"/>
            <polygon points="216,35 222,39 216,43" fill="rgba(232,69,69,0.6)"/>

            {/* Stage 2: Sediment Filter */}
            <g className="animate-fade-in-up hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 cursor-help" style={{ animationDelay: '100ms' }}>
              <polygon points="228,40 288,20 348,40 288,60" fill="#131000" stroke="rgba(240,160,0,0.55)" strokeWidth="0.8"/>
              <polygon points="228,40 288,60 288,95 228,75" fill="#0e0c00" stroke="rgba(240,160,0,0.3)" strokeWidth="0.8"/>
              <polygon points="288,60 348,40 348,75 288,95" fill="#181400" stroke="rgba(240,160,0,0.4)" strokeWidth="0.8"/>
              <text x="288" y="43" textAnchor="middle" fontSize="7" fill="#f0a000" fontFamily="JetBrains Mono,monospace" fontWeight="700">② SEDIMENT</text>
              <text x="288" y="53" textAnchor="middle" fontSize="6" fill="#806000" fontFamily="DM Sans,sans-serif">Filter · catches dirt</text>
              <rect x="255" y="78" width="36" height="10" rx="2" fill="#f0a000/10" stroke="#f0a000/30" strokeWidth="0.5"/>
              <text x="273" y="85" textAnchor="middle" fontSize="5" fill="#f0a000" fontFamily="JetBrains Mono,monospace">{stageInfo[2].status}</text>
              <title>{stageInfo[2].tooltip}\n{stageInfo[2].description}</title>
            </g>

            {/* pipe → Chlorine */}
            <rect x="348" y="35" width="38" height="8" rx="2" fill="url(#waterFlowRed)" stroke="rgba(232,69,69,0.25)" strokeWidth="0.5"/>
            <rect x="348" y="35" width="38" height="8" rx="2" fill="none" stroke="rgba(232,69,69,0.7)" strokeWidth="0.5" strokeDasharray="4 3" className="flow-red" style={{ animationDuration: flowSpeed }} markerEnd="url(#arrow-red)"/>
            <polygon points="384,35 390,39 384,43" fill="rgba(232,69,69,0.6)"/>

            {/* Stage 3: Chlorine */}
            <g className="animate-fade-in-up hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 cursor-help" style={{ animationDelay: '200ms' }}>
              <polygon points="396,40 456,20 516,40 456,60" fill="#071a10" stroke="rgba(31,209,138,0.5)" strokeWidth="0.8"/>
              <polygon points="396,40 456,60 456,95 396,75" fill="#051210" stroke="rgba(31,209,138,0.3)" strokeWidth="0.8"/>
              <polygon points="456,60 516,40 516,75 456,95" fill="#092015" stroke="rgba(31,209,138,0.4)" strokeWidth="0.8"/>
              <text x="456" y="43" textAnchor="middle" fontSize="7" fill="#1fd18a" fontFamily="JetBrains Mono,monospace" fontWeight="700">③ CHLORINE</text>
              <text x="456" y="53" textAnchor="middle" fontSize="6" fill="#1a6b40" fontFamily="DM Sans,sans-serif">Diffusion chamber</text>
              <rect x="423" y="78" width="36" height="10" rx="2" fill="#1fd18a/10" stroke="#1fd18a/30" strokeWidth="0.5"/>
              <text x="441" y="85" textAnchor="middle" fontSize="5" fill="#1fd18a" fontFamily="JetBrains Mono,monospace">{stageInfo[3].status}</text>
              <circle cx="426" cy="80" r="7" fill="rgba(31,209,138,0.15)" stroke="rgba(31,209,138,0.5)" strokeWidth="0.8"/>
              <text x="426" y="83" textAnchor="middle" fontSize="6.5" fill="#1fd18a" fontFamily="JetBrains Mono,monospace" fontWeight="700">Cl</text>
              <title>{stageInfo[3].tooltip}\n{stageInfo[3].description}</title>
            </g>

            {/* pipe down → Tank */}
            <rect x="451" y="95" width="8" height="30" rx="2" fill="url(#waterFlowRed)" stroke="rgba(232,69,69,0.25)" strokeWidth="0.5"/>
            <rect x="451" y="95" width="8" height="30" rx="2" fill="none" stroke="rgba(232,69,69,0.7)" strokeWidth="0.5" strokeDasharray="4 3" className="flow-red" style={{ animationDuration: flowSpeed }} markerEnd="url(#arrow-red)"/>
            <polygon points="448,123 456,131 464,123" fill="rgba(232,69,69,0.6)"/>

            {/* Stage 4: Tank - WITH WATER WAVE */}
            <g className="animate-fade-in-up hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 cursor-help" style={{ animationDelay: '300ms' }}>
              <polygon points="396,148 456,128 516,148 456,168" fill="#0a1520" stroke="rgba(61,142,240,0.45)" strokeWidth="0.8"/>
              <polygon points="396,148 456,168 456,210 396,190" fill="#071020" stroke="rgba(61,142,240,0.3)" strokeWidth="0.8"/>
              <polygon points="456,168 516,148 516,190 456,210" fill="#0c1a35" stroke="rgba(61,142,240,0.4)" strokeWidth="0.8"/>
              <text x="456" y="151" textAnchor="middle" fontSize="7" fill="#3d8ef0" fontFamily="JetBrains Mono,monospace" fontWeight="700">④ TANK</text>
              <text x="456" y="161" textAnchor="middle" fontSize="6" fill="#1a3860" fontFamily="DM Sans,sans-serif">Storage + mixing</text>
              <rect x="423" y="185" width="36" height="10" rx="2" fill="#3d8ef0/10" stroke="#3d8ef0/30" strokeWidth="0.5"/>
              <text x="441" y="192" textAnchor="middle" fontSize="5" fill="#3d8ef0" fontFamily="JetBrains Mono,monospace">{stageInfo[4].status}</text>
              
              {/* Water wave inside tank */}
              <rect x="416" y="180" width="32" height="20" rx="2" fill="rgba(61,142,240,0.15)" stroke="rgba(61,142,240,0.3)" strokeWidth="0.5"/>
              <path d="M416 192 Q424 188, 432 192 T448 192" fill="none" stroke="#3d8ef0" strokeWidth="1" className="water-wave"/>
              
              <title>{stageInfo[4].tooltip}\n{stageInfo[4].description}</title>
            </g>

            {/* pipe left → Manual Valve */}
            <rect x="328" y="161" width="64" height="8" rx="2" fill="url(#waterFlowRed)" stroke="rgba(232,69,69,0.25)" strokeWidth="0.5"/>
            <rect x="328" y="161" width="64" height="8" rx="2" fill="none" stroke="rgba(232,69,69,0.7)" strokeWidth="0.5" strokeDasharray="4 3" className="flow-red" style={{ animationDuration: flowSpeed }} markerEnd="url(#arrow-red)"/>
            <polygon points="332,161 326,165 332,169" fill="rgba(232,69,69,0.6)"/>

            {/* Stage 5: Manual Valve */}
            <g className="animate-fade-in-up hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 cursor-help" style={{ animationDelay: '400ms' }}>
              <polygon points="216,148 276,128 336,148 276,168" fill="#110a1a" stroke="rgba(167,139,250,0.55)" strokeWidth="0.8"/>
              <polygon points="216,148 276,168 276,200 216,180" fill="#0c0714" stroke="rgba(167,139,250,0.3)" strokeWidth="0.8"/>
              <polygon points="276,168 336,148 336,180 276,200" fill="#140b22" stroke="rgba(167,139,250,0.4)" strokeWidth="0.8"/>
              <text x="276" y="151" textAnchor="middle" fontSize="7" fill="#a78bfa" fontFamily="JetBrains Mono,monospace" fontWeight="700">⑤ MANUAL VALVE</text>
              <text x="276" y="161" textAnchor="middle" fontSize="6" fill="#6d5a9e" fontFamily="DM Sans,sans-serif">Hand-operated</text>
              <rect x="243" y="185" width="36" height="10" rx="2" fill="#a78bfa/10" stroke="#a78bfa/30" strokeWidth="0.5"/>
              <text x="261" y="192" textAnchor="middle" fontSize="5" fill="#a78bfa" fontFamily="JetBrains Mono,monospace">{stageInfo[5].status}</text>
              <circle cx="246" cy="184" r="7" fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth="1"/>
              <line x1="239" y1="184" x2="253" y2="184" stroke="#a78bfa" strokeWidth="0.8"/>
              <line x1="246" y1="177" x2="246" y2="191" stroke="#a78bfa" strokeWidth="0.8"/>
              <title>{stageInfo[5].tooltip}\n{stageInfo[5].description}</title>
            </g>

            {/* pipe down → Carbon */}
            <rect x="271" y="200" width="8" height="30" rx="2" fill="url(#waterFlowAmber)" stroke="rgba(240,160,0,0.25)" strokeWidth="0.5"/>
            <rect x="271" y="200" width="8" height="30" rx="2" fill="none" stroke="rgba(240,160,0,0.7)" strokeWidth="0.5" strokeDasharray="4 3" className="flow-amber" style={{ animationDuration: flowSpeed }} markerEnd="url(#arrow-amber)"/>
            <polygon points="268,228 276,236 284,228" fill="rgba(240,160,0,0.6)"/>

            {/* Stage 6: Carbon */}
            <g className="animate-fade-in-up hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 cursor-help" style={{ animationDelay: '500ms' }}>
              <polygon points="216,253 276,233 336,253 276,273" fill="#131000" stroke="rgba(240,160,0,0.5)" strokeWidth="0.8"/>
              <polygon points="216,253 276,273 276,305 216,285" fill="#0e0c00" stroke="rgba(240,160,0,0.3)" strokeWidth="0.8"/>
              <polygon points="276,273 336,253 336,285 276,305" fill="#181400" stroke="rgba(240,160,0,0.4)" strokeWidth="0.8"/>
              <text x="276" y="256" textAnchor="middle" fontSize="7" fill="#f0a000" fontFamily="JetBrains Mono,monospace" fontWeight="700">⑥ CARBON</text>
              <text x="276" y="266" textAnchor="middle" fontSize="6" fill="#806000" fontFamily="DM Sans,sans-serif">Filter · removes impurities</text>
              <rect x="243" y="290" width="36" height="10" rx="2" fill="#f0a000/10" stroke="#f0a000/30" strokeWidth="0.5"/>
              <text x="261" y="297" textAnchor="middle" fontSize="5" fill="#f0a000" fontFamily="JetBrains Mono,monospace">{stageInfo[6].status}</text>
              <rect x="240" y="284" width="6" height="16" rx="2" fill="rgba(240,160,0,0.2)" stroke="rgba(240,160,0,0.4)" strokeWidth="0.5"/>
              <rect x="250" y="284" width="6" height="16" rx="2" fill="rgba(240,160,0,0.2)" stroke="rgba(240,160,0,0.4)" strokeWidth="0.5"/>
              <title>{stageInfo[6].tooltip}\n{stageInfo[6].description}</title>
            </g>

            {/* pipe right → Sensors */}
            <rect x="336" y="266" width="56" height="8" rx="2" fill="url(#waterFlowBlue)" stroke="rgba(61,142,240,0.25)" strokeWidth="0.5"/>
            <rect x="336" y="266" width="56" height="8" rx="2" fill="none" stroke="rgba(61,142,240,0.7)" strokeWidth="0.5" strokeDasharray="4 3" className="flow-blue" style={{ animationDuration: flowSpeed }} markerEnd="url(#arrow-blue)"/>
            <polygon points="390,266 396,270 390,274" fill="rgba(61,142,240,0.6)"/>

            {/* Stage 7: Sensors */}
            <g className="animate-fade-in-up hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 cursor-help" style={{ animationDelay: '600ms' }}>
              <polygon points="400,253 460,233 520,253 460,273" fill="#0a1520" stroke="rgba(61,142,240,0.65)" strokeWidth="0.8"/>
              <polygon points="400,253 460,273 460,308 400,288" fill="#071020" stroke="rgba(61,142,240,0.35)" strokeWidth="0.8"/>
              <polygon points="460,273 520,253 520,288 460,308" fill="#0c1a35" stroke="rgba(61,142,240,0.5)" strokeWidth="0.8"/>
              <text x="460" y="256" textAnchor="middle" fontSize="7" fill="#3d8ef0" fontFamily="JetBrains Mono,monospace" fontWeight="700">⑦ SENSORS</text>
              <text x="460" y="266" textAnchor="middle" fontSize="6" fill="#1a3860" fontFamily="DM Sans,sans-serif">Primary chamber</text>
              <rect x="427" y="290" width="36" height="10" rx="2" fill="#3d8ef0/10" stroke="#3d8ef0/30" strokeWidth="0.5"/>
              <text x="445" y="297" textAnchor="middle" fontSize="5" fill="#3d8ef0" fontFamily="JetBrains Mono,monospace">{stageInfo[7].status}</text>
              <text x="410" y="286" fontSize="6" fill={turbidity > 8 ? '#e84545' : turbidity > 4 ? '#f0a000' : '#1fd18a'} fontFamily="JetBrains Mono,monospace">T:{turbidity.toFixed(1)}</text>
              <text x="410" y="295" fontSize="6" fill={!pipelineState.pHOk ? '#f0a000' : '#1fd18a'} fontFamily="JetBrains Mono,monospace">pH:{pH.toFixed(1)}</text>
              <text x="410" y="304" fontSize="6" fill={conductivity > 500 ? '#f0a000' : '#1fd18a'} fontFamily="JetBrains Mono,monospace">C:{Math.round(conductivity)}</text>
              <circle cx="500" cy="285" r="4" fill="rgba(61,142,240,0.2)" stroke="#3d8ef0" strokeWidth="0.8"/>
              <circle cx="500" cy="285" r="1.5" fill="#3d8ef0"/>
              <title>{stageInfo[7].tooltip}\n{stageInfo[7].description}</title>
            </g>

            {/* pipe down → Decision */}
            <rect x="455" y="308" width="8" height="30" rx="2" fill="url(#waterFlowRed)" stroke="rgba(232,69,69,0.25)" strokeWidth="0.5"/>
            <rect x="455" y="308" width="8" height="30" rx="2" fill="none" stroke="rgba(232,69,69,0.7)" strokeWidth="0.5" strokeDasharray="4 3" className="flow-red" style={{ animationDuration: flowSpeed }} markerEnd="url(#arrow-red)"/>
            <polygon points="452,336 460,344 468,336" fill="rgba(232,69,69,0.6)"/>

            {/* Stage 8: Decision */}
            <g className="animate-fade-in-up hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 cursor-help" style={{ animationDelay: '700ms' }}>
              <polygon points="400,360 460,343 520,360 460,377" fill={dc.fill} stroke={dc.stroke} strokeWidth="0.8" strokeDasharray="4 2"/>
              <polygon points="400,360 460,377 460,400 400,383" fill={dc.fill === '#1a0808' ? '#120505' : dc.fill === '#1a1200' ? '#120e00' : '#051210'} stroke={dc.stroke} strokeWidth="0.8" strokeDasharray="4 2"/>
              <polygon points="460,377 520,360 520,383 460,400" fill={dc.fill === '#1a0808' ? '#170707' : dc.fill === '#1a1200' ? '#181200' : '#092015'} stroke={dc.stroke} strokeWidth="0.8" strokeDasharray="4 2"/>
              <text x="460" y="363" textAnchor="middle" fontSize="7" fill={dc.text} fontFamily="JetBrains Mono,monospace" fontWeight="700">⑧ DECISION</text>
              <text x="460" y="373" textAnchor="middle" fontSize="6" fill={dc.sub} fontFamily="DM Sans,sans-serif">{dc.subText}</text>
              <rect x="427" y="385" width="36" height="10" rx="2" fill={dc.text + '/10'} stroke={dc.text + '/30'} strokeWidth="0.5"/>
              <text x="445" y="392" textAnchor="middle" fontSize="5" fill={dc.text} fontFamily="JetBrains Mono,monospace">{stageInfo[8].status}</text>
              <path d="M428 390 L435 379 L442 390 Z" fill={`${dc.fill}88`} stroke={dc.stroke} strokeWidth="0.6"/>
              <text x="435" y="388" textAnchor="middle" fontSize="5" fill={dc.text}>!</text>
              <title>{stageInfo[8].tooltip}\n{stageInfo[8].description}</title>
            </g>

            {/* pipe right → UV */}
            <rect x="520" y="373" width="44" height="8" rx="2" fill="url(#waterFlowBlue)" stroke="rgba(61,142,240,0.25)" strokeWidth="0.5"/>
            <rect x="520" y="373" width="44" height="8" rx="2" fill="none" stroke="rgba(61,142,240,0.7)" strokeWidth="0.5" strokeDasharray="4 3" className="flow-blue" style={{ animationDuration: flowSpeed }} markerEnd="url(#arrow-blue)"/>
            <polygon points="562,373 568,377 562,381" fill="rgba(61,142,240,0.6)"/>

            {/* Stage 9: UV Sterilizer */}
            <g className="animate-fade-in-up hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 cursor-help" style={{ animationDelay: '800ms' }}>
              <polygon points="572,360 632,343 692,360 632,377" fill="#071428" stroke="rgba(61,142,240,0.7)" strokeWidth="0.9"/>
              <polygon points="572,360 632,377 632,407 572,390" fill="#050e20" stroke="rgba(61,142,240,0.4)" strokeWidth="0.8"/>
              <polygon points="632,377 692,360 692,390 632,407" fill="#091830" stroke="rgba(61,142,240,0.6)" strokeWidth="0.8"/>
              <text x="632" y="363" textAnchor="middle" fontSize="7" fill="#3d8ef0" fontFamily="JetBrains Mono,monospace" fontWeight="700">⑨ UV STERILIZER</text>
              <text x="632" y="373" textAnchor="middle" fontSize="6" fill="#1a3860" fontFamily="DM Sans,sans-serif">{uvSubText}</text>
              <rect x="599" y="385" width="36" height="10" rx="2" fill="#3d8ef0/10" stroke="#3d8ef0/30" strokeWidth="0.5"/>
              <text x="617" y="392" textAnchor="middle" fontSize="5" fill="#3d8ef0" fontFamily="JetBrains Mono,monospace">{stageInfo[9].status}</text>
              <circle cx="596" cy="392" r="8" fill="rgba(61,142,240,0.1)" stroke="rgba(61,142,240,0.3)" strokeWidth="0.8" className="uv-glow"/>
              <circle cx="596" cy="392" r="5" fill="rgba(61,142,240,0.2)" stroke="#3d8ef0" strokeWidth="1" className="uv-glow"/>
              <rect x="613" y="396" width="36" height="10" rx="3" fill={uvBadgeFill} stroke={uvBadgeStroke} strokeWidth="0.5"/>
              <text x="631" y="403" textAnchor="middle" fontSize="6" fill={uvBadgeColor} fontFamily="JetBrains Mono,monospace" fontWeight="700">{uvBadge}</text>
              <title>{stageInfo[9].tooltip}\n{stageInfo[9].description}</title>
            </g>

            {/* pipe down → Sampling */}
            <rect x="627" y="407" width="8" height="30" rx="2" fill="url(#waterFlowBlue)" stroke="rgba(61,142,240,0.25)" strokeWidth="0.5"/>
            <rect x="627" y="407" width="8" height="30" rx="2" fill="none" stroke="rgba(61,142,240,0.7)" strokeWidth="0.5" strokeDasharray="4 3" className="flow-blue" style={{ animationDuration: flowSpeed }} markerEnd="url(#arrow-blue)"/>
            <polygon points="624,435 632,443 640,435" fill="rgba(61,142,240,0.6)"/>

            {/* Stage 10: Sampling */}
            <g className="animate-fade-in-up hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 cursor-help" style={{ animationDelay: '900ms' }}>
              <polygon points="572,460 632,443 692,460 632,477" fill="#0a1520" stroke="rgba(61,142,240,0.5)" strokeWidth="0.8"/>
              <polygon points="572,460 632,477 632,507 572,490" fill="#071020" stroke="rgba(61,142,240,0.3)" strokeWidth="0.8"/>
              <polygon points="632,477 692,460 692,490 632,507" fill="#0c1a35" stroke="rgba(61,142,240,0.4)" strokeWidth="0.8"/>
              <text x="632" y="463" textAnchor="middle" fontSize="7" fill="#3d8ef0" fontFamily="JetBrains Mono,monospace" fontWeight="700">⑩ SAMPLING</text>
              <text x="632" y="473" textAnchor="middle" fontSize="6" fill="#1a3860" fontFamily="DM Sans,sans-serif">Secondary sensors</text>
              <rect x="599" y="485" width="36" height="10" rx="2" fill="#3d8ef0/10" stroke="#3d8ef0/30" strokeWidth="0.5"/>
              <text x="617" y="492" textAnchor="middle" fontSize="5" fill="#3d8ef0" fontFamily="JetBrains Mono,monospace">{stageInfo[10].status}</text>
              <circle cx="592" cy="492" r="7" fill="rgba(31,209,138,0.15)" stroke="rgba(31,209,138,0.4)" strokeWidth="0.8"/>
              <path d="M589 492 L592 495 L597 489" stroke="#1fd18a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <text x="607" y="490" fontSize="6" fill="#1fd18a" fontFamily="JetBrains Mono,monospace">Post:{secT}NTU</text>
              <text x="607" y="499" fontSize="6" fill={safe ? '#1fd18a' : '#f0a000'} fontFamily="JetBrains Mono,monospace">{safe ? 'VERIFIED ✓' : 'CHECKING...'}</text>
              <title>{stageInfo[10].tooltip}\n{stageInfo[10].description}</title>
            </g>

            {/* pipe left → Output Valve */}
            <rect x="392" y="473" width="176" height="8" rx="2" fill={safe ? 'url(#waterFlowGreen)' : 'url(#waterFlowRed)'} stroke="rgba(31,209,138,0.25)" strokeWidth="0.5"/>
            <rect x="392" y="473" width="176" height="8" rx="2" fill="none" stroke={safe ? 'rgba(31,209,138,0.7)' : 'rgba(232,69,69,0.7)'} strokeWidth="0.5" strokeDasharray="4 3" className={safe ? 'flow-green' : 'flow-red'} style={{ animationDuration: flowSpeed }} markerEnd={safe ? "url(#arrow-green)" : "url(#arrow-red)"}/>
            <polygon points="396,473 390,477 396,481" fill={safe ? 'rgba(31,209,138,0.7)' : 'rgba(232,69,69,0.7)'}/>

            {/* Stage 11: Output Valve */}
            <g className="animate-fade-in-up hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 cursor-help" style={{ animationDelay: '1000ms' }}>
              <polygon points="216,460 276,443 336,460 276,477" fill={ov.fill} stroke={ov.stroke} strokeWidth="0.9"/>
              <polygon points="216,460 276,477 276,510 216,493" fill={safe ? '#051210' : '#120505'} stroke={safe ? 'rgba(31,209,138,0.35)' : 'rgba(232,69,69,0.35)'} strokeWidth="0.8"/>
              <polygon points="276,477 336,460 336,493 276,510" fill={safe ? '#092015' : '#170707'} stroke={safe ? 'rgba(31,209,138,0.5)' : 'rgba(232,69,69,0.5)'} strokeWidth="0.8"/>
              <text x="276" y="463" textAnchor="middle" fontSize="7" fill={ov.color} fontFamily="JetBrains Mono,monospace" fontWeight="700">⑪ OUTPUT VALVE</text>
              <text x="276" y="473" textAnchor="middle" fontSize="6" fill={safe ? '#1a6b40' : '#803030'} fontFamily="DM Sans,sans-serif">{safe ? 'SAFE — OPEN' : 'UNSAFE — CLOSED'}</text>
              <rect x="243" y="485" width="36" height="10" rx="2" fill={ov.color + '/10'} stroke={ov.color + '/30'} strokeWidth="0.5"/>
              <text x="261" y="492" textAnchor="middle" fontSize="5" fill={ov.color} fontFamily="JetBrains Mono,monospace">{stageInfo[11].status}</text>
              <circle cx="246" cy="492" r="6" fill="none" stroke={ov.color} strokeWidth="1"/>
              <line x1="240" y1="492" x2="252" y2="492" stroke={ov.color} strokeWidth="0.8"/>
              <line x1="246" y1="486" x2="246" y2="498" stroke={ov.color} strokeWidth="0.8"/>
              <title>{stageInfo[11].tooltip}\n{stageInfo[11].description}</title>
            </g>

            {/* pipe left → Supply */}
            <rect x="336" y="473" width="56" height="8" rx="2" fill={safe ? 'url(#waterFlowGreen)' : 'url(#waterFlowAmber)'} stroke="rgba(31,209,138,0.25)" strokeWidth="0.5"/>
            <rect x="336" y="473" width="56" height="8" rx="2" fill="none" stroke={safe ? 'rgba(31,209,138,0.7)' : 'rgba(240,160,0,0.5)'} strokeWidth="0.5" strokeDasharray="4 3" className={safe ? 'flow-green' : 'flow-amber'} style={{ animationDuration: flowSpeed }} markerEnd={safe ? "url(#arrow-green)" : "url(#arrow-amber)"}/>
            <polygon points="390,473 396,477 390,481" fill={safe ? 'rgba(31,209,138,0.7)' : 'rgba(240,160,0,0.5)'}/>

            {/* Stage 12: Household Supply */}
            <g className="animate-fade-in-up hover:scale-[1.01] hover:-translate-y-0.5 transition-all duration-300 cursor-help" style={{ animationDelay: '1100ms' }}>
              <polygon points="400,460 460,443 520,460 460,477" fill={sc.fill} stroke={sc.stroke} strokeWidth="0.9"/>
              <polygon points="400,460 460,477 460,510 400,493" fill={safe ? '#051210' : '#120e00'} stroke={safe ? 'rgba(31,209,138,0.35)' : 'rgba(240,160,0,0.35)'} strokeWidth="0.8"/>
              <polygon points="460,477 520,460 520,493 460,510" fill={safe ? '#092015' : '#181200'} stroke={safe ? 'rgba(31,209,138,0.5)' : 'rgba(240,160,0,0.5)'} strokeWidth="0.8"/>
              <text x="460" y="462" textAnchor="middle" fontSize="7" fill={sc.text} fontFamily="JetBrains Mono,monospace" fontWeight="700">⑫ HOUSEHOLD SUPPLY</text>
              <text x="460" y="472" textAnchor="middle" fontSize="6" fill={sc.sub} fontFamily="DM Sans,sans-serif">{sc.subText}</text>
              <rect x="427" y="485" width="36" height="10" rx="2" fill={sc.text + '/10'} stroke={sc.text + '/30'} strokeWidth="0.5"/>
              <text x="445" y="492" textAnchor="middle" fontSize="5" fill={sc.text} fontFamily="JetBrains Mono,monospace">{stageInfo[12].status}</text>
              <path d="M420 493 L428 485 L436 493 L436 503 L420 503 Z" fill={safe ? 'rgba(31,209,138,0.15)' : 'rgba(240,160,0,0.1)'} stroke={safe ? 'rgba(31,209,138,0.5)' : 'rgba(240,160,0,0.4)'} strokeWidth="0.7"/>
              {safe && (
                <>
                  <path d="M476 490 C476 490 474 494 474 496 a2 2 0 004 0 C478 494 476 490 476 490z" fill="rgba(31,209,138,0.5)" stroke="#1fd18a" strokeWidth="0.5" className="supply-pulse"/>
                  <path d="M484 493 C484 493 482 496 482 498 a2 2 0 004 0 C486 496 484 493 484 493z" fill="rgba(31,209,138,0.4)" stroke="#1fd18a" strokeWidth="0.5" className="supply-pulse" style={{ animationDelay: '.4s' }}/>
                </>
              )}
              <title>{stageInfo[12].tooltip}\n{stageInfo[12].description}</title>
            </g>

            {/* Water flow gradients for pipes */}
            <defs>
              <linearGradient id="waterFlowRed" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(232,69,69,0.3)"/>
                <stop offset="50%" stopColor="rgba(232,69,69,0.6)"/>
                <stop offset="100%" stopColor="rgba(232,69,69,0.3)"/>
              </linearGradient>
              <linearGradient id="waterFlowBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(61,142,240,0.3)"/>
                <stop offset="50%" stopColor="rgba(61,142,240,0.6)"/>
                <stop offset="100%" stopColor="rgba(61,142,240,0.3)"/>
              </linearGradient>
              <linearGradient id="waterFlowGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(31,209,138,0.3)"/>
                <stop offset="50%" stopColor="rgba(31,209,138,0.6)"/>
                <stop offset="100%" stopColor="rgba(31,209,138,0.3)"/>
              </linearGradient>
              <linearGradient id="waterFlowAmber" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(240,160,0,0.3)"/>
                <stop offset="50%" stopColor="rgba(240,160,0,0.6)"/>
                <stop offset="100%" stopColor="rgba(240,160,0,0.3)"/>
              </linearGradient>
            </defs>

            {/* Water wave animation inside tank */}
            <style>{`
              @keyframes flowR { to { stroke-dashoffset: -24 } }
              @keyframes flowBlue { to { stroke-dashoffset: -24 } }
              @keyframes flowGreen { to { stroke-dashoffset: -24 } }
              @keyframes flowAmber { to { stroke-dashoffset: -24 } }
              @keyframes uvPulse { 0%,100%{opacity:.3} 50%{opacity:1} }
              @keyframes supplyPulse { 0%,100%{opacity:.7} 50%{opacity:1} }
              @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes waterWave {
                0% { transform: translateX(-5px); }
                100% { transform: translateX(5px); }
              }
              .animate-fade-in-up {
                animation: fadeInUp 0.4s ease-out forwards;
                opacity: 0;
              }
              .flow-red { animation: flowR 0.7s linear infinite }
              .flow-blue { animation: flowBlue 1.1s linear infinite }
              .flow-green { animation: flowGreen 1.3s linear infinite }
              .flow-amber { animation: flowAmber 1s linear infinite }
              .uv-glow { animation: uvPulse 1.4s ease-in-out infinite }
              .supply-pulse { animation: supplyPulse 1.8s ease-in-out infinite }
              .water-wave { animation: waterWave 1.5s ease-in-out infinite alternate; }
            `}</style>
          </svg>
        </div>

        {/* Technical Spec Ticker - Bottom Footer */}
        <div className="mt-3 pt-2 border-t border-white/5">
          <div className="text-[6px] font-mono text-gray-600 text-center animate-pulse">
            🔐 ESP32 · AES-256 ENCRYPTED · 5Hz REFRESH · MQTT ACTIVE · SYSTEM HEALTH MONITORED
          </div>
        </div>
      </div>
    </div>
  )
}