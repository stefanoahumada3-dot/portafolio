import { useEffect, useRef, useState } from 'react'
import EncabezadoDemo from './componentes/EncabezadoDemo'
import { ultimosPedidos } from './data/pedidos'

// Asistente de soporte con IA (demo simulada). Se abre en  http://localhost:5173/#/soporte-ia
//
// IMPORTANTE: esta demo NO usa un modelo de IA. Las respuestas salen de reglas escritas a mano
// (palabras clave -> "intención" -> respuesta) para mostrar cómo se diseña la conversación:
// detectar qué quiere el cliente, pedir datos que faltan y derivar a una persona cuando no se sabe.
// En una versión real, un modelo de IA (por ejemplo Claude) haría la interpretación desde un backend seguro.

// ---------- "Base de conocimiento" de la tienda ficticia ----------
const intenciones = [
  {
    id: 'saludo',
    nombre: 'Saludo',
    accion: 'Responder y ofrecer ayuda',
    palabras: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey'],
    respuesta: () => '¡Hola! 👋 Soy el asistente de Aurora. Puedo ayudarte con envíos, devoluciones, pagos y el estado de tu pedido. ¿Qué necesitas?',
  },
  {
    id: 'envio',
    nombre: 'Envíos',
    accion: 'Responder desde la base de conocimiento',
    palabras: ['envio', 'enviar', 'entrega', 'entregan', 'demora', 'tarda', 'delivery', 'despacho', 'llega'],
    respuesta: () => 'Los envíos en Lima llegan en 24 a 48 horas y cuestan S/ 10. Son gratis desde S/ 150 de compra. A provincias tardan de 3 a 5 días hábiles.',
  },
  {
    id: 'devolucion',
    nombre: 'Devoluciones',
    accion: 'Responder desde la base de conocimiento',
    palabras: ['devolver', 'devolucion', 'devuelvo', 'cambio', 'cambiar', 'reembolso', 'garantia', 'malogrado', 'defectuoso'],
    respuesta: () => 'Tienes 15 días para devolver un producto sin usar y en su empaque original. Si llegó defectuoso, lo cambiamos sin costo. ¿Quieres que inicie el proceso?',
  },
  {
    id: 'pago',
    nombre: 'Métodos de pago',
    accion: 'Responder desde la base de conocimiento',
    palabras: ['pago', 'pagar', 'tarjeta', 'yape', 'plin', 'transferencia', 'efectivo', 'contraentrega', 'visa'],
    respuesta: () => 'Aceptamos tarjetas Visa y Mastercard, Yape, Plin y transferencia bancaria. También hay pago contraentrega en Lima.',
  },
  {
    id: 'horario',
    nombre: 'Horarios y contacto',
    accion: 'Responder desde la base de conocimiento',
    palabras: ['horario', 'atienden', 'abren', 'cierran', 'contacto', 'telefono', 'direccion', 'tienda fisica', 'ubicacion'],
    respuesta: () => 'Atendemos de lunes a sábado de 9:00 a 19:00. Nuestra tienda física está en Miraflores, Lima (dirección de ejemplo).',
  },
  {
    id: 'humano',
    nombre: 'Hablar con una persona',
    accion: 'Derivar a una persona',
    palabras: ['persona', 'humano', 'asesor', 'agente', 'reclamo', 'queja', 'supervisor'],
    respuesta: () => 'Claro, te paso con una persona del equipo. En horario de atención te responderá por este mismo chat. (Derivación simulada.)',
  },
  {
    id: 'gracias',
    nombre: 'Agradecimiento',
    accion: 'Cerrar la conversación con amabilidad',
    palabras: ['gracias', 'genial', 'perfecto', 'excelente', 'listo'],
    respuesta: () => '¡Con gusto! Si necesitas algo más, aquí estaré. 😊',
  },
]

const PEDIDO = {
  id: 'pedido',
  nombre: 'Estado de un pedido',
  palabras: ['pedido', 'orden', 'seguimiento', 'rastrear', 'rastreo', 'donde esta', 'tracking', 'compra'],
}

const sugerencias = [
  '¿Cuánto tarda el envío?',
  '¿Puedo devolver un producto?',
  '¿Dónde está mi pedido?',
  '¿Aceptan Yape?',
  'Quiero hablar con una persona',
]

// ---------- Lógica de interpretación ----------
const normalizar = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
// ¿el texto contiene la palabra (o frase) al inicio de una palabra? Así "envios" también coincide con "envio".
const contiene = (texto, palabra) => new RegExp(`(^|[^a-z0-9])${palabra}`).test(texto)
const coincidencias = (texto, palabras) => palabras.filter((p) => contiene(texto, p)).length
const confianzaDe = (n) => Math.min(0.55 + 0.2 * n, 0.97)

// Cómo cuenta el bot cada estado
const frasesEstado = {
  Entregado: 'ya fue entregado ✅',
  'En camino': 'está en camino 🚚 y llega mañana entre 10:00 y 18:00',
  Preparando: 'está en preparación 📦 y sale hoy mismo',
}
const nombresEstado = Object.keys(frasesEstado)

// Los pedidos que también aparecen en el panel de ventas usan su estado real; cualquier otro número
// recibe un estado de ejemplo según sus dígitos (así la demo siempre responde algo).
function estadoDelPedido(numero) {
  const conocido = ultimosPedidos.find(([id]) => id === `AUR-${numero}`)
  return conocido ? conocido[4] : nombresEstado[Number(numero) % nombresEstado.length]
}

// Recibe el mensaje del cliente y lo que el bot está esperando; devuelve la respuesta y cómo lo interpretó.
function interpretar(mensaje, pendiente) {
  const t = normalizar(mensaje)

  // ¿trae un número de pedido? (AUR-1234, aur1234, o solo dígitos si el bot ya lo había pedido)
  const numero = t.match(/aur-?\s?(\d{3,6})/)?.[1] ?? (pendiente === 'pedido' ? t.match(/(^|\D)(\d{3,6})(\D|$)/)?.[2] : undefined)
  if (numero) {
    return {
      texto: `Encontré tu pedido AUR-${numero}: ${frasesEstado[estadoDelPedido(numero)]}.`,
      pendiente: null,
      analisis: { intencion: PEDIDO.nombre, confianza: 0.96, dato: `Pedido AUR-${numero}`, accion: 'Consultar el pedido y responder' },
    }
  }

  const puntajes = [...intenciones, PEDIDO].map((i) => ({ i, n: coincidencias(t, i.palabras) })).filter((x) => x.n > 0)
  puntajes.sort((a, b) => b.n - a.n)
  const mejor = puntajes[0]

  if (mejor?.i.id === 'pedido') {
    return {
      texto: 'Con gusto reviso tu pedido. ¿Me compartes tu número de pedido? Tiene este formato: AUR-1234.',
      pendiente: 'pedido',
      analisis: { intencion: PEDIDO.nombre, confianza: confianzaDe(mejor.n), dato: 'Falta el número de pedido', accion: 'Pedir el dato que falta' },
    }
  }
  if (mejor) {
    return {
      texto: mejor.i.respuesta(),
      pendiente: null,
      analisis: { intencion: mejor.i.nombre, confianza: confianzaDe(mejor.n), dato: '—', accion: mejor.i.accion },
    }
  }
  return {
    texto: 'No estoy seguro de haber entendido 🙈. Puedo ayudarte con envíos, devoluciones, pagos, horarios y el estado de tu pedido. ¿Prefieres que te pase con una persona?',
    pendiente: null,
    analisis: { intencion: 'No entendido', confianza: 0.2, dato: '—', accion: 'Pedir aclaración y ofrecer una persona' },
  }
}

const ahora = () => new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

function Chat({ alAnalizar }) {
  const [mensajes, setMensajes] = useState([])
  const [escribiendo, setEscribiendo] = useState(false)
  const [texto, setTexto] = useState('')
  const pendiente = useRef(null)
  const temporizador = useRef(null)
  const zona = useRef(null)

  // Saludo inicial
  useEffect(() => {
    temporizador.current = setTimeout(() => {
      setMensajes([{ de: 'bot', texto: '¡Hola! 👋 Soy el asistente de Aurora, una tienda de ejemplo. Escríbeme con tus propias palabras o toca una sugerencia.', hora: ahora() }])
    }, 500)
    return () => clearTimeout(temporizador.current)
  }, [])

  // Bajar solo la zona del chat al llegar mensajes nuevos
  useEffect(() => {
    if (zona.current) zona.current.scrollTop = zona.current.scrollHeight
  }, [mensajes, escribiendo])

  function enviar(contenido) {
    const limpio = contenido.trim()
    if (!limpio || escribiendo) return
    setMensajes((m) => [...m, { de: 'yo', texto: limpio, hora: ahora() }])
    setTexto('')
    setEscribiendo(true)
    const r = interpretar(limpio, pendiente.current)
    pendiente.current = r.pendiente
    temporizador.current = setTimeout(() => {
      setMensajes((m) => [...m, { de: 'bot', texto: r.texto, hora: ahora() }])
      alAnalizar(r.analisis)
      setEscribiendo(false)
    }, 900)
  }

  return (
    <div className="vidrio flex h-[600px] w-full flex-col !rounded-[24px] !p-0">
      <div className="flex items-center gap-3 border-b border-[rgba(186,215,247,0.12)] px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(186,214,247,0.1)] text-sm text-frost-glow">A</span>
        <div>
          <p className="text-sm font-medium text-frost-glow">Aurora · Soporte</p>
          <p className="text-xs text-fog-veil">{escribiendo ? 'escribiendo…' : 'asistente virtual · en línea'}</p>
        </div>
      </div>

      <div ref={zona} className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4" aria-live="polite">
        {mensajes.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line ${
              m.de === 'yo'
                ? 'self-end rounded-br-md bg-[rgba(102,58,243,0.35)] text-white'
                : 'self-start rounded-bl-md bg-[rgba(186,214,247,0.08)] text-frost-glow'
            }`}
          >
            {m.texto}
            <span className="mt-1 block text-right text-[10px] text-fog-veil">{m.hora}</span>
          </div>
        ))}
        {escribiendo && (
          <div className="flex gap-1 self-start rounded-2xl rounded-bl-md bg-[rgba(186,214,247,0.08)] px-4 py-3" aria-label="El asistente está escribiendo">
            <span className="punto-escribiendo" />
            <span className="punto-escribiendo" />
            <span className="punto-escribiendo" />
          </div>
        )}
      </div>

      <div className="border-t border-[rgba(186,215,247,0.12)] px-4 pt-3 pb-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {sugerencias.map((s) => (
            <button key={s} onClick={() => enviar(s)} disabled={escribiendo} className="boton-vidrio !px-3 !py-1 text-xs disabled:opacity-50">
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); enviar(texto) }} className="flex gap-2">
          <input
            className="campo"
            placeholder="Escribe tu consulta…"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={200}
            aria-label="Tu mensaje"
          />
          <button type="submit" disabled={escribiendo || !texto.trim()} className="shrink-0 rounded-md bg-void-violet px-5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50">
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}

// Panel que muestra "cómo pensó" el asistente con el último mensaje
function PanelAnalisis({ analisis }) {
  return (
    <aside className="vidrio h-fit" aria-label="Cómo interpretó el asistente tu último mensaje">
      <p className="text-xs tracking-[0.1em] text-fog-veil uppercase">Cómo lo interpreta</p>
      {analisis ? (
        <dl className="mt-5 flex flex-col gap-4 text-sm">
          <div>
            <dt className="text-xs text-fog-veil">Intención detectada</dt>
            <dd className="mt-1 text-frost-glow">{analisis.intencion}</dd>
          </div>
          <div>
            <dt className="text-xs text-fog-veil">Confianza (simulada)</dt>
            <dd className="mt-2 flex items-center gap-3">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(186,214,247,0.12)]">
                <span className="block h-full rounded-full bg-[#98c0ef] transition-[width] duration-500" style={{ width: `${Math.round(analisis.confianza * 100)}%` }} />
              </span>
              <span className="text-frost-glow tabular-nums">{Math.round(analisis.confianza * 100)}%</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-fog-veil">Dato extraído</dt>
            <dd className="mt-1 text-frost-glow">{analisis.dato}</dd>
          </div>
          <div>
            <dt className="text-xs text-fog-veil">Acción</dt>
            <dd className="mt-1 text-frost-glow">{analisis.accion}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-5 text-sm text-fog-veil">Escribe un mensaje y aquí verás qué entendió el asistente y qué decidió hacer.</p>
      )}
    </aside>
  )
}

const pasos = [
  ['Recibe', 'El cliente escribe con sus propias palabras, sin menús ni comandos.'],
  ['Interpreta', 'Detecta la intención (envío, devolución, pedido…) y extrae datos como el número de pedido.'],
  ['Responde', 'Contesta con la información del negocio y pide lo que falta antes de actuar.'],
  ['Deriva', 'Si no está seguro o el cliente lo pide, pasa la conversación a una persona.'],
]

export default function SoporteIA() {
  const [analisis, setAnalisis] = useState(null)

  return (
    <>
      <EncabezadoDemo
        etiqueta="Proyecto · Bot con IA"
        titulo="Asistente de soporte con IA"
        texto="Un asistente que entiende mensajes escritos con libertad, detecta lo que quiere el cliente y sabe cuándo pasar la conversación a una persona."
        tecnologias={['IA conversacional', 'React', 'Tailwind CSS']}
        aviso="Demo simulada con datos ficticios: las respuestas salen de reglas escritas a mano, no de un modelo de IA. No se envía nada a internet."
      />

      <main className="mx-auto max-w-[1100px] px-6 py-14">
        <div className="entrada grid items-start gap-6 lg:grid-cols-[1fr_320px]" style={{ '--d': '0.7s' }}>
          <Chat alAnalizar={setAnalisis} />
          <PanelAnalisis analisis={analisis} />
        </div>

        <section className="aparece mt-20">
          <p className="ojo-seccion">Cómo funciona</p>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pasos.map(([titulo, texto], i) => (
              <li key={titulo} className="vidrio">
                <span className="font-mono text-xs text-fog-veil">0{i + 1}</span>
                <h3 className="font-display mt-2 text-xl font-medium text-frost-glow">{titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-fog-veil">{texto}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="aparece mx-auto mt-20 max-w-2xl text-center">
          <p className="ojo-seccion">Siguiente paso</p>
          <p className="mt-6 text-moon-mist">
            Conectar un modelo de IA real, como Claude, para que entienda cualquier redacción. La clave de la API viviría
            en un backend seguro y nunca en el navegador, y las respuestas se apoyarían en la información del negocio.
          </p>
        </section>
      </main>
    </>
  )
}
