from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# DATABASE URL from .env
DATABASE_URL = os.getenv("DATABASE_URL")

# Create Engine
engine = create_engine(
    DATABASE_URL,
    echo=True,  # logs SQL queries (development ke liye)
    pool_pre_ping=True
)

# Session Local (each request ke liye DB session)
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for models
Base = declarative_base()


# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()