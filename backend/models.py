from flask_sqlalchemy import SQLAlchemy
import json

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    nickname = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    favorites = db.relationship('Favorite', backref='user', lazy=True)
    equip = db.relationship('Equip', backref='user', lazy=True)
    is_admin = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "nickname": self.nickname,
            "email": self.email,
            "favorites": [fav.to_dict() for fav in self.favorites],
            "equip": [equi.to_dict() for equi in self.equip]
        }


class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    pokemon_id = db.Column(db.Integer, nullable=False)
    pokemon_name = db.Column(db.String(100))
    pokemon_image = db.Column(db.String(255))
    height = db.Column(db.Float)
    weight = db.Column(db.Float)
    abilities = db.Column(db.String(255))  # JSON string
    stats = db.Column(db.Text)      # JSON string
    types = db.Column(db.Text)      # JSON string

    def to_dict(self):
        return {
            "id": self.id,
            "pokemon_id": self.pokemon_id,
            "pokemon_name": self.pokemon_name,
            "pokemon_image": self.pokemon_image,
            "height": self.height,
            "weight": self.weight,
            "abilities": json.loads(self.abilities) if self.abilities else [],
            "stats": json.loads(self.stats) if self.stats else {},
            "types": json.loads(self.types) if self.types else []
        }
    
class Equip(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    pokemon_id = db.Column(db.Integer, nullable=False)
    pokemon_name = db.Column(db.String(100))
    pokemon_image = db.Column(db.String(255))
    height = db.Column(db.Float)
    weight = db.Column(db.Float)
    abilities = db.Column(db.String(255))  # JSON string
    stats = db.Column(db.Text)      # JSON string
    types = db.Column(db.Text)      # JSON string

    def to_dict(self):
        return {
            "id": self.id,
            "pokemon_id": self.pokemon_id,
            "pokemon_name": self.pokemon_name,
            "pokemon_image": self.pokemon_image,
            "height": self.height,
            "weight": self.weight,
            "abilities": json.loads(self.abilities) if self.abilities else [],
            "stats": json.loads(self.stats) if self.stats else {},
            "types": json.loads(self.types) if self.types else []
        }