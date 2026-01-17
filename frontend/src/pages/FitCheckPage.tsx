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

export default function FitCheckPage() {
  // Ledger of uploaded images (for thumbnails/history)
  const [runs, setRuns] = useState<FitRun[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Session-level combined outputs
  const [identity, setIdentity] = useState<IdentityResult | null>(null);
  const [recommendations, setRecommendations] = useState<
    Recommendation[] | null
  >(null);

  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [loadingRecommend, setLoadingRecommend] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeRun = useMemo(
    () => runs.find((r) => r.id === activeId) ?? null,
    [runs, activeId]
  );

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.has(file.type))
      return "Please upload a JPG, PNG, or WebP image.";
    if (file.size > MAX_FILE_BYTES)
      return `File too large. Max size is ${MAX_FILE_MB}MB.`;
    return null;
  }

  // Multi-file upload: add all valid files as runs (ledger entries)
  function handlePickFiles(files: File[]) {
    setError(null);

    const remaining = MAX_IMAGES_PER_SESSION - runs.length;
    if (remaining <= 0) {
      setError(
        `Session limit reached (${MAX_IMAGES_PER_SESSION}). Remove one or refresh.`
      );
      return;
    }

    const slice = files.slice(0, remaining);
    if (files.length > slice.length) {
      setError(`Only ${remaining} more images allowed this session.`);
    }

    const newRuns: FitRun[] = [];
    for (const file of slice) {
      const msg = validateFile(file);
      if (msg) {
        setError(msg);
        continue; // skip invalid files but keep the rest
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
      // If user uploads new images, the combined identity is now stale
      setIdentity(null);
      setRecommendations(null);
    }
  }

  // Combined analyze: sends ALL images to backend and gets ONE IdentityResult
  async function handleAnalyzeAll() {
    // Check user has uploaded a file(s)
    if (runs.length === 0) return setError("Upload at least one image first.");
    // Check user has selected a file(s)
    if (runs.filter((run) => {return run.selected === true}).length === 0) return setError("Select at least one image first.")
    setError(null);
    setLoadingAnalyze(true);

    try {
      // Todo: remove later
      // const result = await analyzeBatch(runs.map((r) => r.imageFile));
      const result = await analyzeBatch((runs.filter((run) => {return run.selected})).map(run => run.imageFile));

      setIdentity(result);
      setRecommendations(null); // reset recs after new identity
    } catch {
      setError("Analyze failed. Is the backend running?");
    } finally {
      setLoadingAnalyze(false);
    }
  }

  // Combined recommend: uses improved_style as the target identity for product picks
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

      // Any change to the set of images invalidates combined identity
      setIdentity(null);
      setRecommendations(null);

      return next;
    });
  }

  const toggleSelect = (id: string) => {
    setRuns((prevRuns) =>
    prevRuns.map((run) =>
      run.id === id ? { ...run, selected: !run.selected } : run
    )
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
        onClearSelection={() => setActiveId(null)}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <StyleDNASection identity={identity} />
        <RecommendationsSection
          recommendations={recommendations ?? undefined}
        />
      </div>

      <SessionHistory
        runs={runs}
        activeId={activeId}
        maxImages={MAX_IMAGES_PER_SESSION}
        onSelect={setActiveId}
        onRemove={handleRemoveRun}
        onToggle={toggleSelect}
      />
    </div>
  );
}
