
# 🧩 PokeApi-FullStack

Aplicação **Full Stack** desenvolvida para consumir e gerenciar dados da **PokéAPI**, com frontend em **Angular + TailwindCSS** e backend em **Python + SQL + JWT** para autenticação.

---

## 🚀 Visão Geral

O projeto tem como objetivo fornecer uma plataforma moderna e responsiva que exibe informações sobre Pokémons obtidas da PokéAPI.  
Inclui:
- **Frontend (Angular)**: Interface interativa com design responsivo via TailwindCSS.
- **Backend (Python)**: API REST segura, conectada a banco de dados SQL e protegida com JWT.

---

## 🧱 Estrutura do Projeto

```

PokeApi-FullStack/
│
├── backend/                 ← API Python (Flask)
│   ├── app/
│   │   ├── models/          ← modelos e tabelas SQL
│   │   ├── routes/          ← endpoints REST
│   │   ├── services/        ← regras de negócio
│   │   ├── auth/            ← autenticação JWT
│   │   └── **init**.py
│   ├── requirements.txt
│   └── config.py
│
├── frontend/                ← app Angular + Tailwind
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── environments/
│   ├── tailwind.config.js
│   ├── package.json
│   └── angular.json
│
└── README.md

````

---

## 🧩 Tecnologias utilizadas

### 🖥️ Frontend
- **Angular 18+**
- **TailwindCSS** (para estilização)
- **TypeScript**
- **RxJS / HttpClient** (requisições e observables)
- **Angular Router** (navegação de rotas)

### ⚙️ Backend
- **Python 3.11+**
- **FastAPI** ou **Flask**
- **SQLAlchemy** (ORM)
- **SQLite / PostgreSQL / MySQL** (dependendo do ambiente)
- **PyJWT** (autenticação via JSON Web Token)
- **Pydantic** (validação de dados)
- **CORS Middleware** (para comunicação segura com o frontend)

---

## 🔐 Autenticação (JWT)

O backend utiliza **JSON Web Tokens (JWT)** para autenticação:
- O usuário faz login e recebe um token JWT.
- Esse token é enviado no header (`Authorization: Bearer <token>`) em cada requisição.
- O backend valida o token e autoriza o acesso às rotas protegidas.

---

## 🧠 Funcionalidades principais

✅ Listagem de Pokémons com informações básicas  
✅ Busca por nome ou tipo  
✅ Página de detalhes de cada Pokémon  
✅ Autenticação de usuário (login/logout)  
✅ Favoritar Pokémons (usuário autenticado)  
✅ Integração com a PokéAPI  
✅ API Python segura com JWT  
✅ Banco SQL para armazenamento de usuários e favoritos

---

## 🧰 Como executar o projeto localmente

### 1️⃣ Clonar o repositório
```bash
git clone https://github.com/adrianoads910-max/PokeApi-FullStack.git
cd PokeApi-FullStack
````

---

### 2️⃣ Backend (Python)

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate    # (Windows)
pip install -r requirements.txt
uvicorn app.main:app --reload
```

O servidor será iniciado em `http://localhost:8000`.

---

### 3️⃣ Frontend (Angular)

Em outro terminal:

```bash
cd frontend
npm install
npm run start
```

O app será acessível em `http://localhost:4200`.

---

## ⚡ Comunicação Front ↔ Back

* O Angular consome endpoints do backend Python, por exemplo:

  ```
  GET http://localhost:8000/api/pokemon
  POST http://localhost:8000/api/auth/login
  ```
* Configure a URL base em `frontend/src/environments/environment.ts`:

  ```ts
  export const environment = {
    apiUrl: 'http://localhost:8000/api'
  };
  ```

---

## 🧾 Scripts úteis

### Backend

| Comando                         | Ação                           |
| ------------------------------- | ------------------------------ |
| `uvicorn app.main:app --reload` | Inicia servidor local          |
| `pytest`                        | Executa testes                 |
| `black .`                       | Formata código automaticamente |

### Frontend

| Comando         | Ação                        |
| --------------- | --------------------------- |
| `npm run start` | Inicia servidor Angular     |
| `npm run build` | Gera build de produção      |
| `npm run lint`  | Analisa o código com eslint |

---

## 🚀 Deploy (sugestão)

* **Backend**: Render, Railway, ou Docker + VPS
* **Frontend**: Vercel, Netlify ou GitHub Pages
* Configure variáveis de ambiente:

  ```
  DATABASE_URL=sqlite:///pokeapi.db
  SECRET_KEY=<sua_chave_jwt>
  ```

---

## 📄 Licença

Este projeto está sob a licença MIT.
Sinta-se à vontade para usar e contribuir!

---

### ✨ Autor

**Adriano ADS**
[GitHub](https://github.com/adrianoads910-max)



