from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import youtube, transcripts, gemini

app = FastAPI(title='YouTube Learning App')
app.add_middleware(CORSMiddleware, allow_origins=['http://localhost:5173'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
app.include_router(youtube.router, prefix='/api/youtube', tags=['youtube'])
app.include_router(transcripts.router, prefix='/api/transcripts', tags=['transcripts'])
app.include_router(gemini.router, prefix='/api/gemini', tags=['gemini'])

@app.get('/')
def root():
    return {'status': 'YouTube Learning App Backend Running'}
