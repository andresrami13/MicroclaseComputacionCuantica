import { useState } from 'react'

const EXAMPLES = ['0011', '0000', '1010', '1111', '0101']

function parseState(raw) {
  // accept only 0s and 1s, max 8 qubits
  return raw.replace(/[^01]/g, '').slice(0, 8)
}

function QubitChip({ index, value }) {
  const isOne = value === '1'
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] font-mono text-[#3a5570]">q[{index}]</span>
      <div className={[
        'w-12 h-12 rounded border-2 flex items-center justify-center text-xl font-mono font-bold transition-all duration-300',
        isOne
          ? 'border-purple-500 bg-[#1a0d35] text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
          : 'border-[#1e3a5f] bg-[#0d1e35] text-cyan-700',
      ].join(' ')}>
        {value}
      </div>
      <div className={[
        'px-1.5 py-0.5 rounded text-[9px] font-mono',
        isOne ? 'bg-purple-900/40 text-purple-500' : 'bg-[#0a1020] text-[#2a4060]',
      ].join(' ')}>
        {isOne ? '|1⟩' : '|0⟩'}
      </div>
    </div>
  )
}

function buildExplanation(bits) {
  if (!bits) return null
  // little-endian: rightmost bit = q[0]
  const reversed = bits.split('').reverse()
  const parts = reversed.map((b, i) => `q[${i}]=${b}`)
  const ones = reversed.map((b, i) => ({ i, b })).filter(x => x.b === '1')
  const zeros = reversed.map((b, i) => ({ i, b })).filter(x => x.b === '0')

  const decimalValue = parseInt(bits, 2)

  return { parts, ones, zeros, decimalValue, reversed }
}

export default function StateReader() {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState('')

  const handleInput = (e) => {
    const val = parseState(e.target.value)
    setInput(val)
    setSubmitted(val)
  }

  const handleExample = (ex) => {
    setInput(ex)
    setSubmitted(ex)
  }

  const bits = submitted.length > 0 ? submitted : null
  const info = bits ? buildExplanation(bits) : null

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Lector de Estados</h1>
        <p className="text-[#3a5570] text-sm font-mono">
          Ingresa un estado de medición para decodificar qué qubit vale qué.
        </p>
      </div>

      {/* Input area */}
      <div className="bg-[#0d1528] border border-[#1e2d4a] rounded-lg p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-[10px] font-mono text-cyan-600 uppercase tracking-widest">Estado de entrada</span>
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2a4060] font-mono text-sm select-none">|</span>
            <input
              type="text"
              value={input}
              onChange={handleInput}
              placeholder="e.g. 0011"
              maxLength={8}
              className="w-full bg-[#080c18] border border-[#1e3a5f] rounded px-7 py-2.5 text-cyan-300 font-mono text-lg tracking-[0.2em] placeholder-[#1e3a5f] outline-none focus:border-cyan-700 focus:shadow-[0_0_8px_rgba(34,211,238,0.15)] transition-all duration-200"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2a4060] font-mono text-sm select-none">⟩</span>
          </div>
          <span className="text-[10px] font-mono text-[#2a3a5a]">
            {input.length}/8 qubits
          </span>
        </div>

        {/* Example buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono text-[#2a3a5a]">ejemplos:</span>
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              onClick={() => handleExample(ex)}
              className={[
                'px-2.5 py-1 rounded border text-xs font-mono tracking-widest transition-all duration-150 cursor-pointer',
                submitted === ex
                  ? 'border-cyan-600 text-cyan-300 bg-cyan-900/20'
                  : 'border-[#1e2d4a] text-[#3a5070] hover:border-[#2a4060] hover:text-[#4a6080]',
              ].join(' ')}
            >
              |{ex}⟩
            </button>
          ))}
        </div>
      </div>

      {/* Decoder */}
      {info && (
        <div className="flex flex-col gap-5 fade-in">
          {/* Little-endian note */}
          <div className="flex items-start gap-2 bg-[#0a1020] border border-[#1e2d4a] rounded p-3">
            <span className="text-yellow-500 text-xs mt-0.5">ℹ</span>
            <p className="text-[10px] font-mono text-[#3a5570] leading-relaxed">
              Convención <span className="text-yellow-400">little-endian</span>: el bit más a la derecha es{' '}
              <span className="text-cyan-400">q[0]</span>, el más a la izquierda es{' '}
              <span className="text-cyan-400">q[{bits.length - 1}]</span>.
              Así lo usan Qiskit e IBM Quantum.
            </p>
          </div>

          {/* Qubit chips — right to left mapping */}
          <div className="bg-[#0d1528] border border-[#1e2d4a] rounded-lg p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">Decodificación visual</span>
            </div>

            {/* The bit string with indices */}
            <div className="flex justify-center gap-1 font-mono text-lg flex-wrap">
              {bits.split('').map((b, i) => {
                const qIdx = bits.length - 1 - i
                return (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] text-[#2a4060]">q[{qIdx}]</span>
                    <span className={b === '1' ? 'text-purple-300' : 'text-[#2a5a8a]'}>{b}</span>
                  </div>
                )
              })}
            </div>

            {/* Chips grid */}
            <div className="flex gap-3 flex-wrap justify-center">
              {info.reversed.map((b, i) => (
                <QubitChip key={i} index={i} value={b} />
              ))}
            </div>
          </div>

          {/* Text explanation */}
          <div className="bg-[#080c18] border border-[#1e2d4a] rounded-lg p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span className="text-[10px] font-mono text-yellow-600 uppercase tracking-widest">Explicación textual</span>
            </div>

            <code className="text-sm font-mono text-cyan-300 leading-relaxed">
              {info.parts.join(', ')}
            </code>

            <div className="border-t border-[#1e2d4a] pt-3 grid grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-[#2a4060]">Valor decimal: </span>
                <span className="text-white font-bold">{info.decimalValue}</span>
              </div>
              <div>
                <span className="text-[#2a4060]">Nº de qubits: </span>
                <span className="text-white font-bold">{bits.length}</span>
              </div>
              <div>
                <span className="text-purple-500">Qubits en |1⟩: </span>
                <span className="text-purple-300 font-bold">
                  {info.ones.length > 0 ? info.ones.map(x => `q[${x.i}]`).join(', ') : 'ninguno'}
                </span>
              </div>
              <div>
                <span className="text-cyan-700">Qubits en |0⟩: </span>
                <span className="text-cyan-600 font-bold">
                  {info.zeros.length > 0 ? info.zeros.map(x => `q[${x.i}]`).join(', ') : 'ninguno'}
                </span>
              </div>
            </div>

            {/* Narrative */}
            <div className="border-t border-[#1e2d4a] pt-3">
              <p className="text-[10px] font-mono text-[#3a5070] leading-relaxed">
                {info.ones.length === 0 && `Estado base: todos los qubits colapsaron a cero. Equivale al estado fundamental del sistema.`}
                {info.ones.length === bits.length && `Todos los qubits colapsaron a uno. Equivale al estado de máxima excitación del sistema.`}
                {info.ones.length > 0 && info.ones.length < bits.length &&
                  `${info.ones.length} qubit${info.ones.length > 1 ? 's' : ''} (${info.ones.map(x => `q[${x.i}]`).join(', ')}) colapsaron a |1⟩ y ${info.zeros.length} (${info.zeros.map(x => `q[${x.i}]`).join(', ')}) a |0⟩ tras la medición.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {!info && (
        <div className="text-center text-[#2a3a5a] text-xs font-mono py-6 border border-dashed border-[#1e2d4a] rounded">
          Escribe un estado binario o selecciona un ejemplo para decodificarlo
        </div>
      )}
    </div>
  )
}
