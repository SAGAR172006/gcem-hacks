# AMI — Autonomous Learning Orchestrator

> Hackathon project. Drop a topic or upload a file — AMI generates a full personalized learning module in seconds.

---

## Folder Structure

```
ami/
├── frontend/          ← Vite + React app
│   ├── src/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/           ← FastAPI Python API
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example   ← copy to .env and fill in keys
│   ├── routers/       ← auth.py, modules.py, chat.py
│   ├── agents/        ← search, text, slides, audio, mindmap, image
│   ├── services/      ← gemini.py (key rotation), supabase.py
│   └── models/        ← schemas.py (Pydantic models)
│
├── BACKEND_PROMPTS.md ← Ordered AI prompts to build each backend piece
└── PROJECT_MEMORY.md  ← Master project memory (features, progress, status)
```

---

## Running the Frontend

```bash
cd frontend
npm install       # first time only
npm run dev       # starts at http://localhost:5173
```

---

## Running the Backend

```bash
cd backend

# First time setup
cp .env.example .env          # then open .env and add your API keys
python -m venv venv           # create virtual environment
source venv/bin/activate      # Mac/Linux
# OR: venv\Scripts\activate   # Windows

pip install -r requirements.txt

# Start the server
uvicorn main:app --reload     # starts at http://localhost:8000
```

The frontend Vite dev server automatically proxies `/api/*` requests to `localhost:8000`, so you never need to touch CORS manually.

---

## API Health Check

Once backend is running:
```
GET http://localhost:8000/api/health
→ { "status": "ok" }
```

---

## Building the Backend

See **BACKEND_PROMPTS.md** for 12 ordered prompts (designed for Kiro / Antigravity IDE).
Run them in order — each one builds on the previous.

**Minimum for a demo:** Prompts 1, 2, 3, 9 (text agent only) → gives real AI-generated modules with auth.

---

## Tech Stack

| Layer     | Tech                        |
|-----------|-----------------------------|
| Frontend  | Vite · React 18 · CSS vars  |
| Backend   | FastAPI · Python 3.11       |
| AI        | Google Gemini (key rotation)|
| Database  | Supabase (PostgreSQL)       |
| Auth      | JWT + bcrypt + Google OAuth |
