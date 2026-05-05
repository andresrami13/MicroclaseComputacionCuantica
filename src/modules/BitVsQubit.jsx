import { useState, useCallback } from 'react'

/* ── Shared panel ── */
function Panel({ title, dotColor = '#4589ff', children }) {
  return (
    <div className="rounded-lg p-5 sm:p-6 flex flex-col gap-5 h-full"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: dotColor }} />
        <span className="text-xs font-bold tracking-widest uppercase font-mono" style={{ color: dotColor }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  )
}

/* ── Classic bit ── */
function ClassicBit() {
  const [bit, setBit] = useState(0)

  return (
    <Panel title="Bit Clásico" dotColor="#4589ff">
      <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Un bit solo puede ser{' '}
        <span className="font-bold" style={{ color: '#4589ff' }}>0</span> o{' '}
        <span className="font-bold" style={{ color: '#4589ff' }}>1</span>.
        Nunca en ambos. Es como un interruptor de luz.
      </p>

      <div className="flex flex-col items-center gap-6">
        {/* Display circle */}
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 flex items-center justify-center text-3xl sm:text-4xl font-bold font-mono transition-all duration-400"
          style={bit === 1
            ? { borderColor: '#4589ff', background: '#0d1e40', color: '#4589ff', boxShadow: '0 0 22px rgba(69,137,255,.35)' }
            : { borderColor: 'var(--border)', background: 'var(--bg-deep)', color: 'var(--text-dim)' }
          }
        >
          {bit}
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono transition-colors duration-300"
            style={{ color: bit === 0 ? '#4589ff' : 'var(--text-dim)' }}>0</span>
          <button
            onClick={() => setBit(b => b === 0 ? 1 : 0)}
            className="relative w-14 h-7 rounded-full border-2 transition-all duration-300 cursor-pointer outline-none"
            style={bit === 1
              ? { background: 'rgba(69,137,255,.15)', borderColor: '#4589ff' }
              : { background: 'var(--bg-deep)', borderColor: 'var(--border)' }
            }
            aria-label="Toggle bit"
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300"
              style={bit === 1
                ? { left: 28, background: '#4589ff', boxShadow: '0 0 8px rgba(69,137,255,.7)' }
                : { left: 2,  background: 'var(--text-dim)' }
              }
            />
          </button>
          <span className="text-sm font-mono transition-colors duration-300"
            style={{ color: bit === 1 ? '#4589ff' : 'var(--text-dim)' }}>1</span>
        </div>

        <div className="w-full rounded p-3 font-mono text-xs text-center text-white"
          style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)' }}>
          Estado actual:{' '}
          <span style={{ color: '#4589ff' }}>|{bit}⟩</span>{' '}
          — completamente determinístico
        </div>
      </div>
    </Panel>
  )
}

/* ── Qubit ── */
function QubitDisplay({ prob, measured, result, isFlashing }) {
  const arc = prob * 180
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 flex items-center justify-center relative transition-all duration-400${!measured ? ' pulse-ring' : ''}${isFlashing ? ' collapse-flash' : ''}`}
        style={measured
          ? result === 0
            ? { borderColor: 'var(--border)', background: 'var(--bg-deep)' }
            : { borderColor: 'var(--ibm-purple)', background: '#1a0d35' }
          : { borderColor: 'var(--ibm-purple)', background: '#130d28' }
        }
      >
        {measured ? (
          <span className="text-3xl sm:text-4xl font-bold font-mono"
            style={{ color: result === 0 ? 'var(--text-dim)' : 'var(--ibm-purple)' }}>
            {result}
          </span>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-lg font-mono font-bold" style={{ color: 'var(--ibm-purple)' }}>?</span>
            <span className="text-[10px] font-mono" style={{ color: 'var(--ibm-purple)', opacity: .7 }}>
              {Math.round(prob * 100)}%
            </span>
          </div>
        )}
        {!measured && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 96 96"
            style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="48" cy="48" r="40" fill="none" stroke="#2a1545" strokeWidth="2" />
            <circle cx="48" cy="48" r="40" fill="none" stroke="var(--ibm-purple)"
              strokeWidth="2" strokeDasharray={`${(arc / 360) * 251} 251`} opacity="0.6" />
          </svg>
        )}
      </div>
    </div>
  )
}

function QuantumQubit() {
  const [prob, setProb]         = useState(0.5)
  const [measured, setMeasured] = useState(false)
  const [result, setResult]     = useState(null)
  const [isFlashing, setFlash]  = useState(false)

  const measure = useCallback(() => {
    const r = Math.random() < prob ? 1 : 0
    setResult(r); setMeasured(true); setFlash(true)
    setTimeout(() => setFlash(false), 700)
  }, [prob])

  const reset = () => { setMeasured(false); setResult(null); setFlash(false) }

  const stateLabel = () => {
    if (measured) return result === 1 ? '|1⟩ — colapsó a UNO' : '|0⟩ — colapsó a CERO'
    if (prob === 0) return '|0⟩ — certeza de cero'
    if (prob === 1) return '|1⟩ — certeza de uno'
    return 'α|0⟩ + β|1⟩ — superposición'
  }

  const explanation = () => {
    if (measured) return result === 1
      ? 'El qubit colapsó a |1⟩. La superposición se destruye y el sistema elige un estado definido.'
      : 'El qubit colapsó a |0⟩. La medición forzó al sistema a "decidir".'
    if (prob === 0) return 'Con probabilidad 0% de ser 1, el qubit actúa como un bit clásico en estado 0.'
    if (prob === 1) return 'Con probabilidad 100%, actúa como bit clásico en estado 1.'
    return `El qubit existe en ambos estados a la vez. ${Math.round(prob * 100)}% de probabilidad de colapsar a 1.`
  }

  const labelColor = measured
    ? (result === 1 ? 'var(--ibm-purple)' : '#4589ff')
    : '#f0c040'

  return (
    <Panel title="Qubit" dotColor="var(--ibm-purple)">
      <p className="font-mono text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        Un qubit puede ser{' '}
        <span style={{ color: 'var(--ibm-purple)' }} className="font-bold">|0⟩</span>,{' '}
        <span style={{ color: 'var(--ibm-purple)' }} className="font-bold">|1⟩</span>, o una{' '}
        <span style={{ color: '#f0c040' }}>superposición</span> de ambos.
        Solo al medirlo obtenemos un valor definido.
      </p>

      <div className="flex flex-col items-center gap-4">
        <QubitDisplay prob={prob} measured={measured} result={result} isFlashing={isFlashing} />

        {/* Slider */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex justify-between font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>P(1) = {Math.round(prob * 100)}%</span>
            <span style={{ color: 'var(--text-dim)' }}>← arrástrame</span>
          </div>
          <input type="range" min="0" max="100" value={Math.round(prob * 100)}
            onChange={e => { setProb(e.target.value / 100); setMeasured(false); setResult(null) }}
            className="w-full h-1.5 rounded cursor-pointer appearance-none"
            style={{ background: 'var(--border)' }} />
          <div className="flex justify-between font-mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>
            <span>0% → |0⟩</span><span>50% → H</span><span>100% → |1⟩</span>
          </div>
        </div>

        {/* Probability bars */}
        {(['|0⟩', '|1⟩']).map((lbl, i) => {
          const val = i === 0 ? (1 - prob) : prob
          const col = i === 0 ? '#4589ff' : 'var(--ibm-purple)'
          return (
            <div key={lbl} className="w-full flex items-center gap-2">
              <span className="font-mono text-xs w-6" style={{ color: 'var(--text-muted)' }}>{lbl}</span>
              <div className="flex-1 h-5 rounded overflow-hidden relative" style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)' }}>
                <div className="h-full transition-all duration-400"
                  style={{ width: `${val * 100}%`, background: col, opacity: .5 }} />
              </div>
              <span className="font-mono text-xs w-10 text-right" style={{ color: col }}>
                {Math.round(val * 100)}%
              </span>
            </div>
          )
        })}

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          <button onClick={measure} disabled={measured}
            className="flex-1 py-2.5 rounded font-mono text-sm font-bold border-2 transition-all duration-300"
            style={measured
              ? { borderColor: 'var(--border)', color: 'var(--text-dim)', cursor: 'not-allowed', background: 'transparent' }
              : { borderColor: 'var(--ibm-purple)', color: 'var(--ibm-purple)', cursor: 'pointer', background: 'transparent' }
            }
            onMouseEnter={e => { if (!measured) e.currentTarget.style.background = 'rgba(165,110,255,.12)' }}
            onMouseLeave={e => { if (!measured) e.currentTarget.style.background = 'transparent' }}
          >
            Medir
          </button>
          {measured && (
            <button onClick={reset}
              className="flex-1 py-2.5 rounded font-mono text-sm font-bold border-2 transition-all duration-300 cursor-pointer"
              style={{ borderColor: '#4589ff', color: '#4589ff', background: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(69,137,255,.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Resetear
            </button>
          )}
        </div>

        {/* Explanation */}
        <div className="w-full rounded p-3 fade-in" style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)' }}>
          <p className="font-mono text-xs leading-relaxed">
            <span className="font-bold" style={{ color: labelColor }}>{stateLabel()}</span>
            <br />
            <span style={{ color: 'var(--text-muted)' }}>{explanation()}</span>
          </p>
        </div>
      </div>
    </Panel>
  )
}

export default function BitVsQubit() {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight mb-1" style={{ color: '#e8e8ff' }}>
          Bit vs Qubit
        </h1>
        <p className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
          La diferencia fundamental entre la computación clásica y la cuántica.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        <ClassicBit />
        <QuantumQubit />
      </div>

      {/* Comparison table */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full font-mono resp-table" style={{ minWidth: 380 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left px-4 py-3 text-xs font-normal" style={{ color: 'var(--text-dim)' }}>Característica</th>
                <th className="text-center px-4 py-3 text-xs font-normal" style={{ color: '#4589ff' }}>Bit Clásico</th>
                <th className="text-center px-4 py-3 text-xs font-normal" style={{ color: 'var(--ibm-purple)' }}>Qubit</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Estados posibles',  '0 o 1',             '|0⟩, |1⟩ o superposición'],
                ['Antes de medir',    'Siempre definido',   'Puede ser ambos a la vez'],
                ['Al medir',          'Sin cambios',        'Colapsa al estado medido'],
                ['Ejemplo físico',    'Transistor',         'Átomo / fotón / ion'],
              ].map(([feat, bit, qb]) => (
                <tr key={feat} className="transition-colors duration-150"
                  style={{ borderBottom: '1px solid var(--bg-deep)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-deep)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--text-muted)' }}>{feat}</td>
                  <td className="px-4 py-2.5 text-xs text-center" style={{ color: '#3a78e0' }}>{bit}</td>
                  <td className="px-4 py-2.5 text-xs text-center" style={{ color: '#8a5ecc' }}>{qb}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
