import { useState } from "react";
import Slider, { Range } from "rc-slider";
import "rc-slider/assets/index.css";
export default function FilterPanel({
  setMinPrice,
  setMaxPrice,
  setMinStarRating,
}: {
  setMinPrice: (num: number) => void;
  setMaxPrice: (num: number) => void;
  setMinStarRating: (num: number) => void;
}) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [minStars, setMinStars] = useState(3);

  return (
    // Sliders
    <div style={{ display: "flex", gap: 40, padding: 20 }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 300 }}>
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
              setMinPrice(priceRange[0]);
              setMaxPrice(priceRange[1]);
            }}
            trackStyle={[{ backgroundColor: "#007bff" }]} // blue track
            handleStyle={[
              { borderColor: "#007bff" },
              { borderColor: "#007bff" },
            ]} // blue handles
            railStyle={{ backgroundColor: "#ccc" }}
          />
        </div>

        {/* Stars Slider */}
        <div>
          <label>Minimum Rating: {minStars}⭐</label>
          <Slider
            min={0}
            max={5}
            step={0.5} // increments of 0.5
            value={minStars}
            onChange={(value) => {
              setMinStars(value as number);
              setMinStarRating(value as number);
            }}
            trackStyle={{ backgroundColor: "#007bff" }} // blue track
            handleStyle={{ borderColor: "#007bff" }} // blue handle
            railStyle={{ backgroundColor: "#ccc" }}
            included={true}
          />
        </div>
      </div>
    </div>

    // Other Filters
  );
}
