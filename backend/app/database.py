from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings

# El "engine" es la conexión a PostgreSQL. La "sesión" es una conversación corta con la base de datos.
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    """Todas las tablas heredan de esta clase."""


# FastAPI usa esta función para darle a cada petición su propia sesión y cerrarla al terminar.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
