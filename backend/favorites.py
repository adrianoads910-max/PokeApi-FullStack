# favorites.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Favorites, User
import json

favorites_bp = Blueprint("favorites", __name__, url_prefix="/api/favorites")


# ==========================================================
# 🔐 Helper — obtém usuário autenticado
# ==========================================================
def get_user():
    try:
        current_user_id = int(get_jwt_identity())
        return User.query.get(current_user_id)
    except Exception:
        return None


# ==========================================================
# ⭐ GET /api/favoritos/
# Retorna os favoritos do usuário autenticado
# ==========================================================
@favorites_bp.route("/", methods=["GET", "OPTIONS"])
@jwt_required()
def get_favorites():
    if request.method == "OPTIONS":
        return jsonify({"msg": "ok"}), 200

    user = get_user()
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    favorites = Favorites.query.filter_by(user_id=user.id).all()

    results = []
    for f in favorites:
        results.append({
            "id": f.pokemon_id,
            "name": f.pokemon_name,
            "sprite_url": f.pokemon_image or "",
            "height": f.height or 0,
            "weight": f.weight or 0,
            "abilities": json.loads(f.abilities or "[]"),
            "stats": json.loads(f.stats or "{}"),
            "types": json.loads(f.types or "[]"),
        })

    return jsonify(results), 200


# ==========================================================
# ➕ POST /api/favoritos/
# Adiciona um Pokémon aos favoritos
# ==========================================================
@favorites_bp.route("/", methods=["POST", "OPTIONS"])
@jwt_required()
def add_favorite():
    if request.method == "OPTIONS":
        return jsonify({"msg": "ok"}), 200

    user = get_user()
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    data = request.get_json(silent=True) or {}

    pokemon_id = data.get("pokemon_id") or data.get("id")
    pokemon_name = data.get("pokemon_name") or data.get("name")
    pokemon_image = data.get("sprite_url") or data.get("pokemon_image")
    height = data.get("height")
    weight = data.get("weight")
    abilities = data.get("abilities") or []
    stats = data.get("stats") or {}
    types = data.get("types") or []

    if not pokemon_id or not pokemon_name:
        return jsonify({"msg": "Nome e ID do Pokémon são obrigatórios"}), 400

    # Evita duplicidade
    if Favorites.query.filter_by(user_id=user.id, pokemon_id=pokemon_id).first():
        return jsonify({"msg": "Pokémon já está nos favoritos"}), 400

    try:
        fav = Favorites(
            user_id=user.id,
            pokemon_id=pokemon_id,
            pokemon_name=pokemon_name,
            pokemon_image=pokemon_image,
            height=height,
            weight=weight,
            abilities=json.dumps(abilities),
            stats=json.dumps(stats),
            types=json.dumps(types),
        )
        db.session.add(fav)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Erro ao salvar favorito: {str(e)}"}), 400

    return jsonify({"msg": f"{pokemon_name} adicionado aos favoritos!"}), 201


# ==========================================================
# 🗑️ DELETE /api/favoritos/<id>
# Remove Pokémon dos favoritos
# ==========================================================
@favorites_bp.route("/<int:pokemon_id>", methods=["DELETE", "OPTIONS"])
@jwt_required()
def remove_favorite(pokemon_id):
    if request.method == "OPTIONS":
        return jsonify({"msg": "ok"}), 200

    user = get_user()
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    fav = Favorites.query.filter_by(user_id=user.id, pokemon_id=pokemon_id).first()
    if not fav:
        return jsonify({"msg": "Pokémon não encontrado nos favoritos"}), 404

    db.session.delete(fav)
    db.session.commit()
    return jsonify({"msg": "Pokémon removido dos favoritos!"}), 200
