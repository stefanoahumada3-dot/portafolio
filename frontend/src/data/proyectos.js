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
]
