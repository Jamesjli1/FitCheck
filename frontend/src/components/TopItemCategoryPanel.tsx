import { useState } from "react";
export default function TopItemCategoryPanel({
  setTab,
}: {
  setTab: (tab: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<number>(0);

  const tabs = ["Topwear", "Bottomwear", "Accessories"] as const;
  const tabsName = {
    "Topwear" : "tops",
    "Bottomwear" : "bottoms",
    "Accessories" : "accessories"
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        marginTop: 12,
        marginBottom: -1,
      }}
    >
      {tabs.map((t, i) => {
        const isActive = i === activeTab;

        return (
          <button
            key={t}
            onClick={() => {
              setActiveTab(i)
              setTab(tabsName[t])
            }}
            style={{
              padding: "8px 16px",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,

              border: "1px solid rgba(255,255,255,0.12)",
              borderBottom: isActive
                ? "1px solid rgba(10,10,14,0.96)" // hides seam
                : "1px solid rgba(255,255,255,0.12)",

              background: isActive
                ? "linear-gradient(180deg, rgba(100,108,255,0.16), rgba(10,10,14,0.96))"
                : "rgba(255,255,255,0.04)",

              fontWeight: 900,
              fontSize: 12,
              cursor: "pointer",
              color: "inherit",

              boxShadow: isActive ? "0 -1px 0 rgba(255,255,255,0.22)" : "none",
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
