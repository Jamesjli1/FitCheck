import type { StyleDNA } from "../types";

function Chip({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.06)",
        fontSize: 13,
        marginRight: 8,
        marginBottom: 8,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export default function StyleDNASection({ styleDna }: { styleDna: StyleDNA | undefined }) {
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
      <h2 style={{ margin: 0, fontSize: 18 }}>Style DNA</h2>

      {!styleDna ? (
        <p style={{ opacity: 0.75, marginTop: 10 }}>
          Analyze an image to generate your style profile.
        </p>
      ) : (
        <div style={{ marginTop: 10 }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>Palette</div>
            <div>{styleDna.palette.map((x) => <Chip key={x} label={x} />)}</div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>Vibe</div>
            <div>{styleDna.vibe.map((x) => <Chip key={x} label={x} />)}</div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>Silhouette</div>
            <div>{styleDna.silhouette.map((x) => <Chip key={x} label={x} />)}</div>
          </div>

          {styleDna.avoid?.length ? (
            <div>
              <div style={{ opacity: 0.7, fontSize: 12, marginBottom: 6 }}>Avoid</div>
              <div>{styleDna.avoid.map((x) => <Chip key={x} label={x} />)}</div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
