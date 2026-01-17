import os
import traceback
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from google import genai

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("Missing GEMINI_API_KEY in backend/.env")

MODEL_NAME = os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")

client = genai.Client(api_key=API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # fine for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExplainRequest(BaseModel):
    text: str

class ExplainResponse(BaseModel):
    answer: str

@app.post("/explain", response_model=ExplainResponse)
def explain(req: ExplainRequest):
    try:
        text = (req.text or "").strip()
        if not text:
            raise HTTPException(status_code=400, detail="text is required")

        prompt = (
            "Explain the following to a 5-year-old using simple words and a short analogy. "
            "Keep it under 6 sentences. No jargon.\n\n"
            f"Text: {text}"
        )

        resp = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        answer = (resp.text or "").strip()
        if not answer:
            raise HTTPException(status_code=502, detail="Gemini returned empty text")

        return {"answer": answer}

    except HTTPException:
        raise
    except Exception as e:
        print("ERROR in /explain:", repr(e))
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Backend error (check terminal)")
