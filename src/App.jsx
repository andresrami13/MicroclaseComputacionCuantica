import { useState, useRef, useEffect } from 'react'
import BitVsQubit    from './modules/BitVsQubit'
import Superposition from './modules/Superposition'
import CircuitBuilder from './modules/CircuitBuilder'
import ShotSimulator  from './modules/ShotSimulator'
import './index.css'

/* ── Tabs ── */
const TABS = [
  { id: 'bit-qubit',     short: 'M1', label: 'Bit vs Qubit' },
  { id: 'superposition', short: 'M2', label: 'Superposición' },
  { id: 'circuit',       short: 'M3', label: 'Constructor de Circuito' },
  { id: 'shots',         short: 'M4', label: 'Simulador de Shots' },
]

/* ── Orbit logo (reused in header + welcome) ── */
function OrbitLogo({ size = 28 }) {
  return (
    <div style={{ width: size, height: size }} className="relative flex items-center justify-center flex-shrink-0">
      <div
        className="absolute inset-0 rounded-full border-2 opacity-60 spin-slow"
        style={{ borderColor: 'var(--ibm-blue)' }}
      />
      <div
        className="rounded-full"
        style={{ width: size * 0.28, height: size * 0.28, background: 'var(--ibm-blue)' }}
      />
    </div>
  )
}

/* ── Footer (shared across all modules) ── */
function Footer() {
  return (
    <footer className="mt-16 py-5 border-t" style={{ borderColor: 'var(--border-dim)' }}>
      <p className="text-center font-mono text-xs" style={{ color: 'var(--text-dim)' }}>
        ¿Listo para el hardware real?{' '}
        <a
          href="https://quantum.ibm.com"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-200 hover:underline"
          style={{ color: 'var(--ibm-blue)' }}
        >
          → quantum.ibm.com
        </a>
      </p>
    </footer>
  )
}

/* ── Welcome screen ── */
function Welcome({ onStart }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--bg-page)' }}
    >
      {/* Decorative orbit rings */}
      <div className="relative flex items-center justify-center mb-10">
        <div
          className="absolute rounded-full border opacity-10 welcome-glow"
          style={{ width: 260, height: 260, borderColor: 'var(--ibm-blue)' }}
        />
        <div
          className="absolute rounded-full border opacity-20 welcome-glow"
          style={{ width: 180, height: 180, borderColor: 'var(--ibm-blue)', animationDelay: '.6s' }}
        />
        <div
          className="absolute rounded-full border-2 spin-slow"
          style={{ width: 120, height: 120, borderColor: 'var(--ibm-blue)', opacity: .35 }}
        />
        <div
          className="rounded-full"
          style={{ width: 18, height: 18, background: 'var(--ibm-blue)', boxShadow: '0 0 20px var(--ibm-blue)' }}
        />
      </div>

      <div className="fade-up" style={{ animationDelay: '.1s' }}>
        <div
          className="inline-block px-3 py-1 rounded-full font-mono text-xs mb-5 border"
          style={{ color: 'var(--ibm-blue)', borderColor: 'var(--ibm-blue)', background: 'rgba(69,137,255,.08)' }}
        >
          Quantum Lab · 4 módulos interactivos
        </div>

        <h1
          className="font-mono font-bold mb-3 leading-tight"
          style={{ fontSize: 'clamp(1.2rem, 3.5vw, 2.2rem)', color: '#e8e8ff' }}
        >
          Computación Cuántica{' '}
          <span style={{ color: 'var(--ibm-blue)' }}>— Del concepto al Composer</span>
        </h1>

        <p
          className="font-mono mb-10 max-w-md mx-auto leading-relaxed"
          style={{ fontSize: 'clamp(.85rem, 2vw, 1rem)', color: 'var(--text-muted)' }}
        >
          Practica aquí antes de usar IBM Quantum
        </p>

        <button
          onClick={onStart}
          className="font-mono font-bold px-8 py-3.5 rounded-lg transition-all duration-300 cursor-pointer"
          style={{
            background: 'var(--ibm-blue)',
            color: '#fff',
            fontSize: '.95rem',
            boxShadow: '0 0 0 0 var(--ibm-blue)',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(69,137,255,.4)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 0 var(--ibm-blue)'}
        >
          Comenzar →
        </button>
      </div>

      {/* Module preview chips */}
      <div className="flex flex-wrap gap-2 justify-center mt-10 fade-up" style={{ animationDelay: '.3s' }}>
        {['Bit vs Qubit', 'Superposición', 'Circuitos', 'Shots'].map(name => (
          <span
            key={name}
            className="font-mono text-xs px-2.5 py-1 rounded border"
            style={{ color: 'var(--text-dim)', borderColor: 'var(--border-dim)', background: 'var(--bg-card)' }}
          >
            {name}
          </span>
        ))}
      </div>

      <footer className="absolute bottom-5 w-full text-center font-mono text-xs" style={{ color: 'var(--text-dim)' }}>
        ¿Listo para el hardware real?{' '}
        <a href="https://quantum.ibm.com" target="_blank" rel="noopener noreferrer"
          className="hover:underline transition-colors" style={{ color: 'var(--ibm-blue)' }}>
          → quantum.ibm.com
        </a>
      </footer>
    </div>
  )
}

/* ── App shell ── */
export default function App() {
  const [showWelcome, setShowWelcome] = useState(true)
  const [active, setActive]           = useState('bit-qubit')
  const tabBarRef = useRef(null)

  const [gates, setGates] = useState(() => {
    try { return JSON.parse(localStorage.getItem('qlab-circuit') || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('qlab-circuit', JSON.stringify(gates))
  }, [gates])

  useEffect(() => {
    if (!tabBarRef.current) return
    const btn = tabBarRef.current.querySelector('[data-active="true"]')
    if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [active])

  if (showWelcome) {
    return <Welcome onStart={() => { setActive('bit-qubit'); setShowWelcome(false) }} />
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>

      {/* ── Header ── */}
      <header className="flex-shrink-0 border-b" style={{ background: 'var(--bg-header)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowWelcome(true)}
            className="flex items-center gap-3 cursor-pointer bg-transparent border-none p-0 group"
            aria-label="Volver al inicio"
          >
            <OrbitLogo size={26} />
            <span
              className="font-bold tracking-widest text-xs uppercase transition-colors duration-200 group-hover:opacity-80"
              style={{ color: 'var(--ibm-blue)' }}
            >
              Quantum Lab
            </span>
          </button>
          <span className="hidden sm:block" style={{ color: 'var(--border)', marginInline: 4 }}>|</span>
          <span className="hidden sm:block font-mono text-xs" style={{ color: 'var(--text-dim)' }}>
            Computación Cuántica
          </span>
        </div>
      </header>

      {/* ── Tab bar ── */}
      <div ref={tabBarRef} className="flex-shrink-0 border-b overflow-x-auto" style={{ background: 'var(--bg-header)', borderColor: 'var(--border)', scrollbarWidth: 'none' }}>
        <div className="max-w-5xl mx-auto px-2 sm:px-6 flex">
          {TABS.map(tab => {
            const isActive = active === tab.id
            return (
              <button
                key={tab.id}
                data-active={isActive ? 'true' : 'false'}
                onClick={() => setActive(tab.id)}
                className="flex-shrink-0 px-3 sm:px-5 py-3 font-mono text-xs border-b-2 transition-all duration-200 cursor-pointer bg-transparent outline-none whitespace-nowrap"
                style={{
                  borderBottomColor: isActive ? 'var(--ibm-blue)' : 'transparent',
                  color: isActive ? 'var(--ibm-blue)' : 'var(--text-muted)',
                  background: isActive ? 'rgba(69,137,255,.08)' : 'transparent',
                  fontWeight: isActive ? 700 : 400,
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#8ab4f8' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <span className="sm:hidden">{tab.short}</span>
                <span className="hidden sm:inline">{tab.short} — {tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {active === 'bit-qubit'     && <BitVsQubit />}
        {active === 'superposition' && <Superposition />}
        {active === 'circuit'       && <CircuitBuilder gates={gates} setGates={setGates} onExecute={() => setActive('shots')} />}
        {active === 'shots'         && <ShotSimulator gates={gates} />}
        <Footer />
      </main>
    </div>
  )
}
