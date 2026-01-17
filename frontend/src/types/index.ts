export type StyleDNA = {
  palette: string[];
  vibe: string[];
  silhouette: string[];
  avoid?: string[];
};

export type Recommendation = {
  title: string;
  price?: string;
  imageUrl?: string;
  productUrl?: string;
  reasons: string[];
};

export type FitRun = {
  id: string;
  createdAt: number;
  imageFile: File;
  imagePreviewUrl: string;
  styleDna?: StyleDNA;
  recommendations?: Recommendation[];
};
