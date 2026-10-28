# OpenSource AI — Starter Project

A professional 5-page React + FastAPI starter for an AI-powered open-source contribution assistant.

## Requirements
- Node.js (current supported LTS)
- Python 3.11+
- Internet connection for npm installs and API calls

## 1. Run the frontend
Open a terminal in `frontend`:

```bash
npm install
npm run dev
```

Vite prints the local URL, usually http://localhost:5173.

## 2. Run the backend
Open a second terminal at the project root:

Windows PowerShell:
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

Windows CMD:
```bat
python -m venv .venv
.venv\Scripts\activate.bat
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

macOS/Linux:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

API docs: http://127.0.0.1:8000/docs

## 3. Enable AI (optional)
Copy `backend/.env.example` to `backend/.env`, then add a Groq API key.
Get a key from the provider's official developer console. The AI model name can change, so set `GROQ_MODEL` to a model currently available to your account.

Example:
```env
GROQ_API_KEY=your_key_here
GROQ_MODEL=your_supported_model_id
```

Without a key, all five pages still run and GitHub repository/issue browsing works; AI endpoints return a clear setup message.

## Pages
1. Home
2. Repository Explorer
3. Issues Explorer
4. AI Contribution Assistant
5. Testing & Contribution Guide

## Notes
- Public GitHub repositories are supported without GitHub authentication, subject to GitHub's rate limits.
- Never commit `.env` or expose API keys in frontend code.
- This is a starter project. Review generated AI guidance before using it and never execute untrusted repository code on your main machine.
