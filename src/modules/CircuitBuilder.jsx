import { useState } from 'react'

const GATE_COLORS = {
  H:    { bg: 'bg-[#0f2040]', border: 'border-[#4589ff]', text: 'text-[#4589ff]', glow: 'shadow-[0_0_8px_rgba(69,137,255,0.5)]' },
  NOT:  { bg: 'bg-[#1a0a2e]', border: 'border-[#a855f7]', text: 'text-[#c084fc]', glow: 'shadow-[0_0_8px_rgba(168,85,247,0.5)]' },
  CNOT: { bg: 'bg-[#0d2318]', border: 'border-[#42be65]', text: 'text-[#42be65]', glow: 'shadow-[0_0_8px_rgba(66,190,101,0.5)]' },
}

const PALETTE = ['H', 'NOT', 'CNOT']
const SLOTS = 6
const WIRE_Y = { 0: 48, 1: 120 }   // px from top of canvas
const CANVAS_H = 168

function GateBlock({ type, small = false }) {
  const c = GATE_COLORS[type] || GATE_COLORS.H
  const size = small ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div className={`${size} rounded border-2 ${c.bg} ${c.border} ${c.text} flex items-center justify-center font-mono font-bold select-none`}>
      {type}
    </div>
  )
}

function MeasureBlock() {
  return (
    <div className="w-10 h-10 rounded border-2 border-[#3a5070] bg-[#0d1e35] flex items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path d="M3 15 Q10 4 17 15" fill="none" stroke="#4a7090" strokeWidth="1.5" />
        <line x1="10" y1="15" x2="15" y2="8" stroke="#22d3ee" strokeWidth="1.5" />
        <circle cx="10" cy="15" r="1.5" fill="#4a7090" />
      </svg>
    </div>
  )
}

export default function CircuitBuilder({ gates, setGates, onExecute }) {
  const [dragging, setDragging] = useState(null) // { type, fromId? }
  const [dragOver, setDragOver] = useState(null) // { qubit, slot }
  const [executed, setExecuted] = useState(false)

  const addGate = (type, qubit, slot) => {
    // CNOT occupies both qubits; can't place if other gate already in slot
    const occupied = gates.filter(g => g.slot === slot)
    if (type === 'CNOT') {
      if (occupied.length > 0) return
      setGates(g => [...g, { id: Date.now(), type: 'CNOT', qubit: 0, slot, control: 0, target: 1 }])
    } else {
      if (occupied.some(g => g.type === 'CNOT' || g.qubit === qubit)) return
      setGates(g => [...g, { id: Date.now(), type, qubit, slot }])
    }
    setExecuted(false)
  }

  const removeGate = (id) => {
    setGates(g => g.filter(x => x.id !== id))
    setExecuted(false)
  }

  const handleDragStart = (e, type, fromId = null) => {
    setDragging({ type, fromId })
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleCellDrop = (e, qubit, slot) => {
    e.preventDefault()
    if (!dragging) return
    if (dragging.fromId) removeGate(dragging.fromId)
    addGate(dragging.type, qubit, slot)
    setDragging(null)
    setDragOver(null)
  }

  const handleExecute = () => {
    setExecuted(true)
    if (onExecute) onExecute(gates)
  }

  const cnotGates = gates.filter(g => g.type === 'CNOT')
  const gatesMatrix = {}
  gates.forEach(g => {
    const key = `${g.slot}-${g.qubit}`
    gatesMatrix[key] = g
  })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Constructor de Circuito</h1>
        <p className="text-[#3a5570] text-sm font-mono">
          Arrastra puertas a las líneas de qubits. Observa el estado resultante.
        </p>
      </div>

      {/* Palette */}
      <div className="bg-[#0d1528] border border-[#1e2d4a] rounded-lg p-4 flex flex-col gap-3">
        <span className="text-[10px] font-mono text-[#3a5070] uppercase tracking-widest">Puertas disponibles</span>
        <div className="flex gap-4 flex-wrap">
          {PALETTE.map(type => (
            <div
              key={type}
              draggable
              onDragStart={e => handleDragStart(e, type)}
              className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing"
            >
              <GateBlock type={type} />
              <span className="text-[10px] font-mono text-[#4a6080]">
                {type === 'H' ? 'Hadamard' : type === 'NOT' ? 'NOT' : 'CNOT'}
              </span>
            </div>
          ))}
          <div className="ml-auto self-center text-[10px] font-mono text-[#2a3a5a]">
            arrastra → circuito  |  clic en puerta → borrar
          </div>
        </div>
      </div>

      {/* Circuit canvas */}
      <div className="bg-[#080c18] border border-[#1e2d4a] rounded-lg p-6 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Qubit labels + wires + cells */}
          {[0, 1].map(qubit => (
            <div key={qubit} className="flex items-center gap-0 mb-0" style={{ height: qubit === 0 ? 72 : 72 }}>
              {/* Label */}
              <div className="w-16 flex-shrink-0 flex flex-col items-end pr-3">
                <span className="text-xs font-mono text-cyan-600">q[{qubit}]</span>
                <span className="text-[10px] font-mono text-[#2a4060]">|0⟩</span>
              </div>

              {/* Wire + slots */}
              <div className="flex-1 flex items-center relative">
                {/* Horizontal wire */}
                <div className="absolute inset-0 flex items-center pointer-events-none">
                  <div className="w-full h-px bg-[#1e3a5f]" />
                </div>

                {/* Slot cells */}
                <div className="flex gap-1 relative z-10">
                  {Array.from({ length: SLOTS }).map((_, slot) => {
                    const gate = gates.find(g =>
                      g.slot === slot && (g.qubit === qubit || g.type === 'CNOT')
                    )
                    const isCNOT = gate?.type === 'CNOT'
                    const isOver = dragOver?.qubit === qubit && dragOver?.slot === slot

                    return (
                      <div
                        key={slot}
                        className={[
                          'w-12 h-12 flex items-center justify-center rounded transition-all duration-150',
                          isOver ? 'bg-[#1a2540] border border-dashed border-cyan-700' : 'border border-transparent',
                        ].join(' ')}
                        onDragOver={e => { e.preventDefault(); setDragOver({ qubit, slot }) }}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={e => handleCellDrop(e, qubit, slot)}
                      >
                        {isCNOT ? (
                          /* CNOT visual: dot on control (q0), circle on target (q1) */
                          <div
                            className="relative cursor-pointer"
                            onClick={() => removeGate(gate.id)}
                            title="Clic para borrar"
                          >
                            {qubit === 0 ? (
                              <div className="w-4 h-4 rounded-full" style={{ background: '#42be65', boxShadow: '0 0 8px rgba(66,190,101,0.6)' }} />
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#42be65' }}>
                                <div className="w-px h-3" style={{ background: '#42be65' }} />
                              </div>
                            )}
                          </div>
                        ) : gate && gate.qubit === qubit ? (
                          <div
                            draggable
                            onDragStart={e => handleDragStart(e, gate.type, gate.id)}
                            onClick={() => removeGate(gate.id)}
                            title="Clic para borrar"
                            className="cursor-pointer"
                          >
                            <GateBlock type={gate.type} small />
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>

                {/* Wire continuation after slots */}
                <div className="flex-1 h-px bg-[#1e3a5f] ml-1" />

                {/* Measure block */}
                <div className="ml-2 flex-shrink-0">
                  <MeasureBlock />
                </div>
              </div>
            </div>
          ))}

          {/* CNOT vertical connectors via SVG overlay — drawn relative to slot positions */}
          <svg
            className="absolute pointer-events-none"
            style={{ display: 'none' }}
          />
        </div>

        {/* CNOT vertical lines drawn as absolute overlay */}
        <CnotLines gates={gates} />
      </div>

      {/* Circuit description */}
      <CircuitDescription gates={gates} />

      {/* Execute button */}
      <div className="flex gap-4 items-center">
        <button
          onClick={handleExecute}
          className="px-6 py-3 rounded border border-cyan-600 text-cyan-300 text-sm font-mono font-bold hover:bg-cyan-900/20 hover:shadow-[0_0_14px_rgba(34,211,238,0.25)] transition-all duration-200 cursor-pointer"
        >
          ▶ Ejecutar circuito
        </button>
        <button
          onClick={() => { setGates([]); setExecuted(false) }}
          className="px-4 py-3 rounded border border-[#1e2d4a] text-[#3a5070] text-sm font-mono hover:border-[#2a3a5a] hover:text-[#4a6080] transition-all duration-200 cursor-pointer"
        >
          Limpiar
        </button>
        {executed && (
          <span className="text-xs font-mono text-green-400 fade-in">
            ✓ Pasa al Módulo 4 para ver los resultados
          </span>
        )}
      </div>

      {/* Gate legend */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { type: 'H',    name: 'Hadamard',          desc: 'Crea superposición. Transforma |0⟩ → (|0⟩+|1⟩)/√2' },
          { type: 'NOT',  name: 'NOT',                desc: 'Invierte el qubit. Transforma |0⟩ → |1⟩ y |1⟩ → |0⟩.' },
          { type: 'CNOT', name: 'CNOT (Controlled-NOT)', desc: 'Invierte el target si el control es |1⟩. Crea entrelazamiento.' },
        ].map(({ type, name, desc }) => (
          <div key={type} className="bg-[#0d1528] border border-[#1e2d4a] rounded p-3 flex gap-3 items-start">
            <GateBlock type={type} small />
            <div>
              <div className={`text-xs font-mono font-bold ${GATE_COLORS[type].text}`}>{name}</div>
              <div className="text-[10px] font-mono text-[#3a5070] mt-1">{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Draws vertical CNOT connector lines between q[0] and q[1] rows
function CnotLines({ gates }) {
  const cnots = gates.filter(g => g.type === 'CNOT')
  if (cnots.length === 0) return null
  // Each slot is 52px wide (w-12=48 + gap-1=4), starting after 64px label + some padding
  return (
    <div className="relative -mt-[144px] pointer-events-none" style={{ height: 144 }}>
      <svg width="100%" height="144" className="absolute inset-0">
        {cnots.map(g => {
          const x = 64 + 12 + g.slot * 52 + 24 // label(64) + pr(12) + slot offset + center of cell
          return (
            <line
              key={g.id}
              x1={x} y1={36}
              x2={x} y2={108}
              stroke="#42be65"
              strokeWidth="1.5"
              opacity="0.7"
            />
          )
        })}
      </svg>
    </div>
  )
}

function CircuitDescription({ gates }) {
  if (gates.length === 0) {
    return (
      <div className="text-center text-[#2a3a5a] text-xs font-mono py-4 border border-dashed border-[#1e2d4a] rounded">
        El circuito está vacío — arrastra puertas para construirlo
      </div>
    )
  }

  const sorted = [...gates].sort((a, b) => a.slot - b.slot)
  const parts = sorted.map(g => {
    if (g.type === 'CNOT') return `CNOT(q[0]→q[1])`
    return `${g.type}(q[${g.qubit}])`
  })

  const hOnQ0 = sorted.find(g => g.type === 'H' && g.qubit === 0)
  const cnotGate = sorted.find(g => g.type === 'CNOT')
  // Bell state requires H on q[0] placed BEFORE CNOT (by slot order)
  const hasBellPrep = hOnQ0 && cnotGate && hOnQ0.slot < cnotGate.slot

  const hasH    = sorted.some(g => g.type === 'H')
  const hasCNOT = sorted.some(g => g.type === 'CNOT')
  const hasNOT  = sorted.some(g => g.type === 'NOT')

  return (
    <div className="bg-[#0d1528] border border-[#1e2d4a] rounded p-3 flex flex-col gap-2">
      <span className="text-[10px] font-mono text-[#3a5070] uppercase tracking-widest">Descripción del circuito</span>
      <span className="text-xs font-mono text-cyan-300">{parts.join(' → ')}</span>

      {hasH && (
        <span className="text-[10px] font-mono text-[#4589ff]">
          〜 H (Hadamard): pone el qubit en superposición — |0⟩ → (|0⟩+|1⟩)/√2
        </span>
      )}
      {hasNOT && (
        <span className="text-[10px] font-mono text-[#c084fc]">
          ↕ NOT: invierte el estado del qubit — |0⟩ → |1⟩ y |1⟩ → |0⟩
        </span>
      )}
      {hasCNOT && !hasBellPrep && (
        <span className="text-[10px] font-mono text-[#42be65]">
          ⊕ CNOT: invierte q[1] (target) solo si q[0] (control) es |1⟩
        </span>
      )}
      {hasBellPrep && (
        <span className="text-[10px] font-mono text-yellow-500">
          ★ H seguida de CNOT prepara un Estado de Bell — máximo entrelazamiento entre q[0] y q[1]
        </span>
      )}
    </div>
  )
}
