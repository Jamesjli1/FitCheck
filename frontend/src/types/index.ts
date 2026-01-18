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
  personality: string;
  emoji: string;
};

export type Recommendation = {
  id?: string; // optional stable id from Shopify later
  title: string;
  price?: string;

  imageUrl?: string;
  productUrl?: string; // external link (Shopify product page)

  rating?: number;      // e.g. 4.2
  ratingCount?: number; // e.g. 128

  description?: string; // product description / blurb
  vendor?: string;      // brand / merchant
  sizes?: string[];     // ["XS","S","M"...]
  colors?: string[];    // ["Charcoal","Off-white"...]
  tags?: string[];      // ["Overshirt","Minimal","Streetwear"...]
  inStock?: boolean;

  reasons: string[]; // why it matches identity
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
