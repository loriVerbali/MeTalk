import React from "react";
import { useAppStore } from "../state/useAppStore";

const HighContrastToggle: React.FC = () => {
  const { highContrast, setHighContrast } = useAppStore();

  return (
    <div className="flex flex-col gap-sm">
      <label className="text-sm font-semibold">Display Mode</label>
      <button
        onClick={() => setHighContrast(!highContrast)}
        className="btn btn-secondary"
        style={{ minHeight: "44px" }}
        aria-label={`${highContrast ? "Disable" : "Enable"} high contrast mode`}
        title={`${highContrast ? "Disable" : "Enable"} high contrast mode`}
      >
        <div className="flex items-center gap-sm justify-center">
          <span className="text-lg">{highContrast ? "🔆" : "🌙"}</span>
          <span>{highContrast ? "High Contrast" : "Normal"}</span>
        </div>
      </button>
    </div>
  );
};

export default HighContrastToggle;
