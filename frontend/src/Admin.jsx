import { useEffect, useState } from 'react'

// Pantalla privada para leer los mensajes de contacto. Se abre en  http://localhost:5173/#/admin
// La clave secreta (ADMIN_TOKEN de backend/.env) se pide aquí y se guarda solo mientras la pestaña esté abierta.

const formatoFecha = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' })

export default function Admin() {
  const [clave, setClave] = useState(() => {
    try { return sessionStorage.getItem('admin-clave') ?? '' } catch { return '' }
  })
  const [mensajes, setMensajes] = useState(null) // null = aún no cargado
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function cargar(claveUsada) {
    setCargando(true)
    setError('')
    try {
      const res = await fetch('/api/admin/mensajes', { headers: { 'X-Admin-Token': claveUsada } })
      if (res.status === 401) throw new Error('Clave incorrecta.')
      if (!res.ok) throw new Error('Error del servidor.')
      setMensajes(await res.json())
      try { sessionStorage.setItem('admin-clave', claveUsada) } catch { /* sin almacenamiento: no pasa nada */ }
    } catch (err) {
      setMensajes(null)
      setError(err.message === 'Failed to fetch' ? 'No se pudo conectar con el servidor.' : err.message)
      try { sessionStorage.removeItem('admin-clave') } catch { /* igual */ }
    } finally {
      setCargando(false)
    }
  }

  // Si ya había una clave guardada en esta pestaña, entramos directo.
  useEffect(() => {
    if (clave) cargar(clave)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function salir() {
    try { sessionStorage.removeItem('admin-clave') } catch { /* igual */ }
    setClave('')
    setMensajes(null)
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-center">
        <p className="ojo-seccion">Panel privado</p>
        <h1 className="font-display mt-6 text-4xl font-medium text-[#d8ecf8]">Mensajes de contacto</h1>
      </div>

      {mensajes === null ? (
        <form
          onSubmit={(e) => { e.preventDefault(); cargar(clave) }}
          className="vidrio mx-auto mt-10 flex max-w-sm flex-col gap-4"
        >
          <input
            className="campo"
            type="password"
            placeholder="Clave de administrador"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            autoFocus
            required
          />
          <button
            type="submit"
            disabled={cargando}
            className="rounded-md bg-void-violet px-6 py-3 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
          >
            {cargando ? 'Entrando…' : 'Entrar'}
          </button>
          {error && <p className="text-center text-sm text-red-300">{error}</p>}
        </form>
      ) : (
        <>
          <div className="mt-8 flex items-center justify-between text-sm text-fog-veil">
            <span>{mensajes.length} {mensajes.length === 1 ? 'mensaje' : 'mensajes'}</span>
            <span className="flex gap-2">
              <button className="boton-vidrio" onClick={() => cargar(clave)}>Actualizar</button>
              <button className="boton-vidrio" onClick={salir}>Salir</button>
            </span>
          </div>
          {mensajes.length === 0 && (
            <p className="vidrio mt-6 text-center text-sm text-fog-veil">Todavía no hay mensajes.</p>
          )}
          <ul className="mt-6 flex flex-col gap-4">
            {mensajes.map((m) => (
              <li key={m.id} className="vidrio">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-display text-lg font-medium text-frost-glow">{m.nombre}</span>
                  <time className="text-xs text-fog-veil">{formatoFecha.format(new Date(m.creado_en))}</time>
                </div>
                <a className="text-sm text-moon-mist hover:underline" href={`mailto:${m.email}`}>{m.email}</a>
                {/* whitespace-pre-wrap respeta los saltos de línea del mensaje; React escapa el texto, así que es seguro */}
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-moon-mist">{m.mensaje}</p>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="mt-10 text-center text-sm">
        <a className="text-fog-veil hover:text-frost-glow" href="#">← Volver al portafolio</a>
      </p>
    </main>
  )
}
