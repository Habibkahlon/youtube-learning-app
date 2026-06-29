# YouTube Learning Agent

AI-powered app that finds expert YouTube videos on any topic, extracts transcripts, and builds a personalized learning roadmap with an interactive chat assistant.

## Stack
- Frontend: React + Vite
- Backend: FastAPI (Python)
- AI: Gemini 2.5 Flash Lite
- Transcripts: youtube-transcript.ai + Supadata

## Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Copy .env.example to .env and fill in your API keys
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
