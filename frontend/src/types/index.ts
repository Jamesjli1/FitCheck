/**
 * Shared frontend types.
 * These must match the backend JSON contracts.
 */

export type StyleDesc = {
  name: string;
  colors: string[];
  hexcolors: string[];
  fit: string;
  textures: string;
  layering: string;
  accessories: string[];
};

export type IdentityResult = {
  current_style: StyleDesc;
  current_summary: string;
  current_score: number; // 1-10
  improved_style: StyleDesc;
};

export type Recommendation = {
  title: string;
  price?: string;
  imageUrl?: string;
  productUrl?: string;
  reasons: string[];
};

// FitRun is just for the session ledger (thumbnails + timestamps).
// Identity + recommendations are session-level (combined across all images).
export type FitRun = {
  id: string;
  createdAt: number;
  imageFile: File;
  imagePreviewUrl: string;
  selected: boolean;
};
