/**
 * API CLIENT
 * ----------
 * This file is the ONLY place where the frontend talks to the backend.
 *
 * Combined identity flow:
 *  - Upload multiple images
 *  - POST /analyze/batch (multipart, "files" repeated) -> IdentityResult
 *  - POST /recommend (json, "style") -> Recommendation[]
 */

import type { IdentityResult, Recommendation, StyleDesc } from "../types";

/**
 * Toggle for demo mode.
 * - true  → use local mock data (frontend works without backend)
 * - false → call real FastAPI backend
 */
const USE_MOCK = false;

/**
 * Base URL for backend API.
 * FastAPI should run at this address.
 *
 * Example:
 *   uvicorn main:app --reload --port 8000
 */
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

/**
 * ANALYZE (CONNECTED TO BACKEND)
 * ------------------------------
 * When USE_MOCK === false:
 *  - POST /eval-style
 *  - multipart/form-data
 *  - field name: "images"
 *  - response: { answer: IdentityResult }
 */
export async function analyzeBatch(files: File[]): Promise<IdentityResult> {
  if (USE_MOCK) return mockAnalyzeBatch(files);

  const fd = new FormData();

  // MUST be "images" to match FastAPI signature:
  // eval_style(images: List[UploadFile] = File(...))
  for (const f of files) fd.append("images", f);

  // Call backend API
  const res = await fetch(`${API_BASE}/eval-style`, {
    method: "POST",
    body: fd,
  });

  // Handle errors
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`eval-style failed (${res.status}): ${text}`);
  }

  // Parse response
  const data = await res.json();
  return data.answer as IdentityResult;
}

/**
 * RECOMMENDATIONS (STILL MOCKED)
 * -----------------------------
 * Backend search / Shopify not implemented yet.
 * Keeping this mocked even when USE_MOCK = false.
 */
export async function getRecommendations(_style: StyleDesc): Promise<Recommendation[]> {
  return mockRecommend(_style);
}

/* ---------- MOCK IMPLEMENTATIONS (Frontend-only demo mode) ---------- */

async function mockAnalyzeBatch(_files: File[]): Promise<IdentityResult> {
  await new Promise((r) => setTimeout(r, 700));
  return {
    current_style: {
      name: "minimal streetwear / clean basics",
      colors: ["charcoal neutrals", "soft white", "washed denim"],
      hexcolors: ["#1A1A1A", "#F2F2F2", "#3A3F4B"],
      fit: "relaxed tops, straight-leg bottoms",
      textures: "matte cotton, fleece, light denim; low-contrast solids; minimal graphics",
      layering: "light-midweight; hoodie/jacket over tee; simple stacking",
      accessories: ["white sneakers", "cap", "silver chain"],
    },
    current_summary:
      "neutral base; clean silhouettes; consistent streetwear; improve: 1 statement layer, sharper color harmony, upgraded accessories",
    current_score: 7,
    improved_style: {
      name: "refined minimal streetwear (sharp + elevated)",
      colors: ["deep charcoal + off-white", "cool slate accents", "muted olive option"],
      hexcolors: ["#0F1115", "#EEEDE8", "#49556A", "#5A6B3E"],
      fit: "structured outerwear; relaxed top; tapered/straight bottom",
      textures: "wool-blend overshirt, twill, premium cotton; subtle texture contrast",
      layering: "intentional 2-layer looks; overshirt/bomber + tee; clean proportions",
      accessories: ["leather belt", "minimal watch", "clean tote", "simple silver jewelry"],
    },
  };
}

async function mockRecommend(_style: StyleDesc): Promise<Recommendation[]> {
  await new Promise((r) => setTimeout(r, 700));
  return [
    {
      title: "Charcoal Overshirt Jacket",
      price: "$89",
      imageUrl: "https://via.placeholder.com/600x600?text=Overshirt",
      productUrl: "#",
      reasons: ["Structured layer", "Matches charcoal palette", "Elevates fit"],
    },
    {
      title: "Off-White Heavyweight Tee",
      price: "$39",
      imageUrl: "https://via.placeholder.com/600x600?text=Tee",
      productUrl: "#",
      reasons: ["Premium basic", "Clean silhouette", "Great base for layering"],
    },
  ];
}
