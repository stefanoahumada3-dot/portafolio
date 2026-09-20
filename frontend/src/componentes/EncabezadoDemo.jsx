// Encabezado que comparten las pantallas de demo: enlace de vuelta, título, descripción y tecnologías.
export default function EncabezadoDemo({ etiqueta, titulo, texto, tecnologias = [], aviso }) {
  return (
    <header className="mx-auto max-w-[1100px] px-6 pt-12">
      <a href="#proyectos" className="text-sm text-fog-veil hover:text-frost-glow">← Volver al portafolio</a>
      <div className="mt-8 text-center">
        <p className="ojo-seccion entrada">{etiqueta}</p>
        <h1 className="font-display texto-hielo entrada mt-6 text-4xl leading-[1.1] font-medium sm:text-6xl" style={{ '--d': '0.2s' }}>
          {titulo}
        </h1>
        <p className="entrada mx-auto mt-5 max-w-2xl text-lg text-moon-mist" style={{ '--d': '0.4s' }}>{texto}</p>
        <div className="entrada mt-5 flex flex-wrap justify-center gap-2" style={{ '--d': '0.6s' }}>
          {tecnologias.map((t) => <span key={t} className="etiqueta">{t}</span>)}
        </div>
        {aviso && <p className="mt-4 text-xs text-fog-veil">{aviso}</p>}
      </div>
    </header>
  )
}
