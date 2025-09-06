import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINIKEY;

if (!API_KEY) {
  console.warn("VITE_GEMINIKEY not found in environment variables");
}

const genAI = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export interface AvatarGenerationOptions {
  maxRetries?: number;
  safetySettings?: any[];
}

export interface AvatarGenerationResult {
  success: boolean;
  blob?: Blob;
  error?: string;
  retries?: number;
}

// Safety settings removed - handled by the new API automatically

export interface FaceReplacementOptions {
  maxRetries?: number;
}

export interface FaceReplacementResult {
  success: boolean;
  blob?: Blob;
  error?: string;
  retries?: number;
}

export interface DirectFeelingGenerationOptions {
  maxRetries?: number;
}

export interface DirectFeelingGenerationResult {
  success: boolean;
  blob?: Blob;
  error?: string;
  retries?: number;
}

// Function to replace faces in feeling images with the user's avatar face
export const replaceFaceInImage = async (
  avatarBlob: Blob,
  feelingImageUrl: string,
  feelingName: string,
  options: FaceReplacementOptions = {}
): Promise<FaceReplacementResult> => {
  const { maxRetries = 2 } = options;

  if (!genAI) {
    return {
      success: false,
      error: "Gemini API not configured. Please check your API key.",
    };
  }

  const startTime = Date.now();
  let lastError: string = "";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Use the image generation model
      const model = "gemini-2.5-flash-image-preview";

      // Create prompt for face replacement
      const prompt = `Replace the face in this feeling/emotion image with the cartoon avatar face from the reference image. Keep the same pose, expression, clothing, background, and overall composition. The person should look ${feelingName}. Maintain the same artistic style and colors. Return only the modified image with the face replaced.`;

      // Convert avatar to base64
      const avatarArrayBuffer = await avatarBlob.arrayBuffer();
      const avatarBytes = new Uint8Array(avatarArrayBuffer);
      let avatarBinary = "";
      for (let i = 0; i < avatarBytes.byteLength; i++) {
        avatarBinary += String.fromCharCode(avatarBytes[i]);
      }
      const avatarBase64 = btoa(avatarBinary);

      // Load and convert feeling image to base64
      const feelingImageResponse = await fetch(feelingImageUrl);
      const feelingImageBlob = await feelingImageResponse.blob();
      const feelingArrayBuffer = await feelingImageBlob.arrayBuffer();
      const feelingBytes = new Uint8Array(feelingArrayBuffer);
      let feelingBinary = "";
      for (let i = 0; i < feelingBytes.byteLength; i++) {
        feelingBinary += String.fromCharCode(feelingBytes[i]);
      }
      const feelingBase64 = btoa(feelingBinary);

      // Log what we're sending to Gemini
      const requestPayload = {
        model: model,
        contents: [
          { text: "Reference avatar face:" },
          {
            inlineData: {
              data: `[${avatarBase64.length} chars]`, // Don't log full base64
              mimeType: avatarBlob.type,
            },
          },
          { text: prompt },
          {
            inlineData: {
              data: `[${feelingBase64.length} chars]`, // Don't log full base64
              mimeType: feelingImageBlob.type,
            },
          },
        ],
      };

      console.log(`📤 SENDING TO GEMINI for ${feelingName}:`, requestPayload);
      console.log(
        `📊 Avatar blob size: ${avatarBlob.size}, type: ${avatarBlob.type}`
      );
      console.log(
        `📊 Feeling image blob size: ${feelingImageBlob.size}, type: ${feelingImageBlob.type}`
      );
      console.log(`📝 Prompt: "${prompt}"`);

      // Use the new API format with both images
      const response = await genAI.models.generateContent({
        model: model,
        contents: [
          { text: "Reference avatar face:" },
          {
            inlineData: {
              data: avatarBase64,
              mimeType: avatarBlob.type,
            },
          },
          { text: prompt },
          {
            inlineData: {
              data: feelingBase64,
              mimeType: feelingImageBlob.type,
            },
          },
        ],
      });

      // Debug: Log the complete response structure
      console.log(`🤖 GEMINI COMPLETE RESPONSE for ${feelingName}:`, response);
      console.log(`📊 Response structure for ${feelingName}:`, {
        candidates: response.candidates?.length,
        firstCandidate: response.candidates?.[0],
        content: response.candidates?.[0]?.content,
        parts: response.candidates?.[0]?.content?.parts,
        partsLength: response.candidates?.[0]?.content?.parts?.length,
      });

      // Log each part in detail
      if (response.candidates?.[0]?.content?.parts) {
        response.candidates[0].content.parts.forEach((part, index) => {
          console.log(`📝 Part ${index} for ${feelingName}:`, part);
          console.log(`🔑 Part ${index} keys:`, Object.keys(part));
          if (part.text) {
            console.log(`📄 Part ${index} text:`, part.text);
          }
          if (part.inlineData) {
            console.log(`🖼️ Part ${index} inlineData:`, {
              mimeType: part.inlineData.mimeType,
              dataLength: part.inlineData.data?.length,
              dataPreview: part.inlineData.data?.substring(0, 50) + "...",
            });
          }
        });
      }

      // Look for image data in response parts
      let imageData = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageData = part.inlineData;
            break;
          }
        }
      }

      if (!imageData) {
        console.error(`❌ NO IMAGE DATA FOUND for ${feelingName}`);
        console.error(
          `🔍 Available parts:`,
          response.candidates?.[0]?.content?.parts?.map((part) =>
            Object.keys(part)
          )
        );
        throw new Error(
          `No image data received from Gemini for ${feelingName} face replacement`
        );
      }

      console.log(`✅ FOUND IMAGE DATA for ${feelingName}:`, {
        mimeType: imageData.mimeType,
        dataLength: imageData.data?.length,
        dataPreview: imageData.data?.substring(0, 50) + "...",
      });

      // Convert base64 to blob
      if (!imageData.data) {
        throw new Error("Image data is missing from Gemini response");
      }
      const binaryString = atob(imageData.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "image/png" });

      // Debug: Log successful generation
      console.log(
        `✅ Successfully generated personalized ${feelingName} image:`,
        {
          blobSize: blob.size,
          blobType: blob.type,
          retries: attempt,
        }
      );

      return {
        success: true,
        blob,
        retries: attempt,
      };
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.warn(
        `Face replacement attempt ${attempt + 1} failed for ${feelingName}:`,
        lastError
      );

      // If this was the last attempt, return the error
      if (attempt === maxRetries) {
        return {
          success: false,
          error: lastError,
          retries: attempt,
        };
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return {
    success: false,
    error: lastError,
    retries: maxRetries,
  };
};

// Function to directly generate feeling images from uploaded photo
export const generateFeelingImageDirectly = async (
  uploadedImageFile: File,
  feelingImageUrl: string,
  feelingName: string,
  options: DirectFeelingGenerationOptions = {}
): Promise<DirectFeelingGenerationResult> => {
  const { maxRetries = 2 } = options;

  if (!genAI) {
    return {
      success: false,
      error: "Gemini API not configured. Please check your API key.",
    };
  }

  const startTime = Date.now();
  let lastError: string = "";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Use the image generation model
      const model = "gemini-2.5-flash-image-preview";

      // Create polished prompt for direct feeling image generation
      const prompt = `Convert this uploaded image into something that depicts the feeling "${feelingName}". 
      
      The output should be a cartoon style image. First convert the original image to a cartoon if needed, then modify it to express the specific feeling.
      
      Use the cartoon reference image attached as a style guide for the feeling expression, pose, and overall composition. The person should clearly look ${feelingName}. 
      
      Maintain a friendly, child-appropriate cartoon style with:
      - Clear emotional expression matching the feeling
      - Vibrant, engaging colors
      - Simple, clean composition
      - Age-appropriate content
      
      Return only the final cartoon image showing the feeling.`;

      // Convert uploaded image to base64
      const uploadedArrayBuffer = await uploadedImageFile.arrayBuffer();
      const uploadedBytes = new Uint8Array(uploadedArrayBuffer);
      let uploadedBinary = "";
      for (let i = 0; i < uploadedBytes.byteLength; i++) {
        uploadedBinary += String.fromCharCode(uploadedBytes[i]);
      }
      const uploadedBase64 = btoa(uploadedBinary);

      // Load and convert feeling reference image to base64
      const feelingImageResponse = await fetch(feelingImageUrl);
      const feelingImageBlob = await feelingImageResponse.blob();
      const feelingArrayBuffer = await feelingImageBlob.arrayBuffer();
      const feelingBytes = new Uint8Array(feelingArrayBuffer);
      let feelingBinary = "";
      for (let i = 0; i < feelingBytes.byteLength; i++) {
        feelingBinary += String.fromCharCode(feelingBytes[i]);
      }
      const feelingBase64 = btoa(feelingBinary);

      // Log what we're sending to Gemini
      console.log(`📤 DIRECT FEELING GENERATION for ${feelingName}:`, {
        model: model,
        uploadedImageSize: uploadedImageFile.size,
        uploadedImageType: uploadedImageFile.type,
        feelingImageSize: feelingImageBlob.size,
        feelingImageType: feelingImageBlob.type,
      });
      console.log(`📝 Prompt: "${prompt}"`);

      // Use the new API format with both images
      const response = await genAI.models.generateContent({
        model: model,
        contents: [
          { text: "Original uploaded image:" },
          {
            inlineData: {
              data: uploadedBase64,
              mimeType: uploadedImageFile.type,
            },
          },
          { text: prompt },
          { text: "Reference cartoon feeling image for style:" },
          {
            inlineData: {
              data: feelingBase64,
              mimeType: feelingImageBlob.type,
            },
          },
        ],
      });

      // Debug: Log the complete response structure
      console.log(
        `🤖 DIRECT FEELING GENERATION RESPONSE for ${feelingName}:`,
        response
      );
      console.log(`📊 Response structure for ${feelingName}:`, {
        candidates: response.candidates?.length,
        firstCandidate: response.candidates?.[0],
        content: response.candidates?.[0]?.content,
        parts: response.candidates?.[0]?.content?.parts,
        partsLength: response.candidates?.[0]?.content?.parts?.length,
      });

      // Look for image data in response parts
      let imageData = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageData = part.inlineData;
            break;
          }
        }
      }

      if (!imageData) {
        console.error(
          `❌ NO IMAGE DATA FOUND for ${feelingName} direct generation`
        );
        console.error(
          `🔍 Available parts:`,
          response.candidates?.[0]?.content?.parts?.map((part) =>
            Object.keys(part)
          )
        );
        throw new Error(
          `No image data received from Gemini for ${feelingName} direct feeling generation`
        );
      }

      console.log(`✅ FOUND IMAGE DATA for ${feelingName} direct generation:`, {
        mimeType: imageData.mimeType,
        dataLength: imageData.data?.length,
        dataPreview: imageData.data?.substring(0, 50) + "...",
      });

      // Convert base64 to blob
      if (!imageData.data) {
        throw new Error("Image data is missing from Gemini response");
      }
      const binaryString = atob(imageData.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "image/png" });

      // Debug: Log successful generation
      console.log(`✅ Successfully generated direct ${feelingName} image:`, {
        blobSize: blob.size,
        blobType: blob.type,
        retries: attempt,
      });

      return {
        success: true,
        blob,
        retries: attempt,
      };
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.warn(
        `Direct feeling generation attempt ${
          attempt + 1
        } failed for ${feelingName}:`,
        lastError
      );

      // If this was the last attempt, return the error
      if (attempt === maxRetries) {
        return {
          success: false,
          error: lastError,
          retries: attempt,
        };
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return {
    success: false,
    error: lastError,
    retries: maxRetries,
  };
};

export const generateAvatar = async (
  imageFile: File,
  options: AvatarGenerationOptions = {}
): Promise<AvatarGenerationResult> => {
  const { maxRetries = 2 } = options;

  if (!genAI) {
    return {
      success: false,
      error: "Gemini API not configured. Please check your API key.",
    };
  }

  const startTime = Date.now();
  let lastError: string = "";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Use the image generation model
      const model = "gemini-2.5-flash-image-preview";

      // Create prompt for avatar generation from uploaded photo
      const prompt = `Create a 2D cartoon avatar from this photo. Keep face identity (hair/skin/eyes), age-appropriate, no text, transparent background, 512×512 PNG. Style: friendly, sticker-like, thick outline, high contrast, child-safe. Return only the image.`;

      // Convert file to base64
      const arrayBuffer = await imageFile.arrayBuffer();
      const inputBytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < inputBytes.byteLength; i++) {
        binary += String.fromCharCode(inputBytes[i]);
      }
      const base64 = btoa(binary);

      // Use the new API format - contents should be the prompt array directly
      const response = await genAI.models.generateContent({
        model: model,
        contents: [
          { text: prompt },
          {
            inlineData: {
              data: base64,
              mimeType: imageFile.type,
            },
          },
        ],
      });

      // Debug: Log the complete avatar generation response
      console.log("🤖 GEMINI AVATAR GENERATION COMPLETE RESPONSE:", response);
      console.log("📊 Avatar generation response structure:", {
        candidates: response.candidates?.length,
        firstCandidate: response.candidates?.[0],
        content: response.candidates?.[0]?.content,
        parts: response.candidates?.[0]?.content?.parts,
        partsLength: response.candidates?.[0]?.content?.parts?.length,
      });

      // Log each part in detail for avatar generation
      if (response.candidates?.[0]?.content?.parts) {
        response.candidates[0].content.parts.forEach((part, index) => {
          console.log(`📝 Avatar Part ${index}:`, part);
          console.log(`🔑 Avatar Part ${index} keys:`, Object.keys(part));
          if (part.text) {
            console.log(`📄 Avatar Part ${index} text:`, part.text);
          }
          if (part.inlineData) {
            console.log(`🖼️ Avatar Part ${index} inlineData:`, {
              mimeType: part.inlineData.mimeType,
              dataLength: part.inlineData.data?.length,
              dataPreview: part.inlineData.data?.substring(0, 50) + "...",
            });
          }
        });
      }

      // Look for image data in response parts
      let imageData = null;
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageData = part.inlineData;
            break;
          }
        }
      }

      if (!imageData) {
        // More detailed error message
        const errorDetails = {
          hasCandidates: !!response.candidates?.length,
          hasContent: !!response.candidates?.[0]?.content,
          hasParts: !!response.candidates?.[0]?.content?.parts?.length,
          parts: response.candidates?.[0]?.content?.parts?.map((part) =>
            Object.keys(part)
          ),
          response: response,
        };
        console.error("Gemini response structure:", errorDetails);
        throw new Error(
          `No image data received from Gemini. Response structure: ${JSON.stringify(
            errorDetails,
            null,
            2
          )}`
        );
      }

      // Convert base64 to blob
      if (!imageData.data) {
        throw new Error("Image data is missing from Gemini response");
      }
      const binaryString = atob(imageData.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "image/png" });

      const latency = Date.now() - startTime;

      return {
        success: true,
        blob,
        retries: attempt,
      };
    } catch (error) {
      lastError =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.warn(
        `Avatar generation attempt ${attempt + 1} failed:`,
        lastError
      );

      // If this was the last attempt, return the error
      if (attempt === maxRetries) {
        return {
          success: false,
          error: lastError,
          retries: attempt,
        };
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }

  return {
    success: false,
    error: lastError || "Maximum retries exceeded",
    retries: maxRetries,
  };
};

// Check if Gemini is available
export const isGeminiAvailable = (): boolean => {
  return !!genAI;
};
