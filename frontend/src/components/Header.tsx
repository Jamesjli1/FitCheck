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
          <img
            src="/fc.png"
            alt="FitCheck logo"
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              boxShadow: "0 10px 30px rgba(100,108,255,0.25)",
              objectFit: "cover",
            }}
          />
          <h1 style={{ margin: 0, fontSize: 40 }}>FitCheck</h1>
        </div>
        <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
          Style advisor powered by <u><a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer">Google Gemini</a></u> and <u><a href="https://shopify.com/" target="_blank" rel="noopener noreferrer">Shopify</a></u>.
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
