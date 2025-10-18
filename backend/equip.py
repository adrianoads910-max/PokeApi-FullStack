from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Favorite, User, Equip
import json

equip_bp = Blueprint('equipe', __name__, url_prefix="/api/equipe")


# ==========================================
# 🔹 Função auxiliar: obter usuário autenticado
# ==========================================
def get_user():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    return user


# ==========================================
# 🔹 GET /api/equip
# ==========================================
@equip_bp.route("/", methods=["GET"])
@jwt_required()
def get_equip():
    user = get_user()
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    equip = Equip.query.filter_by(user_id=user.id).all()
    return jsonify([f.to_dict() for f in equip]), 200


# ==========================================
# 🔹 POST /api/equip
# ==========================================
@equip_bp.route("/", methods=["POST"])
@jwt_required()
def add_equip():
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

    # ✅ validações básicas
    if not pokemon_name or not pokemon_id:
        return jsonify({"msg": "Nome e ID do Pokémon são obrigatórios"}), 400

    # ✅ verifica se o Pokémon já está na equipe
    if Equip.query.filter_by(user_id=user.id, pokemon_id=pokemon_id).first():
        return jsonify({"msg": "Pokémon já está na sua equipe"}), 400

    # ✅ verifica se já tem 6 Pokémon
    equipe_atual = Equip.query.filter_by(user_id=user.id).count()
    if equipe_atual >= 6:
        return jsonify({"msg": "Você já possui 6 Pokémon na sua equipe. Remova um antes de adicionar outro."}), 400

    # ✅ adiciona Pokémon
    equip = Equip(
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

    db.session.add(equip)
    db.session.commit()

    return jsonify({"msg": f"{pokemon_name} adicionado à sua equipe!"}), 201


# ==========================================
# 🔹 DELETE /api/equip/<id>
# ==========================================
@equip_bp.route("/<int:pokemon_id>", methods=["DELETE"])
@jwt_required()
def delete_equip(pokemon_id):
    user = get_user()
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    equip = Equip.query.filter_by(user_id=user.id, pokemon_id=pokemon_id).first()
    if not equip:
        return jsonify({"msg": "Pokémon não encontrado na equipe"}), 404

    db.session.delete(equip)
    db.session.commit()

    return jsonify({"msg": "Pokémon removido da equipe!"}), 200
