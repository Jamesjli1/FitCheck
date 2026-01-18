import type { FitRun } from "../types";
import { useEffect, useState } from "react";

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
  const [openId, setOpenId] = useState<string | null>(null);

  // optional: open whatever is currently selected
  useEffect(() => {
    if (activeId) setOpenId(activeId);
  }, [activeId]);

  // close if the open run was removed
  useEffect(() => {
    if (openId && !runs.some((r) => r.id === openId)) setOpenId(null);
  }, [openId, runs]);

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
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>Fits Uploaded</h2>
        <div style={{ opacity: 0.75, fontSize: 13 }}>
          {runs.length} / {maxImages}
        </div>
      </div>

      {runs.length === 0 ? (
        <p style={{ opacity: 0.75, marginTop: 10 }}>
          No fits captured yet. Upload multiple images to build your identity.
        </p>
      ) : (
        <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
          {runs.map((r) => {
            const isActive = r.id === activeId;
            const isOpen = r.id === openId;

            const cardBorder = isActive
              ? "1px solid rgba(97,218,251,0.65)"
              : "1px solid rgba(255,255,255,0.12)";
            const cardBg = isActive ? "rgba(97,218,251,0.08)" : "rgba(0,0,0,0.10)";

            return (
              <div
                key={r.id}
                className={isActive ? "card-active" : "card-hover"}
                style={{
                  borderRadius: 14,
                  border: cardBorder,
                  background: cardBg,
                  overflow: "hidden",
                }}
              >
                {/* COLLAPSED HEADER (ONLY WHEN CLOSED) */}
                {!isOpen && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(r.id);
                      setOpenId(r.id);
                    }}
                    style={{
                      all: "unset",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: 10,
                    }}
                    title="Expand"
                  >
                    <img
                      src={r.imagePreviewUrl}
                      alt={r.imageFile.name}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        objectFit: "cover",
                        border: "1px solid rgba(255,255,255,0.12)",
                        flex: "0 0 auto",
                      }}
                    />

                    <div style={{ minWidth: 0, flex: "1 1 auto" }}>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>
                        {truncate(r.imageFile.name, 26)}
                      </div>
                      <div style={{ opacity: 0.75, fontSize: 12, marginTop: 4 }}>
                        {formatTime(r.createdAt)}
                        <span style={{ marginLeft: 8, opacity: r.selected ? 0.9 : 0.6 }}>
                          • {r.selected ? "Selected" : "Unselected"}
                        </span>
                      </div>
                    </div>

                    <div style={{ opacity: 0.75, fontSize: 12, flex: "0 0 auto" }}>Show</div>
                  </button>
                )}

                {/* EXPANDED VIEW (MATCHES YOUR ORIGINAL CARD) */}
                {isOpen && (
                  <>
                    {/* top row to collapse */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        padding: 10,
                        paddingBottom: 0,
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: 13, opacity: 0.9 }}>
                        {truncate(r.imageFile.name, 26)}
                      </div>

                      <button
                        type="button"
                        onClick={() => setOpenId(null)}
                        style={{
                          all: "unset",
                          cursor: "pointer",
                          opacity: 0.75,
                          fontSize: 12,
                        }}
                        title="Collapse"
                      >
                        Hide
                      </button>
                    </div>

                    {/* Clickable preview (same as before) */}
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
                          marginTop: 10,
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
                        <div style={{ opacity: 0.75, fontSize: 12, marginTop: 4 }}>
                          {formatTime(r.createdAt)}
                        </div>
                      </div>
                    </button>

                    {/* Actions (same as before) */}
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
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
