from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# Los "schemas" definen la FORMA de los datos que entran y salen de la API.
# Pydantic los valida solo: si alguien envía un email inválido, la API responde con error.
class ProyectoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titulo: str
    descripcion: str
    tecnologias: list[str]
    enlace: str


class ContactoIn(BaseModel):
    nombre: str = Field(min_length=2, max_length=100)
    email: EmailStr
    mensaje: str = Field(min_length=5, max_length=2000)


class MensajeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    email: str
    mensaje: str
    creado_en: datetime


class TareaIn(BaseModel):
    titulo: str = Field(min_length=1, max_length=200)
    completada: bool = False


class TareaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titulo: str
    completada: bool
    creada_en: datetime


class ContactoOut(BaseModel):
    ok: bool = True
    detalle: str = "Mensaje recibido. ¡Gracias!"
