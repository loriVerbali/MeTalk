import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../state/useAppStore";
import { canCreateAvatar, recordAvatarGeneration } from "../lib/session";
import { validateUpload } from "../lib/moderation";
// Avatar generation removed - now using direct feeling image generation
import { analytics } from "../lib/analytics";
import { feelingsData } from "../lib/feelings";
import FileDrop from "../components/FileDrop";
import Toast from "../components/Toast";

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { setAvatar, incrementAvatarsCreated } = useAppStore();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      console.log("File selected:", file.name, file.type, file.size);

      // Check cooldown before proceeding
      const cooldownCheck = canCreateAvatar();
      if (!cooldownCheck.allowed) {
        setError(
          cooldownCheck.reason || "Please wait before creating another avatar"
        );
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        // Validate upload
        console.log("Starting validation...");
        const validation = await validateUpload(file);
        console.log("Validation result:", validation);
        if (!validation.valid) {
          setError(validation.error || "Upload validation failed");
          analytics.uploadBlockedModeration();
          return;
        }

        // Store original file for direct feeling image generation
        const startTime = Date.now();

        // Store the original uploaded file
        const fileToStore = validation.processedFile
          ? new File([validation.processedFile], file.name, { type: file.type })
          : file;
        setAvatar({ originalFile: fileToStore });
        incrementAvatarsCreated();
        recordAvatarGeneration(); // Record generation time for cooldown

        const latency = Date.now() - startTime;
        analytics.avatarCreated(latency, 0); // No retries needed for file storage

        // Navigate directly to board (skip avatar review)
        console.log("Upload successful, navigating to board...");
        navigate("/board");
      } catch (err) {
        console.error("Upload error:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
        analytics.error("upload_error", "upload");
      } finally {
        console.log("Upload process finished");
        setIsUploading(false);
      }
    },
    [navigate, setAvatar, incrementAvatarsCreated]
  );

  return (
    <div className="min-h-screen">
      <div className="main-container">
        {/* Explanation Section */}
        <div className="w-full max-w-4xl mx-auto mb-lg">
          <div className="text-center mb-lg">
            <h1 className="text-4xl font-bold mb-md text-primary">
              HeroMe Feelings Collage
            </h1>
            <p className="text-xl text-text mb-lg">
              Upload an image and create an AAC feelings collage that looks like
              you or anyone you choose
            </p>
            <p className="text-text-secondary max-w-3xl mx-auto">
              Transform any photo into a personalized feelings communication
              board. Our AI will create cartoon-style versions of your image
              expressing different emotions, perfect for AAC (Augmentative and
              Alternative Communication) users.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="text-center mb-md">
            <div className="flex gap-sm justify-center flex-wrap">
              <button
                onClick={() => setShowHowItWorks(true)}
                className="bg-primary text-white font-bold px-md py-sm rounded hover:bg-primary/90 transition-colors"
              >
                How it works
              </button>
              <button
                onClick={() => {
                  const uploadSection =
                    document.getElementById("upload-section");
                  uploadSection?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-secondary text-white font-bold px-md py-sm rounded hover:bg-secondary/90 transition-colors"
              >
                Upload your image
              </button>
            </div>
          </div>

          {/* Preview Collage */}
          <div className="mb-md">
            <h3 className="text-lg font-semibold text-center mb-md">
              Preview: Your collage will include these feelings
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-xs max-w-2xl mx-auto">
              {feelingsData.slice(0, 2).map((category) =>
                category.tiles.slice(0, 4).map((tile) => (
                  <div
                    key={tile.key}
                    className="flex flex-col bg-white rounded border overflow-hidden"
                  >
                    <div className="aspect-square">
                      <img
                        src={tile.assetPath}
                        alt={tile.label.en}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-xs">
                      <span className="text-xs text-center font-bold leading-tight block">
                        {tile.label.en}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <p className="text-center text-sm text-text-secondary mt-md">
              ...and many more! Your uploaded image will be transformed to match
              each feeling.
            </p>
          </div>
        </div>

        {/* Upload Section - Now Smaller */}
        <div id="upload-section" className="w-full max-w-md mx-auto">
          <div className="text-center mb-md">
            <h2 className="text-xl font-semibold mb-sm">Upload Your Photo</h2>
            <p className="text-text-secondary text-sm">
              Upload a clear photo with exactly one face
            </p>
          </div>

          <div className="card">
            <FileDrop
              onFileSelect={handleFileSelect}
              disabled={isUploading}
              acceptedTypes={["image/jpeg", "image/jpg", "image/png"]}
              maxSize={5 * 1024 * 1024}
            />
          </div>

          {isUploading && (
            <div className="mt-lg text-center">
              <div className="animate-pulse text-lg font-semibold mb-sm">
                Processing your photo...
              </div>
              <p className="text-sm text-text-secondary">
                Preparing your image for feeling generation. This will be quick!
              </p>
            </div>
          )}

          {error && (
            <div className="mt-lg p-md bg-error/10 border border-error/20 rounded text-error">
              <h3 className="font-semibold mb-sm">Upload Failed</h3>
              <p className="text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="btn btn-secondary btn-sm mt-md"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Tips */}
          <div className="mt-md p-sm bg-surface rounded text-center">
            <p className="text-xs text-text-secondary">
              💡 <strong>Tip:</strong> Use a clear, well-lit photo with one
              visible face for best results
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* How it Works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-md">
          <div className="bg-white rounded-lg max-w-md w-full p-lg">
            <div className="flex justify-between items-center mb-md">
              <h2 className="text-xl font-bold text-primary">How it works</h2>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="text-text-secondary hover:text-text text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="space-y-md">
              <div className="flex items-center gap-sm">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <p className="text-text">
                  Upload a clear photo with exactly one face
                </p>
              </div>
              <div className="flex items-center gap-sm">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <p className="text-text">
                  Explore 24 different feelings organized in 4 categories
                </p>
              </div>
              <div className="flex items-center gap-sm">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <p className="text-text">
                  Tap any feeling to hear it spoken aloud
                </p>
              </div>
              <div className="flex items-center gap-sm">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  4
                </div>
                <p className="text-text">
                  Print a collage of all your feelings to keep
                </p>
              </div>
            </div>
            <div className="mt-lg text-center">
              <button
                onClick={() => setShowHowItWorks(false)}
                className="btn btn-primary"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
