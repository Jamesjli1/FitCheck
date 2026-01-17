export default function Header({
  maxImages,
  maxFileMb,
}: {
  maxImages: number;
  maxFileMb: number;
}) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
        padding: "10px 0",
      }}
    >
      <div style={{ textAlign: "left" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "linear-gradient(135deg, #000000, #ffffff)",
              boxShadow: "0 10px 30px rgba(100,108,255,0.25)",
            }}
            aria-hidden="true"
          />
          <h1 style={{ margin: 0, fontSize: 34 }}>FitCheck</h1>
        </div>
        <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
          Upload a fit → get Style DNA + Shopify picks.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <span
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.06)",
            fontSize: 13,
          }}
        >
          Max {maxImages} images/session
        </span>
        <span
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.06)",
            fontSize: 13,
          }}
        >
          Max {maxFileMb}MB
        </span>
      </div>
    </header>
  );
}
