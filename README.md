# Portafolio de Stefano Ahumada

Portafolio web de Stefano Ahumada, estudiante de Ingeniería de Sistemas en Lima, Perú.

## Contenido

- **Portafolio** con animaciones en CSS.
- **Ficha del chatbot de WhatsApp** con una demo de chat simulada (`#/chatbot`).
- **Landing de ejemplo para una barbería** (`#/barberia`).
- **Gestor de tareas** (CRUD completo con React + FastAPI + PostgreSQL) y **panel de mensajes**: solo funcionan en local, porque necesitan el backend (`#/gestor`, `#/admin`).

## Estructura

```
frontend/   React + Vite + Tailwind CSS  (lo que se publica en Vercel)
backend/    FastAPI + SQLAlchemy + PostgreSQL (por ahora solo local)
```

## Ejecutar en local

Frontend (solo esto basta para ver el portafolio, el chatbot y la barbería):

```bash
cd frontend
npm install
npm run dev
```

Backend (opcional, habilita el gestor de tareas y el panel de mensajes):

```bash
cd backend
docker compose up -d            # PostgreSQL
py -3.14 -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe -m uvicorn app.main:app --port 8000
```

Antes, copia `backend/.env.example` a `backend/.env` y cambia las claves. El archivo `.env` nunca se sube al repositorio.

## Publicar el frontend en Vercel

1. Importar este repositorio en Vercel.
2. **Root Directory:** `frontend`. Vercel detecta Vite solo (`npm run build`, salida `dist`).
3. Deploy.

## Diseño

- Portafolio: estilo "AuthKit" (medianoche con cristal esmerilado). Ver `frontend/DESIGN.md`.
- Landing de la barbería: estilo "Redbrick Coffee". Ambos tomados como referencia de [refero.design](https://styles.refero.design).
