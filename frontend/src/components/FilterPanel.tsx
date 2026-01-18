import { useState } from "react";
import Slider, { Range } from "rc-slider";
import "rc-slider/assets/index.css";
export default function FilterPanel({
  setMinPrice,
  setMaxPrice,
  setMinStarRating,
  filterRecommendations,
}: {
  setMinPrice: (num: number) => void;
  setMaxPrice: (num: number) => void;
  setMinStarRating: (num: number) => void;
  filterRecommendations: (filter: string) => void;
}) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minStars, setMinStars] = useState(3);

  const [filter, setFilter] = useState("");

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 40,
          padding: 20,
          alignItems: "stretch", // make both columns same height
        }}
      >
        {/* LEFT COLUMN — Sliders */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: 300,
          }}
        >
          {/* Price Range Slider */}
          <div style={{ marginBottom: 40 }}>
            <label>
              Price Range: ${priceRange[0]} - ${priceRange[1]}
            </label>
            <Range
              min={0}
              max={500}
              step={10}
              value={priceRange}
              onChange={(value) => {
                setPriceRange(value as [number, number]);
                setMinPrice(value[0]);
                setMaxPrice(value[1]);
              }}
              trackStyle={[{ backgroundColor: "#007bff" }]}
              handleStyle={[
                { borderColor: "#007bff" },
                { borderColor: "#007bff" },
              ]}
              railStyle={{ backgroundColor: "#ccc" }}
            />
          </div>

          
        </div>

        {/* RIGHT COLUMN — Dropdown */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end", // push dropdown to bottom
            maxWidth: 300,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <label htmlFor="filter">Sort by:</label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                filterRecommendations(e.target.value);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: 4,
                border: "1px solid #ccc",
                fontSize: 14,
                outline: "none",
                backgroundColor: "#f8f9fa", // matches your container
                color: "#333", // text color
              }}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Lowest to Highest Price</option>
              <option value="price-desc">Highest to Lowest Price</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
