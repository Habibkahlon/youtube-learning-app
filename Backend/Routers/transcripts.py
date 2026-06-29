import os, httpx, re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()
SUPADATA_KEY = os.getenv('SUPADATA_API_KEY')

class TranscriptRequest(BaseModel):
    video_ids: list

def clean_text(text):
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

async def fetch_primary(video_id):
    url = f'https://youtube-transcript.ai/api/transcript?videoId={video_id}'
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(url)
            if r.status_code == 200:
                data = r.json()
                if isinstance(data, list):
                    return clean_text(' '.join(s.get('text','') for s in data))
                if isinstance(data, dict) and 'transcript' in data:
                    return clean_text(data['transcript'])
    except Exception:
        pass
    return None

async def fetch_fallback(video_id):
    url = f'https://api.supadata.ai/v1/youtube/transcript?videoId={video_id}'
    headers = {'x-api-key': SUPADATA_KEY}
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(url, headers=headers)
            if r.status_code == 200:
                data = r.json()
                if 'transcript' in data:
                    return clean_text(data['transcript'])
                if 'content' in data:
                    segs = data['content']
                    if isinstance(segs, list):
                        return clean_text(' '.join(s.get('text','') for s in segs))
    except Exception:
        pass
    return None

@router.post('/fetch')
async def fetch_transcripts(req: TranscriptRequest):
    results = []
    for vid in req.video_ids:
        text = await fetch_primary(vid)
        source = 'youtube-transcript.ai'
        if not text:
            text = await fetch_fallback(vid)
            source = 'supadata'
        results.append({'video_id':vid,'transcript':text or '','source':source,'available':bool(text)})
    return {'transcripts': results}
