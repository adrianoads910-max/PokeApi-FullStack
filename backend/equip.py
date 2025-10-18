# equip.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Equip, User
import json

equip_bp = Blueprint('equip', __name__, url_prefix="/api/equipe")

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
# ⚙️ GET /api/equipe/
# Retorna a equipe do usuário logado
# ==========================================================
@equip_bp.route("/", methods=["GET", "OPTIONS"])
@jwt_required()
def get_equipe():
    if request.method == "OPTIONS":
        return jsonify({"msg": "ok"}), 200

    user = get_user()
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    equipe = Equip.query.filter_by(user_id=user.id).all()

    results = []
    for e in equipe:
        results.append({
            "id": e.pokemon_id,
            "name": e.pokemon_name,
            "sprite_url": e.pokemon_image or "",
            "height": e.height or 0,
            "weight": e.weight or 0,
            "abilities": json.loads(e.abilities or "[]"),
            "stats": json.loads(e.stats or "{}"),
            "types": json.loads(e.types or "[]"),
        })

    return jsonify(results), 200

# ==========================================================
# ➕ POST /api/equipe/
# Adiciona um Pokémon à equipe do usuário
# ==========================================================
@equip_bp.route("/", methods=["POST", "OPTIONS"])
@jwt_required()
def add_to_equipe():
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

    # ✅ verifica se já tem 6 Pokémon
    equipe_atual = Equip.query.filter_by(user_id=user.id).count()
    if equipe_atual >= 6:
    # Limite de 6
        if Equip.query.filter_by(user_id=user.id).count() >= 6:
         return jsonify({"msg": "Você já possui 6 Pokémon na sua equipe. Remova um antes de adicionar outro."}), 400
    # Evita duplicidade
    if Equip.query.filter_by(user_id=user.id, pokemon_id=pokemon_id).first():
        return jsonify({"msg": "Pokémon já está na equipe"}), 400
    
    try:
        equip = Equip(
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
        db.session.add(equip)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Erro ao salvar na equipe: {str(e)}"}), 400

    return jsonify({"msg": f"{pokemon_name} adicionado à equipe!"}), 201

# ==========================================================
# 🗑️ DELETE /api/equipe/<id>
# Remove Pokémon da equipe
# ==========================================================
@equip_bp.route("/<int:pokemon_id>", methods=["DELETE", "OPTIONS"])
@jwt_required()
def remove_from_equipe(pokemon_id):
    if request.method == "OPTIONS":
        return jsonify({"msg": "ok"}), 200

    user = get_user()
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    equipe_item = Equip.query.filter_by(user_id=user.id, pokemon_id=pokemon_id).first()
    if not equipe_item:
        return jsonify({"msg": "Pokémon não encontrado na equipe"}), 404

    db.session.delete(equipe_item)
    db.session.commit()
    return jsonify({"msg": "Pokémon removido da equipe!"}), 200
