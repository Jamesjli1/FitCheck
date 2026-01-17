import type { IdentityResult, StyleDesc } from "../types";

function chip(label: string) {
  return (
    <span
      key={label}
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

function swatch(hex: string) {
  return (
    <span
      key={hex}
      title={hex}
      style={{
        width: 16,
        height: 16,
        borderRadius: 6,
        background: hex,
        border: "1px solid rgba(255,255,255,0.18)",
        display: "inline-block",
        marginRight: 8,
      }}
    />
  );
}

function StyleCard({
  title,
  subtitle,
  accent,
  desc,
}: {
  title: string;
  subtitle: string;
  accent: "current" | "improved";
  desc: StyleDesc;
}) {
  const border =
    accent === "improved"
      ? "1px solid rgba(97,218,251,0.35)"
      : "1px solid rgba(255,255,255,0.12)";
  const bg =
    accent === "improved"
      ? "linear-gradient(180deg, rgba(97,218,251,0.10), rgba(255,255,255,0.04))"
      : "rgba(255,255,255,0.04)";

  return (
    <div
      className="vault-panel"
      style={{
        padding: 14,
        borderRadius: 16,
        border,
        background: bg,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: accent === "improved" ? 18 : 16, fontWeight: 900, marginTop: 4 }}>
            {desc.name}
          </div>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>{subtitle}</div>
        </div>

        {/* quick color swatches */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {desc.hexcolors?.slice(0, 4).map(swatch)}
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: 12,
        }}
      >
        {/* left column */}
        <div>
          <div style={{ opacity: 0.65, fontSize: 12, marginBottom: 6 }}>Palette</div>
          <div>{desc.colors.map(chip)}</div>

          <div style={{ marginTop: 10 }}>
            <div style={{ opacity: 0.65, fontSize: 12, marginBottom: 6 }}>Accessories</div>
            <div>{desc.accessories.map(chip)}</div>
          </div>
        </div>

        {/* right column */}
        <div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ opacity: 0.65, fontSize: 12, marginBottom: 6 }}>Fit</div>
            <div style={{ opacity: 0.88 }}>{desc.fit}</div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ opacity: 0.65, fontSize: 12, marginBottom: 6 }}>Textures</div>
            <div style={{ opacity: 0.88 }}>{desc.textures}</div>
          </div>
          <div>
            <div style={{ opacity: 0.65, fontSize: 12, marginBottom: 6 }}>Layering</div>
            <div style={{ opacity: 0.88 }}>{desc.layering}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StyleDNASection({ identity }: { identity?: IdentityResult | null }) {
  return (
    <section
      className="vault-panel fade-up"
      style={{
        textAlign: "left",
        padding: 16,
        borderRadius: 16,
        minHeight: 260,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Fashion Identity</h2>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
            Combined identity across all uploaded fits.
          </div>
        </div>

        {identity ? (
          <div
            className="badge"
            style={{
              fontWeight: 900,
              padding: "8px 12px",
              borderColor: "rgba(97,218,251,0.22)",
              background: "rgba(97,218,251,0.08)",
            }}
          >
            Score: {identity.current_score}/10
          </div>
        ) : (
          <div className="badge">Not minted</div>
        )}
      </div>

      {!identity ? (
        <p style={{ opacity: 0.75, marginTop: 12 }}>
          Upload fits, then click <b>Mint Style Identity</b>.
        </p>
      ) : (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Summary */}
          <div
            className="vault-card"
            style={{
              padding: 14,
              borderRadius: 16,
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>Summary</div>
            <div style={{ marginTop: 8, opacity: 0.9 }}>{identity.current_summary}</div>
          </div>

          {/* Current vs Improved */}
          <StyleCard
            title="CURRENT IDENTITY"
            subtitle="What your outfits currently signal most often."
            accent="current"
            desc={identity.current_style}
          />

          <StyleCard
            title="IMPROVED IDENTITY"
            subtitle="Upgraded direction: clearer silhouette, better materials, cleaner palette."
            accent="improved"
            desc={identity.improved_style}
          />
        </div>
      )}
    </section>
  );
}
