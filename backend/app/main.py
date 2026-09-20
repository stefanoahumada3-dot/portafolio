import secrets
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from . import models, schemas
from .config import settings
from .database import Base, SessionLocal, engine, get_db

PROYECTOS_INICIALES = [
    {
        "titulo": "Chatbot de WhatsApp para negocio",
        "descripcion": "Bot que atiende clientes automáticamente por WhatsApp usando la API de Meta. Responde consultas y ayuda a gestionar pedidos.",
        "tecnologias": ["Python", "API de Meta (WhatsApp)", "Webhooks"],
        "enlace": "#/chatbot",
    },
    {
        "titulo": "App web con base de datos",
        "descripcion": "Aplicación para crear, ver, editar y borrar registros (CRUD) con una API en Python y datos guardados en PostgreSQL.",
        "tecnologias": ["React", "FastAPI", "PostgreSQL"],
        "enlace": "#/gestor",
    },
    {
        "titulo": "Página web para un negocio",
        "descripcion": "Landing de ejemplo para una barbería: servicios con precios, horarios y ubicación. Diseño responsive con animaciones en CSS.",
        "tecnologias": ["React", "Tailwind CSS"],
        "enlace": "#/barberia",
    },
]


# Se ejecuta una vez al encender la API: crea las tablas si no existen y carga los 3 proyectos si la tabla está vacía.
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if db.scalar(select(models.Proyecto.id).limit(1)) is None:
            db.add_all(models.Proyecto(**{"enlace": "", **p}) for p in PROYECTOS_INICIALES)
            db.commit()
    yield


app = FastAPI(title="API del portafolio", lifespan=lifespan)

# CORS: permite que el frontend (otro puerto) hable con esta API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "X-Admin-Token"],
)


@app.get("/api/salud")
def salud():
    return {"estado": "ok"}


# GET = pedir datos. Devuelve la lista de proyectos guardados en la base de datos.
@app.get("/api/proyectos", response_model=list[schemas.ProyectoOut])
def listar_proyectos(db: Session = Depends(get_db)):
    return db.scalars(select(models.Proyecto).order_by(models.Proyecto.id)).all()


# ---------- Gestor de tareas: CRUD completo ----------
# Las 4 letras de CRUD son 4 tipos de petición HTTP:
#   Create -> POST      Read -> GET      Update -> PUT      Delete -> DELETE

MAX_TAREAS = 50  # tope para que nadie llene tu base de datos si la demo es pública


def buscar_tarea(db: Session, tarea_id: int) -> models.Tarea:
    tarea = db.get(models.Tarea, tarea_id)
    if tarea is None:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return tarea


# READ: todas las tareas, las más nuevas primero.
@app.get("/api/tareas", response_model=list[schemas.TareaOut])
def listar_tareas(db: Session = Depends(get_db)):
    return db.scalars(select(models.Tarea).order_by(models.Tarea.id.desc())).all()


# CREATE: crea una tarea nueva.
@app.post("/api/tareas", response_model=schemas.TareaOut, status_code=201)
def crear_tarea(datos: schemas.TareaIn, db: Session = Depends(get_db)):
    if db.scalar(select(func.count(models.Tarea.id))) >= MAX_TAREAS:
        raise HTTPException(status_code=409, detail=f"Máximo {MAX_TAREAS} tareas en la demo")
    tarea = models.Tarea(**datos.model_dump())
    db.add(tarea)
    db.commit()
    db.refresh(tarea)
    return tarea


# UPDATE: cambia el título o marca la tarea como completada.
@app.put("/api/tareas/{tarea_id}", response_model=schemas.TareaOut)
def actualizar_tarea(tarea_id: int, datos: schemas.TareaIn, db: Session = Depends(get_db)):
    tarea = buscar_tarea(db, tarea_id)
    tarea.titulo = datos.titulo
    tarea.completada = datos.completada
    db.commit()
    db.refresh(tarea)
    return tarea


# DELETE: borra la tarea. Responde 204 (éxito, sin contenido).
@app.delete("/api/tareas/{tarea_id}", status_code=204)
def borrar_tarea(tarea_id: int, db: Session = Depends(get_db)):
    db.delete(buscar_tarea(db, tarea_id))
    db.commit()


# Guardia de seguridad: exige el encabezado "X-Admin-Token" con tu clave secreta.
# compare_digest compara sin filtrar información por tiempos de respuesta.
def exigir_admin(x_admin_token: str = Header(default="")):
    if not secrets.compare_digest(x_admin_token, settings.admin_token):
        raise HTTPException(status_code=401, detail="Clave incorrecta")


# Solo tú: lista los mensajes de contacto, del más nuevo al más antiguo.
@app.get(
    "/api/admin/mensajes",
    response_model=list[schemas.MensajeOut],
    dependencies=[Depends(exigir_admin)],
)
def listar_mensajes(db: Session = Depends(get_db)):
    return db.scalars(
        select(models.MensajeContacto).order_by(models.MensajeContacto.creado_en.desc())
    ).all()


# POST = enviar datos. Guarda el mensaje del formulario de contacto en la base de datos.
@app.post("/api/contacto", response_model=schemas.ContactoOut, status_code=201)
def enviar_contacto(datos: schemas.ContactoIn, db: Session = Depends(get_db)):
    db.add(models.MensajeContacto(**datos.model_dump()))
    db.commit()
    return schemas.ContactoOut()
