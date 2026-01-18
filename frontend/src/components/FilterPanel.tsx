// FilterPanel.tsx
import { useState } from "react";
import { Range } from "rc-slider";
import "rc-slider/assets/index.css";

type SortMode = "featured" | "price-asc" | "price-desc";

export default function FilterPanel({
  setMinPrice,
  setMaxPrice,
  filterRecommendations,
}: {
  setMinPrice: (num: number) => void;
  setMaxPrice: (num: number) => void;
  filterRecommendations: (filter: SortMode) => void;
}) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [filter, setFilter] = useState<SortMode>("featured");

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Price Range Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <label style={{ fontWeight: 800, fontSize: 12, opacity: 0.85 }}>
          Price Range: ${priceRange[0]} - ${priceRange[1]}
        </label>
        <div style={{ width: "100%" }}>
          <Range
            min={0}
            max={500}
            step={10}
            value={priceRange}
            onChange={(value) => {
              const v = value as [number, number];
              setPriceRange(v);
              setMinPrice(v[0]);
              setMaxPrice(v[1]);
            }}
            trackStyle={[{ backgroundColor: "rgba(97,218,251,0.85)" }]}
            handleStyle={[
              { borderColor: "rgba(97,218,251,0.95)", backgroundColor: "rgba(15,17,21,0.9)" },
              { borderColor: "rgba(97,218,251,0.95)", backgroundColor: "rgba(15,17,21,0.9)" },
            ]}
            railStyle={{ backgroundColor: "rgba(255,255,255,0.18)" }}
          />
        </div>
      </div>

      {/* Sort Dropdown Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label htmlFor="filter" style={{ fontWeight: 800, fontSize: 12, opacity: 0.85 }}>
          Sort by:
        </label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => {
            const v = e.target.value as SortMode;
            setFilter(v);
            filterRecommendations(v);
          }}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.92)",
            fontSize: 13,
            fontWeight: 800,
            outline: "none",
            cursor: "pointer",
            width: "100%",
          }}
        >
          <option value="featured" style={{ color: "#111" }}>
            Featured
          </option>
          <option value="price-asc" style={{ color: "#111" }}>
            Lowest to Highest Price
          </option>
          <option value="price-desc" style={{ color: "#111" }}>
            Highest to Lowest Price
          </option>
        </select>
      </div>
    </div>
  );
}
