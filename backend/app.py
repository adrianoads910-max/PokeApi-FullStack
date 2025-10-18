# app.py
from flask import Flask, request, jsonify, Blueprint
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
from config import Config
import os
import requests
from datetime import timedelta

# ==============================================
# Inicialização do app
# ==============================================
app = Flask(__name__)
app.config.from_object(Config)

# 🔐 JWT (garante leitura via header Authorization: Bearer <token>)
app.config.setdefault("JWT_TOKEN_LOCATION", ["headers"])
app.config.setdefault("JWT_HEADER_NAME", "Authorization")
app.config.setdefault("JWT_HEADER_TYPE", "Bearer")
app.config.setdefault("JWT_ERROR_MESSAGE_KEY", "message")

# 🌐 CORS (Angular em localhost e 127.0.0.1)

CORS(app, resources={r"/*": {
    "origins": ["http://localhost:4200", 
                "http://127.0.0.1:4200",
                "https://adrianoads910-max.github.io",
                "https://pokeapi-fullstack.onrender.com"],
    "allow_headers": ["Content-Type", "Authorization"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "supports_credentials": True
}})


# DB + JWT
db.init_app(app)
jwt = JWTManager(app)

# URL Base da PokéAPI
POKEAPI_BASE_URL = "https://pokeapi.co/api/v2/pokemon/"

# ==============================================
# 1) Setup inicial e usuário admin
# ==============================================
with app.app_context():
    db.create_all()

    try:
        db_path = os.path.join(app.instance_path, 'db.sqlite3')
        print(f"Banco de dados ativo em: {db_path}")
    except Exception:
        pass

    if not User.query.filter_by(email="admin@teste.com").first():
        admin = User(
            name="Administrador",
            nickname="admin",
            email="admin@teste.com",
            password=generate_password_hash("123456"),
            is_admin=True
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Usuário admin criado: admin@teste.com / 123456")

# ==============================================
# 2) Auth: registro / login / rota protegida
# ==============================================
@app.post("/register")
def register():
    data = request.get_json() or {}

    name = data.get("name")
    nickname = data.get("nickname")
    email = data.get("email")
    password = data.get("password")
    confirm_password = data.get("confirmPassword")

    if not all([name, nickname, email, password, confirm_password]):
        return jsonify({"msg": "Todos os campos são obrigatórios!"}), 400

    if password != confirm_password:
        return jsonify({"msg": "As senhas não coincidem!"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "E-mail já cadastrado!"}), 409

    hashed_password = generate_password_hash(password)
    new_user = User(
        name=name,
        nickname=nickname,
        email=email,
        password=hashed_password,
        is_admin=False
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuário registrado com sucesso!"}), 200


@app.post("/login")
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"msg": "Credenciais inválidas"}), 401

    # ✅ Corrigido: subject deve ser string
    token = create_access_token(identity=str(user.id))

    return jsonify({
        "msg": "Login bem-sucedido!",
        "access_token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "nickname": user.nickname,
            "email": user.email,
            "is_admin": user.is_admin
        }
    }), 200


@app.get("/protected")
@jwt_required()
def protected():
    current_user_id = int(get_jwt_identity())  # ✅ convertido para int
    user = User.query.get(current_user_id)
    email = user.email if user else "desconhecido"
    return jsonify({"msg": f"Acesso autorizado para {email}"}), 200

# ==============================================
# 3) Perfil do Usuário (GET/PUT)
# ==============================================
profile_bp = Blueprint('profile', __name__, url_prefix="/api/profile")


@profile_bp.route("/", methods=["GET"])
@jwt_required()
def get_profile():
    current_user_id = int(get_jwt_identity())  # ✅ conversão
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "nickname": user.nickname,
        "email": user.email,
        "is_admin": user.is_admin
    }), 200


@profile_bp.route("/", methods=["PUT"])
@jwt_required()
def update_profile():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404

    data = request.get_json() or {}

    if "name" in data and data["name"]:
        user.name = data["name"]
    if "nickname" in data and data["nickname"]:
        user.nickname = data["nickname"]
    if "password" in data and data["password"]:
        user.password = generate_password_hash(data["password"])

    db.session.commit()

    return jsonify({
        "msg": "Perfil atualizado com sucesso!",
        "user": {
            "id": user.id,
            "name": user.name,
            "nickname": user.nickname,
            "email": user.email,
            "is_admin": user.is_admin
        }
    }), 200


app.register_blueprint(profile_bp)

# ==============================================
# 4) Rotas administrativas
# ==============================================
@app.route("/api/users", methods=["GET"])
@jwt_required()
def get_users():
    current_user_id = int(get_jwt_identity())  # ✅ conversão
    current_user = User.query.get(current_user_id)

    if not current_user or not current_user.is_admin:
        return jsonify({"error": "Acesso negado"}), 403

    users = User.query.all()
    return jsonify([
        {
            "id": u.id,
            "name": u.name,
            "nickname": u.nickname,
            "email": u.email,
            "is_admin": u.is_admin
        }
        for u in users
    ]), 200

# ==============================================
# 5) Rotas PokéAPI
# ==============================================
@app.route("/pokemon/filter", methods=["GET"])
def filter_pokemon():
    generation_id = request.args.get("generation")
    type_name = request.args.get("type")
    results = []

    try:
        # ✅ Caso nenhum filtro seja enviado → retorna os primeiros 50 Pokémon
        if not generation_id and not type_name:
            base_url = "https://pokeapi.co/api/v2/pokemon?limit=50&offset=0"
            response = requests.get(base_url, timeout=5)
            response.raise_for_status()
            data = response.json()

            for entry in data.get("results", []):
                poke_response = requests.get(entry["url"], timeout=5)
                if poke_response.ok:
                    poke_data = poke_response.json()
                    results.append({
                        "id": poke_data.get("id"),
                        "name": poke_data.get("name").capitalize(),
                        "types": [t["type"]["name"].capitalize() for t in poke_data.get("types", [])],
                        "sprite_url": poke_data["sprites"]["front_default"],
                    })

            return jsonify({"results": results, "count": len(results)}), 200

        # ✅ Apenas geração
        if generation_id and not type_name:
            gen_url = f"https://pokeapi.co/api/v2/generation/{generation_id}"
            response = requests.get(gen_url, timeout=5)
            response.raise_for_status()
            data = response.json()

            for species in data.get("pokemon_species", []):
                species_name = species["name"]
                poke_response = requests.get(f"https://pokeapi.co/api/v2/pokemon/{species_name}", timeout=5)
                if poke_response.ok:
                    poke_data = poke_response.json()
                    results.append({
                        "id": poke_data.get("id"),
                        "name": poke_data.get("name").capitalize(),
                        "types": [t["type"]["name"].capitalize() for t in poke_data.get("types", [])],
                        "sprite_url": poke_data["sprites"]["front_default"],
                    })

            return jsonify({"results": results, "count": len(results)}), 200

        # ✅ Apenas tipo
        if type_name and not generation_id:
            type_url = f"https://pokeapi.co/api/v2/type/{type_name.lower()}"
            response = requests.get(type_url, timeout=5)
            response.raise_for_status()
            data = response.json()

            for poke in data.get("pokemon", []):
                poke_response = requests.get(poke["pokemon"]["url"], timeout=5)
                if poke_response.ok:
                    poke_data = poke_response.json()
                    results.append({
                        "id": poke_data.get("id"),
                        "name": poke_data.get("name").capitalize(),
                        "types": [t["type"]["name"].capitalize() for t in poke_data.get("types", [])],
                        "sprite_url": poke_data["sprites"]["front_default"],
                    })

            return jsonify({"results": results, "count": len(results)}), 200

        # ✅ Geração + Tipo
        if generation_id and type_name:
            gen_url = f"https://pokeapi.co/api/v2/generation/{generation_id}"
            type_url = f"https://pokeapi.co/api/v2/type/{type_name.lower()}"

            gen_data = requests.get(gen_url, timeout=5).json()
            type_data = requests.get(type_url, timeout=5).json()

            gen_species = {p["name"] for p in gen_data.get("pokemon_species", [])}
            filtered = [p["pokemon"] for p in type_data.get("pokemon", []) if p["pokemon"]["name"] in gen_species]

            for poke in filtered:
                poke_response = requests.get(poke["url"], timeout=5)
                if poke_response.ok:
                    poke_data = poke_response.json()
                    results.append({
                        "id": poke_data.get("id"),
                        "name": poke_data.get("name").capitalize(),
                        "types": [t["type"]["name"].capitalize() for t in poke_data.get("types", [])],
                        "sprite_url": poke_data["sprites"]["front_default"],
                    })

            return jsonify({"results": results, "count": len(results)}), 200

    except requests.exceptions.Timeout:
        return jsonify({"msg": "PokéAPI demorou demais para responder. Tente novamente."}), 504

    except Exception as e:
        print(f"Erro inesperado: {e}")
        return jsonify({"msg": "Erro interno ao processar o filtro."}), 500


@app.get("/pokemon/search/<name_or_id>")
def get_pokemon_data(name_or_id):
    url = f"{POKEAPI_BASE_URL}{name_or_id.lower()}"

    try:
        response = requests.get(url)

        if response.status_code == 404:
            return jsonify({"msg": f"Pokémon '{name_or_id}' não encontrado."}), 404

        response.raise_for_status()

        poke_data = response.json()

        pokemon_info = {
            "id": poke_data.get("id"),
            "name": poke_data.get("name").capitalize(),
            "types": [t["type"]["name"].capitalize() for t in poke_data.get("types", [])],
            "height": poke_data.get("height") / 10,
            "weight": poke_data.get("weight") / 10,
            "sprite_url": poke_data["sprites"]["front_default"],
            "abilities": [
                {"name": a["ability"]["name"], "is_hidden": a["is_hidden"]}
                for a in poke_data.get("abilities", [])
            ],
            "stats": {s["stat"]["name"]: s["base_stat"] for s in poke_data.get("stats", [])}
        }

        return jsonify(pokemon_info), 200

    except requests.exceptions.RequestException:
        return jsonify({"msg": "Erro ao comunicar com o serviço de Pokémon externo."}), 503

# ==============================================
# 6) Blueprints de Favoritos e Equipe
# ==============================================
from favorites import favorites_bp
from equip import equip_bp

app.register_blueprint(favorites_bp)
app.register_blueprint(equip_bp)

# ==============================================
# 7) Healthcheck e erros padrão
# ==============================================
@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Rota não encontrada"}), 404


@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Erro interno do servidor"}), 500


# ==============================================
# 8) Execução
# ==============================================
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
