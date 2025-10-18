from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Favorite, User, Equip
import json

equip_bp = Blueprint('equipe', __name__, url_prefix="/api/equipe/")

def get_user():
    current_user_email = get_jwt_identity()
    return User.query.filter_by(email=current_user_email).first()

# GET /api/equipe/
@equip_bp.route("/", methods=["GET", "OPTIONS"])
@jwt_required()
def get_equip():
    if request.method == "OPTIONS":
        return jsonify({"msg": "ok"}), 200

    user = get_user()
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    equip = Equip.query.filter_by(user_id=user.id).all()

    results = []
    for f in equip:
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

# POST /api/equipe/
@equip_bp.route("/", methods=["POST", "OPTIONS"])
@jwt_required()
def add_equip():
    if request.method == "OPTIONS":
        return jsonify({"msg": "ok"}), 200

    user = get_user()
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    data = request.get_json(silent=True) or {}

    # 🔄 Normalização de campos do front/back
    pokemon_id = data.get("pokemon_id") or data.get("id")
    pokemon_name = data.get("pokemon_name") or data.get("name")
    pokemon_image = data.get("sprite_url") or data.get("pokemon_image")
    height = data.get("height")
    weight = data.get("weight")
    abilities = data.get("abilities") or []
    stats = data.get("stats") or {}
    types = data.get("types") or []

    if not pokemon_name or not pokemon_id:
        return jsonify({"msg": "Nome e ID do Pokémon são obrigatórios"}), 400

    if Equip.query.filter_by(user_id=user.id, pokemon_id=pokemon_id).first():
        return jsonify({"msg": "Pokémon já está na sua equipe"}), 400

    # Limite de 6
    if Equip.query.filter_by(user_id=user.id).count() >= 6:
        return jsonify({"msg": "Você já possui 6 Pokémon na sua equipe. Remova um antes de adicionar outro."}), 400

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
        return jsonify({"msg": f"Erro ao salvar equipe: {str(e)}"}), 400

    return jsonify({"msg": f"{pokemon_name} adicionado à sua equipe!"}), 201

# DELETE /api/equipe/<id>
@equip_bp.route("/<int:pokemon_id>", methods=["DELETE", "OPTIONS"])
@jwt_required()
def delete_equip(pokemon_id):
    if request.method == "OPTIONS":
        return jsonify({"msg": "ok"}), 200

    user = get_user()
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    equip = Equip.query.filter_by(user_id=user.id, pokemon_id=pokemon_id).first()
    if not equip:
        return jsonify({"msg": "Pokémon não encontrado na equipe"}), 404

    db.session.delete(equip)
    db.session.commit()
    return jsonify({"msg": "Pokémon removido da equipe!"}), 200
