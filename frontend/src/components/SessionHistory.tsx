import type { FitRun } from "../types";
import { useState } from "react";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function truncate(name: string, n = 18) {
  return name.length > n ? name.slice(0, n) + "…" : name;
}

export default function SessionHistory({
  runs,
  activeId,
  maxImages,
  onSelect,
  onRemove,
  onToggle,
}: {
  runs: FitRun[];
  activeId: string | null;
  maxImages: number;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section
      className="vault-panel fade-up"
      style={{
        textAlign: "left",
        padding: 16,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      {/* Header row (always visible) */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Fits Uploaded ({runs.length} / {maxImages})</h2>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            opacity: 0.9,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            padding: "8px 10px",
            cursor: "pointer",
            fontWeight: 700,
          }}
          title={open ? "Collapse" : "Expand"}
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {/* Collapsible body */}
      <div
        style={{
          overflow: "hidden",
          transition: "max-height 320ms ease, opacity 200ms ease, margin-top 200ms ease",
          maxHeight: open ? 1200 : 0, // big enough for 2 rows
          opacity: open ? 1 : 0,
          marginTop: open ? 12 : 0,
        }}
      >
        {runs.length === 0 ? (
          <p style={{ opacity: 0.75, marginTop: 10 }}>
            No fits captured yet. Upload multiple images to build your identity.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))", // ✅ 5 columns
              gap: 12,
            }}
          >
            {runs.slice(0, 10).map((r) => {
              const isActive = r.id === activeId;

              return (
                <div
                  key={r.id}
                  className={isActive ? "card-active" : "card-hover"}
                  style={{
                    borderRadius: 14,
                    border: isActive
                      ? "1px solid rgba(97,218,251,0.65)"
                      : "1px solid rgba(255,255,255,0.12)",
                    background: isActive
                      ? "rgba(97,218,251,0.08)"
                      : "rgba(0,0,0,0.10)",
                    overflow: "hidden",
                  }}
                >
                  {/* Clickable preview */}
                  <button
                    onClick={() => onSelect(r.id)}
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      display: "block",
                      width: "100%",
                    }}
                    title="Select this fit"
                  >
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "1 / 1",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={r.imagePreviewUrl}
                        alt={r.imageFile.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    <div style={{ padding: 10 }}>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>
                        {truncate(r.imageFile.name)}
                      </div>
                      <div style={{ opacity: 0.75, fontSize: 12, marginTop: 4 }}>
                        {formatTime(r.createdAt)}
                      </div>
                    </div>
                  </button>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, padding: 10, paddingTop: 0 }}>
                    <button
                      onClick={() => onToggle(r.id)}
                      style={{
                        width: "100%",
                        opacity: 0.9,
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.06)",
                        padding: "8px 10px",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                      title="Toggle Select"
                    >
                      {r.selected ? "Unselect" : "Select"}
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: 8, padding: 10, paddingTop: 0 }}>
                    <button
                      onClick={() => onRemove(r.id)}
                      style={{
                        width: "100%",
                        opacity: 0.9,
                        borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.06)",
                        padding: "8px 10px",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                      title="Remove this fit"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}