import { useState, useRef, useCallback, useMemo } from 'react'

const OUTCOMES = ['00', '01', '10', '11']
const TOTAL    = 1024
const H_VAL    = 1 / Math.sqrt(2)

// Qubit colors — consistent across circuit preview, histogram labels, and state reading
const Q0_COLOR = '#22d3ee'  // cyan  → segundo dígito en el resultado
const Q1_COLOR = '#fb923c'  // naranja → primer dígito en el resultado

// ─── Quantum simulation (Qiskit little-endian convention) ────────────────────
// Outcome string "XY" → X = q[1] (primer dígito), Y = q[0] (segundo dígito)
// State vector index = q[1]*2 + q[0]:  0=|00⟩ 1=|01⟩ 2=|10⟩ 3=|11⟩
function simulate(gates) {
  let s = [1, 0, 0, 0]
  const sorted = [...(gates || [])].sort((a, b) => a.slot - b.slot)
  for (const gate of sorted) {
    const [a, b, c, d] = s
    if (gate.type === 'H') {
      // qubit 0 → I⊗H  |  qubit 1 → H⊗I
      s = gate.qubit === 0
        ? [H_VAL*(a+b), H_VAL*(a-b), H_VAL*(c+d), H_VAL*(c-d)]
        : [H_VAL*(a+c), H_VAL*(b+d), H_VAL*(a-c), H_VAL*(b-d)]
    } else if (gate.type === 'NOT') {
      // qubit 0 → I⊗X (swap bit 0)  |  qubit 1 → X⊗I (swap bit 1)
      s = gate.qubit === 0 ? [b, a, d, c] : [c, d, a, b]
    } else if (gate.type === 'CNOT') {
      // control=q[0], target=q[1]: if q[0]=1 flip q[1] → swap indices 1↔3
      s = [a, d, c, b]
    }
  }
  return { '00': s[0]**2, '01': s[1]**2, '10': s[2]**2, '11': s[3]**2 }
}

function sampleFromProbs(probs) {
  const r = Math.random()
  let cum = 0
  for (const o of OUTCOMES) { cum += probs[o]; if (r < cum) return o }
  return '11'
}

// ─── Circuit label ────────────────────────────────────────────────────────────
function getCircuitLabel(probs) {
  const isBell    = probs['00'] > 0.45 && probs['11'] > 0.45 && probs['01'] < 0.05 && probs['10'] < 0.05
  const isDet     = Object.values(probs).some(p => p > 0.99)
  const isUniform = Object.values(probs).every(p => Math.abs(p - 0.25) < 0.05)
  if (isBell)    return { text: 'Estado de Bell |Φ+⟩', color: 'text-yellow-500' }
  if (isDet) {
    const o = Object.entries(probs).find(([, p]) => p > 0.99)[0]
    return { text: `Estado determinístico |${o}⟩`, color: 'text-cyan-400' }
  }
  if (isUniform) return { text: 'Superposición uniforme', color: 'text-[#c084fc]' }
  return { text: 'Circuito personalizado', color: 'text-[#4a6080]' }
}

// ─── Plain-language qubit explanation ────────────────────────────────────────
// outcomeStr: "XY" where X=q[1], Y=q[0]
function explainQubit(qubitIdx, digitValue, gates, outcomeStr) {
  const q0digit  = outcomeStr[1]                                    // segundo dígito = q[0]
  const myGates  = gates.filter(g => g.type !== 'CNOT' && g.qubit === qubitIdx)
  const hasCNOT  = gates.some(g => g.type === 'CNOT')
  const hasH     = myGates.some(g => g.type === 'H')
  const hasNOT   = myGates.some(g => g.type === 'NOT')

  if (hasH)   return `superposición por H → midió |${digitValue}⟩ al azar`
  if (hasNOT) return `NOT invirtió el qubit → |${digitValue}⟩`
  if (qubitIdx === 1 && hasCNOT) {
    return q0digit === '1'
      ? `CNOT lo invirtió (q[0] midió |1⟩) → |${digitValue}⟩`
      : `CNOT no actuó (q[0] midió |0⟩) → se mantuvo en |${digitValue}⟩`
  }
  return `sin puerta → siempre mide |0⟩`
}

// ─── Gate pill styles ─────────────────────────────────────────────────────────
const GATE_STYLE = {
  H:   { border: '#4589ff', color: '#4589ff', bg: 'rgba(69,137,255,0.12)' },
  NOT: { border: '#a855f7', color: '#c084fc', bg: 'rgba(168,85,247,0.12)' },
}

// ─── Circuit Preview ──────────────────────────────────────────────────────────
function CircuitPreview({ gates }) {
  if (!gates || gates.length === 0) {
    return (
      <span className="text-[10px] font-mono text-[#2a3a5a]">
        Circuito vacío — construye uno en M3
      </span>
    )
  }
  return (
    <div className="flex flex-col gap-1.5">
      {[0, 1].map(qubit => {
        const color = qubit === 0 ? Q0_COLOR : Q1_COLOR
        return (
          <div key={qubit} className="flex items-center gap-1 text-xs font-mono flex-wrap">
            <span className="w-8 flex-shrink-0 font-bold" style={{ color }}>q[{qubit}]</span>
            <span className="text-[#1e2d4a]">──</span>
            {Array.from({ length: 6 }).map((_, slot) => {
              const gate = gates.find(g => g.slot === slot)
              if (!gate) return null
              if (gate.type === 'CNOT') {
                return (
                  <span key={slot} className="text-[#42be65] font-bold mx-0.5">
                    {qubit === 0 ? '●' : '⊕'}
                  </span>
                )
              }
              if (gate.qubit !== qubit) return null
              const st = GATE_STYLE[gate.type]
              return (
                <span key={slot}
                  className="px-1.5 py-0.5 rounded font-bold text-[10px] mx-0.5 flex-shrink-0"
                  style={{ border: `1px solid ${st.border}`, color: st.color, background: st.bg }}
                >
                  {gate.type}
                </span>
              )
            })}
            <span className="text-[#1e2d4a]">──</span>
            <span className="px-1.5 py-0.5 border border-[#2a4060] text-[#4a6080] rounded text-[10px] flex-shrink-0">M</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Histogram bar ────────────────────────────────────────────────────────────
const BAR_FILL = {
  '00': { bar: 'bg-[#0e4a6a]', glow: 'shadow-[0_0_6px_rgba(34,211,238,0.35)]' },
  '01': { bar: 'bg-[#1e3a5a]', glow: 'shadow-[0_0_4px_rgba(34,211,238,0.15)]' },
  '10': { bar: 'bg-[#3a2a50]', glow: 'shadow-[0_0_4px_rgba(251,146,60,0.15)]' },
  '11': { bar: 'bg-[#3a1850]', glow: 'shadow-[0_0_6px_rgba(168,85,247,0.35)]' },
}

function Bar({ label, count, total, animFlash }) {
  const pct    = total === 0 ? 0 : count / total
  const c      = BAR_FILL[label]
  const active = count > 0
  const flash  = animFlash === label
  const [d1, d0] = label.split('')  // d1=q[1] digit, d0=q[0] digit

  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <span className={`text-xs font-mono font-bold ${active ? 'text-white' : 'text-[#2a3a5a]'}`}>
        {(pct * 100).toFixed(1)}%
      </span>
      <div className="w-full flex flex-col justify-end bg-[#080c18] border border-[#1e2d4a] rounded overflow-hidden" style={{ height: 180 }}>
        <div
          className={`w-full transition-all duration-300 ${c.bar} ${active ? c.glow : ''} ${flash ? 'brightness-150' : ''}`}
          style={{ height: `${pct * 100}%`, minHeight: active ? 4 : 0 }}
        />
      </div>
      <span className={`text-[10px] font-mono ${active ? 'text-[#4a6080]' : 'text-[#1e2d4a]'}`}>{count}</span>
      {/* Two-color outcome label */}
      <span className="text-sm font-mono font-bold">
        |<span style={{ color: active ? Q1_COLOR : '#2a3a5a' }}>{d1}</span>
        <span style={{ color: active ? Q0_COLOR : '#2a3a5a' }}>{d0}</span>⟩
      </span>
    </div>
  )
}

// ─── State Reading Panel (replaces M5) ───────────────────────────────────────
function StateReadingPanel({ gates, counts, total }) {
  if (total === 0 || !gates || gates.length === 0) return null

  const activeOutcomes = OUTCOMES
    .filter(o => counts[o] > 0)
    .sort((a, b) => counts[b] - counts[a])

  return (
    <div className="bg-[#0d1528] border border-[#1e2d4a] rounded-lg p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: Q0_COLOR }} />
        <span className="text-[10px] font-mono text-[#3a5070] uppercase tracking-widest">Lectura de estados</span>
      </div>

      {/* How to read key */}
      <div className="bg-[#080c18] border border-[#1e2d4a] rounded p-3 flex flex-col gap-2">
        <span className="text-[10px] font-mono text-[#3a5070]">Cómo leer cada resultado |XY⟩:</span>
        <div className="flex items-center gap-4 font-mono">
          <div className="text-xl flex items-center">
            <span className="text-[#4a6080]">|</span>
            <span className="font-bold" style={{ color: Q1_COLOR }}>X</span>
            <span className="font-bold" style={{ color: Q0_COLOR }}>Y</span>
            <span className="text-[#4a6080]">⟩</span>
          </div>
          <div className="flex flex-col gap-1 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: Q1_COLOR, display: 'inline-block' }} />
              <span className="font-bold" style={{ color: Q1_COLOR }}>X</span>
              <span className="text-[#3a5070]">= primer dígito → estado de</span>
              <span className="font-bold" style={{ color: Q1_COLOR }}>q[1]</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: Q0_COLOR, display: 'inline-block' }} />
              <span className="font-bold" style={{ color: Q0_COLOR }}>Y</span>
              <span className="text-[#3a5070]">= segundo dígito → estado de</span>
              <span className="font-bold" style={{ color: Q0_COLOR }}>q[0]</span>
            </div>
          </div>
        </div>
      </div>

      {/* Per-outcome breakdown */}
      <div className="flex flex-col gap-2">
        {activeOutcomes.map(outcome => {
          const [d1, d0] = outcome.split('')
          const pct  = ((counts[outcome] / total) * 100).toFixed(1)
          const expl1 = explainQubit(1, d1, gates, outcome)
          const expl0 = explainQubit(0, d0, gates, outcome)

          return (
            <div key={outcome} className="border border-[#1e2d4a] rounded p-3 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="text-base font-mono font-bold">
                  |<span style={{ color: Q1_COLOR }}>{d1}</span>
                  <span style={{ color: Q0_COLOR }}>{d0}</span>⟩
                </span>
                <span className="text-xs font-mono text-[#4a6080]">{pct}% de los shots</span>
              </div>
              <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-[#1e2d4a]">
                <div className="flex items-start gap-2 text-[10px] font-mono">
                  <span className="font-bold flex-shrink-0" style={{ color: Q1_COLOR }}>q[1] = {d1}</span>
                  <span className="text-[#2a3a5a]">→</span>
                  <span className="text-[#4a6080]">{expl1}</span>
                </div>
                <div className="flex items-start gap-2 text-[10px] font-mono">
                  <span className="font-bold flex-shrink-0" style={{ color: Q0_COLOR }}>q[0] = {d0}</span>
                  <span className="text-[#2a3a5a]">→</span>
                  <span className="text-[#4a6080]">{expl0}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Statistical insight (after 50 shots) ────────────────────────────────────
function Insight({ counts, total, probs }) {
  const isBell    = probs['00'] > 0.45 && probs['11'] > 0.45 && probs['01'] < 0.05 && probs['10'] < 0.05
  const isDet     = Object.values(probs).some(p => p > 0.99)
  const isUniform = Object.values(probs).every(p => Math.abs(p - 0.25) < 0.05)

  if (isBell) return (
    <p className="text-xs font-mono text-[#4a6080] leading-relaxed">
      Tras <span className="text-white">{total}</span> mediciones:{' '}
      <span style={{ color: Q0_COLOR }}>|00⟩ = {((counts['00']/total)*100).toFixed(1)}%</span>,{' '}
      <span style={{ color: Q1_COLOR }}>|11⟩ = {((counts['11']/total)*100).toFixed(1)}%</span>.{' '}
      {counts['01'] + counts['10'] > 0 && (
        <span>Ruido: |01⟩+|10⟩ = {(((counts['01']+counts['10'])/total)*100).toFixed(1)}%. </span>
      )}
      Los dos qubits siempre miden el mismo valor — eso es entrelazamiento cuántico.
    </p>
  )

  if (isDet) {
    const o = Object.entries(probs).find(([, p]) => p > 0.99)[0]
    return (
      <p className="text-xs font-mono text-[#4a6080] leading-relaxed">
        Tras <span className="text-white">{total}</span> mediciones: siempre{' '}
        <span className="text-white font-bold">|{o}⟩</span>.{' '}
        Este circuito es completamente determinístico — no hay aleatoriedad.
      </p>
    )
  }

  if (isUniform) return (
    <p className="text-xs font-mono text-[#4a6080] leading-relaxed">
      Tras <span className="text-white">{total}</span> mediciones: distribución uniforme (~25% cada estado).
      La superposición completa hace que todos los resultados sean igualmente probables.
    </p>
  )

  return (
    <p className="text-xs font-mono text-[#4a6080] leading-relaxed">
      Tras <span className="text-white">{total}</span> mediciones:{' '}
      {OUTCOMES.filter(o => counts[o] > 0).map((o, i, arr) => (
        <span key={o}>
          <span className="text-white">|{o}⟩ = {((counts[o]/total)*100).toFixed(1)}%</span>
          {i < arr.length - 1 ? ', ' : '.'}
        </span>
      ))}{' '}
      Distribución estadística del circuito construido.
    </p>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ShotSimulator({ gates }) {
  const [counts, setCounts]       = useState({ '00': 0, '01': 0, '10': 0, '11': 0 })
  const [animFlash, setAnimFlash] = useState(null)
  const [running, setRunning]     = useState(false)
  const animRef = useRef(null)

  const probs   = useMemo(() => simulate(gates), [gates])
  const label   = useMemo(() => getCircuitLabel(probs), [probs])
  const total   = Object.values(counts).reduce((a, b) => a + b, 0)
  const isEmpty = !gates || gates.length === 0

  const addShot = useCallback(() => {
    const o = sampleFromProbs(probs)
    setCounts(c => ({ ...c, [o]: c[o] + 1 }))
    setAnimFlash(o)
    setTimeout(() => setAnimFlash(null), 250)
  }, [probs])

  const runBulk = useCallback(() => {
    if (running) return
    const remaining = TOTAL - total
    if (remaining <= 0) return
    setRunning(true)
    const batch = Array.from({ length: remaining }, () => sampleFromProbs(probs))
    const steps = 20
    const perStep = Math.ceil(remaining / steps)
    let done = 0
    const tick = () => {
      const chunk = batch.slice(done, done + perStep)
      const d = { '00': 0, '01': 0, '10': 0, '11': 0 }
      chunk.forEach(o => d[o]++)
      setCounts(c => ({ '00': c['00']+d['00'], '01': c['01']+d['01'], '10': c['10']+d['10'], '11': c['11']+d['11'] }))
      done += perStep
      if (done < remaining) { animRef.current = setTimeout(tick, 40) }
      else { setRunning(false) }
    }
    animRef.current = setTimeout(tick, 0)
  }, [running, total, probs])

  const reset = () => {
    if (animRef.current) clearTimeout(animRef.current)
    setCounts({ '00': 0, '01': 0, '10': 0, '11': 0 })
    setRunning(false)
    setAnimFlash(null)
  }

  const remaining = TOTAL - total

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Simulador de Shots</h1>
        <p className="text-[#3a5570] text-sm font-mono">
          Ejecuta el circuito repetidamente y observa la distribución de resultados.
        </p>
      </div>

      {/* Circuit preview */}
      <div className="bg-[#0d1528] border border-[#1e2d4a] rounded-lg p-4 flex items-start justify-between gap-4 flex-wrap">
        <CircuitPreview gates={gates} />
        {!isEmpty && (
          <span className={`text-[10px] font-mono self-center flex-shrink-0 ${label.color}`}>{label.text}</span>
        )}
      </div>

      {isEmpty ? (
        <div className="text-center text-[#2a3a5a] text-xs font-mono py-10 border border-dashed border-[#1e2d4a] rounded">
          No hay circuito — ve a M3, construye uno y pulsa "Ejecutar circuito"
        </div>
      ) : (
        <>
          {/* Histogram */}
          <div className="bg-[#0d1528] border border-[#1e2d4a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-[#3a5070] uppercase tracking-widest">Histograma de resultados</span>
              <span className="text-xs font-mono text-[#4a6080]">
                <span className={total > 0 ? 'text-white font-bold' : ''}>{total}</span>
                <span className="text-[#2a3a5a]"> / {TOTAL} shots</span>
              </span>
            </div>

            {/* Qubit color key */}
            <div className="flex items-center gap-5 mb-5 text-[10px] font-mono">
              <span className="text-[#2a3a5a]">En cada |XY⟩:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: Q1_COLOR }} />
                <span style={{ color: Q1_COLOR }}>X</span>
                <span className="text-[#3a5070]">= primer dígito = q[1]</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: Q0_COLOR }} />
                <span style={{ color: Q0_COLOR }}>Y</span>
                <span className="text-[#3a5070]">= segundo dígito = q[0]</span>
              </div>
            </div>

            <div className="flex gap-4 items-end">
              {OUTCOMES.map(o => (
                <Bar key={o} label={o} count={counts[o]} total={total} animFlash={animFlash} />
              ))}
            </div>

            <div className="mt-4 w-full h-1 bg-[#080c18] rounded overflow-hidden border border-[#1e2d4a]">
              <div className="h-full bg-cyan-800 transition-all duration-300" style={{ width: `${(total/TOTAL)*100}%` }} />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={addShot}
              disabled={running || total >= TOTAL}
              className={[
                'px-5 py-2.5 rounded border text-sm font-mono font-bold transition-all duration-200',
                !running && total < TOTAL
                  ? 'border-cyan-600 text-cyan-300 hover:bg-cyan-900/20 cursor-pointer hover:shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                  : 'border-[#1e2d4a] text-[#2a3a5a] cursor-not-allowed',
              ].join(' ')}
            >
              + 1 shot
            </button>
            <button
              onClick={runBulk}
              disabled={running || total >= TOTAL}
              className={[
                'px-5 py-2.5 rounded border text-sm font-mono font-bold transition-all duration-200',
                !running && total < TOTAL
                  ? 'border-purple-600 text-purple-300 hover:bg-purple-900/20 cursor-pointer hover:shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'border-[#1e2d4a] text-[#2a3a5a] cursor-not-allowed',
              ].join(' ')}
            >
              {running ? '⟳ simulando…' : `▶▶ ${remaining > 0 ? remaining : TOTAL} shots`}
            </button>
            <button
              onClick={reset}
              className="px-4 py-2.5 rounded border border-[#1e2d4a] text-[#3a5070] text-sm font-mono hover:border-[#2a3a5a] hover:text-[#4a6080] transition-all duration-200 cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* State reading panel */}
          <StateReadingPanel gates={gates} counts={counts} total={total} />

          {/* Statistical insight */}
          {total >= 50 && (
            <div className="bg-[#0d1528] border border-[#1e2d4a] rounded p-4 fade-in">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-[10px] font-mono text-yellow-600 uppercase tracking-widest">Interpretación estadística</span>
              </div>
              <Insight counts={counts} total={total} probs={probs} />
            </div>
          )}

          {total === 0 && (
            <div className="text-center text-[#2a3a5a] text-xs font-mono py-4 border border-dashed border-[#1e2d4a] rounded">
              Presiona "+ 1 shot" o "▶▶ shots" para ejecutar el circuito
            </div>
          )}
        </>
      )}
    </div>
  )
}
