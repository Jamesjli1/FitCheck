import "./App.css";
import FitCheckPage from "./pages/FitCheckPage";
import { useState } from "react";
import type { FitRun } from "./types";

export default function App() {
  const [runs, setRuns] = useState<FitRun[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const maxImages = 5;

  const handleSelect = (id: string) => {
    setActiveId(id);
  };

  const handleRemove = (id: string) => {
    setRuns(runs.filter(run => run.id !== id));
  };

  return (
    <FitCheckPage
      runs={runs}
      activeId={activeId}
      maxImages={maxImages}
      onSelect={handleSelect}
      onRemove={handleRemove}
    />
  );
}
