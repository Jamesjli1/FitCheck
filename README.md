# FitCheck - AI-Powered Style Identity & Shopping Assistant

**FitCheck** is an AI-driven fashion assistant that turns outfit photos into a clear **Style Identity** and curated **Shopify product recommendations**. Upload your fits, mint your style DNA, then explore products filtered by price, category, and sorting — all aligned to your *improved* fashion identity. Built for a hackathon with a focus on **AI × Commerce × Identity**.

For UofTHacks 13

---

## Features

- **Outfit Uploads**
  - Upload up to 10 outfit images per session
  - Select / unselect fits to influence your identity

- **Style DNA Generation**
  - AI analyzes selected outfits
  - Generates:
    - Style personality + emoji
    - Color palette & materials
    - Fit, layering, and accessories
    - Improvement suggestions

- **Smart Shopify Recommendations**
  - Curated product picks aligned to your *improved* style
  - Category tabs:
    - Topwear
    - Bottomwear
    - Accessories

- **Interactive Filters**
  - Price range slider
  - Sort by:
    - Featured
    - Lowest → Highest price
    - Highest → Lowest price
  - Live filtering without page reloads

---

## Tech Stack

### Frontend
- **React + TypeScript**
- Vite

### Backend
- **FastAPI (Python)**


### AI / LLM
- **Gemini** (style analysis)
- **OpenRouter** (LLM routing)

### Commerce / Product Data
- **Shopify UCP API** (Shopify product catalog retrieval)

---

## Limitations

- Product ratings and inventory depend on available Shopify metadata
- Filters and sorting currently run client-side for speed
- No persistent user accounts or saved sessions yet

## Next Steps

- Add user profiles with saved Style DNA
- Deeper Shopify integration (real-time inventory, merchant boosts)

---

## How to Run Locally

### Clone the repository
```bash
git clone https://github.com/your-username/FitCheck.git
cd FitCheck

Backend:
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt

Setup .env:
backend/.env

In .env:
# AI
GEMINI_API_KEY=your_gemini_key
OPENROUTER_API_KEY=your_openrouter_key

# Shopify (Developer Dashboard / Catalogs / Create a catalog)
SHOPIFY_CLIENT_ID=""
SHOPIFY_CLIENT_SECRET=""
SHOPIFY_SAVED_CATALOG=""

Run Backend:
uvicorn main:app --reload --port 8000
http://127.0.0.1:8000

Frontend:
cd frontend
npm install
npm run dev

Frontend runs on:
http://localhost:5173

