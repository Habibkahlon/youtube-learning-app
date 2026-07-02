import os
from openai import OpenAI
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
limiter = Limiter(key_func=get_remote_address)
from pydantic import BaseModel
from dotenv import load_dotenv
load_dotenv()
router = APIRouter()
client = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)
MODEL = "gemini-2.5-flash-lite"

class RoadmapRequest(BaseModel):
    topic: str
    videos: list
    transcripts: list

class ChatRequest(BaseModel):
    topic: str
    roadmap: str
    transcripts: list
    history: list
    message: str

def build_context(transcripts, videos):
    ctx = []
    vid_map = {v["id"]: v for v in videos}
    for t in transcripts:
        if not t.get("available") or not t.get("transcript"):
            continue
        v = vid_map.get(t["video_id"], {})
        title = v.get("title", t["video_id"])
        channel = v.get("channel", "")
        text = t["transcript"][:4000]
        ctx.append(f"--- VIDEO: {title} | CHANNEL: {channel} ---\n{text}\n")
    return "\n".join(ctx)

@router.post("/roadmap")
@limiter.limit("10/minute")
async def generate_roadmap(request: Request, req: RoadmapRequest):
    try:
        context = build_context(req.transcripts, req.videos)
        if not context:
            context = "\n".join([f"- {v.get('title','')}" for v in req.videos])
            if not context:
                raise HTTPException(status_code=400, detail="No video data available")
        prompt = f"""You are an expert learning coach. Based on the YouTube video transcripts below about "{req.topic}", create a comprehensive structured learning roadmap.
TRANSCRIPTS:
{context}
Create a roadmap with exactly this structure:
# Learning Roadmap: {req.topic}
## Overview
[2-3 sentence summary]
## Phase 1: Foundation
**Goal:** [what you will understand]
**Key Concepts:**
- [concept 1]
- [concept 2]
**Action Steps:**
1. [step 1]
2. [step 2]
**Source Videos:** [relevant video titles]
## Phase 2: Core Skills
**Goal:** [what you will be able to do]
**Key Concepts:**
- [concept 1]
- [concept 2]
**Action Steps:**
1. [step 1]
2. [step 2]
**Source Videos:** [relevant video titles]
## Phase 3: Hands-on Practice
**Goal:** [practical application]
**Key Concepts:**
- [concept 1]
- [concept 2]
**Action Steps:**
1. [step 1]
2. [step 2]
**Source Videos:** [relevant video titles]
## Phase 4: Advanced Topics
**Goal:** [advanced understanding]
**Key Concepts:**
- [concept 1]
- [concept 2]
**Action Steps:**
1. [step 1]
2. [step 2]
**Source Videos:** [relevant video titles]
## Phase 5: Common Mistakes to Avoid
- [mistake 1 and how to avoid it]
- [mistake 2 and how to avoid it]
- [mistake 3 and how to avoid it]
## Estimated Learning Time
[realistic time estimate]
Base everything strictly on what the experts said in the transcripts."""
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        return {"roadmap": response.choices[0].message.content, "topic": req.topic}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat(req: ChatRequest):
    try:
        context = build_context(req.transcripts, [])
        history_text = ""
        for h in req.history[-6:]:
            role = "User" if h["role"] == "user" else "Assistant"
            history_text += f"{role}: {h['content']}\n"
        prompt = f"""You are an expert learning assistant for the topic: "{req.topic}".
Roadmap:
{req.roadmap}
Transcripts:
{context[:8000]}
Conversation:
{history_text}
User: {req.message}
Answer based on the roadmap and transcripts. Cite phases and videos when relevant."""
        response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}]
        )
        return {"reply": response.choices[0].message.content}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
