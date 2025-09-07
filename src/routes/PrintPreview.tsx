import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../state/useAppStore";
import { feelingsData } from "../lib/feelings";
import { generateDirectFeelingImage } from "../lib/compose";
import { generateCollagePDF } from "../lib/collage";
import { analytics } from "../lib/analytics";

const PrintPreview: React.FC = () => {
  const navigate = useNavigate();
  const { avatar, language } = useAppStore();
  const [composedTiles, setComposedTiles] = useState<Map<string, Blob>>(
    new Map()
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!avatar?.originalFile) {
      navigate("/");
      return;
    }

    const generateAllTiles = async () => {
      setIsGenerating(true);
      setError(null);
      const newComposedTiles = new Map<string, Blob>();

      try {
        for (const category of feelingsData) {
          for (const tile of category.tiles) {
            try {
              const composedBlob = await generateDirectFeelingImage(
                avatar.originalFile,
                tile.assetPath,
                tile.key
              );
              newComposedTiles.set(tile.key, composedBlob);
            } catch (error) {
              console.warn(`Failed to compose tile ${tile.key}:`, error);
            }
          }
        }

        setComposedTiles(newComposedTiles);
      } catch (error) {
        setError("Failed to generate collage images");
        console.error("Failed to generate tiles:", error);
      } finally {
        setIsGenerating(false);
      }
    };

    generateAllTiles();
  }, [avatar, navigate]);

  const handlePrint = async () => {
    if (composedTiles.size === 0) return;

    analytics.printCollageStarted();

    try {
      await generateCollagePDF(feelingsData, composedTiles, {
        title: "My Feelings - HeroMe",
        includeCategories: true,
        tilesPerRow: 3,
        pageSize: "A4",
      });

      analytics.printCollageCompleted();
    } catch (error) {
      console.error("Failed to generate print collage:", error);
      analytics.error("print_collage_failed", "print");
      setError("Failed to generate print file");
    }
  };

  if (!avatar) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-lg">
        <div className="card text-center">
          <h1 className="text-2xl font-bold text-error mb-md">
            No Avatar Found
          </h1>
          <p className="text-text-secondary mb-lg">
            Please upload a photo to create your avatar first.
          </p>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Upload Photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-lg">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-xl">
          <h1 className="text-3xl font-bold mb-md">Print Your Feelings</h1>
          <p className="text-text-secondary">
            Generate a printable collage of all your feeling scenes
          </p>
        </div>

        {isGenerating ? (
          <div className="card text-center">
            <div className="animate-pulse text-lg font-semibold mb-sm">
              Generating your collage...
            </div>
            <p className="text-text-secondary">
              Creating all 24 feeling scenes. This may take a moment.
            </p>
          </div>
        ) : error ? (
          <div className="card text-center">
            <h2 className="text-xl font-bold text-error mb-md">
              Generation Failed
            </h2>
            <p className="text-text-secondary mb-lg">{error}</p>
            <button
              onClick={() => navigate("/board")}
              className="btn btn-primary"
            >
              Back to Board
            </button>
          </div>
        ) : (
          <div className="card text-center">
            <div className="mb-lg">
              <div className="text-6xl mb-md">🖨️</div>
              <h2 className="text-2xl font-bold mb-sm">Ready to Print!</h2>
              <p className="text-text-secondary">
                Your collage contains all 24 feelings organized by category.
                <br />
                Click the button below to open the print dialog.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-md justify-center">
              <button
                onClick={handlePrint}
                className="btn btn-primary btn-large"
              >
                🖨️ Print Collage
              </button>

              <button
                onClick={() => navigate("/board")}
                className="btn btn-secondary btn-large"
              >
                Back to Board
              </button>
            </div>
          </div>
        )}

        {/* Preview of what will be printed */}
        {composedTiles.size > 0 && (
          <div className="mt-xl">
            <h3 className="text-xl font-semibold mb-md text-center">
              What's included:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
              {feelingsData.map((category) => (
                <div key={category.key} className="card">
                  <h4 className="font-semibold mb-sm text-center">
                    {category.label[language]}
                  </h4>
                  <div className="grid grid-cols-2 gap-sm">
                    {category.tiles.map((tile) => (
                      <div key={tile.key} className="text-center">
                        <div className="text-sm font-medium">
                          {tile.label[language]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-xl p-lg bg-surface rounded-lg">
          <h3 className="font-semibold mb-sm">Print Instructions:</h3>
          <ul className="text-sm text-text-secondary space-y-xs">
            <li>• The print dialog will open automatically</li>
            <li>• Choose your printer and settings</li>
            <li>• The collage will fit on standard A4 or Letter paper</li>
            <li>• All 24 feelings will be organized by category</li>
            <li>• Perfect for sharing with family, teachers, or therapists</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PrintPreview;
