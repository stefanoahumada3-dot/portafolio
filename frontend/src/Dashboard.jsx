import { useMemo, useRef, useState } from 'react'
import EncabezadoDemo from './componentes/EncabezadoDemo'
import { ultimosPedidos } from './data/pedidos'

// Panel de ventas (demo de frontend). Se abre en  http://localhost:5173/#/dashboard
// Los datos son ficticios y se generan con un "generador de números casi aleatorios" con semilla fija,
// así siempre salen los mismos valores para cada periodo. Los gráficos están dibujados a mano en SVG.

const periodos = {
  '7d': { etiqueta: '7 días', puntos: 7, base: 2600, escala: 0.25, mensual: false },
  '30d': { etiqueta: '30 días', puntos: 30, base: 2600, escala: 1, mensual: false },
  '12m': { etiqueta: '12 meses', puntos: 12, base: 68000, escala: 12, mensual: true },
}

const dinero = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 })
const numero = new Intl.NumberFormat('es-PE')

// Generador con semilla (mulberry32): misma semilla -> misma secuencia
function azar(semilla) {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Genera 2 periodos seguidos (el anterior y el actual) para poder calcular la variación entre ambos.
function generarDatos(clave) {
  const { puntos: n, base, mensual } = periodos[clave]
  const r = azar(clave.length * 7919 + n * 104729)
  const hoy = new Date()
  const ventas = []
  const pedidos = []
  const nuevos = []
  for (let i = 0; i < 2 * n; i++) {
    const tendencia = 1 + 0.18 * (i / (2 * n)) // crece poco a poco
    const estacion = mensual
      ? 1 + 0.12 * Math.sin((i / 12) * Math.PI * 2) // meses: sube y baja en el año
      : [0.9, 0.95, 1, 1.02, 1.1, 1.28, 1.2][i % 7] // días: fines de semana venden más
    const v = base * tendencia * estacion * (0.9 + r() * 0.2)
    const ticket = 105 + r() * 30
    const p = Math.max(1, Math.round(v / ticket))
    ventas.push(Math.round(v))
    pedidos.push(p)
    nuevos.push(Math.round(p * (0.3 + r() * 0.08)))
  }
  // Etiquetas de fecha para el periodo actual (terminan hoy)
  const etiquetas = Array.from({ length: n }, (_, i) => {
    const f = new Date(hoy)
    if (mensual) f.setMonth(f.getMonth() - (n - 1 - i), 1)
    else f.setDate(f.getDate() - (n - 1 - i))
    return mensual
      ? new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(f).replace('.', '')
      : new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'short' }).format(f).replace('.', '')
  })
  const suma = (arr, desde, hasta) => arr.slice(desde, hasta).reduce((s, x) => s + x, 0)
  const actual = { ventas: suma(ventas, n, 2 * n), pedidos: suma(pedidos, n, 2 * n), nuevos: suma(nuevos, n, 2 * n) }
  const previo = { ventas: suma(ventas, 0, n), pedidos: suma(pedidos, 0, n), nuevos: suma(nuevos, 0, n) }
  return {
    serie: ventas.slice(n).map((v, i) => ({ v, p: pedidos[n + i], etiqueta: etiquetas[i] })),
    actual,
    previo,
  }
}

const variacion = (actual, previo) => (previo === 0 ? 0 : ((actual - previo) / previo) * 100)

// Redondea el máximo del eje a un número "bonito" (1.5, 2, 3, 5, 10 × potencia de 10)
function maximoBonito(m) {
  const e = 10 ** Math.floor(Math.log10(m))
  const f = m / e
  return (f <= 1.5 ? 1.5 : f <= 2 ? 2 : f <= 3 ? 3 : f <= 5 ? 5 : 10) * e
}
const abreviado = (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))

const productosTop = [
  ['Audífonos inalámbricos', 84, 189],
  ['Teclado mecánico compacto', 61, 249],
  ['Mochila antirrobo', 52, 159],
  ['Cargador portátil 20 000 mAh', 47, 139],
  ['Botella térmica 750 ml', 39, 59],
]

const canales = [
  ['Web', 0.52, '#d8ecf8'],
  ['WhatsApp', 0.31, '#98c0ef'],
  ['Tienda física', 0.17, '#5a8fd0'],
]

function Kpi({ titulo, valor, cambio }) {
  const sube = cambio >= 0
  return (
    <div className="vidrio aparece">
      <p className="text-xs tracking-[0.1em] text-fog-veil uppercase">{titulo}</p>
      <p className="font-display mt-3 text-3xl font-medium text-frost-glow tabular-nums">{valor}</p>
      <p className={`mt-2 text-xs tabular-nums ${sube ? 'text-frost-glow' : 'text-fog-veil'}`}>
        {sube ? '▲' : '▼'} {Math.abs(cambio).toFixed(1)}% <span className="text-fog-veil">vs. periodo anterior</span>
      </p>
    </div>
  )
}

// Gráfico de área con tooltip al pasar el mouse (o el dedo) por encima
function GraficoVentas({ serie }) {
  const [activo, setActivo] = useState(null)
  const contenedor = useRef(null)

  const W = 760
  const H = 260
  const m = { i: 52, d: 14, s: 14, b: 30 } // márgenes: izquierda, derecha, arriba, abajo
  const ancho = W - m.i - m.d
  const alto = H - m.s - m.b
  const maximo = maximoBonito(Math.max(...serie.map((p) => p.v)))
  const x = (i) => m.i + (serie.length === 1 ? 0 : (i * ancho) / (serie.length - 1))
  const y = (v) => m.s + alto - (v / maximo) * alto

  const linea = serie.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ')
  const area = `${linea} L${x(serie.length - 1).toFixed(1)},${m.s + alto} L${x(0).toFixed(1)},${m.s + alto} Z`
  const marcasY = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maximo)
  const paso = Math.max(1, Math.ceil(serie.length / 6))

  function mover(e) {
    const caja = contenedor.current.getBoundingClientRect()
    const px = ((e.clientX - caja.left) / caja.width) * W
    const i = Math.round(((px - m.i) / ancho) * (serie.length - 1))
    setActivo(Math.min(serie.length - 1, Math.max(0, i)))
  }

  const p = activo === null ? null : serie[activo]

  return (
    <div ref={contenedor} className="relative" onPointerMove={mover} onPointerLeave={() => setActivo(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full touch-pan-y" role="img" aria-label={`Ventas por ${serie.length === 12 ? 'mes' : 'día'}: de ${dinero.format(Math.min(...serie.map((s) => s.v)))} a ${dinero.format(Math.max(...serie.map((s) => s.v)))}`}>
        <defs>
          <linearGradient id="relleno-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#98c0ef" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#98c0ef" stopOpacity="0" />
          </linearGradient>
        </defs>
        {marcasY.map((v) => (
          <g key={v}>
            <line x1={m.i} x2={W - m.d} y1={y(v)} y2={y(v)} stroke="rgba(186,215,247,0.1)" />
            <text x={m.i - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#9da7ba">{abreviado(v)}</text>
          </g>
        ))}
        {serie.map((s, i) => (i % paso === 0 || i === serie.length - 1) && (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#9da7ba">{s.etiqueta}</text>
        ))}
        <path d={area} fill="url(#relleno-area)" />
        <path d={linea} fill="none" stroke="#98c0ef" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {activo !== null && (
          <g>
            <line x1={x(activo)} x2={x(activo)} y1={m.s} y2={m.s + alto} stroke="rgba(186,215,247,0.3)" strokeDasharray="3 3" />
            <circle cx={x(activo)} cy={y(p.v)} r="5" fill="#05060f" stroke="#d8ecf8" strokeWidth="2" />
          </g>
        )}
      </svg>
      {p && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg bg-[#0d0f1c] px-3 py-2 text-xs shadow-[inset_0_0_0_1px_rgba(186,215,247,0.18)]"
          style={{ left: `${Math.min(88, Math.max(12, (x(activo) / W) * 100))}%`, top: 0 }}
        >
          <p className="text-fog-veil">{p.etiqueta}</p>
          <p className="mt-0.5 text-sm text-frost-glow tabular-nums">{dinero.format(p.v)}</p>
          <p className="text-fog-veil tabular-nums">{p.p} pedidos</p>
        </div>
      )}
    </div>
  )
}

function Donut({ total }) {
  const R = 52
  const C = 2 * Math.PI * R
  // Cada tramo empieza donde termina el anterior: la suma de las partes previas
  const tramos = canales.map(([nombre, parte, color], i) => ({
    nombre, parte, color,
    inicio: canales.slice(0, i).reduce((suma, c) => suma + c[1], 0),
  }))
  return (
    <div className="flex flex-col items-center gap-6">
      <svg viewBox="0 0 140 140" className="h-40 w-40 shrink-0 -rotate-90" role="img" aria-label="Ventas por canal">
        <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(186,215,247,0.08)" strokeWidth="16" />
        {tramos.map(({ nombre, parte, color, inicio }) => {
          const largo = parte * C
          return (
            <circle key={nombre} cx="70" cy="70" r={R} fill="none" stroke={color} strokeWidth="16"
              strokeDasharray={`${largo - 2} ${C - largo + 2}`} strokeDashoffset={-inicio * C} />
          )
        })}
      </svg>
      <ul className="flex w-full flex-col gap-2 text-sm">
        {canales.map(([nombre, parte, color]) => (
          <li key={nombre} className="flex items-center justify-between gap-4 whitespace-nowrap">
            <span className="flex items-center gap-2 text-moon-mist">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} aria-hidden="true" />
              {nombre}
            </span>
            <span className="text-frost-glow tabular-nums">{Math.round(parte * 100)}% · {dinero.format(total * parte)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const colorEstado = {
  Entregado: 'text-frost-glow bg-[rgba(199,211,234,0.12)]',
  'En camino': 'text-[#98c0ef] bg-[rgba(152,192,239,0.12)]',
  Preparando: 'text-fog-veil bg-[rgba(199,211,234,0.06)]',
}

export default function Dashboard() {
  const [clave, setClave] = useState('30d')
  const datos = useMemo(() => generarDatos(clave), [clave])
  const { actual, previo } = datos
  const { escala } = periodos[clave]
  const ticket = actual.ventas / actual.pedidos
  const ticketPrevio = previo.ventas / previo.pedidos

  return (
    <>
      <EncabezadoDemo
        etiqueta="Proyecto · Frontend"
        titulo="Panel de ventas"
        texto="Indicadores, gráficos y tablas para seguir un negocio de un vistazo, con datos por periodo. Los gráficos están dibujados a mano en SVG."
        tecnologias={['React', 'SVG', 'JavaScript']}
        aviso="Demo con datos ficticios generados por el programa."
      />

      <main className="mx-auto max-w-[1100px] px-6 py-12">
        <div className="entrada flex flex-wrap items-center justify-between gap-4" style={{ '--d': '0.7s' }}>
          <div>
            <p className="font-display text-2xl font-medium text-frost-glow">Aurora · Resumen</p>
            <p className="text-sm text-fog-veil">Últimos {periodos[clave].etiqueta}</p>
          </div>
          <div className="flex gap-2" role="group" aria-label="Periodo">
            {Object.entries(periodos).map(([k, p]) => (
              <button key={k} onClick={() => setClave(k)} aria-pressed={clave === k} className={`boton-vidrio ${clave === k ? 'bg-[rgba(186,214,247,0.18)]' : ''}`}>
                {p.etiqueta}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi titulo="Ventas" valor={dinero.format(actual.ventas)} cambio={variacion(actual.ventas, previo.ventas)} />
          <Kpi titulo="Pedidos" valor={numero.format(actual.pedidos)} cambio={variacion(actual.pedidos, previo.pedidos)} />
          <Kpi titulo="Ticket promedio" valor={dinero.format(ticket)} cambio={variacion(ticket, ticketPrevio)} />
          <Kpi titulo="Clientes nuevos" valor={numero.format(actual.nuevos)} cambio={variacion(actual.nuevos, previo.nuevos)} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          <section className="vidrio aparece">
            <h2 className="font-display text-xl font-medium text-frost-glow">Ventas en el tiempo</h2>
            <p className="mb-4 text-xs text-fog-veil">Pasa el mouse (o el dedo) sobre el gráfico para ver cada punto.</p>
            {/* key={clave}: al cambiar de periodo, el gráfico se reinicia (y su punto activo también) */}
            <GraficoVentas key={clave} serie={datos.serie} />
          </section>
          <section className="vidrio aparece">
            <h2 className="font-display text-xl font-medium text-frost-glow">Ventas por canal</h2>
            <div className="mt-5"><Donut total={actual.ventas} /></div>
          </section>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="vidrio aparece">
            <h2 className="font-display text-xl font-medium text-frost-glow">Productos más vendidos</h2>
            <ol className="mt-5 flex flex-col gap-4">
              {productosTop.map(([nombre, unidades, precio]) => {
                const u = Math.max(1, Math.round(unidades * escala))
                return (
                  <li key={nombre}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-moon-mist">{nombre}</span>
                      <span className="text-frost-glow tabular-nums">{u} u · {dinero.format(u * precio)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[rgba(186,214,247,0.1)]">
                      <div className="h-full rounded-full bg-[#98c0ef] transition-[width] duration-500" style={{ width: `${(unidades / productosTop[0][1]) * 100}%` }} />
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>

          <section className="vidrio aparece overflow-x-auto">
            <h2 className="font-display text-xl font-medium text-frost-glow">Últimos pedidos</h2>
            <table className="mt-4 w-full min-w-[420px] text-left text-sm">
              <thead className="text-xs text-fog-veil">
                <tr>
                  <th scope="col" className="pb-2 font-normal">Pedido</th>
                  <th scope="col" className="pb-2 font-normal">Cliente</th>
                  <th scope="col" className="pb-2 text-right font-normal">Total</th>
                  <th scope="col" className="pb-2 text-right font-normal">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(186,215,247,0.08)]">
                {ultimosPedidos.map(([id, cliente, producto, total, estado]) => (
                  <tr key={id}>
                    <td className="py-2.5 font-mono text-xs text-moon-mist">{id}</td>
                    <td className="py-2.5">
                      <span className="text-frost-glow">{cliente}</span>
                      <span className="block text-xs text-fog-veil">{producto}</span>
                    </td>
                    <td className="py-2.5 text-right text-frost-glow tabular-nums">{dinero.format(total)}</td>
                    <td className="py-2.5 text-right"><span className={`rounded-md px-2 py-1 text-xs ${colorEstado[estado]}`}>{estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </>
  )
}
