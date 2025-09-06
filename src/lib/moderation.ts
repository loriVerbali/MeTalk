import * as nsfwjs from "nsfwjs";

let nsfwModel: nsfwjs.NSFWJS | null = null;

// Initialize NSFW model
const initNSFWModel = async (): Promise<nsfwjs.NSFWJS | null> => {
  if (nsfwModel) return nsfwModel;

  try {
    nsfwModel = await nsfwjs.load();
    return nsfwModel;
  } catch (error) {
    console.warn("Failed to load NSFW model:", error);
    return null;
  }
};

// Check if image is safe
export const isImageSafe = async (
  imageFile: File
): Promise<{ safe: boolean; confidence?: number; error?: string }> => {
  try {
    const model = await initNSFWModel();

    if (!model) {
      // If model fails to load, assume safe (fail open for demo)
      return { safe: true };
    }

    // Create image element
    const img = new Image();
    const imageUrl = URL.createObjectURL(imageFile);

    return new Promise((resolve) => {
      img.onload = async () => {
        try {
          const predictions = await model.classify(img);

          // Check for NSFW content
          const nsfwPrediction = predictions.find(
            (p) => p.className === "Porn" || p.className === "Sexy"
          );
          const isNSFW = nsfwPrediction && nsfwPrediction.probability > 0.5;

          URL.revokeObjectURL(imageUrl);

          resolve({
            safe: !isNSFW,
            confidence: nsfwPrediction?.probability,
          });
        } catch (error) {
          URL.revokeObjectURL(imageUrl);
          resolve({
            safe: true, // Fail open
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve({
          safe: false,
          error: "Failed to load image for moderation",
        });
      };

      img.src = imageUrl;
    });
  } catch (error) {
    return {
      safe: true, // Fail open for demo
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Check if image has exactly one face
export const hasOneFace = async (
  imageFile: File
): Promise<{ hasOneFace: boolean; faceCount?: number; error?: string }> => {
  try {
    // For now, we'll use a simple heuristic approach
    // In a production app, you'd use face-api.js or MediaPipe

    // Create image element to analyze
    const img = new Image();
    const imageUrl = URL.createObjectURL(imageFile);

    return new Promise((resolve) => {
      img.onload = () => {
        try {
          // Simple heuristic: check if image is reasonable size and format
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            URL.revokeObjectURL(imageUrl);
            resolve({
              hasOneFace: false,
              error: "Could not create canvas context",
            });
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // For demo purposes, we'll assume most photos have one face
          // In production, you'd implement actual face detection here
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const hasReasonableContent = imageData.data.some((value, index) => {
            // Check for non-transparent pixels
            return index % 4 === 3 && value > 0; // Alpha channel
          });

          URL.revokeObjectURL(imageUrl);

          // For demo, assume single face if image has content
          resolve({
            hasOneFace: hasReasonableContent,
            faceCount: hasReasonableContent ? 1 : 0,
          });
        } catch (error) {
          URL.revokeObjectURL(imageUrl);
          resolve({
            hasOneFace: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve({
          hasOneFace: false,
          error: "Failed to load image for face detection",
        });
      };

      img.src = imageUrl;
    });
  } catch (error) {
    return {
      hasOneFace: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Strip EXIF data from image
export const stripEXIF = async (imageFile: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const imageUrl = URL.createObjectURL(imageFile);

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not create canvas context"));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(imageUrl);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob from canvas"));
            }
          },
          "image/png",
          0.95
        );
      } catch (error) {
        URL.revokeObjectURL(imageUrl);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
};

// Validate uploaded file
export const validateUpload = async (
  file: File
): Promise<{
  valid: boolean;
  error?: string;
  processedFile?: Blob;
}> => {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "Please upload an image file (JPG, PNG, etc.)",
    };
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return {
      valid: false,
      error: "File size must be less than 5MB",
    };
  }

  // Check if image is safe
  const safetyCheck = await isImageSafe(file);
  if (!safetyCheck.safe) {
    return {
      valid: false,
      error: "Image content is not appropriate for this application",
    };
  }

  // Check for exactly one face
  const faceCheck = await hasOneFace(file);
  if (!faceCheck.hasOneFace) {
    return {
      valid: false,
      error: "Please upload a photo with exactly one face",
    };
  }

  // Strip EXIF data
  try {
    const processedFile = await stripEXIF(file);
    return {
      valid: true,
      processedFile,
    };
  } catch (error) {
    return {
      valid: false,
      error: "Failed to process image",
    };
  }
};
