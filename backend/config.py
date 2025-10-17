import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "chave-secreta-teste"
    SQLALCHEMY_DATABASE_URI = 'sqlite:///db.sqlite3'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "chave-jwt-super-secreta"
    
    # ✅ Adicione esta linha:
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)
