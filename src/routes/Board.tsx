import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../state/useAppStore";
import { feelingsData } from "../lib/feelings";
import { generateDirectFeelingImage } from "../lib/compose";
import { analytics } from "../lib/analytics";
import CategoryTabs from "../components/CategoryTabs";
import Tile from "../components/Tile";
import LanguageSelector from "../components/LanguageSelector";
import HighContrastToggle from "../components/HighContrastToggle";
import PrintButton from "../components/PrintButton";
import NormalPrintButton from "../components/NormalPrintButton";
import Toast from "../components/Toast";

const Board: React.FC = () => {
  const navigate = useNavigate();
  const { avatar, language, setLanguage, setCurrentCategory, currentCategory } =
    useAppStore();

  const [composedTiles, setComposedTiles] = useState<Map<string, Blob>>(
    new Map()
  );
  const [composedUrls, setComposedUrls] = useState<Map<string, string>>(
    new Map()
  );
  const [isComposing, setIsComposing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Set default category if none selected
  useEffect(() => {
    if (!currentCategory) {
      setCurrentCategory("goodBody");
    }
  }, [currentCategory, setCurrentCategory]);

  // Generate feeling images directly from uploaded photo
  useEffect(() => {
    if (!avatar?.originalFile) {
      navigate("/");
      return;
    }

    const composeAllTiles = async () => {
      setIsComposing(true);
      const newComposedTiles = new Map<string, Blob>();
      const newComposedUrls = new Map<string, string>();

      try {
        // Compose first 2 tiles only for testing
        let processedCount = 0;
        const maxTiles = 2;

        for (const category of feelingsData) {
          for (const tile of category.tiles) {
            if (processedCount >= maxTiles) break;

            try {
              console.log(
                `🔄 Processing tile ${processedCount + 1}/${maxTiles}: ${
                  tile.key
                }`
              );
              console.log(`📸 Original image URL:`, tile.assetPath);

              const composedBlob = await generateDirectFeelingImage(
                avatar.originalFile,
                tile.assetPath,
                tile.key
              );

              const composedUrl = URL.createObjectURL(composedBlob);
              console.log(
                `✅ Generated personalized URL for ${tile.key}:`,
                composedUrl
              );
              console.log(
                `📊 Blob size: ${composedBlob.size} bytes, type: ${composedBlob.type}`
              );

              newComposedTiles.set(tile.key, composedBlob);
              newComposedUrls.set(tile.key, composedUrl);

              processedCount++;
            } catch (error) {
              console.error(`❌ Failed to compose tile ${tile.key}:`, error);
              // Continue with other tiles even if one fails
              processedCount++;
            }
          }
          if (processedCount >= maxTiles) break;
        }

        setComposedTiles(newComposedTiles);
        setComposedUrls(newComposedUrls);
      } catch (error) {
        console.error("Failed to compose tiles:", error);
        setToast({
          message: "Failed to generate personalized feeling images",
          type: "error",
        });
      } finally {
        setIsComposing(false);
      }
    };

    composeAllTiles();
  }, [avatar, navigate]);

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      composedUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [composedUrls]);

  const currentCategoryData = useMemo(() => {
    return feelingsData.find((cat) => cat.key === currentCategory);
  }, [currentCategory]);

  const handleLanguageChange = (newLanguage: typeof language) => {
    setLanguage(newLanguage);
    analytics.languageChanged(newLanguage);
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  if (!avatar) {
    return (
      <div className="min-h-screen">
        <div className="main-container center-content">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="main-container">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-xl gap-lg w-full">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold mb-sm">My Feelings</h1>
            <p className="text-text-secondary">
              Tap any feeling to hear it spoken aloud
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-md items-center justify-center">
            <div className="flex flex-row gap-md items-center justify-center">
              <LanguageSelector
                value={language}
                onChange={handleLanguageChange}
                disabled={isComposing}
              />
              <HighContrastToggle />
            </div>

            {/* Print Buttons */}
            {composedTiles.size > 0 && (
              <div className="flex flex-row gap-sm items-center justify-center">
                <NormalPrintButton disabled={isComposing} />
                <PrintButton
                  categories={feelingsData}
                  composedTiles={composedTiles}
                  disabled={isComposing}
                />
              </div>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <CategoryTabs
          categories={feelingsData}
          currentCategory={currentCategory}
          onCategoryChange={setCurrentCategory}
          language={language}
        />

        {/* Tiles Grid */}
        {isComposing ? (
          <div className="center-content">
            <div className="animate-pulse text-lg font-semibold mb-sm">
              Creating your personalized feeling images...
            </div>
            <p className="text-text-secondary">
              Using AI to transform your photo into cartoon-style feeling
              images. This may take a few minutes.
            </p>
          </div>
        ) : currentCategoryData ? (
          <>
            <div className="category-heading">
              {currentCategoryData.label[language]}
            </div>
            <div className="collage-grid mb-xl">
              {currentCategoryData.tiles.map((tile) => (
                <Tile
                  key={tile.key}
                  tile={tile}
                  language={language}
                  composedImageUrl={composedUrls.get(tile.key)}
                  disabled={isComposing}
                />
              ))}
            </div>

            {/* All categories for print-all-categories mode */}
            <div className="all-categories-print">
              {feelingsData.map((category) => (
                <div key={category.key} className="category-section">
                  <div className="category-heading">
                    {category.label[language]}
                  </div>
                  <div className="collage-grid mb-xl">
                    {category.tiles.map((tile) => (
                      <Tile
                        key={tile.key}
                        tile={tile}
                        language={language}
                        composedImageUrl={composedUrls.get(tile.key)}
                        disabled={isComposing}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {/* Print Button */}
        {composedTiles.size > 0 && (
          <div className="text-center">
            <PrintButton
              categories={feelingsData}
              composedTiles={composedTiles}
              disabled={isComposing}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center gap-md mt-xl">
          <button
            onClick={() => navigate("/")}
            className="btn btn-secondary"
            disabled={isComposing}
          >
            Upload New Photo
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-xl p-lg bg-surface rounded-lg">
          <h3 className="font-semibold mb-sm">How to use:</h3>
          <ul className="text-sm text-text-secondary space-y-xs">
            <li>• Tap any feeling tile to hear it spoken</li>
            <li>• Use the language selector to change the spoken language</li>
            <li>• Switch between categories using the tabs above</li>
            <li>• Print a collage to keep all your feelings</li>
            <li>
              • Use keyboard navigation: Tab to move, Enter/Space to speak
            </li>
          </ul>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Board;
