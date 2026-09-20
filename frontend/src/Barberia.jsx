// Landing de ejemplo: "Carmín Barbería" (negocio ficticio).
// Se abre en  http://localhost:5173/#/barberia
// Estilo basado en "Redbrick Coffee" de refero.design: fondo blanco cálido, un solo rojo, titulares serif finísimos,
// etiquetas pequeñas tipo revista y tarjetas grises de esquinas muy redondeadas.

// Para que el botón "Reservar" abra WhatsApp, escribe aquí el número con código de país y sin signos (ej. '51987654321').
// Mientras esté vacío, el botón lleva a la sección de horarios y contacto.
const WHATSAPP = ''
const MENSAJE = 'Hola, quiero reservar una cita en Carmín Barbería.'

const servicios = [
  { nombre: 'Corte clásico', precio: 25, detalle: 'Tijera y máquina, lavado y peinado.', duracion: '40 min' },
  { nombre: 'Corte + barba', precio: 40, detalle: 'El combo completo con perfilado de barba.', duracion: '60 min' },
  { nombre: 'Perfilado de barba', precio: 20, detalle: 'Contornos precisos y aceite hidratante.', duracion: '25 min' },
  { nombre: 'Afeitado con toalla caliente', precio: 30, detalle: 'Navaja, espuma artesanal y toallas calientes.', duracion: '35 min' },
]

const motivos = [
  ['01', 'Barberos con oficio', 'Más de diez años cortando en el barrio. Escuchamos antes de pasar la tijera.'],
  ['02', 'Con cita, sin esperas', 'Reservas tu hora y entras a tu hora. Tu tiempo también cuenta.'],
  ['03', 'Detalles de antes', 'Toalla caliente, navaja y productos que huelen a barbería de verdad.'],
]

const horarios = [
  ['Lunes a viernes', '9:00 – 20:00'],
  ['Sábado', '9:00 – 18:00'],
  ['Domingo', 'Cerrado'],
]

// Llevar a una sección sin tocar la dirección (la barra de direcciones ya la usamos para las "pantallas" del sitio).
function ir(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Etiqueta pequeña tipo revista: texto a la izquierda, línea roja y enlace con flecha a la derecha.
function EtiquetaSeccion({ texto, enlace, destino }) {
  return (
    <div className="flex items-end justify-between border-b border-brick-red pb-2 text-xs tracking-[0.06em] text-brick-deep uppercase">
      <span>{texto}</span>
      {enlace && (
        <button onClick={() => ir(destino)} className="uppercase hover:opacity-70">
          {enlace} →
        </button>
      )}
    </div>
  )
}

// Poste de barbero dibujado en SVG. Las rayas diagonales suben en bucle (animación .rayas-poste).
function PosteBarbero() {
  // Cada franja se repite cada 56px de alto; se generan de sobra para cubrir todo el poste mientras sube.
  const franjas = Array.from({ length: 12 }, (_, i) => i * 56 - 112)
  return (
    <svg viewBox="0 0 160 420" className="mx-auto h-full max-h-[440px]" role="img" aria-label="Poste de barbería con rayas rojas y blancas">
      <defs>
        <clipPath id="cuerpo-poste">
          <rect x="44" y="64" width="72" height="292" rx="10" />
        </clipPath>
      </defs>
      {/* tapas */}
      <rect x="36" y="36" width="88" height="30" rx="8" fill="#212529" />
      <rect x="36" y="354" width="88" height="30" rx="8" fill="#212529" />
      <circle cx="80" cy="26" r="14" fill="#e82c2a" />
      {/* cuerpo: fondo blanco + franjas rojas en diagonal */}
      <g clipPath="url(#cuerpo-poste)">
        <rect x="44" y="64" width="72" height="292" fill="#fff" />
        <g className="rayas-poste">
          {franjas.map((y) => (
            <polygon key={y} points={`40,${y} 120,${y - 40} 120,${y - 12} 40,${y + 28}`} fill="#e82c2a" />
          ))}
        </g>
        {/* brillo suave a la izquierda para dar volumen */}
        <rect x="52" y="64" width="10" height="292" fill="#fff" opacity="0.35" />
      </g>
      <rect x="44" y="64" width="72" height="292" rx="10" fill="none" stroke="#212529" strokeWidth="3" />
    </svg>
  )
}

const urlReserva = WHATSAPP ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(MENSAJE)}` : null

// Botón "Reservar": si hay WhatsApp configurado abre el chat; si no, baja a la sección de contacto.
function Reservar({ className }) {
  return urlReserva ? (
    <a href={urlReserva} target="_blank" rel="noopener noreferrer" className={className}>
      Reservar cita →
    </a>
  ) : (
    <button onClick={() => ir('contacto-barberia')} className={className}>
      Reservar cita →
    </button>
  )
}

export default function Barberia() {
  return (
    <div className="min-h-screen bg-white font-sans text-press-black">
      {/* Barra de anuncio roja */}
      <div className="bg-brick-deep px-6 py-1.5 text-center text-[11px] tracking-[0.06em] text-white uppercase">
        Reserva tu cita hoy · Lun a sáb desde las 9:00
      </div>

      {/* Cabecera */}
      <header className="border-b border-brick-red">
        <nav className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-4">
          <span className="font-editorial text-2xl font-light tracking-wide text-brick-red">CARMÍN</span>
          <ul className="hidden gap-8 text-[15px] tracking-[0.013em] text-press-black sm:flex">
            {[['servicios', 'Servicios'], ['nosotros', 'Nosotros'], ['contacto-barberia', 'Horarios y contacto']].map(([id, texto]) => (
              <li key={id}>
                <button onClick={() => ir(id)} className="hover:text-brick-deep">{texto}</button>
              </li>
            ))}
          </ul>
          <a href="#proyectos" className="text-xs tracking-[0.06em] text-press-black uppercase hover:text-brick-deep">
            ← Portafolio
          </a>
        </nav>
      </header>

      {/* Hero: texto a la izquierda, imagen a la derecha */}
      <section className="mx-auto grid max-w-[1200px] items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="entrada text-xs tracking-[0.06em] text-brick-deep uppercase" style={{ '--d': '0.1s' }}>
            Barbería · Lima
          </p>
          <h1
            className="entrada font-editorial mt-5 text-[clamp(3.25rem,8vw,7rem)] leading-[1.02] font-light text-brick-red"
            style={{ '--d': '0.3s' }}
          >
            Corte clásico, trato de siempre.
          </h1>
          <p className="entrada mt-6 max-w-md text-[17px] leading-relaxed tracking-[0.013em]" style={{ '--d': '0.6s' }}>
            Cortes, barba y afeitado a navaja en un local tranquilo. Reservas en un minuto y llegas sin esperar.
          </p>
          <div className="entrada mt-8 flex flex-wrap gap-3" style={{ '--d': '0.9s' }}>
            <Reservar className="rounded-full bg-brick-deep px-7 py-3 text-[15px] text-white hover:bg-brick-red" />
            <button
              onClick={() => ir('servicios')}
              className="rounded-full border border-brick-red px-7 py-3 text-[15px] text-brick-deep hover:bg-soft-grey"
            >
              Ver servicios
            </button>
          </div>
        </div>
        <div className="entrada flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[25px] bg-soft-grey p-8" style={{ '--d': '0.4s' }}>
          <PosteBarbero />
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="mx-auto max-w-[1200px] scroll-mt-4 px-6 py-16 md:py-24">
        <EtiquetaSeccion texto="Servicios y precios" enlace="Reservar" destino="contacto-barberia" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {servicios.map((s) => (
            <article key={s.nombre} className="aparece flex flex-col rounded-[25px] bg-soft-grey p-[30px]">
              <span className="text-xs tracking-[0.06em] text-brick-deep uppercase">{s.duracion}</span>
              <h3 className="mt-3 text-xl tracking-[0.017em]">{s.nombre}</h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-press-black/75">{s.detalle}</p>
              <p className="font-editorial mt-6 text-4xl font-light text-brick-red">S/ {s.precio}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Por qué nosotros */}
      <section id="nosotros" className="mx-auto max-w-[1200px] scroll-mt-4 px-6 py-16 md:py-24">
        <EtiquetaSeccion texto="Por qué Carmín" />
        <h2 className="font-editorial aparece mt-10 max-w-3xl text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.05] font-light text-brick-red">
          Una barbería que se toma su tiempo, para que tú no pierdas el tuyo.
        </h2>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {motivos.map(([num, titulo, texto]) => (
            <div key={num} className="aparece border-t border-brick-red pt-5">
              <span className="text-xs tracking-[0.06em] text-brick-deep">{num}</span>
              <h3 className="mt-3 text-xl tracking-[0.017em]">{titulo}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-press-black/75">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Horarios y contacto */}
      <section id="contacto-barberia" className="mx-auto max-w-[1200px] scroll-mt-4 px-6 py-16 md:py-24">
        <EtiquetaSeccion texto="Horarios y contacto" />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="aparece rounded-[25px] bg-soft-grey p-[30px]">
            <h3 className="text-xl tracking-[0.017em]">Horarios</h3>
            <dl className="mt-5 divide-y divide-press-black/10 text-[15px]">
              {horarios.map(([dia, hora]) => (
                <div key={dia} className="flex justify-between py-3">
                  <dt>{dia}</dt>
                  <dd className="text-press-black/75">{hora}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="aparece rounded-[25px] bg-soft-grey p-[30px]">
            <h3 className="text-xl tracking-[0.017em]">Ubicación</h3>
            <p className="mt-5 text-[15px] leading-relaxed">
              Av. Ejemplo 123, Miraflores<br />
              Lima, Perú
            </p>
            <p className="mt-2 text-xs text-press-black/60">(Dirección de ejemplo: negocio ficticio para la demo.)</p>
            <Reservar className="mt-8 rounded-full bg-brick-deep px-7 py-3 text-[15px] text-white hover:bg-brick-red" />
            {!urlReserva && (
              <p className="mt-3 text-xs text-press-black/60">
                En la versión real, este botón abre WhatsApp con el mensaje de reserva ya escrito.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Pie de página oscuro */}
      <footer className="bg-carbon px-6 py-14 text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="font-editorial text-4xl font-light">Carmín Barbería</p>
          <div className="text-sm text-white/60">
            <p>Página de ejemplo creada por Stefano Ahumada. Negocio ficticio.</p>
            <a href="#proyectos" className="mt-2 inline-block text-white hover:underline">← Volver al portafolio</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
