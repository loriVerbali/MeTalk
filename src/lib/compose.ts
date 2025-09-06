import { replaceFaceInImage, generateFeelingImageDirectly } from "./gemini";

export interface CompositionOptions {
  avatarScale?: number;
  anchor?: "bottom-center" | "center" | "top-center";
  offsetX?: number;
  offsetY?: number;
}

export interface FaceReplacementOptions {
  maxRetries?: number;
}

export interface DirectFeelingGenerationOptions {
  maxRetries?: number;
}

export const composeAvatarOverBackground = async (
  avatarBlob: Blob,
  backgroundUrl: string,
  options: CompositionOptions = {}
): Promise<Blob> => {
  const {
    avatarScale = 0.65,
    anchor = "bottom-center",
    offsetX = 0,
    offsetY = 0,
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not create canvas context"));
      return;
    }

    // Set canvas size to 512x512 (standard tile size)
    canvas.width = 512;
    canvas.height = 512;

    const avatarImg = new Image();
    const backgroundImg = new Image();
    let loadedCount = 0;

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === 2) {
        try {
          // Draw background
          ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

          // Calculate avatar dimensions
          const avatarWidth = canvas.width * avatarScale;
          const avatarHeight = canvas.height * avatarScale;

          // Calculate avatar position based on anchor
          let avatarX = 0;
          let avatarY = 0;

          switch (anchor) {
            case "bottom-center":
              avatarX = (canvas.width - avatarWidth) / 2 + offsetX;
              avatarY = canvas.height - avatarHeight + offsetY;
              break;
            case "center":
              avatarX = (canvas.width - avatarWidth) / 2 + offsetX;
              avatarY = (canvas.height - avatarHeight) / 2 + offsetY;
              break;
            case "top-center":
              avatarX = (canvas.width - avatarWidth) / 2 + offsetX;
              avatarY = 0 + offsetY;
              break;
          }

          // Draw avatar
          ctx.drawImage(avatarImg, avatarX, avatarY, avatarWidth, avatarHeight);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
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
          reject(error);
        }
      }
    };

    const onImageError = (error: string) => {
      reject(new Error(error));
    };

    // Load avatar image
    avatarImg.onload = onImageLoad;
    avatarImg.onerror = () => onImageError("Failed to load avatar image");
    avatarImg.src = URL.createObjectURL(avatarBlob);

    // Load background image
    backgroundImg.onload = onImageLoad;
    backgroundImg.onerror = () =>
      onImageError("Failed to load background image");
    backgroundImg.src = backgroundUrl;
  });
};

// Preload images for better performance
export const preloadImages = (urls: string[]): Promise<void[]> => {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () =>
            reject(new Error(`Failed to preload image: ${url}`));
          img.src = url;
        })
    )
  );
};

// Create a composition with multiple avatars (for future use)
export const composeMultipleAvatars = async (
  avatars: { blob: Blob; x: number; y: number; scale: number }[],
  backgroundUrl: string,
  canvasSize: { width: number; height: number } = { width: 512, height: 512 }
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not create canvas context"));
      return;
    }

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    const backgroundImg = new Image();
    let loadedAvatars = 0;
    const avatarImages: HTMLImageElement[] = [];

    const onBackgroundLoad = () => {
      // Draw background
      ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

      // Draw all avatars
      avatars.forEach((avatar, index) => {
        const img = avatarImages[index];
        if (img) {
          const width = canvas.width * avatar.scale;
          const height = canvas.height * avatar.scale;
          ctx.drawImage(img, avatar.x, avatar.y, width, height);
        }
      });

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        },
        "image/png",
        0.95
      );
    };

    // Load background
    backgroundImg.onload = onBackgroundLoad;
    backgroundImg.onerror = () =>
      reject(new Error("Failed to load background image"));
    backgroundImg.src = backgroundUrl;

    // Load all avatars
    avatars.forEach((avatar, index) => {
      const img = new Image();
      img.onload = () => {
        loadedAvatars++;
        if (loadedAvatars === avatars.length && backgroundImg.complete) {
          onBackgroundLoad();
        }
      };
      img.onerror = () => reject(new Error(`Failed to load avatar ${index}`));
      img.src = URL.createObjectURL(avatar.blob);
      avatarImages[index] = img;
    });
  });
};

// New function to replace faces in feeling images using Gemini
export const generatePersonalizedFeelingImage = async (
  avatarBlob: Blob,
  feelingImageUrl: string,
  feelingName: string,
  options: FaceReplacementOptions = {}
): Promise<Blob> => {
  const result = await replaceFaceInImage(
    avatarBlob,
    feelingImageUrl,
    feelingName,
    options
  );

  if (!result.success || !result.blob) {
    throw new Error(
      result.error || `Failed to generate personalized ${feelingName} image`
    );
  }

  return result.blob;
};

// New function to directly generate feeling images from uploaded photo
export const generateDirectFeelingImage = async (
  uploadedImageFile: File,
  feelingImageUrl: string,
  feelingName: string,
  options: DirectFeelingGenerationOptions = {}
): Promise<Blob> => {
  const result = await generateFeelingImageDirectly(
    uploadedImageFile,
    feelingImageUrl,
    feelingName,
    options
  );

  if (!result.success || !result.blob) {
    throw new Error(
      result.error || `Failed to generate direct ${feelingName} image`
    );
  }

  return result.blob;
};
