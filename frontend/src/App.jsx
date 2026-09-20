import { lazy, Suspense, useEffect, useState } from 'react'
import { proyectos as proyectosLocales } from './data/proyectos'
import { CONTACTO, HAY_BACKEND, RUTAS_CON_BACKEND } from './config'

// Cada pantalla de demo se carga solo cuando alguien la abre (lazy). Así la página principal pesa menos.
const rutas = {
  '#/chatbot': { Pantalla: lazy(() => import('./Chatbot')) },
  '#/soporte-ia': { Pantalla: lazy(() => import('./SoporteIA')) },
  '#/tienda': { Pantalla: lazy(() => import('./Tienda')) },
  '#/dashboard': { Pantalla: lazy(() => import('./Dashboard')) },
  // La landing de la barbería tiene su propio diseño (claro): va sin el fondo oscuro del portafolio.
  '#/barberia': { Pantalla: lazy(() => import('./Barberia')), fondoPropio: true },
  // Estas dos necesitan el backend. Se consulta import.meta.env.DEV aquí mismo (y no HAY_BACKEND de config.js)
  // para que, al compilar la versión publicada, Vite las elimine por completo y sus archivos ni se generen.
  // Cuando publiques el backend, cambia DEV por true.
  ...(import.meta.env.DEV && {
    '#/gestor': { Pantalla: lazy(() => import('./Gestor')) },
    '#/admin': { Pantalla: lazy(() => import('./Admin')) },
  }),
}

function Cargando() {
  return <p className="py-24 text-center text-sm text-fog-veil">Cargando…</p>
}

// Un "componente" en React es una función que devuelve HTML (llamado JSX).
// Las clases como "text-xl" son de Tailwind. Las clases "vidrio", "boton-vidrio", "etiqueta",
// "ojo-seccion" y "texto-hielo" las definimos nosotros en index.css.

// Puntos que parpadean en el fondo. Se generan una sola vez con posiciones "pseudo-aleatorias"
// (fijas, para que no cambien cada vez que React redibuja la página).
const estrellas = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: (i * 37.7) % 100,
  y: (i * 23.3) % 70,
  dur: 3 + ((i * 7) % 5),
  delay: (i * 0.6) % 6,
}))

function Estrellas() {
  return (
    <div className="estrellas" aria-hidden="true">
      {estrellas.map((e) => (
        <span
          key={e.id}
          className="estrella"
          style={{ left: `${e.x}%`, top: `${e.y}%`, '--dur': `${e.dur}s`, '--delay': `${e.delay}s` }}
        />
      ))}
    </div>
  )
}

// Encabezado de cada sección: etiqueta pequeña + título grande + texto opcional
function TituloSeccion({ etiqueta, titulo, texto }) {
  return (
    <div className="aparece text-center">
      <p className="ojo-seccion">{etiqueta}</p>
      <h2 className="font-display mt-6 text-4xl font-medium text-[#d8ecf8] sm:text-5xl">{titulo}</h2>
      {texto && <p className="mx-auto mt-4 max-w-xl text-moon-mist">{texto}</p>}
    </div>
  )
}

function Encabezado() {
  return (
    <header className="sticky top-0 z-10 bg-midnight-canvas/70 backdrop-blur">
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <span className="font-display font-medium text-frost-glow">Stefano Ahumada</span>
        <ul className="flex gap-2 text-sm">
          {[['#sobre-mi', 'Sobre mí'], ['#proyectos', 'Proyectos'], ['#contacto', 'Contacto']].map(([href, texto]) => (
            <li key={href}>
              <a className="boton-vidrio inline-block" href={href}>{texto}</a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

function Inicio() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 pb-[120px] pt-24 text-center">
      {/* Cada elemento entra con un retraso distinto (--d) para que aparezcan uno tras otro */}
      <p className="ojo-seccion entrada" style={{ '--d': '0.2s' }}>Portafolio · Ingeniería de Sistemas</p>
      <h1 className="font-display texto-hielo entrada mt-8 text-6xl font-medium leading-[1.1] sm:text-8xl" style={{ '--d': '0.5s' }}>
        Stefano Ahumada
      </h1>
      <p className="entrada mx-auto mt-6 max-w-xl text-lg text-moon-mist" style={{ '--d': '0.8s' }}>
        Construyo aplicaciones web y bots con IA mientras aprendo programación creando proyectos reales.
      </p>
      <div className="entrada mt-10 flex justify-center gap-3" style={{ '--d': '1.1s' }}>
        {/* El violeta es el único color de acento: se usa solo en el botón principal */}
        <a href="#proyectos" className="rounded-full bg-void-violet px-6 py-3 text-sm font-medium text-white hover:brightness-110">
          Ver mis proyectos
        </a>
        <a href="#contacto" className="boton-vidrio px-6 py-3">Contacto</a>
      </div>
    </section>
  )
}

function SobreMi() {
  return (
    <section id="sobre-mi" className="mx-auto max-w-[1200px] px-6 py-[60px] sm:py-[120px]">
      <TituloSeccion
        etiqueta="Sobre mí"
        titulo="Aprendiendo haciendo"
        texto="Estoy en el 4.º ciclo de Ingeniería de Sistemas. Desarrollo páginas web, aplicaciones con base de datos y bots que usan inteligencia artificial."
      />
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {['JavaScript', 'React', 'Tailwind CSS', 'Python', 'FastAPI', 'PostgreSQL'].map((tec) => (
          <span key={tec} className="etiqueta">{tec}</span>
        ))}
      </div>
    </section>
  )
}

function Proyectos() {
  // useState guarda datos que cambian; useEffect ejecuta código al cargar la página.
  // Empezamos con los datos locales y, cuando la API responde, los reemplazamos por los de la base de datos.
  // Si la API está apagada, la página sigue funcionando con los datos locales.
  const [proyectos, setProyectos] = useState(proyectosLocales)

  useEffect(() => {
    if (!HAY_BACKEND) return // en la versión publicada no hay API: usamos los datos locales
    fetch('/api/proyectos')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setProyectos)
      .catch(() => {})
  }, [])

  return (
    <section id="proyectos" className="mx-auto max-w-[1200px] px-6 py-[60px] sm:py-[120px]">
      <TituloSeccion etiqueta="Proyectos" titulo="Lo que he construido" />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {/* .map recorre la lista y crea una tarjeta por cada proyecto */}
        {proyectos.map((p) => (
          <article key={p.id} className="vidrio aparece">
            <h3 className="font-display text-2xl font-medium text-frost-glow">{p.titulo}</h3>
            <p className="mt-3 text-sm leading-relaxed text-fog-veil">{p.descripcion}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {p.tecnologias.map((t) => (
                <span key={t} className="etiqueta">{t}</span>
              ))}
            </div>
            {/* Si el proyecto tiene enlace, mostramos el botón de demo */}
            {p.enlace && (HAY_BACKEND || !RUTAS_CON_BACKEND.includes(p.enlace)) && (
              <a href={p.enlace} className="boton-vidrio mt-5 inline-block">Ver demo →</a>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

function Contacto() {
  // Los datos vienen de src/config.js: si cambian, se editan solo allí.
  const datos = [
    ['Teléfono', CONTACTO.telefono, `tel:${CONTACTO.telefonoLink}`],
    ['Correo', CONTACTO.email, `mailto:${CONTACTO.email}`],
    ['Ciudad', CONTACTO.ciudad, null],
  ]
  const whatsapp = `https://wa.me/${CONTACTO.telefonoLink.replace('+', '')}?text=${encodeURIComponent('Hola Stefano, vi tu portafolio.')}`

  return (
    <section id="contacto" className="mx-auto max-w-[1200px] px-6 py-[60px] sm:py-[120px]">
      <TituloSeccion
        etiqueta="Contacto"
        titulo="Hablemos"
        texto="¿Tienes una idea o un proyecto? Escríbeme o llámame."
      />
      {/* La columna del medio (correo) es más ancha para que no se corte a mitad de palabra */}
      <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-[1fr_1.7fr_1fr]">
        {datos.map(([etiqueta, valor, enlace]) => (
          <div key={etiqueta} className="vidrio aparece text-center !px-4">
            <p className="text-xs tracking-[0.1em] text-fog-veil uppercase">{etiqueta}</p>
            {enlace ? (
              <a href={enlace} className="mt-2 block text-sm break-words text-frost-glow hover:underline sm:whitespace-nowrap">{valor}</a>
            ) : (
              <p className="mt-2 text-sm text-frost-glow">{valor}</p>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        {/* El violeta es el acento único del diseño: lo usamos en la acción principal de contacto */}
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-full bg-void-violet px-7 py-3 text-sm font-medium text-white hover:brightness-110"
        >
          Escríbeme por WhatsApp
        </a>
      </div>
    </section>
  )
}

export default function App() {
  // Rutas mínimas sin librerías: según lo que haya después del "#" en la dirección, mostramos una pantalla u otra.
  //   #/chatbot, #/tienda, #/dashboard... -> una demo (ver "rutas" arriba)     cualquier otra cosa -> portafolio
  const [ruta, setRuta] = useState(window.location.hash)
  useEffect(() => {
    const alCambiar = () => setRuta(window.location.hash)
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  // Al cambiar de pantalla, volvemos arriba (o al ancla si es una sección del portafolio).
  useEffect(() => {
    if (ruta.startsWith('#/')) window.scrollTo(0, 0)
  }, [ruta])

  const actual = rutas[ruta] // undefined si la dirección no es una pantalla de demo -> se muestra el portafolio
  const Pantalla = actual?.Pantalla

  if (actual?.fondoPropio) {
    return (
      <Suspense fallback={<Cargando />}>
        <Pantalla />
      </Suspense>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="fondo-halo" />
      <div className="fondo-cuadricula" />
      <Estrellas />
      {Pantalla ? (
        <Suspense fallback={<Cargando />}>
          <Pantalla />
        </Suspense>
      ) : (
        <Portafolio />
      )}
    </div>
  )
}

function Portafolio() {
  return (
    <>
      <Encabezado />
      <main>
        <Inicio />
        <SobreMi />
        <Proyectos />
        <Contacto />
      </main>
      <footer className="py-10 text-center text-sm text-fog-veil">
        <p>Portafolio diseñado y desarrollado por {CONTACTO.nombre}</p>
        <p className="mt-1">{CONTACTO.ciudad} · © {new Date().getFullYear()}</p>
      </footer>
    </>
  )
}
