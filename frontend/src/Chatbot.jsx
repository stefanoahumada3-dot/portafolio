import { useEffect, useRef, useState } from 'react'

// Ficha del proyecto "Chatbot de WhatsApp para negocio". Se abre en  http://localhost:5173/#/chatbot
// La conversación de la derecha es una SIMULACIÓN con datos ficticios (una barbería de ejemplo):
// no está conectada a WhatsApp ni a ningún cliente real. Las respuestas están programadas en "nodos".
//
// ✏️ Los textos de las secciones "Qué hace" y "Cómo funciona" son una descripción general:
//    edítalos abajo para que reflejen exactamente cómo funciona TU bot.

const queHace = [
  'Atiende a los clientes por WhatsApp a cualquier hora, sin que el dueño esté pendiente del teléfono.',
  'Responde las preguntas frecuentes: servicios, precios, horarios y ubicación.',
  'Guía al cliente paso a paso con opciones, para tomar pedidos o reservas.',
  'Recibe los mensajes mediante webhooks de la API oficial de Meta.',
]

const pasos = [
  ['Cliente', 'Escribe un mensaje al número de WhatsApp del negocio.'],
  ['API de Meta', 'WhatsApp Business Platform recibe el mensaje y lo envía a un webhook.'],
  ['Bot en Python', 'Interpreta el mensaje, decide la respuesta y prepara el siguiente paso.'],
  ['Respuesta', 'El bot responde por la misma API y el cliente lo ve en su chat.'],
]

const tecnologias = ['Python', 'API de Meta (WhatsApp)', 'Webhooks', 'Base de datos']

// ---------- Demo: la conversación como una pequeña "máquina de estados" ----------
// Cada nodo tiene el texto que dice el bot y las opciones (botones) que aparecen debajo.
// Cada opción puede guardar un dato de la reserva (guardar) y lleva a otro nodo (ir).

const SERVICIOS = [
  ['Corte clásico', 25],
  ['Corte + barba', 40],
  ['Perfilado de barba', 20],
  ['Afeitado con toalla', 30],
]

const nodos = {
  inicio: {
    texto: () => '¡Hola! 👋 Soy el asistente de Carmín Barbería (negocio de ejemplo). ¿En qué te ayudo?',
    opciones: [
      { label: 'Ver servicios', ir: 'servicios' },
      { label: 'Horarios', ir: 'horarios' },
      { label: 'Reservar cita', ir: 'reservar_servicio' },
    ],
  },
  servicios: {
    texto: () => 'Estos son nuestros servicios:\n' + SERVICIOS.map(([n, p]) => `• ${n}: S/ ${p}`).join('\n'),
    opciones: [
      { label: 'Reservar cita', ir: 'reservar_servicio' },
      { label: 'Volver al menú', ir: 'inicio' },
    ],
  },
  horarios: {
    texto: () => 'Atendemos:\n• Lunes a viernes: 9:00 – 20:00\n• Sábado: 9:00 – 18:00\n• Domingo: cerrado',
    opciones: [
      { label: 'Reservar cita', ir: 'reservar_servicio' },
      { label: 'Volver al menú', ir: 'inicio' },
    ],
  },
  reservar_servicio: {
    texto: () => '¡Genial! ¿Qué servicio quieres?',
    opciones: SERVICIOS.map(([n]) => ({ label: n, guardar: { servicio: n }, ir: 'reservar_dia' })),
  },
  reservar_dia: {
    texto: () => '¿Para qué día?',
    opciones: ['Mañana', 'Viernes', 'Sábado'].map((d) => ({ label: d, guardar: { dia: d }, ir: 'reservar_hora' })),
  },
  reservar_hora: {
    texto: () => '¿A qué hora te acomoda?',
    opciones: ['10:00', '15:30', '18:00'].map((h) => ({ label: h, guardar: { hora: h }, ir: 'confirmacion' })),
  },
  confirmacion: {
    texto: (r) => `✅ ¡Listo! Tu cita quedó reservada:\n• ${r.servicio}\n• ${r.dia} a las ${r.hora}\nTe esperamos. (Reserva simulada)`,
    opciones: [{ label: 'Hacer otra consulta', ir: 'inicio' }],
  },
}

const ahora = () => new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })

function DemoChat() {
  const [mensajes, setMensajes] = useState([])
  const [nodoActual, setNodoActual] = useState(null)
  const [escribiendo, setEscribiendo] = useState(false)
  const reserva = useRef({})
  const temporizador = useRef(null)
  const zonaMensajes = useRef(null)

  // El bot "escribe" durante un momento y luego muestra el mensaje del nodo indicado.
  function botResponde(clave, retraso = 700) {
    setNodoActual(null)
    setEscribiendo(true)
    temporizador.current = setTimeout(() => {
      const nodo = nodos[clave]
      setMensajes((m) => [...m, { de: 'bot', texto: nodo.texto(reserva.current), hora: ahora() }])
      setEscribiendo(false)
      setNodoActual(clave)
    }, retraso)
  }

  function reiniciar() {
    clearTimeout(temporizador.current)
    reserva.current = {}
    setMensajes([])
    botResponde('inicio', 500)
  }

  // Al abrir la ficha empieza la conversación; al salir se cancela el temporizador pendiente.
  useEffect(() => {
    reiniciar()
    return () => clearTimeout(temporizador.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Cada vez que llega un mensaje, bajamos solo la zona del chat (no toda la página).
  useEffect(() => {
    const zona = zonaMensajes.current
    if (zona) zona.scrollTop = zona.scrollHeight
  }, [mensajes, escribiendo])

  function elegir(opcion) {
    reserva.current = { ...reserva.current, ...opcion.guardar }
    setMensajes((m) => [...m, { de: 'yo', texto: opcion.label, hora: ahora() }])
    botResponde(opcion.ir)
  }

  const opciones = nodoActual ? nodos[nodoActual].opciones : []

  return (
    <div className="vidrio mx-auto flex h-[600px] w-full max-w-[380px] flex-col !rounded-[32px] !p-0">
      {/* Cabecera del chat */}
      <div className="flex items-center justify-between border-b border-[rgba(186,215,247,0.12)] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(186,214,247,0.1)] text-sm text-frost-glow">C</span>
          <div>
            <p className="text-sm font-medium text-frost-glow">Carmín Barbería</p>
            <p className="text-xs text-fog-veil">{escribiendo ? 'escribiendo…' : 'bot · en línea'}</p>
          </div>
        </div>
        <button onClick={reiniciar} className="boton-vidrio !px-3 !py-1 text-xs" aria-label="Reiniciar la conversación">
          ↺ Reiniciar
        </button>
      </div>

      {/* Mensajes */}
      <div ref={zonaMensajes} className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4" aria-live="polite">
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
          <div className="flex gap-1 self-start rounded-2xl rounded-bl-md bg-[rgba(186,214,247,0.08)] px-4 py-3" aria-label="El bot está escribiendo">
            <span className="punto-escribiendo" />
            <span className="punto-escribiendo" />
            <span className="punto-escribiendo" />
          </div>
        )}
      </div>

      {/* Opciones (respuestas rápidas) */}
      <div className="flex min-h-[76px] flex-wrap content-center gap-2 border-t border-[rgba(186,215,247,0.12)] px-4 py-3">
        {opciones.map((o) => (
          <button key={o.label} onClick={() => elegir(o)} className="boton-vidrio">
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Chatbot() {
  return (
    <main className="mx-auto max-w-[1100px] px-6 py-16">
      <a href="#proyectos" className="text-sm text-fog-veil hover:text-frost-glow">← Volver al portafolio</a>

      <div className="mt-10 grid items-start gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Columna izquierda: la ficha */}
        <div>
          <p className="ojo-seccion !justify-start entrada">Proyecto real · Chatbot</p>
          <h1 className="font-display texto-hielo entrada mt-6 text-4xl leading-[1.1] font-medium sm:text-6xl" style={{ '--d': '0.2s' }}>
            Chatbot de WhatsApp para negocio
          </h1>
          <p className="entrada mt-6 max-w-xl text-lg text-moon-mist" style={{ '--d': '0.4s' }}>
            Un bot que atiende a los clientes de un negocio por WhatsApp usando la API oficial de Meta. Responde consultas
            y ayuda a gestionar pedidos, para que el dueño se dedique a su negocio.
          </p>
          <div className="entrada mt-6 flex flex-wrap gap-2" style={{ '--d': '0.6s' }}>
            {tecnologias.map((t) => <span key={t} className="etiqueta">{t}</span>)}
          </div>

          <section className="aparece mt-14">
            <p className="ojo-seccion !justify-start">Qué hace</p>
            <ul className="mt-6 flex flex-col gap-3 text-moon-mist">
              {queHace.map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-frost-glow" aria-hidden="true" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="aparece mt-14">
            <p className="ojo-seccion !justify-start">Cómo funciona</p>
            <ol className="mt-6 grid gap-3 sm:grid-cols-2">
              {pasos.map(([titulo, texto], i) => (
                <li key={titulo} className="vidrio !p-5">
                  <span className="font-mono text-xs text-fog-veil">0{i + 1}</span>
                  <h3 className="font-display mt-2 text-xl font-medium text-frost-glow">{titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-fog-veil">{texto}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="aparece mt-14">
            <p className="ojo-seccion !justify-start">Siguiente paso</p>
            <p className="mt-6 text-moon-mist">
              Hoy el bot responde con reglas programadas. La siguiente mejora es conectarlo a un modelo de IA para que
              entienda mensajes libres, sin depender solo de botones y palabras exactas.
            </p>
          </section>
        </div>

        {/* Columna derecha: demo interactiva (se queda fija al bajar en pantallas grandes) */}
        <div className="entrada lg:sticky lg:top-8" style={{ '--d': '0.5s' }}>
          <p className="mb-4 text-center text-xs tracking-[0.1em] text-fog-veil uppercase">Prueba la demo</p>
          <DemoChat />
          <p className="mt-4 text-center text-xs text-fog-veil">
            Conversación simulada con datos ficticios. No está conectada a WhatsApp.
          </p>
        </div>
      </div>
    </main>
  )
}
