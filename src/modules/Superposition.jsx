import { useState, useCallback } from 'react'

const S = { ZERO: 'zero', SUPER: 'superposition', MEASURED: 'measured' }

/* ── Bloch sphere ── */
function BlochSphere({ state, result }) {
  const isSuper    = state === S.SUPER
  const isMeasured = state === S.MEASURED

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="150" height="150" viewBox="0 0 160 160" className="overflow-visible">
        <defs>
          <filter id="glow-b"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="glow-p"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        <ellipse cx="80" cy="80" rx="60" ry="60" fill="none" stroke="var(--border)" strokeWidth="1.5"/>
        <ellipse cx="80" cy="80" rx="60" ry="18" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 3"/>
        <line x1="80" y1="16" x2="80" y2="144" stroke="var(--border)" strokeWidth="1"/>
        <text x="80" y="11"  textAnchor="middle" fill="#4589ff" fontSize="11" fontFamily="monospace">|0⟩</text>
        <text x="80" y="155" textAnchor="middle" fill="var(--ibm-purple)" fontSize="11" fontFamily="monospace">|1⟩</text>

        {state === S.ZERO && <>
          <line x1="80" y1="80" x2="80" y2="24" stroke="#4589ff" strokeWidth="2.5"/>
          <circle cx="80" cy="24" r="5" fill="#4589ff" filter="url(#glow-b)"/>
        </>}

        {isSuper && <>
          <line x1="80" y1="80" x2="122" y2="38" stroke="#f0c040" strokeWidth="2" strokeDasharray="5 3" opacity=".8"/>
          <circle cx="122" cy="38" r="4" fill="#f0c040" opacity=".9"/>
          <path d="M 80 24 A 56 56 0 0 1 136 80" fill="none" stroke="var(--ibm-purple)" strokeWidth="1.5" strokeDasharray="6 4" opacity=".4"/>
        </>}

        {isMeasured && <>
          <line x1="80" y1="80" x2="80" y2={result === 0 ? 24 : 136}
            stroke={result === 0 ? '#4589ff' : 'var(--ibm-purple)'} strokeWidth="2.5"/>
          <circle cx="80" cy={result === 0 ? 24 : 136} r="5"
            fill={result === 0 ? '#4589ff' : 'var(--ibm-purple)'}
            filter={result === 0 ? 'url(#glow-b)' : 'url(#glow-p)'}/>
        </>}

        <circle cx="80" cy="80" r="3" fill="var(--border)"/>
      </svg>

      <div className="px-3 py-1 rounded font-mono text-xs font-bold border transition-all duration-400"
        style={state === S.ZERO
          ? { borderColor: '#4589ff', color: '#4589ff', background: 'rgba(69,137,255,.08)' }
          : state === S.SUPER
            ? { borderColor: '#f0c040', color: '#f0c040', background: 'rgba(240,192,64,.06)' }
            : result === 0
              ? { borderColor: '#4589ff', color: '#4589ff', background: 'rgba(69,137,255,.08)' }
              : { borderColor: 'var(--ibm-purple)', color: 'var(--ibm-purple)', background: 'rgba(165,110,255,.08)' }
        }
      >
        {state === S.ZERO     && '|0⟩'}
        {state === S.SUPER    && '(|0⟩ + |1⟩) / √2'}
        {state === S.MEASURED && `|${result}⟩ — colapsado`}
      </div>
    </div>
  )
}

/* ── Prob bars ── */
function ProbBars({ p0, p1, animKey }) {
  return (
    <div className="w-full flex flex-col gap-2" key={animKey}>
      {[{ lbl:'|0⟩', v:p0, col:'#4589ff' }, { lbl:'|1⟩', v:p1, col:'var(--ibm-purple)' }].map(({ lbl, v, col }) => (
        <div key={lbl} className="flex items-center gap-3">
          <span className="font-mono text-xs w-8" style={{ color: 'var(--text-muted)' }}>{lbl}</span>
          <div className="flex-1 h-6 rounded overflow-hidden relative"
            style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)' }}>
            <div className="h-full bar-animated transition-all duration-500"
              style={{ width: `${v * 100}%`, background: col, opacity: .5 }}/>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-xs"
              style={{ color: col }}>{Math.round(v * 100)}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── History ── */
function History({ history }) {
  if (!history.length) return null
  const zeros = history.filter(v => v === 0).length
  const ones  = history.length - zeros

  return (
    <div className="rounded-lg p-4 flex flex-col gap-3"
      style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
          Historial de mediciones
        </span>
        <span className="font-mono text-xs" style={{ color: 'var(--text-dim)' }}>n = {history.length}</span>
      </div>

      <div className="flex flex-wrap gap-1 max-h-14 overflow-hidden">
        {history.slice(-48).map((v, i) => (
          <span key={i}
            className="w-5 h-5 rounded font-mono font-bold text-[10px] flex items-center justify-center"
            style={v === 0
              ? { background: 'rgba(69,137,255,.12)', color: '#4589ff', border: '1px solid rgba(69,137,255,.3)' }
              : { background: 'rgba(165,110,255,.12)', color: 'var(--ibm-purple)', border: '1px solid rgba(165,110,255,.3)' }
            }>{v}</span>
        ))}
        {history.length > 48 && <span className="self-center font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>+{history.length - 48}</span>}
      </div>

      <div className="flex gap-4 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
        {[
          { label: 'ceros', count: zeros, col: '#4589ff' },
          { label: 'unos',  count: ones,  col: 'var(--ibm-purple)' },
          { label: 'total', count: history.length, col: 'var(--text-muted)' },
        ].map(({ label, count, col }, i, arr) => (
          <div key={label} className="flex-1 text-center">
            <div className="text-lg font-bold font-mono" style={{ color: col }}>{count}</div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>
              {label}{i < 2 ? ` (${Math.round(count / history.length * 100)}%)` : ''}
            </div>
          </div>
        ))}
      </div>

      {history.length >= 10 && (
        <p className="font-mono border-t pt-2" style={{ fontSize: 10, color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
          {Math.abs(zeros / history.length - 0.5) < 0.1
            ? '✓ Distribución convergiendo a 50/50 — ley de grandes números.'
            : 'Aún convergiendo. Con más mediciones la estadística se estabilizará.'}
        </p>
      )}
    </div>
  )
}

/* ── Gate box ── */
function GateBox({ active, label }) {
  return (
    <div className="w-8 h-8 border-2 rounded flex items-center justify-center transition-all duration-300"
      style={active
        ? { borderColor: '#f0c040', background: 'rgba(240,192,64,.1)' }
        : { borderColor: 'var(--border)', background: 'transparent' }
      }>
      <span className="font-mono text-sm font-bold"
        style={{ color: active ? '#f0c040' : 'var(--text-dim)' }}>{label}</span>
    </div>
  )
}

/* ── Main export ── */
export default function Superposition() {
  const [state, setState]   = useState(S.ZERO)
  const [result, setResult] = useState(null)
  const [history, setHist]  = useState([])
  const [animKey, setKey]   = useState(0)

  const applyH = useCallback(() => {
    setState(S.SUPER); setResult(null); setKey(k => k + 1)
  }, [])

  const measure = useCallback(() => {
    const r = Math.random() < 0.5 ? 1 : 0
    setResult(r); setState(S.MEASURED); setHist(h => [...h, r])
    setTimeout(() => {
      setTimeout(() => { setState(S.SUPER); setResult(null); setKey(k => k + 1) }, 800)
    }, 600)
  }, [])

  const reset = useCallback(() => {
    setState(S.ZERO); setResult(null); setHist([]); setKey(k => k + 1)
  }, [])

  const p0 = state === S.ZERO ? 1 : state === S.SUPER ? 0.5 : result === 0 ? 1 : 0
  const p1 = 1 - p0

  const explanations = {
    [S.ZERO]:     'El qubit está en |0⟩. Aplica la puerta Hadamard para crear superposición.',
    [S.SUPER]:    'La puerta H rotó 90° en la esfera de Bloch. Ahora 50/50. ¡Mídelo!',
    [S.MEASURED]: `Colapsó a |${result}⟩. Vuelve automáticamente a superposición.`,
  }

  const isCanMeasure = state === S.SUPER

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight mb-1" style={{ color: '#e8e8ff' }}>
          Visualizador de Superposición
        </h1>
        <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
          Observa cómo la puerta Hadamard crea superposición y cómo emerge la estadística.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">

        {/* Left — controls */}
        <div className="rounded-lg p-5 sm:p-6 flex flex-col gap-5"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: '#f0c040' }} />
            <span className="font-mono text-xs font-bold tracking-widest uppercase" style={{ color: '#f0c040' }}>
              Circuito Cuántico
            </span>
          </div>

          {/* Circuit diagram */}
          <div className="flex items-center gap-1 rounded p-3 overflow-x-auto"
            style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)' }}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <span className="font-mono text-[10px]" style={{ color: '#4589ff' }}>|0⟩</span>
              <div className="w-8 h-8 border-2 rounded flex items-center justify-center"
                style={{ borderColor: '#4589ff', background: 'rgba(69,137,255,.08)' }}>
                <span className="font-mono text-[10px]" style={{ color: '#4589ff' }}>|0⟩</span>
              </div>
            </div>
            <div className="flex-1 h-px mx-1" style={{ background: 'var(--border)', minWidth: 8 }} />
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <span className="font-mono text-[10px]" style={{ color: '#f0c040' }}>H</span>
              <GateBox active={state !== S.ZERO} label="H" />
            </div>
            <div className="flex-1 h-px mx-1" style={{ background: 'var(--border)', minWidth: 8 }} />
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>M</span>
              <div className="w-8 h-8 border-2 rounded flex items-center justify-center transition-all duration-300"
                style={isCanMeasure
                  ? { borderColor: 'var(--ibm-purple)', background: 'rgba(165,110,255,.08)' }
                  : { borderColor: 'var(--border)', background: 'transparent' }
                }>
                <span className="text-sm" style={{ color: isCanMeasure ? 'var(--ibm-purple)' : 'var(--text-dim)' }}>⟨M⟩</span>
              </div>
            </div>
            <div className="flex-1 h-px mx-1" style={{ background: 'var(--border)', minWidth: 8 }} />
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <span className="font-mono text-[10px]" style={{ color: 'var(--text-dim)' }}>out</span>
              <div className="w-8 h-8 border-2 rounded flex items-center justify-center transition-all duration-300"
                style={state === S.MEASURED
                  ? { borderColor: result === 0 ? '#4589ff' : 'var(--ibm-purple)',
                      background: result === 0 ? 'rgba(69,137,255,.08)' : 'rgba(165,110,255,.08)' }
                  : { borderColor: 'var(--border)', background: 'transparent' }
                }>
                <span className="font-mono text-sm font-bold"
                  style={{ color: state === S.MEASURED
                    ? (result === 0 ? '#4589ff' : 'var(--ibm-purple)')
                    : 'var(--text-dim)' }}>
                  {state === S.MEASURED ? result : '?'}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            {[
              { label: 'Aplicar H', sub: 'puerta Hadamard', enabled: state === S.ZERO, action: applyH, col: '#f0c040' },
              { label: 'Medir',     sub: 'colapsar',        enabled: isCanMeasure,     action: measure, col: 'var(--ibm-purple)' },
            ].map(({ label, sub, enabled, action, col }) => (
              <button key={label} onClick={action} disabled={!enabled}
                className="w-full py-3 rounded font-mono text-sm font-bold border-2 transition-all duration-300"
                style={enabled
                  ? { borderColor: col, color: col, cursor: 'pointer', background: 'transparent' }
                  : { borderColor: 'var(--border)', color: 'var(--text-dim)', cursor: 'not-allowed', background: 'transparent' }
                }
                onMouseEnter={e => { if (enabled) e.currentTarget.style.background = `rgba(128,128,128,.1)` }}
                onMouseLeave={e => { if (enabled) e.currentTarget.style.background = 'transparent' }}
              >
                {label}{' '}
                <span style={{ color: 'var(--text-dim)', fontWeight: 'normal' }}>({sub})</span>
              </button>
            ))}
            <button onClick={reset}
              className="w-full py-2 rounded font-mono text-xs border transition-all duration-300 cursor-pointer"
              style={{ borderColor: 'var(--border-dim)', color: 'var(--text-dim)', background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-dim)';   e.currentTarget.style.borderColor = 'var(--border-dim)' }}
            >
              Resetear todo
            </button>
          </div>

          {/* Explanation */}
          <div className="rounded p-3 font-mono text-xs leading-relaxed fade-in"
            style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            {explanations[state]}
          </div>
        </div>

        {/* Right — visualization */}
        <div className="flex flex-col gap-5">
          <div className="rounded-lg p-5 sm:p-6 flex flex-col items-center gap-5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 self-start">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--ibm-purple)' }} />
              <span className="font-mono text-xs font-bold tracking-widest uppercase" style={{ color: 'var(--ibm-purple)' }}>
                Esfera de Bloch
              </span>
            </div>
            <BlochSphere state={state} result={result} />
            <ProbBars p0={p0} p1={p1} animKey={animKey} />
          </div>

          {/* Hadamard matrix */}
          <div className="rounded-lg p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: '#f0c040' }} />
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase" style={{ color: '#f0c040' }}>
                Puerta Hadamard
              </span>
            </div>
            <div className="flex items-center justify-center gap-4 font-mono text-sm">
              <span style={{ color: 'var(--text-dim)' }}>H =</span>
              <div className="border-l-2 border-r-2 px-3 py-1 flex flex-col gap-0.5"
                style={{ borderColor: 'var(--text-dim)' }}>
                <div className="flex gap-6">
                  <span style={{ color: '#4589ff' }}>1</span>
                  <span style={{ color: '#4589ff' }}>1</span>
                </div>
                <div className="flex gap-6">
                  <span style={{ color: 'var(--ibm-purple)' }}>1</span>
                  <span style={{ color: '#e05050' }}>-1</span>
                </div>
              </div>
              <span style={{ color: 'var(--text-dim)' }}>/ √2</span>
            </div>
            <p className="font-mono text-center mt-3 leading-relaxed"
              style={{ fontSize: 10, color: 'var(--text-dim)' }}>
              |0⟩ → (|0⟩+|1⟩)/√2<br />|1⟩ → (|0⟩−|1⟩)/√2
            </p>
          </div>
        </div>
      </div>

      <History history={history} />

      {!history.length && (
        <div className="text-center font-mono text-xs py-4 border border-dashed rounded"
          style={{ color: 'var(--text-dim)', borderColor: 'var(--border-dim)' }}>
          Aplica H y mide varias veces para ver la estadística → 50/50
        </div>
      )}
    </div>
  )
}
