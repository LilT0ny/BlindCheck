from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_url: str
    database_name: str
    secret_key: str
    encryption_key: str
    access_token_expire_minutes: int = 30
    algorithm: str = "HS256"

    class Config:
        env_file = ".env"

settings = Settings()
