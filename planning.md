# Mirror Ledger – Hackathon Plan

## Stack
- Frontend: React (Vite)
- Backend: FastAPI (uvicorn)
- AI API: Vision model (image → style signals → Style DNA)
- Commerce API: Shopify Admin API

## Core Flow
1. User uploads image (React)
2. Backend analyzes image using vision model
3. Backend generates Style DNA (JSON)
4. Backend fetches Shopify products
5. Backend ranks products against Style DNA
6. Frontend displays recommendations + explanations

## Backend Responsibilities
- Handle image uploads
- Call vision model
- Normalize output into Style DNA schema
- Fetch Shopify product catalog
- Score + rank products

## Frontend Responsibilities
- Upload UI
- Style DNA display
- Product recommendation grid

## Prototype Scope
- Single image upload
- One Shopify dev store
