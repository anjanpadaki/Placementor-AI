import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    GROQ_CHAT_MODEL: str = "openai/gpt-oss-20b"
    HF_EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    CHROMA_PERSIST_DIRECTORY: str = "./data/chroma"
    UPLOAD_DIRECTORY: str = "./data/uploads"
    
    class Config:
        env_file = ".env"

settings = Settings()
