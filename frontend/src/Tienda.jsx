import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import EncabezadoDemo from './componentes/EncabezadoDemo'

// Tienda online con carrito (demo de frontend). Se abre en  http://localhost:5173/#/tienda
// Todo ocurre en el navegador: no hay servidor ni pagos reales. El carrito se recuerda en el navegador (localStorage).

const productos = [
  { id: 1, nombre: 'Audífonos inalámbricos', categoria: 'Audio', precio: 189, icono: '🎧' },
  { id: 2, nombre: 'Parlante portátil', categoria: 'Audio', precio: 129, icono: '🔊' },
  { id: 3, nombre: 'Auriculares in-ear', categoria: 'Audio', precio: 79, precioAntes: 99, icono: '🎵' },
  { id: 4, nombre: 'Soporte de laptop de aluminio', categoria: 'Escritorio', precio: 99, icono: '💻' },
  { id: 5, nombre: 'Teclado mecánico compacto', categoria: 'Escritorio', precio: 249, icono: '⌨️' },
  { id: 6, nombre: 'Lámpara LED de escritorio', categoria: 'Escritorio', precio: 89, precioAntes: 119, icono: '💡' },
  { id: 7, nombre: 'Mouse ergonómico', categoria: 'Escritorio', precio: 119, icono: '🖱️' },
  { id: 8, nombre: 'Mochila antirrobo', categoria: 'Viaje', precio: 159, icono: '🎒' },
  { id: 9, nombre: 'Botella térmica 750 ml', categoria: 'Viaje', precio: 59, icono: '🧴' },
  { id: 10, nombre: 'Organizador de cables', categoria: 'Viaje', precio: 39, icono: '🔌' },
  { id: 11, nombre: 'Cargador portátil 20 000 mAh', categoria: 'Viaje', precio: 139, icono: '🔋' },
  { id: 12, nombre: 'Almohada de viaje', categoria: 'Viaje', precio: 49, icono: '😴' },
]

const categorias = ['Todos', 'Audio', 'Escritorio', 'Viaje']

// Cada categoría tiene su propio degradado suave detrás del icono
const fondos = {
  Audio: 'linear-gradient(135deg, rgba(152,192,239,0.22), rgba(102,58,243,0.12))',
  Escritorio: 'linear-gradient(135deg, rgba(216,236,248,0.16), rgba(152,192,239,0.05))',
  Viaje: 'linear-gradient(135deg, rgba(2,125,234,0.18), rgba(186,214,247,0.05))',
}

const ENVIO_GRATIS_DESDE = 150
const COSTO_ENVIO = 10
const soles = (n) => `S/ ${n.toFixed(2)}`
const CLAVE_CARRITO = 'aurora-carrito'

// Lee el carrito guardado ({ idProducto: cantidad }). Si el navegador no permite guardar, empezamos vacío.
function leerCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO) ?? '{}')
    const valido = {}
    for (const p of productos) if (Number.isInteger(guardado[p.id]) && guardado[p.id] > 0) valido[p.id] = Math.min(guardado[p.id], 99)
    return valido
  } catch {
    return {}
  }
}

function Carrito({ carrito, cambiar, quitar, vaciar, cerrar }) {
  const [pedido, setPedido] = useState(null)
  const botonCerrar = useRef(null)

  // Al abrir el panel, el foco va al botón "Cerrar" (solo esa vez)
  useEffect(() => {
    botonCerrar.current?.focus()
  }, [])

  // Escape cierra el panel
  useEffect(() => {
    const alTeclear = (e) => e.key === 'Escape' && cerrar()
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [cerrar])

  const lineas = productos.filter((p) => carrito[p.id]).map((p) => ({ ...p, cantidad: carrito[p.id] }))
  const subtotal = lineas.reduce((s, l) => s + l.precio * l.cantidad, 0)
  const envio = subtotal === 0 || subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO
  const faltaGratis = ENVIO_GRATIS_DESDE - subtotal

  function finalizar() {
    setPedido(`AUR-${Math.floor(1000 + Math.random() * 9000)}`)
    vaciar()
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end" role="dialog" aria-modal="true" aria-label="Carrito de compras">
      <button className="absolute inset-0 bg-black/60" onClick={cerrar} aria-label="Cerrar el carrito" tabIndex={-1} />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-[rgba(186,215,247,0.12)] bg-midnight-canvas">
        <div className="flex items-center justify-between border-b border-[rgba(186,215,247,0.12)] px-6 py-5">
          <h2 className="font-display text-2xl font-medium text-frost-glow">Tu carrito</h2>
          <button ref={botonCerrar} onClick={cerrar} className="boton-vidrio">Cerrar ✕</button>
        </div>

        {pedido ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="text-4xl" aria-hidden="true">✅</p>
            <p className="font-display text-2xl font-medium text-frost-glow">¡Gracias por tu compra!</p>
            <p className="text-sm text-moon-mist">Pedido {pedido} registrado.</p>
            <p className="text-xs text-fog-veil">Esto es una demo: no se procesó ningún pago ni se envió nada.</p>
            <button onClick={cerrar} className="boton-vidrio mt-4">Seguir comprando</button>
          </div>
        ) : lineas.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="text-4xl" aria-hidden="true">🛒</p>
            <p className="text-moon-mist">Tu carrito está vacío.</p>
            <button onClick={cerrar} className="boton-vidrio mt-2">Ver productos</button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-[rgba(186,215,247,0.08)] overflow-y-auto px-6">
              {lineas.map((l) => (
                <li key={l.id} className="flex items-center gap-4 py-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: fondos[l.categoria] }} aria-hidden="true">{l.icono}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-frost-glow">{l.nombre}</p>
                    <p className="text-xs text-fog-veil">{soles(l.precio)} c/u</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button className="boton-vidrio !px-3 !py-0.5" onClick={() => cambiar(l.id, -1)} aria-label={`Quitar una unidad de ${l.nombre}`}>−</button>
                      <span className="w-6 text-center text-sm text-frost-glow tabular-nums" aria-label={`Cantidad: ${l.cantidad}`}>{l.cantidad}</span>
                      <button className="boton-vidrio !px-3 !py-0.5" onClick={() => cambiar(l.id, 1)} aria-label={`Agregar una unidad de ${l.nombre}`}>+</button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-frost-glow tabular-nums">{soles(l.precio * l.cantidad)}</p>
                    <button className="mt-2 text-xs text-fog-veil hover:text-frost-glow" onClick={() => quitar(l.id)} aria-label={`Eliminar ${l.nombre} del carrito`}>Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-[rgba(186,215,247,0.12)] px-6 py-5">
              {envio > 0 && (
                <p className="mb-4 rounded-lg bg-[rgba(186,214,247,0.06)] px-3 py-2 text-xs text-moon-mist">
                  Te faltan {soles(faltaGratis)} para tener <strong className="font-medium text-frost-glow">envío gratis</strong>.
                </p>
              )}
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between"><dt className="text-fog-veil">Subtotal</dt><dd className="text-frost-glow tabular-nums">{soles(subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-fog-veil">Envío (Lima)</dt><dd className="text-frost-glow tabular-nums">{envio === 0 ? 'Gratis' : soles(envio)}</dd></div>
                <div className="flex justify-between border-t border-[rgba(186,215,247,0.12)] pt-3 text-base"><dt className="text-frost-glow">Total</dt><dd className="font-medium text-frost-glow tabular-nums">{soles(subtotal + envio)}</dd></div>
              </dl>
              <button onClick={finalizar} className="mt-5 w-full rounded-full bg-void-violet px-6 py-3 text-sm font-medium text-white hover:brightness-110">
                Finalizar compra
              </button>
              <p className="mt-3 text-center text-xs text-fog-veil">Demo: no se realiza ningún cobro.</p>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

export default function Tienda() {
  const [categoria, setCategoria] = useState('Todos')
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('destacados')
  const [carrito, setCarrito] = useState(leerCarrito)
  const [abierto, setAbierto] = useState(false)

  // Guardar el carrito cada vez que cambia
  useEffect(() => {
    try { localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito)) } catch { /* sin almacenamiento: no pasa nada */ }
  }, [carrito])

  // Suma o resta unidades de un producto (si llega a 0, se quita del carrito)
  const cambiar = (id, delta) =>
    setCarrito((c) => {
      const cantidad = Math.min((c[id] ?? 0) + delta, 99)
      const nuevo = { ...c }
      if (cantidad > 0) nuevo[id] = cantidad
      else delete nuevo[id]
      return nuevo
    })
  const quitar = (id) =>
    setCarrito((c) => {
      const nuevo = { ...c }
      delete nuevo[id]
      return nuevo
    })
  const vaciar = () => setCarrito({})
  const cerrar = useCallback(() => setAbierto(false), []) // useCallback: la función no cambia entre renders

  const cantidadTotal = Object.values(carrito).reduce((s, n) => s + n, 0)

  const visibles = useMemo(() => {
    const t = busqueda.trim().toLowerCase()
    const lista = productos.filter((p) => (categoria === 'Todos' || p.categoria === categoria) && p.nombre.toLowerCase().includes(t))
    if (orden === 'menor') return [...lista].sort((a, b) => a.precio - b.precio)
    if (orden === 'mayor') return [...lista].sort((a, b) => b.precio - a.precio)
    return lista
  }, [categoria, busqueda, orden])

  return (
    <>
      <EncabezadoDemo
        etiqueta="Proyecto · Frontend"
        titulo="Tienda online con carrito"
        texto="Catálogo con búsqueda, filtros y orden, carrito que recuerda tus productos y cálculo de envío en soles. Hecho solo con React."
        tecnologias={['React', 'Tailwind CSS', 'JavaScript']}
        aviso="Demo con productos ficticios: no se realiza ningún cobro."
      />

      <main className="mx-auto max-w-[1100px] px-6 py-12">
        {/* Barra de herramientas */}
        <div className="entrada flex flex-wrap items-center gap-3" style={{ '--d': '0.7s' }}>
          <input
            className="campo !w-auto min-w-[200px] flex-1"
            type="search"
            placeholder="Buscar productos…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar productos"
          />
          <select className="campo !w-auto" value={orden} onChange={(e) => setOrden(e.target.value)} aria-label="Ordenar productos">
            <option value="destacados">Destacados</option>
            <option value="menor">Precio: menor a mayor</option>
            <option value="mayor">Precio: mayor a menor</option>
          </select>
          <button onClick={() => setAbierto(true)} className="boton-vidrio flex items-center gap-2 !px-4 !py-2.5">
            🛒 Carrito
            <span className="min-w-5 rounded-full bg-void-violet px-1.5 text-center text-xs text-white tabular-nums" aria-label={`${cantidadTotal} productos en el carrito`}>{cantidadTotal}</span>
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
          {categorias.map((c) => (
            <button key={c} onClick={() => setCategoria(c)} aria-pressed={categoria === c} className={`boton-vidrio ${categoria === c ? 'bg-[rgba(186,214,247,0.18)]' : ''}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Productos */}
        {visibles.length === 0 ? (
          <p className="vidrio mt-8 text-center text-sm text-fog-veil">No encontramos productos con esa búsqueda.</p>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibles.map((p) => (
              <li key={p.id} className="vidrio flex flex-col !p-4">
                <div className="relative flex aspect-square items-center justify-center rounded-xl text-6xl" style={{ background: fondos[p.categoria] }} aria-hidden="true">
                  {p.icono}
                  {p.precioAntes && <span className="absolute top-2 left-2 rounded-md bg-void-violet px-2 py-0.5 text-[10px] font-medium text-white">OFERTA</span>}
                </div>
                <p className="mt-4 text-xs text-fog-veil">{p.categoria}</p>
                <h3 className="mt-1 flex-1 text-sm text-frost-glow">{p.nombre}</h3>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-xl font-medium text-frost-glow tabular-nums">{soles(p.precio)}</span>
                  {p.precioAntes && <span className="text-xs text-fog-veil line-through tabular-nums">{soles(p.precioAntes)}</span>}
                </p>
                <button onClick={() => cambiar(p.id, 1)} className="boton-vidrio mt-4 w-full text-center">
                  {carrito[p.id] ? `Agregar otro (${carrito[p.id]} en el carrito)` : 'Agregar al carrito'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      {abierto && <Carrito carrito={carrito} cambiar={cambiar} quitar={quitar} vaciar={vaciar} cerrar={cerrar} />}
    </>
  )
}
