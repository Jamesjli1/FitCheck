import type { FitRun } from "../types";
import { useState } from "react";
import FilterPanel from "./FilterPanel";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function UploadPanel({
  activeRun,
  runsCount,
  loadingAnalyze,
  loadingRecommend,
  canRecommend,
  onPickFiles,
  onAnalyzeAll,
  onRecommendAll,
  onClearSelection,
  setMinPrice,
  setMaxPrice,
  setMinStarRating,
  filterRecommendations,
}: {
  activeRun: FitRun | null;
  runsCount: number;
  loadingAnalyze: boolean;
  loadingRecommend: boolean;
  canRecommend: boolean;
  onPickFiles: (files: File[]) => void;
  onAnalyzeAll: () => void;
  onRecommendAll: () => void;
  onClearSelection: () => void;
  setMinPrice: (num: number) => void;
  setMaxPrice: (num: number) => void;
  setMinStarRating: (num: number) => void;
  filterRecommendations: (filter: string) => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  return (
    <section
      className="vault-panel fade-up"
      style={{
        textAlign: "left",
        padding: 16,
        borderRadius: 16,
      }}
    >
      <h2 style={{ margin: 0, fontSize: 18 }}>Capture</h2>
      <p style={{ margin: "6px 0 12px", opacity: 0.75 }}>
        Upload multiple fits. We mint one combined Fashion Identity from the
        full set.
      </p>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.08)",
            cursor: "pointer",
            userSelect: "none",
            fontWeight: 700,
          }}
        >
          Capture fits
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            style={{ display: "none" }}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length) onPickFiles(files);
              e.currentTarget.value = "";
            }}
          />
        </label>

        <button
          onClick={onAnalyzeAll}
          disabled={runsCount === 0 || loadingAnalyze}
        >
          {loadingAnalyze ? "Minting..." : `Mint Style Identity (${runsCount})`}
        </button>

        <button
          className="btn-primary"
          onClick={onRecommendAll}
          disabled={!canRecommend || loadingRecommend}
          style={{ opacity: !canRecommend || loadingRecommend ? 0.6 : 1 }}
        >
          {loadingRecommend ? "Matching..." : "Generate Matches"}
        </button>

        {activeRun && (
          <button
            onClick={onClearSelection}
            style={{ opacity: 0.9 }}
            title="Deselect current run"
          >
            Clear selection
          </button>
        )}
        <button
          className="btn-primary"
          onClick={() => {
            setFiltersOpen(!filtersOpen);
          }}
          style={{ opacity: 0.9 }}
        >
          Toggle Filters
        </button>
      </div>

      {/* Filter Panel */}
      <div
        style={{
          overflow: "hidden",
          transition: "max-height 320ms ease, opacity 200ms ease",
          maxHeight: filtersOpen ? 500 : 0,
          opacity: filtersOpen ? 1 : 0,
          marginTop: filtersOpen ? 14 : 0,
        }}
      >
        <FilterPanel
          setMinPrice={(num) => {
            setMinPrice(num);
          }}
          setMaxPrice={(num) => {
            setMaxPrice(num);
          }}
          setMinStarRating={setMinStarRating}
          filterRecommendations={filterRecommendations}
        />
      </div>

      {activeRun && (
        <div
          style={{ marginTop: 14, display: "flex", gap: 14, flexWrap: "wrap" }}
        >
          <img
            src={activeRun.imagePreviewUrl}
            alt="Uploaded preview"
            style={{
              width: 160,
              height: 160,
              objectFit: "cover",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ opacity: 0.8 }}>
              Selected: <b>{activeRun.imageFile.name}</b> •{" "}
              {formatTime(activeRun.createdAt)}
            </div>
            <div style={{ opacity: 0.7, fontSize: 13 }}>
              Size: {(activeRun.imageFile.size / (1024 * 1024)).toFixed(2)}MB
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
