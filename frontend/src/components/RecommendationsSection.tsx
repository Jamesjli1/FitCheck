import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Recommendation } from "../types";
import TopItemCategoryPanel from "./TopItemCategoryPanel";
import FilterPanel from "./FilterPanel";

function roundToHalf(n: number) {
  return Math.round(n * 2) / 2;
}

function StarRating({ rating, count }: { rating?: number; count?: number }) {
  const r = rating == null ? 0 : roundToHalf(rating);
  const full = Math.floor(r);
  const half = r - full === 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", gap: 2, fontSize: 14, lineHeight: 1 }}>
        {Array.from({ length: full }).map((_, i) => (
          <span key={`f-${i}`}>★</span>
        ))}

        {half && (
          <span style={{ position: "relative", width: 14, display: "inline-block" }} title={`${r}`}>
            <span style={{ opacity: 0.28 }}>★</span>
            <span style={{ position: "absolute", top: 0, left: 0, width: "50%", overflow: "hidden" }}>
              ★
            </span>
          </span>
        )}

        {Array.from({ length: empty }).map((_, i) => (
          <span key={`e-${i}`} style={{ opacity: 0.28 }}>
            ★
          </span>
        ))}
      </div>

      <div style={{ fontSize: 12, opacity: 0.75, whiteSpace: "nowrap" }}>
        <span style={{ fontWeight: 900, opacity: 0.95 }}>
          {r.toFixed(r % 1 === 0 ? 0 : 1)}
        </span>
        {count != null ? <span style={{ opacity: 0.75 }}> ({count})</span> : null}
      </div>
    </div>
  );
}

function Pill({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.06)",
        fontSize: 12,
        opacity: 0.92,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function clampText(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function ProductModal({
  product,
  onClose,
}: {
  product: Recommendation;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const sizes = (product as any).sizes as string[] | undefined;
  const vendor = (product as any).vendor as string | undefined;
  const tags = (product as any).tags as string[] | undefined;
  const inStock = (product as any).inStock as boolean | undefined;
  const colors = (product as any).colors as string[] | undefined;
  const desc = (product as any).description as string | undefined;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(0,0,0,0.60)",
        backdropFilter: "blur(6px)",
      }}
    >
      {/* ✅ hard-center on true viewport */}
      <div
        className="vault-panel"
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(900px, 72vw)",
          maxWidth: "94vw",

          // ✅ FIX: autosize instead of forcing tall height
          height: "auto",
          maxHeight: "88vh",

          // ✅ FIX: keep scroll inside the modal if content is too tall
          overflow: "hidden",

          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.14)",
          background:
            "radial-gradient(1200px 600px at 15% 0%, rgba(97,218,251,0.12), transparent 60%), rgba(10,10,14,0.96)",
          boxShadow: "0 30px 120px rgba(0,0,0,0.55)",

          // ✅ make modal a column so header stays and body scrolls
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            padding: 14,
            position: "sticky",
            top: 0,
            backdropFilter: "blur(10px)",
            background: "rgba(10,10,14,0.72)",
            borderBottom: "1px solid rgba(255,255,255,0.10)",
            zIndex: 1,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>Match Details</div>
            <div style={{ marginTop: 4, fontWeight: 900, fontSize: 18 }}>{product.title}</div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.06)",
              cursor: "pointer",
              fontWeight: 900,
            }}
            aria-label="Close"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* ✅ body scroll area (only if needed) */}
        <div
          style={{
            padding: 14,
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 14,
            overflow: "auto",
          }}
        >
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.22)",
              minWidth: 0,
            }}
          >
            <div style={{ width: "100%", aspectRatio: "16 / 11", overflow: "hidden" }}>
              <img
                src={product.imageUrl}
                alt={product.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 950, fontSize: 18 }}>{product.price ?? ""}</div>
                {inStock != null ? <Pill text={inStock ? "In stock" : "Out of stock"} /> : null}
              </div>

              <StarRating rating={(product as any).rating} count={(product as any).ratingCount} />

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {vendor ? <Pill text={vendor} /> : null}
                {colors?.slice(0, 2).map((c) => <Pill key={c} text={c} />) ?? null}
              </div>
            </div>
          </div>

          {/* ✅ right column becomes flex so description can expand */}
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* ✅ Description expands to remove “dead bottom”, and scrolls if huge */}
            <div
              style={{
                padding: 12,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.04)",
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minHeight: 160,
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>Description</div>
              <div
                style={{
                  marginTop: 8,
                  opacity: 0.9,
                  lineHeight: 1.35,
                  overflow: "auto",
                  paddingRight: 6,
                }}
              >
                {desc ?? "No description provided yet (mock)."}
              </div>
            </div>

            <div
              style={{
                padding: 12,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>Options</div>

              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.65, fontWeight: 800 }}>Sizes</div>
                  <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(sizes?.length ? sizes : ["—"]).map((s) => (
                      <Pill key={s} text={s} />
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, opacity: 0.65, fontWeight: 800 }}>Tags</div>
                  <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(tags?.length ? tags : ["—"]).map((t) => (
                      <Pill key={t} text={t} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: 12,
                borderRadius: 16,
                border: "1px solid rgba(97,218,251,0.22)",
                background: "rgba(97,218,251,0.08)",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 900 }}>
                Why it matches your identity
              </div>
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                {(product.reasons ?? []).slice(0, 6).map((r) => (
                  <div key={r} style={{ opacity: 0.92 }}>
                    • {r}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href={product.productUrl ?? "#"}
                target="_blank"
                rel="noreferrer"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(97,218,251,0.35)",
                  background: "rgba(97,218,251,0.14)",
                  fontWeight: 900,
                  color: "inherit",
                }}
              >
                Open product ↗
              </a>

              <button
                onClick={onClose}
                style={{
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.06)",
                  cursor: "pointer",
                  fontWeight: 800,
                  color: "inherit",
                }}
              >
                Back to grid
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecommendationsSection({
  recommendations,
  filter,
  setMinPrice,
  setMaxPrice,
  filterRecommendation
}: {
  recommendations?: Recommendation[];
  filter: string;
  setMinPrice: (int: number) => void;
  setMaxPrice: (int: number) => void;
  filterRecommendation: (filter: string) => void;
}) {
  const items = useMemo(() => (recommendations ?? []).slice(0, 10), [recommendations]);

  const [filterPage, toggleFilterPage] = useState(false);

  // @ts-ignore
  // const [currItems, setCurrItems] = useState(items)
  const [selected, setSelected] = useState<Recommendation | null>(null);

  function parsePrice(price?: string | number) {
  if (typeof price === "number") return price;
  if (!price) return 0;

  // Remove anything that is not a digit or a dot
  const cleaned = price.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

  const currItems = useMemo(() => {
  if (!recommendations) return [];

  let sorted = [...recommendations.slice(0, 10)];

  switch (filter) {
    case "price-asc":
      sorted.sort((a, b) => parsePrice(a.price || "0") - parsePrice(b.price || "0"));
      break;
    case "price-desc":
      sorted.sort((a, b) => parsePrice(b.price || "0") - parsePrice(a.price || "0"));
      break;
    case "rating-desc":
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
  }

  return sorted;
}, [filter, recommendations]); // ✅ stable



  return (
    <section
      className="vault-panel fade-up"
      style={{
        textAlign: "left",
        padding: 16,
        borderRadius: 16,
        minHeight: 260,
        minWidth: 0,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "linear-gradient(180deg, rgba(100,108,255,0.08), rgba(255,255,255,0.03))",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Matches</h2>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
            Curated picks aligned to your <b>Improved Identity</b>.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Pill text="Shopify picks" />
          <Pill text="10 results" />
          <button onClick={() => {
            toggleFilterPage(!filterPage)
          }}>Toggle Button</button>
        </div>
      </div>
      {/* TODO HERE */}
      <div
        style={{
          overflow: "hidden",
          transition: "max-height 320ms ease, opacity 200ms ease, margin-top 200ms ease",
          maxHeight: filterPage ? 500 : 0,
          opacity: filterPage ? 1 : 0,
          marginTop: filterPage ? 14 : 0,
        }}
      >
        <FilterPanel
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          filterRecommendations={filterRecommendation}
        />
      </div>

      {!items.length ? (
        <div
          className="vault-card"
          style={{
            marginTop: 12,
            padding: 14,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(0,0,0,0.10)",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 800 }}>No matches yet</div>
          <p style={{ opacity: 0.78, marginTop: 8 }}>
            Mint your identity, then hit <b>Generate Matches</b>.
          </p>
        </div>
      ) : (
        <div>
          <TopItemCategoryPanel></TopItemCategoryPanel>
          <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {currItems.map((p) => (
            <div
              key={p.title}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(p)}
              onKeyDown={(e) => e.key === "Enter" && setSelected(p)}
              style={{
                cursor: "pointer",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.12)",
                background:
                  "radial-gradient(1200px 400px at 20% 0%, rgba(97,218,251,0.10), transparent 60%), rgba(0,0,0,0.10)",
                overflow: "hidden",
                minWidth: 0,
                boxShadow: "0 14px 40px rgba(0,0,0,0.28)",
              }}
            >
              <div style={{ width: "100%", aspectRatio: "16 / 11", overflow: "hidden" }}>
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: "scale(1.02)",
                    filter: "saturate(1.05) contrast(1.02)",
                  }}
                />
              </div>

              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 900, fontSize: 13, lineHeight: 1.2, minWidth: 0 }}>
                    {clampText(p.title, 44)}
                  </div>

                  <div style={{ fontWeight: 900, fontSize: 13, opacity: 0.95, whiteSpace: "nowrap" }}>
                    {p.price ?? ""}
                  </div>
                </div>

                <StarRating rating={(p as any).rating} count={(p as any).ratingCount} />

                {p.reasons?.length ? (
                  <div style={{ fontSize: 12, opacity: 0.78, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {p.reasons.slice(0, 2).map((r) => (
                      <span
                        key={r}
                        style={{
                          padding: "5px 8px",
                          borderRadius: 999,
                          border: "1px solid rgba(255,255,255,0.10)",
                          background: "rgba(255,255,255,0.06)",
                        }}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        </div>
        
      )}

      {selected
        ? createPortal(
            <ProductModal product={selected} onClose={() => setSelected(null)} />,
            document.body
          )
        : null}
    </section>
  );
}
