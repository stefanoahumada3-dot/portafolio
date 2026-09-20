from pydantic_settings import BaseSettings, SettingsConfigDict


# Lee las variables del archivo .env (así las claves nunca quedan escritas en el código).
class Settings(BaseSettings):
    database_url: str
    frontend_url: str = "http://localhost:5173"
    admin_token: str  # clave secreta para ver los mensajes de contacto

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
