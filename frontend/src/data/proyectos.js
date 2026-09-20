// Aquí viven los datos de tus proyectos. Para agregar uno nuevo, copia un bloque { ... } y cambia los textos.
// Más adelante estos datos vendrán de tu base de datos (PostgreSQL) a través de la API.
export const proyectos = [
  {
    id: 1,
    titulo: 'Chatbot de WhatsApp para negocio',
    descripcion:
      'Bot que atiende clientes automáticamente por WhatsApp usando la API de Meta. Responde consultas y ayuda a gestionar pedidos.',
    tecnologias: ['Python', 'API de Meta (WhatsApp)', 'Webhooks'],
    enlace: '#/chatbot',
  },
  {
    id: 2,
    titulo: 'App web con base de datos',
    descripcion:
      'Aplicación para crear, ver, editar y borrar registros (CRUD) con una API en Python y datos guardados en PostgreSQL.',
    tecnologias: ['React', 'FastAPI', 'PostgreSQL'],
    enlace: '#/gestor',
  },
  {
    id: 3,
    titulo: 'Página web para un negocio',
    descripcion:
      'Landing de ejemplo para una barbería: servicios con precios, horarios y ubicación. Diseño responsive con animaciones en CSS.',
    tecnologias: ['React', 'Tailwind CSS'],
    enlace: '#/barberia',
  },
  {
    id: 4,
    titulo: 'Asistente de soporte con IA',
    descripcion:
      'Demo simulada de un asistente que entiende mensajes libres, detecta la intención del cliente, pide los datos que faltan y deriva a una persona cuando no sabe.',
    tecnologias: ['IA conversacional', 'React', 'Tailwind CSS'],
    enlace: '#/soporte-ia',
  },
  {
    id: 5,
    titulo: 'Tienda online con carrito',
    descripcion:
      'Catálogo con búsqueda, filtros y orden, carrito que recuerda tus productos y cálculo de envío en soles. Hecho solo con React.',
    tecnologias: ['React', 'Tailwind CSS', 'JavaScript'],
    enlace: '#/tienda',
  },
  {
    id: 6,
    titulo: 'Panel de ventas',
    descripcion:
      'Indicadores, gráficos dibujados en SVG y tablas con datos ficticios por periodo: 7 días, 30 días y 12 meses.',
    tecnologias: ['React', 'SVG', 'JavaScript'],
    enlace: '#/dashboard',
  },
]
