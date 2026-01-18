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
from utils import compress_image

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

class SearchTermsResponse(BaseModel):
    answer: List[str]

class SearchTermsRequest(BaseModel):
    profile: dict[str, Any]
    weather: dict[str, Any] | None = None # these two aren't used yet
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
            compressed_bytes, mime_type = compress_image(image_bytes, image.content_type)
            image_base64 = base64.b64encode(compressed_bytes).decode('utf-8')
            data_url = f"data:image/{mime_type};base64,{image_base64}"
            content.append({"type": "image_url", "image_url": {"url": data_url}})
        
        messages = [{"role": "user", "content": content}]
        resp = openrouter_post(messages)
        answer = (resp["choices"][0]["message"]["content"] or "").strip()
        if not answer:
            raise HTTPException(status_code=502, detail="Model returned empty text")
        
        json_answer_1 = extract_json(answer)

        messages = [{"role": "user", "content": load_prompt("personality-emoji").replace("<styledesc>", json.dumps(json_answer_1))}]
        resp = openrouter_post(messages)
        answer = (resp["choices"][0]["message"]["content"] or "").strip()
        if not answer:
            raise HTTPException(status_code=502, detail="Model returned empty text")
        
        json_answer_2 = extract_json(answer)
        
        return {"answer": {**json_answer_1, **json_answer_2}}
    except HTTPException:
        raise
    except Exception as e:
        print("ERROR in /eval-style:", repr(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Backend error: {str(e)}")

# Provides the list of 3 suggested search terms for clothing, based on the style JSON
@app.post("/search-terms", response_model=SearchTermsResponse)
async def search_terms(req: SearchTermsRequest):
    try:
        style_profile = req.profile
        #weather = req.weather
        #looking_for = req.looking_for
        if not style_profile:
            raise HTTPException(status_code=400, detail="Style response is required")
        
        prompt = load_prompt(
            "search-terms",
            ""
        ).replace("<styledesc>", json.dumps(style_profile))

        resp = openrouter_post([{"role": "user", "content": prompt}])
        answer = (resp["choices"][0]["message"]["content"] or "").strip()
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


class SearchShopifyRequest(BaseModel):
    search_term: str
    context: str = ""
    limit: int = 10

class SearchShopifyResponse(BaseModel):
    results: List[dict[str, Any]]
    
# Searches a Shopify catalog for products matching the search term
# for a maximum of `limit` items
@app.post("/search-shopify", response_model=SearchShopifyResponse)
def search_shopify(req: SearchShopifyRequest):
    response = requests.post(
        url="https://api.shopify.com/auth/access_token",
        headers={
            'Content-Type': 'application/json'
        }, 
        data=json.dumps({
            "client_id": os.getenv("SHOPIFY_CLIENT_ID"),
            "client_secret": os.getenv("SHOPIFY_CLIENT_SECRET"),
            "grant_type": "client_credentials"
        }))
    token = response.json()["access_token"]
    response = requests.post(
        'https://discover.shopifyapps.com/global/mcp',
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        },
        json={
            'jsonrpc': '2.0',
            'method': 'tools/call',
            'id': 1,
            'params': {
                'name': 'search_global_products',
                'arguments': {
                    'query': req.search_term,
                    'context': req.context,
                    'limit': req.limit,
                    'saved_catalog': os.getenv("SHOPIFY_SAVED_CATALOG")
                }
            }
        }
    ).json()["result"]["content"][0]["text"]

    json_response = extract_json(response)["offers"]

    return {"results": json_response}
