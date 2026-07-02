import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from limiter import limiter
from routers import youtube, transcripts, gemini

app = FastAPI(title='YouTube Learning App')
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(youtube.router, prefix='/api/youtube', tags=['youtube'])
app.include_router(transcripts.router, prefix='/api/transcripts', tags=['transcripts'])
app.include_router(gemini.router, prefix='/api/gemini', tags=['gemini'])

@app.get('/')
def root():
    return {'status': 'YouTube Learning App Backend Running'}
