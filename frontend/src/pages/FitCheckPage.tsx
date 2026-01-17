import { useMemo, useState } from "react";
import type { FitRun } from "../types";
import { analyzeImage, getRecommendations } from "../api/client";

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

export default function FitCheckPage() {
  const [runs, setRuns] = useState<FitRun[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [loadingRecommend, setLoadingRecommend] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRun = useMemo(
    () => runs.find((r) => r.id === activeId) ?? null,
    [runs, activeId]
  );

  function setActiveRunPatch(patch: Partial<FitRun>) {
    if (!activeId) return;
    setRuns((prev) => prev.map((r) => (r.id === activeId ? { ...r, ...patch } : r)));
  }

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.has(file.type)) return "Please upload a JPG, PNG, or WebP image.";
    if (file.size > MAX_FILE_BYTES) return `File too large. Max size is ${MAX_FILE_MB}MB.`;
    if (runs.length >= MAX_IMAGES_PER_SESSION)
      return `Session limit reached (${MAX_IMAGES_PER_SESSION} images). Remove one or refresh.`;
    return null;
  }

  function handlePickFile(file: File) {
    const msg = validateFile(file);
    if (msg) return setError(msg);
    setError(null);

    const id = uid();
    const preview = URL.createObjectURL(file);

    const newRun: FitRun = {
      id,
      createdAt: Date.now(),
      imageFile: file,
      imagePreviewUrl: preview,
    };

    setRuns((prev) => [newRun, ...prev]);
    setActiveId(id);
  }

  async function handleAnalyze() {
    if (!activeRun) return setError("Upload an image first.");
    setError(null);
    setLoadingAnalyze(true);
    try {
      const styleDna = await analyzeImage(activeRun.imageFile);
      setActiveRunPatch({ styleDna });
    } catch {
      setError("Analyze failed. Is the backend running?");
    } finally {
      setLoadingAnalyze(false);
    }
  }

  async function handleRecommend() {
    if (!activeRun?.styleDna) return setError("Analyze first to generate Style DNA.");
    setError(null);
    setLoadingRecommend(true);
    try {
      const recs = await getRecommendations(activeRun.styleDna);
      setActiveRunPatch({ recommendations: recs });
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
      return next;
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Header maxImages={MAX_IMAGES_PER_SESSION} maxFileMb={MAX_FILE_MB} />

      {error && (
        <div
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
        loadingAnalyze={loadingAnalyze}
        loadingRecommend={loadingRecommend}
        onPickFile={handlePickFile}
        onAnalyze={handleAnalyze}
        onRecommend={handleRecommend}
        onClearSelection={() => setActiveId(null)}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <StyleDNASection styleDna={activeRun?.styleDna} />
        <RecommendationsSection recommendations={activeRun?.recommendations} />
      </div>

      <SessionHistory
        runs={runs}
        activeId={activeId}
        maxImages={MAX_IMAGES_PER_SESSION}
        onSelect={setActiveId}
        onRemove={handleRemoveRun}
      />

    </div>
  );
}
