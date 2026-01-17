import type { FitRun } from "../types";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function UploadPanel({
  activeRun,
  loadingAnalyze,
  loadingRecommend,
  onPickFile,
  onAnalyze,
  onRecommend,
  onClearSelection,
}: {
  activeRun: FitRun | null;
  loadingAnalyze: boolean;
  loadingRecommend: boolean;
  onPickFile: (file: File) => void;
  onAnalyze: () => void;
  onRecommend: () => void;
  onClearSelection: () => void;
}) {
  return (
    <section
      style={{
        textAlign: "left",
        padding: 16,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <h2 style={{ margin: 0, fontSize: 18 }}>Upload</h2>
      <p style={{ margin: "6px 0 12px", opacity: 0.75 }}>
        Choose an image (JPG/PNG/WebP). We’ll extract style signals and recommend products.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
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
            fontWeight: 600,
          }}
        >
          Upload image
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPickFile(f);
              e.currentTarget.value = ""; // allow re-upload same file
            }}
          />
        </label>

        <button
          onClick={onAnalyze}
          disabled={!activeRun || loadingAnalyze}
          style={{ opacity: !activeRun || loadingAnalyze ? 0.6 : 1 }}
        >
          {loadingAnalyze ? "Analyzing..." : "Analyze"}
        </button>

        <button
          onClick={onRecommend}
          disabled={!activeRun?.styleDna || loadingRecommend}
          style={{ opacity: !activeRun?.styleDna || loadingRecommend ? 0.6 : 1 }}
        >
          {loadingRecommend ? "Loading..." : "Get recommendations"}
        </button>

        {activeRun && (
          <button onClick={onClearSelection} style={{ opacity: 0.9 }} title="Deselect current run">
            Clear selection
          </button>
        )}
      </div>

      {activeRun && (
        <div style={{ marginTop: 14, display: "flex", gap: 14, flexWrap: "wrap" }}>
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
              Selected: <b>{activeRun.imageFile.name}</b> • {formatTime(activeRun.createdAt)}
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
