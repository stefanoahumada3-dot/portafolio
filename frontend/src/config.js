// ¿Está disponible el backend (API en Python + PostgreSQL)?
// Por ahora solo existe en tu computadora (modo desarrollo, "npm run dev"). En la versión publicada en internet
// no hay backend, así que se ocultan las partes que lo necesitan (gestor de tareas y panel /admin)
// y los proyectos salen de src/data/proyectos.js.
//
// Cuando publiques el backend, cambia esto por:  export const HAY_BACKEND = true
export const HAY_BACKEND = import.meta.env.DEV

// Pantallas que necesitan el backend. Mientras no haya backend publicado, sus botones "Ver demo" se ocultan.
export const RUTAS_CON_BACKEND = ['#/gestor']

// Datos de contacto que se muestran al final del portafolio.
export const CONTACTO = {
  nombre: 'Stefano Ahumada',
  telefono: '+51 904 569 554',
  telefonoLink: '+51904569554', // sin espacios, para los enlaces tel: y WhatsApp
  email: 'stefanoahumada3@gmail.com',
  ciudad: 'Lima, Perú',
}
