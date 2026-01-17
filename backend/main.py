import os
import json
import traceback
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
from google.genai import types
from typing import Any, List
import requests

from google import genai

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not API_KEY:
    raise RuntimeError("Missing GEMINI_API_KEY in backend/.env")

MODEL_NAME = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash-lite")

client = genai.Client(api_key=API_KEY)

# Prompts directory
PROMPTS_DIR = Path(__file__).parent / "prompts"

def load_prompt(prompt_name: str, default: str = "") -> str:
    prompt_file = PROMPTS_DIR / f"{prompt_name}.txt"
    try:
        if prompt_file.exists():
            return prompt_file.read_text().strip()
        else:
            print(f"Warning: Prompt file {prompt_file} not found, using default")
            return default
    except Exception as e:
        print(f"Error loading prompt {prompt_name}: {e}")
        return default

def extract_json(text: str, brace_1: str = '{', brace_2: str = '}') -> dict:

    start_idx = text.find(brace_1)
    if start_idx == -1:
        raise ValueError(f"No opening '{brace_1}' brace found in text")
    
    depth = 0
    end_idx = start_idx
    
    for i in range(start_idx, len(text)):
        if text[i] == brace_1:
            depth += 1
        elif text[i] == brace_2:
            depth -= 1
            if depth == 0:
                end_idx = i
                break
    
    if depth != 0:
        raise ValueError(f"No matching '{brace_2}' brace found")
    
    json_str = text[start_idx:end_idx + 1]
    
    return json.loads(json_str)

def openrouter_post(messages: list[dict[str, Any]]) -> dict[str, Any]:
    return requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "https://www.google.com",
        "X-Title": "Google"
        },
        data=json.dumps({
            "model": MODEL_NAME,
            "messages": messages
        })
    ).json()


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # fine for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StyleResponse(BaseModel):
    answer: dict[str, Any]

class SearchResponse(BaseModel):
    answer: List[str]

class SearchRequest(BaseModel):
    profile: dict[str, Any]
    weather: dict[str, Any]
    looking_for: str | None = None

@app.post("/eval-style", response_model=StyleResponse)
async def eval_style(images: List[UploadFile] = File(...), prompt: str = None):
    try: 
        # Validate number of images
        if len(images) == 0:
            raise HTTPException(status_code=400, detail="At least one image is required")
        if len(images) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 images allowed")
        
        # Validate all images are image types
        for image in images:
            if not image.content_type.startswith("image/"):
                raise HTTPException(status_code=400, detail=f"Invalid image type: {image.filename}")
        
        # Load prompt from file if not provided, with fallback default
        if prompt is None:
            prompt = load_prompt(
                "eval-style",
                "Identify the style of dress of the person in the image. Return a JSON object with the style name and a description. "
            )
        
        content = [{"type": "text", "text": prompt}]
        # iteratively add all images to the content
        for image in images:
            image_bytes = await image.read()
            image_base64 = base64.b64encode(image_bytes).decode('utf-8')
            data_url = f"data:image/{image.content_type};base64,{image_base64}"
            content.append({"type": "image_url", "image_url": {"url": data_url}})
        
        messages = [{"role": "user", "content": content}]
        resp = openrouter_post(messages)
        answer = (resp["choices"][0]["message"]["content"] or "").strip()
        if not answer:
            raise HTTPException(status_code=502, detail="Model returned empty text")
        
        json_answer = extract_json(answer)
        
        return {"answer": json_answer}
    except HTTPException:
        raise
    except Exception as e:
        print("ERROR in /eval-style:", repr(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Backend error: {str(e)}")

@app.post("/search-terms", response_model=SearchResponse)
async def search_terms(req: SearchRequest):
    try:
        style_profile = req.profile
        weather = req.weather
        looking_for = req.looking_for
        if not style_profile:
            raise HTTPException(status_code=400, detail="Style response is required")
        
        if not looking_for:
            looking_for = "any"
        
        prompt = load_prompt(
            "search-terms",
            ""
        ).replace("<styledesc>", json.dumps(style_profile)).replace("<weather>", json.dumps(weather)).replace("<looking_for>", looking_for)

        resp = openrouter_post([{"role": "user", "content": prompt}])
        answer = (resp.text or "").strip()
        if not answer:
            raise HTTPException(status_code=502, detail="Model returned empty text")
        
        json_answer = extract_json(answer, '[', ']')
        
        return {"answer": json_answer}
    except HTTPException:
        raise
    except Exception as e:
        print("ERROR in /search-terms:", repr(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Backend error: {str(e)}")