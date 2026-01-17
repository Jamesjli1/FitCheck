import type { FitRun } from "../types";

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
}: {
  runs: FitRun[];
  activeId: string | null;
  maxImages: number;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}) {
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
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Fits Uploaded 
        </h2>
        <div style={{ opacity: 0.75, fontSize: 13 }}>
          {runs.length} / {maxImages}
        </div>
      </div>

      {runs.length === 0 ? (
        <p style={{ opacity: 0.75, marginTop: 10 }}>
          No fits captured yet. Upload multiple images to build your identity.
        </p>
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
                className={isActive ? "card-active" : "card-hover"}
                style={{
                  borderRadius: 14,
                  border: isActive
                    ? "1px solid rgba(97,218,251,0.65)"
                    : "1px solid rgba(255,255,255,0.12)",
                  background: isActive ? "rgba(97,218,251,0.08)" : "rgba(0,0,0,0.10)",
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
                  <div style={{ width: "100%", aspectRatio: "1 / 1", overflow: "hidden" }}>
                    <img
                      src={r.imagePreviewUrl}
                      alt={r.imageFile.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>

                  <div style={{ padding: 10 }}>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>
                      {truncate(r.imageFile.name)}
                    </div>
                    <div style={{ opacity: 0.75, fontSize: 12, marginTop: 4 }}>
                      {formatTime(r.createdAt)}
                    </div>

                    <div style={{ marginTop: 8, opacity: 0.8, fontSize: 12 }}>
                      {isActive ? "• Selected" : "• Captured"}
                    </div>
                  </div>
                </button>

                {/* Actions */}
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
    </section>
  );
}
