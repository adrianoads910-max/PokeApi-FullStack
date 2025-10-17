from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
from config import Config
import os
import requests  # chamadas externas (PokeAPI)

# ⚠️ Import do favorites_bp fica MAIS ABAIXO, depois de app/db/jwt estarem prontos

app = Flask(__name__)
app.config.from_object(Config)

# ✅ Corrigido: CORS liberado para o Angular
CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}}, supports_credentials=True)

db.init_app(app)
jwt = JWTManager(app)

# URL Base da PokéAPI
POKEAPI_BASE_URL = "https://pokeapi.co/api/v2/pokemon/"

# ----------------------------------------------
# 1. Configuração Inicial e Usuário Admin
# ----------------------------------------------
with app.app_context():
    db.create_all()

    # Corrigido: aponta para o banco dentro de /instance/
    db_path = os.path.join(app.instance_path, 'db.sqlite3')
    print(f"Banco de dados ativo em: {db_path}")

    # Cria o usuário admin se não existir
    if not User.query.filter_by(email="admin@teste.com").first():
        user = User(
            name="Administrador",
            nickname="admin",
            email="admin@teste.com",
            password=generate_password_hash("123456")
        )
        db.session.add(user)
        db.session.commit()
        print("Usuário admin criado com sucesso!")

# ----------------------------------------------
# 2. Rotas de Autenticação
# ----------------------------------------------

@app.post("/register")
def register():
    data = request.get_json()

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
    new_user = User(name=name, nickname=nickname, email=email, password=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuário registrado com sucesso!"}), 200


@app.post("/login")
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"msg": "Credenciais inválidas"}), 401

    # Cria token JWT
    token = create_access_token(identity=user.email)

    # Retorna também os dados do usuário
    return jsonify({
        "msg": "Login bem-sucedido!",
        "access_token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "nickname": user.nickname,
            "email": user.email
        }
    }), 200



@app.get("/protected")
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"msg": f"Acesso autorizado para {current_user}"}), 200


# ----------------------------------------------
# 3. Rotas da PokéAPI
# ----------------------------------------------

@app.get("/pokemon/filter")
def filter_pokemon_data():
    generation_id = request.args.get('generation')
    type_name = request.args.get('type')

    pokemon_set = set()
    temp_set = set()

    try:
        if generation_id:
            gen_url = f"https://pokeapi.co/api/v2/generation/{generation_id.lower()}"
            gen_response = requests.get(gen_url)
            gen_response.raise_for_status()
            gen_data = gen_response.json()

            for species in gen_data.get('pokemon_species', []):
                temp_set.add(species['name'])

            pokemon_set = temp_set.copy()
            temp_set.clear()

        if type_name:
            type_url = f"https://pokeapi.co/api/v2/type/{type_name.lower()}"
            type_response = requests.get(type_url)
            type_response.raise_for_status()
            type_data = type_response.json()

            for pokemon_entry in type_data.get('pokemon', []):
                temp_set.add(pokemon_entry['pokemon']['name'])

            if not generation_id:
                pokemon_set = temp_set
            else:
                pokemon_set = pokemon_set.intersection(temp_set)

        if not generation_id and not type_name:
            return jsonify({"msg": "Forneça pelo menos um parâmetro: 'generation' ou 'type'."}), 400

        if not pokemon_set:
            return jsonify({"results": [], "count": 0, "msg": "Nenhum Pokémon encontrado com os filtros combinados."}), 200

        final_results = []
        for pokemon_name in list(pokemon_set):
            detail_response = requests.get(f"{POKEAPI_BASE_URL}{pokemon_name}")
            if detail_response.ok:
                poke_data = detail_response.json()
                final_results.append({
                    "id": poke_data.get("id"),
                    "name": poke_data.get("name").capitalize(),
                    "types": [t["type"]["name"].capitalize() for t in poke_data.get("types", [])],
                    "sprite_url": poke_data["sprites"]["front_default"],
                })

        final_results.sort(key=lambda x: x['id'])

        return jsonify({
            "results": final_results,
            "count": len(final_results)
        }), 200

    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            return jsonify({"msg": "Geração ou Tipo de Pokémon não encontrado/inválido."}), 404
        return jsonify({"msg": f"Erro ao consultar API externa: {e}"}), 503

    except requests.exceptions.RequestException:
        return jsonify({"msg": "Erro de rede ao comunicar com a PokéAPI."}), 503


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


# 🔻 Importa e registra o Blueprint após inicializações
from favorites import favorites_bp
app.register_blueprint(favorites_bp)

# ----------------------------------------------
# 4. Execução do App
# ----------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
