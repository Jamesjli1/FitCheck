// FitCheckPage.tsx
import { useMemo, useState } from "react";
import type { FitRun, IdentityResult, Recommendation } from "../types";
import { analyzeBatch, getRecommendations } from "../api/client";

import Header from "../components/Header";
import UploadPanel from "../components/UploadPanel";
import StyleDNASection from "../components/StyleDNASection";
import RecommendationsSection from "../components/RecommendationsSection";
import SessionHistory from "../components/SessionHistory";

const MAX_IMAGES_PER_SESSION = 10;
const MAX_FILE_MB = 5;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function uid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

type SortMode = "featured" | "price-asc" | "price-desc";

export default function FitCheckPage() {
  const [runs, setRuns] = useState<FitRun[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [identity, setIdentity] = useState<IdentityResult | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, Recommendation[]> | null>(null);

  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [loadingRecommend, setLoadingRecommend] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRun = useMemo(
    () => runs.find((r) => r.id === activeId) ?? null,
    [runs, activeId]
  );

  // ✅ Filter state lives here (single source of truth)
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortMode, setSortMode] = useState<SortMode>("featured");

  const filterRecommendations = (value: string) => {
    if (value === "featured" || value === "price-asc" || value === "price-desc") {
      setSortMode(value);
    } else {
      setSortMode("featured");
    }
  };

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.has(file.type)) return "Please upload a JPG, PNG, or WebP image.";
    if (file.size > MAX_FILE_BYTES) return `File too large. Max size is ${MAX_FILE_MB}MB.`;
    return null;
  }

  function handlePickFiles(files: File[]) {
    setError(null);

    const remaining = MAX_IMAGES_PER_SESSION - runs.length;
    if (remaining <= 0) {
      setError(`Session limit reached (${MAX_IMAGES_PER_SESSION}). Remove one or refresh.`);
      return;
    }

    const slice = files.slice(0, remaining);
    if (files.length > slice.length) setError(`Only ${remaining} more images allowed this session.`);

    const newRuns: FitRun[] = [];
    for (const file of slice) {
      const msg = validateFile(file);
      if (msg) {
        setError(msg);
        continue;
      }

      const id = uid();
      const preview = URL.createObjectURL(file);

      newRuns.push({
        id,
        createdAt: Date.now(),
        imageFile: file,
        imagePreviewUrl: preview,
        selected: true,
      });
    }

    if (newRuns.length) {
      setRuns((prev) => [...newRuns, ...prev]);
      setActiveId(newRuns[0].id);
      setIdentity(null);
      setRecommendations(null);
    }
  }

  async function handleAnalyzeAll() {
    if (runs.length === 0) return setError("Upload at least one image first.");
    if (runs.filter((run) => run.selected === true).length === 0)
      return setError("Select at least one image first.");

    setError(null);
    setLoadingAnalyze(true);

    try {
      const result = await analyzeBatch(runs.filter((run) => run.selected).map((run) => run.imageFile));
      setIdentity(result);
      setRecommendations(null);
    } catch {
      setError("Analyze failed. Is the backend running?");
    } finally {
      setLoadingAnalyze(false);
    }
  }

  async function handleRecommendAll() {
    if (!identity) return setError("Mint your identity first (Analyze).");
    setError(null);
    setLoadingRecommend(true);

    try {
      const recs = await getRecommendations(identity.improved_style);
      setRecommendations(recs);
    } catch {
      setError("Recommendation failed. Is the backend running?");
    } finally {
      setLoadingRecommend(false);
    }
  }

  function handleRemoveRun(id: string) {
    setRuns((prev) => {
      const removing = prev.find((r) => r.id === id);
      if (removing) URL.revokeObjectURL(removing.imagePreviewUrl);

      const next = prev.filter((r) => r.id !== id);
      if (activeId === id) setActiveId(next[0]?.id ?? null);

      setIdentity(null);
      setRecommendations(null);

      return next;
    });
  }

  const toggleSelect = (id: string) => {
    setRuns((prevRuns) =>
      prevRuns.map((run) => (run.id === id ? { ...run, selected: !run.selected } : run))
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Header maxImages={MAX_IMAGES_PER_SESSION} maxFileMb={MAX_FILE_MB} />

      {error && (
        <div
          className="vault-panel fade-up"
          style={{
            textAlign: "left",
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,80,80,0.35)",
            background: "rgba(255,80,80,0.08)",
          }}
        >
          {error}
        </div>
      )}

      <UploadPanel
        activeRun={activeRun}
        runsCount={runs.length}
        loadingAnalyze={loadingAnalyze}
        loadingRecommend={loadingRecommend}
        canRecommend={!!identity}
        onPickFiles={handlePickFiles}
        onAnalyzeAll={handleAnalyzeAll}
        onRecommendAll={handleRecommendAll}
        onClearSelection={() => {
          runs.forEach((r) => URL.revokeObjectURL(r.imagePreviewUrl));
          setRuns([]);
          setActiveId(null);
          setIdentity(null);
          setRecommendations(null);
          setError(null);

          // optional: reset filters too
          setMinPrice(0);
          setMaxPrice(500);
          setSortMode("featured");
        }}
      />

      <SessionHistory
        runs={runs}
        activeId={activeId}
        maxImages={MAX_IMAGES_PER_SESSION}
        onSelect={setActiveId}
        onRemove={handleRemoveRun}
        onToggle={toggleSelect}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <StyleDNASection identity={identity} />
        <RecommendationsSection
          recommendations={recommendations ?? undefined}
          filter={sortMode}
          minPrice={minPrice}
          maxPrice={maxPrice}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          filterRecommendation={filterRecommendations}
        />
      </div>
    </div>
  );
}
