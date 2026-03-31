// src/components/IsoPipeline.jsx
// ─────────────────────────────────────────────────────────────────
// 11-stage 3D isometric pipeline
// Edison's confirmed flow order:
// Inlet → Sediment → Chlorine → Tank → Manual Valve →
// Carbon → Sensors → Decision → UV → Sampling → Supply
// ─────────────────────────────────────────────────────────────────

// ── Helpers ───────────────────────────────────────────────────────
function uvMode(turbidity) {
  if (turbidity > 8)  return 'FULL'
  if (turbidity >= 4) return 'STANDBY'
  return 'OFF'
}

function pipeColor(mode) {
  if (mode === 'FULL')    return 'rgba(232,69,69,0.7)'
  if (mode === 'STANDBY') return 'rgba(240,160,0,0.7)'
  return 'rgba(31,209,138,0.7)'
}

function decisionColor(mode) {
  if (mode === 'FULL')    return { fill: '#1a0808', stroke: 'rgba(232,69,69,0.6)',   text: '#e84545', sub: '#803030', subText: 'UV Full Power' }
  if (mode === 'STANDBY') return { fill: '#1a1200', stroke: 'rgba(240,160,0,0.6)',   text: '#f0a000', sub: '#806000', subText: 'UV Standby' }
  return                         { fill: '#071a10', stroke: 'rgba(31,209,138,0.6)',  text: '#1fd18a', sub: '#1a6b40', subText: 'UV Off' }
}

function supplyColor(safe) {
  return safe
    ? { fill: '#071a10', stroke: 'rgba(31,209,138,0.6)',  text: '#1fd18a', sub: '#1a6b40', subText: 'Safe water flowing' }
    : { fill: '#1a1200', stroke: 'rgba(240,160,0,0.6)',   text: '#f0a000', sub: '#806000', subText: 'Treatment in progress' }
}
// ──────────────────────────────────────────────────────────────────

export default function IsoPipeline({ sensors }) {
  const { turbidity = 12.3, pH = 6.1, temperature = 29.1, conductivity = 320 } = sensors || {}

  const mode    = uvMode(turbidity)
  const secT    = parseFloat((turbidity * 0.25).toFixed(1))
  const pHOk    = pH >= 6.5 && pH <= 8.5
  const safe    = secT < 4 && pHOk
  const dc      = decisionColor(mode)
  const sc      = supplyColor(safe)
  const redPipe = pipeColor('FULL')   // before treatment
  const bluPipe = pipeColor('STANDBY') // mid treatment
  const grnPipe = pipeColor('OFF')     // after treatment

  // UV badge
  const uvBadge = mode === 'FULL' ? 'FULL PWR' : mode === 'STANDBY' ? 'STANDBY' : 'OFF'
  const uvBadgeFill   = mode === 'FULL' ? 'rgba(232,69,69,0.2)' : mode === 'STANDBY' ? 'rgba(240,160,0,0.2)' : 'rgba(31,209,138,0.2)'
  const uvBadgeStroke = mode === 'FULL' ? 'rgba(232,69,69,0.5)' : mode === 'STANDBY' ? 'rgba(240,160,0,0.5)' : 'rgba(31,209,138,0.5)'
  const uvBadgeColor  = mode === 'FULL' ? '#e84545'             : mode === 'STANDBY' ? '#f0a000'             : '#1fd18a'
  const uvSubText     = mode === 'FULL' ? 'Full power active'   : mode === 'STANDBY' ? 'Standby mode'        : 'Off — water clear'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 overflow-x-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
        <div>
          <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest mb-0.5">
            Live water treatment pipeline · 11 stages
          </p>
          <p className="text-[9px] text-gray-600">
            Water inlet → household supply · Edison's confirmed flow
          </p>
        </div>
        {/* Legend */}
        <div className="flex gap-3 flex-wrap">
          {[
            { color: '#e84545', label: 'Contaminated' },
            { color: '#3d8ef0', label: 'Treating' },
            { color: '#1fd18a', label: 'Safe / clean' },
            { color: '#f0a000', label: 'Filtering' },
            { color: '#a78bfa', label: 'Manual' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="font-mono text-[8px] text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG Pipeline */}
      <svg
        style={{ minWidth: '700px', width: '100%' }}
        viewBox="0 0 720 580"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ════════════════════════════════════════
            ROW 1 (left → right):
            ① Inlet  ② Sediment  ③ Chlorine
            ════════════════════════════════════════ */}

        {/* ① Water Inlet */}
        <polygon points="60,40 120,20 180,40 120,60"   fill="#0a1830" stroke="rgba(61,142,240,0.5)"  strokeWidth="0.8"/>
        <polygon points="60,40 120,60 120,90 60,70"    fill="#071020" stroke="rgba(61,142,240,0.3)"  strokeWidth="0.8"/>
        <polygon points="120,60 180,40 180,70 120,90"  fill="#0c1a35" stroke="rgba(61,142,240,0.4)"  strokeWidth="0.8"/>
        <text x="120" y="43" textAnchor="middle" fontSize="7.5" fill="#3d8ef0" fontFamily="JetBrains Mono,monospace" fontWeight="700">① INLET</text>
        <text x="120" y="54" textAnchor="middle" fontSize="6.5" fill="#3d5a80" fontFamily="DM Sans,sans-serif">Raw water enters</text>
        {/* water drop icon */}
        <path d="M90 72 C90 72 87 76 87 78 a3 3 0 006 0 C93 76 90 72 90 72z" fill="rgba(61,142,240,0.5)" stroke="#3d8ef0" strokeWidth="0.5"/>

        {/* pipe → Sediment (red = unfiltered) */}
        <rect x="180" y="35" width="38" height="8" rx="2" fill="#1a0808" stroke="rgba(232,69,69,0.25)" strokeWidth="0.5"/>
        <rect x="180" y="35" width="38" height="8" rx="2" fill="none"   stroke={redPipe} strokeWidth="0.5" strokeDasharray="4 3"
          style={{ animation: 'flowR .7s linear infinite' }}/>
        <polygon points="216,35 222,39 216,43" fill="rgba(232,69,69,0.6)"/>

        {/* ② Sediment Filter — FIRST, protects everything downstream */}
        <polygon points="228,40 288,20 348,40 288,60"  fill="#131000" stroke="rgba(240,160,0,0.55)" strokeWidth="0.8"/>
        <polygon points="228,40 288,60 288,95 228,75"  fill="#0e0c00" stroke="rgba(240,160,0,0.3)"  strokeWidth="0.8"/>
        <polygon points="288,60 348,40 348,75 288,95"  fill="#181400" stroke="rgba(240,160,0,0.4)"  strokeWidth="0.8"/>
        <text x="288" y="43" textAnchor="middle" fontSize="7"   fill="#f0a000" fontFamily="JetBrains Mono,monospace" fontWeight="700">② SEDIMENT</text>
        <text x="288" y="53" textAnchor="middle" fontSize="6.5" fill="#806000" fontFamily="DM Sans,sans-serif">Filter · catches dirt first</text>
        {/* filter lines icon */}
        <line x1="248" y1="78" x2="268" y2="78" stroke="rgba(240,160,0,0.45)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="248" y1="83" x2="263" y2="83" stroke="rgba(240,160,0,0.3)"  strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="248" y1="88" x2="256" y2="88" stroke="rgba(240,160,0,0.2)"  strokeWidth="1.2" strokeLinecap="round"/>

        {/* pipe → Chlorine (still unfiltered of bacteria) */}
        <rect x="348" y="35" width="38" height="8" rx="2" fill="#1a0808" stroke="rgba(232,69,69,0.25)" strokeWidth="0.5"/>
        <rect x="348" y="35" width="38" height="8" rx="2" fill="none"   stroke={redPipe} strokeWidth="0.5" strokeDasharray="4 3"
          style={{ animation: 'flowR .7s linear infinite' }}/>
        <polygon points="384,35 390,39 384,43" fill="rgba(232,69,69,0.6)"/>

        {/* ③ Chlorine Diffusion Chamber */}
        <polygon points="396,40 456,20 516,40 456,60"  fill="#071a10" stroke="rgba(31,209,138,0.5)"  strokeWidth="0.8"/>
        <polygon points="396,40 456,60 456,95 396,75"  fill="#051210" stroke="rgba(31,209,138,0.3)"  strokeWidth="0.8"/>
        <polygon points="456,60 516,40 516,75 456,95"  fill="#092015" stroke="rgba(31,209,138,0.4)"  strokeWidth="0.8"/>
        <text x="456" y="43" textAnchor="middle" fontSize="7"   fill="#1fd18a" fontFamily="JetBrains Mono,monospace" fontWeight="700">③ CHLORINE</text>
        <text x="456" y="53" textAnchor="middle" fontSize="6.5" fill="#1a6b40" fontFamily="DM Sans,sans-serif">Diffusion chamber</text>
        <circle cx="426" cy="80" r="8" fill="rgba(31,209,138,0.15)" stroke="rgba(31,209,138,0.5)" strokeWidth="0.8"/>
        <text x="426" y="83" textAnchor="middle" fontSize="7" fill="#1fd18a" fontFamily="JetBrains Mono,monospace" fontWeight="700">Cl</text>

        {/* pipe DOWN → Tank */}
        <rect x="451" y="95"  width="8" height="30" rx="2" fill="#1a0808" stroke="rgba(232,69,69,0.25)" strokeWidth="0.5"/>
        <rect x="451" y="95"  width="8" height="30" rx="2" fill="none"   stroke={redPipe} strokeWidth="0.5" strokeDasharray="4 3"
          style={{ animation: 'flowR .7s linear infinite' }}/>
        <polygon points="448,123 456,131 464,123" fill="rgba(232,69,69,0.6)"/>

        {/* ════════════════════════════════════════
            ROW 2 (right → left):
            ④ Tank  ⑤ Manual Valve
            ════════════════════════════════════════ */}

        {/* ④ Tank Storage */}
        <polygon points="396,148 456,128 516,148 456,168" fill="#0a1520" stroke="rgba(61,142,240,0.45)" strokeWidth="0.8"/>
        <polygon points="396,148 456,168 456,210 396,190" fill="#071020" stroke="rgba(61,142,240,0.3)"  strokeWidth="0.8"/>
        <polygon points="456,168 516,148 516,190 456,210" fill="#0c1a35" stroke="rgba(61,142,240,0.4)"  strokeWidth="0.8"/>
        <text x="456" y="151" textAnchor="middle" fontSize="7"   fill="#3d8ef0" fontFamily="JetBrains Mono,monospace" fontWeight="700">④ TANK</text>
        <text x="456" y="161" textAnchor="middle" fontSize="6.5" fill="#1a3860" fontFamily="DM Sans,sans-serif">Storage + mixing</text>
        {/* water level */}
        <rect x="416" y="180" width="32" height="20" rx="2" fill="rgba(61,142,240,0.15)" stroke="rgba(61,142,240,0.3)" strokeWidth="0.5"/>

        {/* pipe LEFT → Manual Valve */}
        <rect x="328" y="161" width="64" height="8" rx="2" fill="#1a0808" stroke="rgba(232,69,69,0.25)" strokeWidth="0.5"/>
        <rect x="328" y="161" width="64" height="8" rx="2" fill="none"   stroke={redPipe} strokeWidth="0.5" strokeDasharray="4 3"
          style={{ animation: 'flowR .7s linear infinite' }}/>
        <polygon points="332,161 326,165 332,169" fill="rgba(232,69,69,0.6)"/>

        {/* ⑤ Manual Valve — STATIC, no sensors, person-operated */}
        <polygon points="216,148 276,128 336,148 276,168" fill="#110a1a" stroke="rgba(167,139,250,0.55)" strokeWidth="0.8"/>
        <polygon points="216,148 276,168 276,200 216,180" fill="#0c0714" stroke="rgba(167,139,250,0.3)"  strokeWidth="0.8"/>
        <polygon points="276,168 336,148 336,180 276,200" fill="#140b22" stroke="rgba(167,139,250,0.4)"  strokeWidth="0.8"/>
        <text x="276" y="151" textAnchor="middle" fontSize="7"   fill="#a78bfa" fontFamily="JetBrains Mono,monospace" fontWeight="700">⑤ MANUAL VALVE</text>
        <text x="276" y="161" textAnchor="middle" fontSize="6.5" fill="#6d5a9e" fontFamily="DM Sans,sans-serif">Hand-operated · maintenance</text>
        {/* valve wheel graphic */}
        <circle cx="246" cy="184" r="8"  fill="none" stroke="rgba(167,139,250,0.4)" strokeWidth="1"/>
        <line x1="238" y1="184" x2="254" y2="184" stroke="#a78bfa" strokeWidth="0.8"/>
        <line x1="246" y1="176" x2="246" y2="192" stroke="#a78bfa" strokeWidth="0.8"/>
        <circle cx="246" cy="184" r="2.5" fill="rgba(167,139,250,0.4)" stroke="#a78bfa" strokeWidth="0.6"/>
        <text x="246" y="198" textAnchor="middle" fontSize="5.5" fill="#6d5a9e" fontFamily="DM Sans,sans-serif">turn to close</text>

        {/* pipe DOWN from Manual Valve → Carbon */}
        <rect x="271" y="200" width="8" height="30" rx="2" fill="#131000" stroke="rgba(240,160,0,0.25)" strokeWidth="0.5"/>
        <rect x="271" y="200" width="8" height="30" rx="2" fill="none"   stroke="rgba(240,160,0,0.6)" strokeWidth="0.5" strokeDasharray="4 3"
          style={{ animation: 'flowR 1s linear infinite' }}/>
        <polygon points="268,228 276,236 284,228" fill="rgba(240,160,0,0.6)"/>

        {/* ════════════════════════════════════════
            ROW 3 (left → right):
            ⑥ Carbon  ⑦ Sensors
            ════════════════════════════════════════ */}

        {/* ⑥ Carbon Filter */}
        <polygon points="216,253 276,233 336,253 276,273" fill="#131000" stroke="rgba(240,160,0,0.5)"  strokeWidth="0.8"/>
        <polygon points="216,253 276,273 276,305 216,285" fill="#0e0c00" stroke="rgba(240,160,0,0.3)"  strokeWidth="0.8"/>
        <polygon points="276,273 336,253 336,285 276,305" fill="#181400" stroke="rgba(240,160,0,0.4)"  strokeWidth="0.8"/>
        <text x="276" y="256" textAnchor="middle" fontSize="7"   fill="#f0a000" fontFamily="JetBrains Mono,monospace" fontWeight="700">⑥ CARBON</text>
        <text x="276" y="266" textAnchor="middle" fontSize="6.5" fill="#806000" fontFamily="DM Sans,sans-serif">Filter · removes impurities</text>
        {/* carbon columns */}
        <rect x="240" y="284" width="6" height="16" rx="2" fill="rgba(240,160,0,0.2)" stroke="rgba(240,160,0,0.4)" strokeWidth="0.5"/>
        <rect x="250" y="284" width="6" height="16" rx="2" fill="rgba(240,160,0,0.2)" stroke="rgba(240,160,0,0.4)" strokeWidth="0.5"/>
        <rect x="260" y="284" width="6" height="16" rx="2" fill="rgba(240,160,0,0.15)" stroke="rgba(240,160,0,0.3)" strokeWidth="0.5"/>

        {/* pipe RIGHT → Sensors */}
        <rect x="336" y="266" width="56" height="8" rx="2" fill="#0a1520" stroke="rgba(61,142,240,0.25)" strokeWidth="0.5"/>
        <rect x="336" y="266" width="56" height="8" rx="2" fill="none"   stroke="rgba(61,142,240,0.6)" strokeWidth="0.5" strokeDasharray="4 3"
          style={{ animation: 'flowR 1.1s linear infinite' }}/>
        <polygon points="390,266 396,270 390,274" fill="rgba(61,142,240,0.6)"/>

        {/* ⑦ Primary Sensor Chamber */}
        <polygon points="400,253 460,233 520,253 460,273" fill="#0a1520" stroke="rgba(61,142,240,0.65)" strokeWidth="0.8"/>
        <polygon points="400,253 460,273 460,308 400,288" fill="#071020" stroke="rgba(61,142,240,0.35)" strokeWidth="0.8"/>
        <polygon points="460,273 520,253 520,288 460,308" fill="#0c1a35" stroke="rgba(61,142,240,0.5)"  strokeWidth="0.8"/>
        <text x="460" y="256" textAnchor="middle" fontSize="7"   fill="#3d8ef0" fontFamily="JetBrains Mono,monospace" fontWeight="700">⑦ SENSORS</text>
        <text x="460" y="266" textAnchor="middle" fontSize="6.5" fill="#1a3860" fontFamily="DM Sans,sans-serif">Primary chamber</text>
        {/* live sensor readings */}
        <text x="410" y="286" fontSize="6" fill={turbidity > 8 ? '#e84545' : turbidity > 4 ? '#f0a000' : '#1fd18a'} fontFamily="JetBrains Mono,monospace">
          T:{turbidity.toFixed(1)}
        </text>
        <text x="410" y="295" fontSize="6" fill={!pHOk ? '#f0a000' : '#1fd18a'} fontFamily="JetBrains Mono,monospace">
          pH:{pH.toFixed(1)}
        </text>
        <text x="410" y="304" fontSize="6" fill={conductivity > 500 ? '#f0a000' : '#1fd18a'} fontFamily="JetBrains Mono,monospace">
          C:{Math.round(conductivity)}
        </text>
        {/* scanning dot */}
        <circle cx="500" cy="285" r="5"   fill="rgba(61,142,240,0.2)" stroke="#3d8ef0" strokeWidth="0.8"/>
        <circle cx="500" cy="285" r="2"   fill="#3d8ef0"/>

        {/* pipe DOWN → Decision */}
        <rect x="455" y="308" width="8" height="30" rx="2" fill="#1a0808" stroke="rgba(232,69,69,0.25)" strokeWidth="0.5"/>
        <rect x="455" y="308" width="8" height="30" rx="2" fill="none"   stroke={redPipe} strokeWidth="0.5" strokeDasharray="4 3"
          style={{ animation: 'flowR .7s linear infinite' }}/>
        <polygon points="452,336 460,344 468,336" fill="rgba(232,69,69,0.6)"/>

        {/* ════════════════════════════════════════
            ROW 4 (left → right):
            ⑧ Decision  ⑨ UV  ⑩ Sampling
            ════════════════════════════════════════ */}

        {/* ⑧ Decision Point — dashed border, changes color live */}
        <polygon points="400,360 460,343 520,360 460,377"
          fill={dc.fill} stroke={dc.stroke} strokeWidth="0.8" strokeDasharray="4 2"/>
        <polygon points="400,360 460,377 460,400 400,383"
          fill={dc.fill === '#1a0808' ? '#120505' : dc.fill === '#1a1200' ? '#120e00' : '#051210'}
          stroke={dc.stroke} strokeWidth="0.8" strokeDasharray="4 2"/>
        <polygon points="460,377 520,360 520,383 460,400"
          fill={dc.fill === '#1a0808' ? '#170707' : dc.fill === '#1a1200' ? '#181200' : '#092015'}
          stroke={dc.stroke} strokeWidth="0.8" strokeDasharray="4 2"/>
        <text x="460" y="363" textAnchor="middle" fontSize="7"   fill={dc.text} fontFamily="JetBrains Mono,monospace" fontWeight="700">⑧ DECISION</text>
        <text x="460" y="373" textAnchor="middle" fontSize="6.5" fill={dc.sub}  fontFamily="DM Sans,sans-serif">{dc.subText}</text>
        {/* warning triangle */}
        <path d="M428 390 L435 379 L442 390 Z" fill={`${dc.fill}88`} stroke={dc.stroke} strokeWidth="0.6"/>
        <text x="435" y="388" textAnchor="middle" fontSize="5" fill={dc.text}>!</text>

        {/* pipe RIGHT → UV */}
        <rect x="520" y="373" width="44" height="8" rx="2" fill="#071428" stroke="rgba(61,142,240,0.25)" strokeWidth="0.5"/>
        <rect x="520" y="373" width="44" height="8" rx="2" fill="none"   stroke="rgba(61,142,240,0.6)" strokeWidth="0.5" strokeDasharray="4 3"
          style={{ animation: 'flowR 1.1s linear infinite' }}/>
        <polygon points="562,373 568,377 562,381" fill="rgba(61,142,240,0.6)"/>

        {/* ⑨ UV Sterilizer */}
        <polygon points="572,360 632,343 692,360 632,377" fill="#071428" stroke="rgba(61,142,240,0.7)"  strokeWidth="0.9"/>
        <polygon points="572,360 632,377 632,407 572,390" fill="#050e20" stroke="rgba(61,142,240,0.4)"  strokeWidth="0.8"/>
        <polygon points="632,377 692,360 692,390 632,407" fill="#091830" stroke="rgba(61,142,240,0.6)"  strokeWidth="0.8"/>
        <text x="632" y="363" textAnchor="middle" fontSize="7"   fill="#3d8ef0" fontFamily="JetBrains Mono,monospace" fontWeight="700">⑨ UV STERILIZER</text>
        <text x="632" y="373" textAnchor="middle" fontSize="6.5" fill="#1a3860" fontFamily="DM Sans,sans-serif">{uvSubText}</text>
        {/* UV glow rings */}
        <circle cx="596" cy="392" r="10" fill="rgba(61,142,240,0.1)"  stroke="rgba(61,142,240,0.3)"  strokeWidth="0.8"
          style={{ animation: 'uvPulse 1.4s ease-in-out infinite' }}/>
        <circle cx="596" cy="392" r="6"  fill="rgba(61,142,240,0.2)"  stroke="#3d8ef0" strokeWidth="1"
          style={{ animation: 'uvPulse 1.4s ease-in-out infinite' }}/>
        <circle cx="596" cy="392" r="2.5" fill="#3d8ef0"/>
        {/* UV badge */}
        <rect x="613" y="396" width="36" height="10" rx="3"
          fill={uvBadgeFill} stroke={uvBadgeStroke} strokeWidth="0.5"
          style={{ transition: 'fill 0.4s, stroke 0.4s' }}/>
        <text x="631" y="403" textAnchor="middle" fontSize="6.5" fill={uvBadgeColor}
          fontFamily="JetBrains Mono,monospace" fontWeight="700"
          style={{ transition: 'fill 0.4s' }}>
          {uvBadge}
        </text>

        {/* ════════════════════════════════════════
            ROW 5:
            ⑩ Sampling  ⑪ Household Supply
            ════════════════════════════════════════ */}

        {/* pipe DOWN from UV → Sampling */}
        <rect x="627" y="407" width="8" height="30" rx="2" fill="#071428" stroke="rgba(61,142,240,0.25)" strokeWidth="0.5"/>
        <rect x="627" y="407" width="8" height="30" rx="2" fill="none"   stroke="rgba(61,142,240,0.6)" strokeWidth="0.5" strokeDasharray="4 3"
          style={{ animation: 'flowR 1.1s linear infinite' }}/>
        <polygon points="624,435 632,443 640,435" fill="rgba(61,142,240,0.6)"/>

        {/* ⑩ Sampling Chamber */}
        <polygon points="572,460 632,443 692,460 632,477" fill="#0a1520" stroke="rgba(61,142,240,0.5)"  strokeWidth="0.8"/>
        <polygon points="572,460 632,477 632,507 572,490" fill="#071020" stroke="rgba(61,142,240,0.3)"  strokeWidth="0.8"/>
        <polygon points="632,477 692,460 692,490 632,507" fill="#0c1a35" stroke="rgba(61,142,240,0.4)"  strokeWidth="0.8"/>
        <text x="632" y="463" textAnchor="middle" fontSize="7"   fill="#3d8ef0" fontFamily="JetBrains Mono,monospace" fontWeight="700">⑩ SAMPLING</text>
        <text x="632" y="473" textAnchor="middle" fontSize="6.5" fill="#1a3860" fontFamily="DM Sans,sans-serif">Secondary sensors verify</text>
        {/* check circle */}
        <circle cx="592" cy="492" r="8"  fill="rgba(31,209,138,0.15)" stroke="rgba(31,209,138,0.4)" strokeWidth="0.8"/>
        <path d="M589 492 L592 495 L597 489" stroke="#1fd18a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* post-UV reading */}
        <text x="607" y="490" fontSize="6" fill="#1fd18a" fontFamily="JetBrains Mono,monospace">
          Post:{secT}NTU
        </text>
        <text x="607" y="499" fontSize="6" fill={safe ? '#1fd18a' : '#f0a000'} fontFamily="JetBrains Mono,monospace">
          {safe ? 'VERIFIED ✓' : 'CHECKING...'}
        </text>

        {/* pipe LEFT from Sampling → Household Supply */}
        <rect x="392" y="473" width="176" height="8" rx="2"
          fill={safe ? '#071a10' : '#1a1200'}
          stroke={safe ? 'rgba(31,209,138,0.25)' : 'rgba(240,160,0,0.25)'} strokeWidth="0.5"/>
        <rect x="392" y="473" width="176" height="8" rx="2" fill="none"
          stroke={safe ? 'rgba(31,209,138,0.7)' : 'rgba(240,160,0,0.7)'} strokeWidth="0.5" strokeDasharray="4 3"
          style={{ animation: 'flowR 1.3s linear infinite' }}/>
        <polygon points="396,473 390,477 396,481"
          fill={safe ? 'rgba(31,209,138,0.7)' : 'rgba(240,160,0,0.7)'}/>

        {/* ⑪ Household Supply */}
        <polygon points="216,460 276,443 336,460 276,477"
          fill={sc.fill} stroke={sc.stroke} strokeWidth="0.9"
          style={{ transition: 'fill 0.5s, stroke 0.5s' }}/>
        <polygon points="216,460 276,477 276,510 216,493"
          fill={safe ? '#051210' : '#120e00'} stroke={safe ? 'rgba(31,209,138,0.35)' : 'rgba(240,160,0,0.35)'} strokeWidth="0.8"
          style={{ transition: 'fill 0.5s' }}/>
        <polygon points="276,477 336,460 336,493 276,510"
          fill={safe ? '#092015' : '#181200'} stroke={safe ? 'rgba(31,209,138,0.5)' : 'rgba(240,160,0,0.5)'} strokeWidth="0.8"
          style={{ transition: 'fill 0.5s' }}/>
        <text x="276" y="462" textAnchor="middle" fontSize="7"   fill={sc.text} fontFamily="JetBrains Mono,monospace" fontWeight="700"
          style={{ transition: 'fill 0.5s' }}>
          ⑪ HOUSEHOLD SUPPLY
        </text>
        <text x="276" y="472" textAnchor="middle" fontSize="6.5" fill={sc.sub}  fontFamily="DM Sans,sans-serif"
          style={{ transition: 'fill 0.5s' }}>
          {sc.subText}
        </text>
        {/* house icon */}
        <path d="M236 493 L244 485 L252 493 L252 503 L236 503 Z"
          fill={safe ? 'rgba(31,209,138,0.15)' : 'rgba(240,160,0,0.1)'}
          stroke={safe ? 'rgba(31,209,138,0.5)' : 'rgba(240,160,0,0.4)'} strokeWidth="0.7"
          style={{ transition: 'fill 0.5s, stroke 0.5s' }}/>
        {/* water drops (only show when safe) */}
        {safe && (
          <>
            <path d="M292 490 C292 490 290 494 290 496 a2 2 0 004 0 C294 494 292 490 292 490z"
              fill="rgba(31,209,138,0.5)" stroke="#1fd18a" strokeWidth="0.5"
              style={{ animation: 'supplyPulse 1.8s ease-in-out infinite' }}/>
            <path d="M300 493 C300 493 298 496 298 498 a2 2 0 004 0 C302 496 300 493 300 493z"
              fill="rgba(31,209,138,0.4)" stroke="#1fd18a" strokeWidth="0.5"
              style={{ animation: 'supplyPulse 1.8s ease-in-out infinite', animationDelay: '.4s' }}/>
          </>
        )}

        {/* Stage key */}
        <text x="30" y="568" fontSize="7" fill="rgba(61,142,240,0.3)" fontFamily="JetBrains Mono,monospace">
          ① Inlet  ② Sediment  ③ Chlorine  ④ Tank  ⑤ Manual Valve  ⑥ Carbon  ⑦ Sensors  ⑧ Decision  ⑨ UV  ⑩ Sampling  ⑪ Supply
        </text>

        {/* CSS Animations */}
        <style>{`
          @keyframes flowR       { to { stroke-dashoffset: -24 } }
          @keyframes uvPulse     { 0%,100%{opacity:.4} 50%{opacity:1} }
          @keyframes supplyPulse { 0%,100%{opacity:.7} 50%{opacity:1} }
        `}</style>

      </svg>
    </div>
  )
}