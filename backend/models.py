# models.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# ==========================================================
# 👤 Usuário
# ==========================================================
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    nickname = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    # Relacionamentos
    favorites = db.relationship("Favorites", backref="user", lazy=True, cascade="all, delete-orphan")
    equipe = db.relationship("Equip", backref="user", lazy=True, cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"


# ==========================================================
# ⭐ Favoritos (plural, para manter compatibilidade)
# ==========================================================
class Favorites(db.Model):
    __tablename__ = "favorites"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    pokemon_id = db.Column(db.Integer, nullable=False)
    pokemon_name = db.Column(db.String(120), nullable=False)
    pokemon_image = db.Column(db.String(255))

    height = db.Column(db.Float)
    weight = db.Column(db.Float)
    abilities = db.Column(db.Text)   # JSON string
    stats = db.Column(db.Text)       # JSON string
    types = db.Column(db.Text)       # JSON string

    def __repr__(self):
        return f"<Favorites {self.pokemon_name} (User {self.user_id})>"


# ==========================================================
# 🧢 Equipe (Pokémons do time)
# ==========================================================
class Equip(db.Model):
    __tablename__ = "equip"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    pokemon_id = db.Column(db.Integer, nullable=False)
    pokemon_name = db.Column(db.String(120), nullable=False)
    pokemon_image = db.Column(db.String(255))

    height = db.Column(db.Float)
    weight = db.Column(db.Float)
    abilities = db.Column(db.Text)   # JSON string
    stats = db.Column(db.Text)       # JSON string
    types = db.Column(db.Text)       # JSON string

    def __repr__(self):
        return f"<Equip {self.pokemon_name} (User {self.user_id})>"
