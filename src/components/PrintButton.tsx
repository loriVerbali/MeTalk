import React, { useState } from "react";
import type { Category } from "../types";
import { analytics } from "../lib/analytics";

interface PrintButtonProps {
  categories: Category[];
  composedTiles: Map<string, Blob>;
  disabled?: boolean;
}

const PrintButton: React.FC<PrintButtonProps> = ({ disabled = false }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = async () => {
    if (disabled || isGenerating) return;

    setIsGenerating(true);
    analytics.printCollageStarted();

    try {
      // Add a class to body to trigger print-all-categories mode
      document.body.classList.add("print-all-categories");

      // Print the current page content
      window.print();

      // Remove the class after printing
      setTimeout(() => {
        document.body.classList.remove("print-all-categories");
      }, 1000);

      analytics.printCollageCompleted();
    } catch (error) {
      console.error("Failed to print:", error);
      analytics.error("print_collage_failed", "print");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handlePrint}
      disabled={disabled || isGenerating}
      className="btn btn-primary btn-large"
      style={{ minHeight: "56px" }}
    >
      <div className="flex items-center gap-sm">
        {isGenerating ? (
          <>
            <div className="animate-pulse">🖨️</div>
            <span>Generating...</span>
          </>
        ) : (
          <>
            <span>🖨️</span>
            <span>Print Collage</span>
          </>
        )}
      </div>
    </button>
  );
};

export default PrintButton;
