import type { Recommendation } from "../types";

export default function RecommendationsSection({
  recommendations,
}: {
  recommendations?: Recommendation[];
}) {
  return (
    <section
      style={{
        textAlign: "left",
        padding: 16,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.04)",
        minHeight: 220,
      }}
    >
      <h2 style={{ margin: 0, fontSize: 18 }}>Recommendations</h2>

      {!recommendations?.length ? (
        <p style={{ opacity: 0.75, marginTop: 10 }}>
          Generate recommendations after Style DNA is ready.
        </p>
      ) : (
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {recommendations.map((p) => (
            <a
              key={p.title}
              href={p.productUrl ?? "#"}
              style={{
                textDecoration: "none",
                color: "inherit",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(0,0,0,0.12)",
                overflow: "hidden",
              }}
            >
              <div style={{ width: "100%", aspectRatio: "1 / 1", overflow: "hidden" }}>
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: 10 }}>
                <div style={{ fontWeight: 700, lineHeight: 1.2 }}>{p.title}</div>
                {p.price && <div style={{ opacity: 0.8, marginTop: 4 }}>{p.price}</div>}
                <div style={{ marginTop: 8, opacity: 0.8, fontSize: 12 }}>
                  {p.reasons.slice(0, 2).map((r) => (
                    <div key={r}>• {r}</div>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
