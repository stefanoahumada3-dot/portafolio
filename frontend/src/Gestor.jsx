import { useEffect, useState } from 'react'

// Gestor de tareas: demuestra un CRUD completo (Crear, Leer, Actualizar, Borrar).
// Se abre en  http://localhost:5173/#/gestor
// Cada acción del usuario hace una petición a la API y luego actualiza la pantalla con la respuesta.

// Función auxiliar: hace la petición y lanza un error con mensaje claro si algo sale mal.
async function api(ruta, opciones) {
  let res
  try {
    res = await fetch(`/api/tareas${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    })
  } catch {
    throw new Error('No se pudo conectar con el servidor.')
  }
  if (!res.ok) {
    const cuerpo = await res.json().catch(() => ({}))
    throw new Error(typeof cuerpo.detail === 'string' ? cuerpo.detail : 'Datos no válidos.')
  }
  return res.status === 204 ? null : res.json() // 204 = sin contenido (lo que devuelve DELETE)
}

const filtros = [
  ['todas', 'Todas'],
  ['pendientes', 'Pendientes'],
  ['completadas', 'Completadas'],
]

export default function Gestor() {
  const [tareas, setTareas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [nueva, setNueva] = useState('')
  const [filtro, setFiltro] = useState('todas')
  const [editandoId, setEditandoId] = useState(null)
  const [textoEdicion, setTextoEdicion] = useState('')

  // READ: al abrir la pantalla, pedimos todas las tareas.
  useEffect(() => {
    api('')
      .then(setTareas)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }, [])

  // Ejecuta una acción y muestra el error si falla.
  async function intentar(accion) {
    setError('')
    try {
      await accion()
    } catch (e) {
      setError(e.message)
    }
  }

  // CREATE
  const crear = (e) => {
    e.preventDefault()
    const titulo = nueva.trim()
    if (!titulo) return
    intentar(async () => {
      const tarea = await api('', { method: 'POST', body: JSON.stringify({ titulo }) })
      setTareas((ts) => [tarea, ...ts])
      setNueva('')
    })
  }

  // UPDATE (marcar / desmarcar como completada)
  const alternar = (t) =>
    intentar(async () => {
      const act = await api(`/${t.id}`, { method: 'PUT', body: JSON.stringify({ titulo: t.titulo, completada: !t.completada }) })
      setTareas((ts) => ts.map((x) => (x.id === t.id ? act : x)))
    })

  // UPDATE (cambiar el texto)
  const guardarEdicion = (t) => {
    const titulo = textoEdicion.trim()
    if (!titulo || titulo === t.titulo) return setEditandoId(null)
    intentar(async () => {
      const act = await api(`/${t.id}`, { method: 'PUT', body: JSON.stringify({ titulo, completada: t.completada }) })
      setTareas((ts) => ts.map((x) => (x.id === t.id ? act : x)))
      setEditandoId(null)
    })
  }

  // DELETE
  const borrar = (t) =>
    intentar(async () => {
      await api(`/${t.id}`, { method: 'DELETE' })
      setTareas((ts) => ts.filter((x) => x.id !== t.id))
    })

  const visibles = tareas.filter((t) =>
    filtro === 'todas' ? true : filtro === 'completadas' ? t.completada : !t.completada,
  )
  const pendientes = tareas.filter((t) => !t.completada).length

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="text-center">
        <p className="ojo-seccion">Proyecto · CRUD completo</p>
        <h1 className="font-display mt-6 text-4xl font-medium text-[#d8ecf8]">Gestor de tareas</h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-moon-mist">
          React + FastAPI + PostgreSQL. Crea, marca, edita (botón ✎ o doble clic) y borra tareas: todo se guarda en la base de datos.
        </p>
      </div>

      <form onSubmit={crear} className="mt-10 flex gap-2">
        <input
          className="campo"
          placeholder="Nueva tarea…"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          maxLength={200}
          aria-label="Nueva tarea"
        />
        <button type="submit" className="shrink-0 rounded-md bg-void-violet px-5 text-sm font-medium text-white hover:brightness-110">
          Agregar
        </button>
      </form>

      {error && <p className="mt-4 text-center text-sm text-red-300">{error}</p>}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-fog-veil">
        <span>{pendientes} {pendientes === 1 ? 'pendiente' : 'pendientes'}</span>
        <div className="flex gap-2">
          {filtros.map(([clave, texto]) => (
            <button
              key={clave}
              onClick={() => setFiltro(clave)}
              aria-pressed={filtro === clave}
              className={`boton-vidrio ${filtro === clave ? 'bg-[rgba(186,214,247,0.16)]' : ''}`}
            >
              {texto}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <p className="vidrio mt-4 text-center text-sm text-fog-veil">Cargando…</p>
      ) : visibles.length === 0 ? (
        <p className="vidrio mt-4 text-center text-sm text-fog-veil">
          {tareas.length === 0 ? 'Aún no hay tareas. ¡Agrega la primera!' : 'No hay tareas en este filtro.'}
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {visibles.map((t) => (
            <li key={t.id} className="vidrio flex items-center gap-3 !p-3">
              <input
                type="checkbox"
                checked={t.completada}
                onChange={() => alternar(t)}
                className="h-4 w-4 shrink-0 accent-[#663af3]"
                aria-label={`Marcar "${t.titulo}" como completada`}
              />
              {editandoId === t.id ? (
                <input
                  className="campo"
                  value={textoEdicion}
                  onChange={(e) => setTextoEdicion(e.target.value)}
                  onBlur={() => guardarEdicion(t)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') guardarEdicion(t)
                    if (e.key === 'Escape') setEditandoId(null)
                  }}
                  maxLength={200}
                  autoFocus
                />
              ) : (
                <span
                  onDoubleClick={() => { setEditandoId(t.id); setTextoEdicion(t.titulo) }}
                  className={`flex-1 break-words text-sm ${t.completada ? 'text-fog-veil line-through' : 'text-frost-glow'}`}
                >
                  {t.titulo}
                </span>
              )}
              <button
                className="boton-vidrio !px-3"
                onClick={() => { setEditandoId(t.id); setTextoEdicion(t.titulo) }}
                aria-label={`Editar "${t.titulo}"`}
              >
                ✎
              </button>
              <button className="boton-vidrio !px-3" onClick={() => borrar(t)} aria-label={`Borrar "${t.titulo}"`}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10 text-center text-sm">
        <a className="text-fog-veil hover:text-frost-glow" href="#proyectos">← Volver al portafolio</a>
      </p>
    </main>
  )
}
