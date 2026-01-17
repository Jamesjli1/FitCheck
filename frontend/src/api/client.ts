/**
 * API CLIENT
 * ----------
 * This file is the ONLY place where the frontend talks to the backend.
 *
 *  - flip USE_MOCK to false (or use an env var)
 *  - ensure backend endpoints match the contracts documented below
 */

import type { Recommendation, StyleDNA } from "../types";

/**
 * Toggle for demo mode.
 * - true  → use local mock data (frontend works without backend)
 * - false → call real FastAPI backend
 *
 */
const USE_MOCK = true;

/**
 * Base URL for backend API.
 * FastAPI should run at this address.
 *
 * Example:
 *   uvicorn main:app --port 8000
 */
const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

/**
 * ANALYZE IMAGE
 * -------------
 * Called when user clicks "Analyze".
 *
 * Frontend sends:
 *   POST /analyze
 *   Content-Type: multipart/form-data
 *   Body:
 *     - file: image file (JPG / PNG / WebP)
 *
 * Backend MUST return JSON shaped like:
 * {
 *   "style_dna": {
 *     "palette": string[],
 *     "vibe": string[],
 *     "silhouette": string[],
 *     "avoid"?: string[]
 *   }
 * }
 *
 * The returned style_dna is passed directly into the UI.
 */
export async function analyzeImage(file: File): Promise<StyleDNA> {
  // Demo / offline mode
  if (USE_MOCK) return mockAnalyze(file);

  // Build multipart form data
  const fd = new FormData();
  fd.append("file", file);

  // Call backend
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    throw new Error("analyze failed");
  }

  const data = await res.json();

  // Backend → frontend mapping happens HERE
  // UI assumes StyleDNA shape defined in src/types
  return data.style_dna as StyleDNA;
}

/**
 * GET RECOMMENDATIONS
 * -------------------
 * Called after Style DNA is available.
 *
 * Frontend sends:
 *   POST /recommend
 *   Content-Type: application/json
 *   Body:
 *     {
 *       "style_dna": StyleDNA
 *     }
 *
 * Backend MUST return JSON shaped like:
 * {
 *   "recommendations": Recommendation[]
 * }
 *
 * Each Recommendation should contain:
 *  - title (string)
 *  - price? (string)
 *  - imageUrl? (string)
 *  - productUrl? (string)
 *  - reasons (string[])
 */
export async function getRecommendations(
  styleDna: StyleDNA
): Promise<Recommendation[]> {
  // Demo / offline mode
  if (USE_MOCK) return mockRecommend(styleDna);

  const res = await fetch(`${API_BASE}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ style_dna: styleDna }),
  });

  if (!res.ok) {
    throw new Error("recommend failed");
  }

  const data = await res.json();

  // Backend → frontend mapping happens HERE
  return data.recommendations as Recommendation[];
}

/* MOCK IMPLEMENTATIONS (Frontend-only demo mode)                      */
/**
 * Fake vision model output.
 * Allows frontend to be developed and demoed without backend running.
 */
async function mockAnalyze(_file: File): Promise<StyleDNA> {
  await new Promise((r) => setTimeout(r, 700));
  return {
    palette: ["black", "white", "neutral"],
    vibe: ["minimal streetwear", "clean"],
    silhouette: ["oversized tops", "straight pants"],
    avoid: ["neon", "busy patterns"],
  };
}

/**
 * Fake recommendation engine output.
 * Simulates Shopify-style product picks.
 */
async function mockRecommend(_styleDna: StyleDNA): Promise<Recommendation[]> {
  await new Promise((r) => setTimeout(r, 700));
  return [
    {
      title: "Oversized Black Hoodie",
      price: "$59",
      imageUrl: "https://via.placeholder.com/600x600?text=Hoodie",
      productUrl: "#",
      reasons: [
        "Matches your neutral palette",
        "Oversized silhouette",
        "Streetwear vibe",
      ],
    },
    {
      title: "Straight-Leg Denim (Black)",
      price: "$79",
      imageUrl: "https://via.placeholder.com/600x600?text=Denim",
      productUrl: "#",
      reasons: [
        "Straight fit aligns with your silhouette",
        "Black matches palette",
      ],
    },
    {
      title: "Clean White Sneakers",
      price: "$89",
      imageUrl: "https://via.placeholder.com/600x600?text=Sneakers",
      productUrl: "#",
      reasons: [
        "Minimal + clean vibe",
        "White fits palette",
      ],
    },
  ];
}
