
# 🎮 Poké-Explorer | PokeApi-FullStack

Aplicação Full Stack que consome e gerencia dados da **PokéAPI**, permitindo ao usuário explorar Pokémon, montar equipes, favoritar e autenticar via login com JWT.

💻 **Frontend:** Angular + TailwindCSS  
🛠 **Backend:** Flask (Python) + SQLAlchemy + JWT  
🛡 **Autenticação:** JSON Web Token (JWT)  
🐍 **PokéAPI:** https://pokeapi.co  

---

## 🌐 Deploys Online

| Serviço       | URL |
|--------------|-----|
| **Frontend (Angular)** | ✅ https://adrianoads910-max.github.io/PokeApi-FullStack/ |
| **Backend (Flask)**    | ✅ https://pokeapi-fullstack.onrender.com |

⚠ *O backend no Render pode demorar até 50s para acordar (servidor gratuito "sleep mode").*

---

## 🧪 Branch de Desenvolvimento Local

A branch `teste-local` foi criada para desenvolvimento *offline*. Ela usa:

| Serviço      | URL Local |
|--------------|-----------|
| Frontend     | http://localhost:4200 |
| Backend      | http://127.0.0.1:5000 |

### ✅ Como rodar localmente:

```bash
git clone https://github.com/adrianoads910-max/PokeApi-FullStack.git
cd PokeApi-FullStack
git checkout teste-local
````

**Backend**

```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Frontend**

```bash
cd frontend
npm install
ng serve
```

---

## 🧱 Estrutura do Projeto

```
PokeApi-FullStack/
│
├── backend/                 ← API Flask + JWT + SQLAlchemy
│   ├── models/             ← modelos / tabelas SQL
│   ├── routes/             ← endpoints REST
│   ├── favorites.py        ← rota de favoritos
│   ├── equip.py            ← rota de equipe (máx. 6 Pokémon)
│   ├── app.py              ← ponto principal da API
│   ├── config.py           ← configurações e variáveis
│   └── requirements.txt
│
├── frontend/                ← Angular + Tailwind
│   ├── src/app/            ← componentes
│   ├── assets/             ← imagens, ícones
│   ├── environments/       ← URLs de produção e localhost
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## ✅ Funcionalidades

✔ Listagem de Pokémons com imagem, tipos e ID
✔ Filtro por geração, tipo, nome ou ID
✔ Login / Cadastro de usuário
✔ Favoritar pokémon
✔ Criar equipe (máximo 6 Pokémon)
✔ Salvo no banco de dados local (SQLite / Render)
✔ Consumo real da PokéAPI


##🐜 Bugs (Versão online gh-pages + render)
✔ Algumas vezes o render não da deploy no backend o que ocsaionar erros de login
✔ Demora para carregar filtros "todos"

---

## 🧠 Tecnologias utilizadas

| Frontend          | Backend            | Extra         |
| ----------------- | ------------------ | ------------- |
| Angular 18+       | Flask (Python)     | PokéAPI       |
| TailwindCSS       | SQLAlchemy (ORM)   | JWT (Auth)    |
| TypeScript        | SQLite (local)     | CORS          |
| RxJS + HttpClient | Flask-JWT-Extended | Render Deploy |

---

## ⚙ Comunicação Front ↔ Back

Exemplo de requisição no Angular:

```typescript
this.http.get(`${API_URL}/pokemon/filter?generation=1`)
```

No backend Flask:

```python
@app.route("/pokemon/filter", methods=["GET"])
def filter_pokemon():
    # retorna JSON com lista de Pokémon filtrados
```

O valor de `API_URL` vem de:

```
frontend/src/environments/environment.ts   (localhost)
frontend/src/environments/environment.prod.ts (produção)
```

---

## 🚀 Deploy Manual

### Publicar **Frontend** no GitHub Pages:

```bash
ng build --configuration production --base-href "/PokeApi-FullStack/"
npx angular-cli-ghpages --dir=dist/pokeapi/browser
```

### Atualizar **Backend** no Render:

Apenas:

```bash
git add .
git commit -m "Atualizando backend"
git push origin master
```

O Render faz o deploy automaticamente.

---

## 📌 Branches do Repositório

| Branch        | Descrição                                                           |
| ------------- | ------------------------------------------------------------------- |
| `master`      | Produção – Deploy no Render & GitHub Pages                          |
| `gh-pages`    | Código compilado do Angular para deploy                             |
| `teste-local` | Ambiente de desenvolvimento local (localhost:4200 / 127.0.0.1:5000) |

---

## 📄 Licença

Este projeto está sob a licença **MIT**.
Fique à vontade para usar, estudar ou contribuir!

---

## ✨ Autor

👨‍💻 **Adriano ADS**
📌 GitHub: [https://github.com/adrianoads910-max](https://github.com/adrianoads910-max)
