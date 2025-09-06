import React, { useState } from "react";
import { analytics } from "../lib/analytics";

interface NormalPrintButtonProps {
  disabled?: boolean;
}

const NormalPrintButton: React.FC<NormalPrintButtonProps> = ({
  disabled = false,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    if (disabled || isPrinting) return;

    setIsPrinting(true);
    analytics.printCollageStarted(); // Reuse existing analytics

    try {
      // Add a class to body to trigger print-only-tiles mode
      document.body.classList.add("print-tiles-only");

      // Print the current page content
      window.print();

      // Remove the class after printing
      setTimeout(() => {
        document.body.classList.remove("print-tiles-only");
      }, 1000);

      analytics.printCollageCompleted();
    } catch (error) {
      console.error("Failed to print:", error);
      analytics.error("print_collage_failed", "print");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={disabled || isPrinting}
      className="btn btn-secondary btn-large"
      style={{ minHeight: "56px" }}
    >
      <div className="flex items-center gap-sm">
        {isPrinting ? (
          <>
            <div className="animate-pulse">🖨️</div>
            <span>Printing...</span>
          </>
        ) : (
          <>
            <span>🖨️</span>
            <span>Print Current View</span>
          </>
        )}
      </div>
    </button>
  );
};

export default NormalPrintButton;
