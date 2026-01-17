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
from typing import Any

from google import genai

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("Missing GEMINI_API_KEY in backend/.env")

MODEL_NAME = os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")

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

def extract_json(text: str) -> dict:

    start_idx = text.find('{')
    if start_idx == -1:
        raise ValueError("No opening brace found in text")
    
    depth = 0
    end_idx = start_idx
    
    for i in range(start_idx, len(text)):
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
            if depth == 0:
                end_idx = i
                break
    
    if depth != 0:
        raise ValueError("No matching closing brace found")
    
    json_str = text[start_idx:end_idx + 1]
    
    return json.loads(json_str)

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

@app.post("/eval-style", response_model=StyleResponse)
async def eval_style(image: UploadFile = File(...), prompt: str = None):
    try: 
        if not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Invalid image type")
        
        # Load prompt from file if not provided, with fallback default
        if prompt is None:
            prompt = load_prompt(
                "eval-style",
                "Identify the style of dress of the person in the image. Return a JSON object with the style name and a description. "
            )
        
        image_bytes = await image.read()
        image_part = types.Part.from_bytes(data=image_bytes, mime_type=image.content_type)
        contents = [prompt, image_part]
        resp = client.models.generate_content(
            model=MODEL_NAME,
            contents=contents,
        )
        answer = (resp.text or "").strip()
        if not answer:
            raise HTTPException(status_code=502, detail="Gemini returned empty text")
        
        json_answer = extract_json(answer)
        
        return {"answer": json_answer}
    except HTTPException:
        raise
    except Exception as e:
        print("ERROR in /eval-style:", repr(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Backend error: {str(e)}")