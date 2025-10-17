from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Favorite, User
import json

favorites_bp = Blueprint('favorites', __name__, url_prefix="/api/favorites")

# Função auxiliar para obter usuário autenticado
def get_user():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    return user


# ==========================================
# GET /api/favorites
# ==========================================
@favorites_bp.route("/", methods=["GET"])
@jwt_required()
def get_favorites():
    user = get_user()
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    favorites = Favorite.query.filter_by(user_id=user.id).all()
    return jsonify([f.to_dict() for f in favorites]), 200


# ==========================================
# POST /api/favorites
# ==========================================
@favorites_bp.route("/", methods=["POST"])
@jwt_required()
def add_favorite():
    user = get_user()
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    data = request.get_json()

    pokemon_id = data.get("pokemon_id")
    pokemon_name = data.get("pokemon_name")
    pokemon_image = data.get("pokemon_image")
    height = data.get("height")
    weight = data.get("weight")
    abilities = data.get("abilities", [])
    stats = data.get("stats", {})
    types = data.get("types", [])

    if not pokemon_name or not pokemon_id:
        return jsonify({"msg": "Nome e ID do Pokémon são obrigatórios"}), 400

    if Favorite.query.filter_by(user_id=user.id, pokemon_id=pokemon_id).first():
        return jsonify({"msg": "Pokémon já está nos favoritos"}), 400

    favorite = Favorite(
        user_id=user.id,
        pokemon_id=pokemon_id,
        pokemon_name=pokemon_name,
        pokemon_image=pokemon_image,
        height=height,
        weight=weight,
        abilities=json.dumps(abilities),
        stats=json.dumps(stats),
        types=json.dumps(types)
    )

    db.session.add(favorite)
    db.session.commit()

    return jsonify({"msg": f"{pokemon_name} adicionado aos favoritos!"}), 201


# ==========================================
# DELETE /api/favorites/<id>
# ==========================================
@favorites_bp.route("/<int:pokemon_id>", methods=["DELETE"])
@jwt_required()
def delete_favorite(pokemon_id):
    user = get_user()
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    favorite = Favorite.query.filter_by(user_id=user.id, pokemon_id=pokemon_id).first()
    if not favorite:
        return jsonify({"msg": "Favorito não encontrado"}), 404

    db.session.delete(favorite)
    db.session.commit()

    return jsonify({"msg": "Favorito removido!"}), 200
