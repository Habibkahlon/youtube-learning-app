import os, httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from dotenv import load_dotenv
load_dotenv()
router = APIRouter()
YT_KEY = os.getenv('YOUTUBE_API_KEY')
YT_API = 'https://www.googleapis.com/youtube/v3'

class TopicRequest(BaseModel):
    topic: str = Field(min_length=2, max_length=150)
    max_results: int = Field(default=30, ge=1, le=50)

    @field_validator("topic")
    @classmethod
    def clean_topic(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Topic cannot be empty")
        return v

def build_queries(topic):
    return [
        f'{topic} tutorial for beginners',
        f'{topic} advanced deep dive',
        f'{topic} practical hands-on guide',
        f'{topic} tips mistakes to avoid',
    ]

async def search_videos(query, max_results=10):
    params = {'part':'snippet','q':query,'type':'video','videoCaption':'closedCaption','maxResults':max_results,'order':'relevance','videoDuration':'medium','key':YT_KEY}
    async with httpx.AsyncClient() as client:
        r = await client.get(f'{YT_API}/search', params=params)
        r.raise_for_status()
        return r.json().get('items', [])

async def get_video_details(video_ids):
    params = {'part':'snippet,statistics,contentDetails','id':','.join(video_ids),'key':YT_KEY}
    async with httpx.AsyncClient() as client:
        r = await client.get(f'{YT_API}/videos', params=params)
        r.raise_for_status()
        return r.json().get('items', [])

@router.post('/search')
async def search_youtube(req: TopicRequest):
    try:
        queries = build_queries(req.topic)
        all_items, seen = [], set()
        for q in queries:
            items = await search_videos(q, max_results=10)
            for item in items:
                vid = item['id']['videoId']
                if vid not in seen:
                    seen.add(vid)
                    all_items.append(vid)
        details = await get_video_details(all_items[:25])
        candidates = []
        for v in details:
            stats = v.get('statistics', {})
            views = int(stats.get('viewCount', 0))
            if views < 5000:
                continue
            candidates.append({'id':v['id'],'title':v['snippet']['title'],'channel':v['snippet']['channelTitle'],
                               'description':v['snippet']['description'][:300],'views':views,
                               'thumbnail':v['snippet']['thumbnails']['medium']['url'],'published':v['snippet']['publishedAt'][:10]})
        candidates.sort(key=lambda x: x['views'], reverse=True)
        return {'videos': candidates[:20], 'topic': req.topic}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
