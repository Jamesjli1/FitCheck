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
const USE_MOCK = true;

/**
 * Base URL for backend API.
 * FastAPI should run at this address.
 *
 * Example:
 *   uvicorn main:app --reload --port 8000
 */
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

/**
 * ANALYZE (BATCH)
 * --------------
 * Sends multiple images to backend to generate ONE combined identity JSON.
 *
 * Frontend sends:
 *   POST /analyze/batch
 *   Content-Type: multipart/form-data
 *   Body:
 *     - files: <file1>
 *     - files: <file2>
 *     - files: <file3> ...
 *
 * Backend MUST return IdentityResult JSON:
 * {
 *   "current_style": { ...styledesc... },
 *   "current_summary": "...",
 *   "current_score": 1-10,
 *   "improved_style": { ...styledesc... }
 * }
 */
export async function analyzeBatch(files: File[]): Promise<IdentityResult> {
  if (USE_MOCK) return mockAnalyzeBatch(files);

  const fd = new FormData();
  for (const f of files) fd.append("files", f); // key MUST match backend (files)

  const res = await fetch(`${API_BASE}/analyze/batch`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`analyze batch failed (${res.status}): ${text}`);
  }

  return (await res.json()) as IdentityResult;
}

/**
 * GET RECOMMENDATIONS
 * -------------------
 * Uses the combined identity's style (usually improved_style) to fetch products.
 *
 * Frontend sends:
 *   POST /recommend
 *   Content-Type: application/json
 *   Body:
 *     {
 *       "style": StyleDesc
 *     }
 *
 * Backend MUST return JSON shaped like:
 * {
 *   "recommendations": Recommendation[]
 * }
 */
export async function getRecommendations(style: StyleDesc): Promise<Recommendation[]> {
  if (USE_MOCK) return mockRecommend(style);

  const res = await fetch(`${API_BASE}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ style }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`recommend failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.recommendations as Recommendation[];
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
