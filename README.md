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

- **Product Detail Modal**
  - Full product preview
  - Description, sizes, tags, vendor, stock status
  - Direct link to Shopify product

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

# Shopify (UCP / Admin)
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_token
SHOPIFY_API_VERSION=2024-01

Run Backend:
uvicorn main:app --reload --port 8000
http://127.0.0.1:8000

Frontend:
cd frontend
npm install
npm run dev

Frontend runs on:
http://localhost:5173

