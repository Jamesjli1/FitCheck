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

async function mockRecommend(): Promise<Recommendation[]> {
  await new Promise((r) => setTimeout(r, 600));

  return [
    {
      id: "overshirt-charcoal",
      title: "Charcoal Wool-Blend Overshirt",
      price: "$89",
      imageUrl: "https://via.placeholder.com/600x600?text=Overshirt",
      productUrl: "#",
      rating: 4.6,
      ratingCount: 312,
      vendor: "FitCheck Studio",
      inStock: true,
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Charcoal"],
      tags: ["Layering", "Minimal"],
      description:
        "Structured overshirt with a clean drape. Designed to sharpen relaxed silhouettes.",
      reasons: [
        "Adds structure",
        "Matches neutral palette",
        "Ideal outer layer",
      ],
    },
    {
      id: "tee-offwhite",
      title: "Heavyweight Off-White Tee",
      price: "$39",
      imageUrl: "https://via.placeholder.com/600x600?text=Tee",
      productUrl: "#",
      rating: 4.4,
      ratingCount: 528,
      vendor: "FitCheck Studio",
      inStock: true,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Off-White"],
      tags: ["Base Layer"],
      description:
        "Premium cotton tee built as a foundational layer for minimal fits.",
      reasons: ["Clean base", "Improves layering"],
    },
    {
      id: "denim-black",
      title: "Straight-Leg Black Denim",
      price: "$79",
      imageUrl: "https://via.placeholder.com/600x600?text=Denim",
      productUrl: "#",
      rating: 4.3,
      ratingCount: 221,
      vendor: "FitCheck Studio",
      inStock: true,
      sizes: ["28", "30", "32", "34"],
      colors: ["Black"],
      tags: ["Bottoms"],
      description: "Relaxed straight-leg denim with clean structure.",
      reasons: ["Balances oversized tops", "Neutral staple"],
    },
    {
      id: "sneakers-white",
      title: "Minimal White Sneakers",
      price: "$99",
      imageUrl: "https://via.placeholder.com/600x600?text=Sneakers",
      productUrl: "#",
      rating: 4.7,
      ratingCount: 892,
      vendor: "FitCheck Studio",
      inStock: true,
      sizes: ["8", "9", "10", "11"],
      colors: ["White"],
      tags: ["Footwear"],
      description: "Clean low-profile sneakers with matte finish.",
      reasons: ["Completes minimal look"],
    },
    {
      id: "hoodie-black",
      title: "Oversized Black Hoodie",
      price: "$69",
      imageUrl: "https://via.placeholder.com/600x600?text=Hoodie",
      productUrl: "#",
      rating: 4.5,
      ratingCount: 411,
      vendor: "FitCheck Studio",
      inStock: true,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black"],
      tags: ["Streetwear"],
      description: "Relaxed hoodie designed for everyday layering.",
      reasons: ["Streetwear staple"],
    },
    {
      id: "bomber-slate",
      title: "Slate Bomber Jacket",
      price: "$129",
      imageUrl: "https://via.placeholder.com/600x600?text=Bomber",
      productUrl: "#",
      rating: 4.2,
      ratingCount: 174,
      vendor: "FitCheck Studio",
      inStock: true,
      sizes: ["S", "M", "L"],
      colors: ["Slate"],
      tags: ["Outerwear"],
      description: "Structured bomber with subtle sheen.",
      reasons: ["Adds polish"],
    },
    {
      id: "cap-black",
      title: "Minimal Black Cap",
      price: "$29",
      imageUrl: "https://via.placeholder.com/600x600?text=Cap",
      productUrl: "#",
      rating: 4.1,
      ratingCount: 98,
      vendor: "FitCheck Studio",
      inStock: true,
      sizes: ["One Size"],
      colors: ["Black"],
      tags: ["Accessories"],
      description: "Clean six-panel cap with no branding.",
      reasons: ["Finishes outfit"],
    },
    {
      id: "belt-leather",
      title: "Leather Belt (Black)",
      price: "$45",
      imageUrl: "https://via.placeholder.com/600x600?text=Belt",
      productUrl: "#",
      rating: 4.8,
      ratingCount: 201,
      vendor: "FitCheck Studio",
      inStock: true,
      sizes: ["30", "32", "34", "36"],
      colors: ["Black"],
      tags: ["Accessories"],
      description: "Minimal leather belt with matte buckle.",
      reasons: ["Elevates details"],
    },
    {
      id: "tote-canvas",
      title: "Canvas Tote Bag",
      price: "$49",
      imageUrl: "https://via.placeholder.com/600x600?text=Tote",
      productUrl: "#",
      rating: 4.3,
      ratingCount: 154,
      vendor: "FitCheck Studio",
      inStock: true,
      sizes: ["One Size"],
      colors: ["Natural"],
      tags: ["Accessories"],
      description: "Durable tote for daily carry.",
      reasons: ["Functional + clean"],
    },
    {
      id: "watch-minimal",
      title: "Minimal Steel Watch",
      price: "$159",
      imageUrl: "https://via.placeholder.com/600x600?text=Watch",
      productUrl: "#",
      rating: 4.9,
      ratingCount: 433,
      vendor: "FitCheck Studio",
      inStock: true,
      sizes: ["One Size"],
      colors: ["Silver"],
      tags: ["Accessories"],
      description: "Slim steel watch with clean face.",
      reasons: ["Sharpens identity"],
    },
  ];
}
