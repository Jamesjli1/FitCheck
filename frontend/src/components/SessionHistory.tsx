import type { FitRun } from "../types";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function SessionHistory({
  runs,
  activeId,
  maxImages,
  onSelect,
  onRemove,
}: {
  runs: FitRun[];
  activeId: string | null;
  maxImages: number;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
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
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>This session</h2>
        <div style={{ opacity: 0.75, fontSize: 13 }}>
          {runs.length} / {maxImages}
        </div>
      </div>

      {runs.length === 0 ? (
        <p style={{ opacity: 0.75, marginTop: 10 }}>No uploads yet.</p>
      ) : (
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: 12,
          }}
        >
          {runs.map((r) => {
            const isActive = r.id === activeId;
            return (
              <div
                key={r.id}
                style={{
                  borderRadius: 14,
                  border: isActive
                    ? "1px solid rgba(97,218,251,0.65)"
                    : "1px solid rgba(255,255,255,0.12)",
                  background: isActive ? "rgba(97,218,251,0.08)" : "rgba(0,0,0,0.10)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => onSelect(r.id)}
                  style={{
                    all: "unset",
                    cursor: "pointer",
                    display: "block",
                    width: "100%",
                  }}
                  title="View this run"
                >
                  <div style={{ width: "100%", aspectRatio: "1 / 1", overflow: "hidden" }}>
                    <img
                      src={r.imagePreviewUrl}
                      alt="Run preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {r.imageFile.name.length > 18 ? r.imageFile.name.slice(0, 18) + "…" : r.imageFile.name}
                    </div>
                    <div style={{ opacity: 0.75, fontSize: 12, marginTop: 4 }}>{formatTime(r.createdAt)}</div>
                    <div style={{ marginTop: 8, opacity: 0.8, fontSize: 12 }}>
                      {r.styleDna ? (
                        <>
                          <div>• {r.styleDna.vibe[0] ?? "Style ready"}</div>
                          <div>• {r.styleDna.palette[0] ?? "Palette"}</div>
                        </>
                      ) : (
                        <div>• Not analyzed yet</div>
                      )}
                    </div>
                  </div>
                </button>

                <div style={{ display: "flex", gap: 8, padding: 10, paddingTop: 0 }}>
                  <button onClick={() => onRemove(r.id)} style={{ width: "100%", opacity: 0.85 }}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
