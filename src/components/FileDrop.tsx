import React, { useCallback, useState, useRef } from "react";

interface FileDropProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  onProcessingComplete?: () => void;
}

const FileDrop: React.FC<FileDropProps> = ({
  onFileSelect,
  disabled = false,
  acceptedTypes = ["image/*"],
  maxSize = 5 * 1024 * 1024, // 5MB
  onProcessingComplete,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      const isValidType = acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isValidType) {
        return "Please upload an image file (JPG, PNG, etc.)";
      }

      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        return `File size must be less than ${maxSizeMB}MB`;
      }

      return null;
    },
    [acceptedTypes, maxSize]
  );

  const handleFile = useCallback(
    (file: File) => {
      console.log(
        "FileDrop: handleFile called with:",
        file.name,
        "isProcessing:",
        isProcessing
      );
      if (isProcessing) {
        console.log("FileDrop: already processing, returning early");
        return; // Prevent multiple simultaneous processing
      }

      console.log("FileDrop: starting file processing");
      setError(null);
      setIsProcessing(true);

      try {
        console.log("FileDrop: validating file");
        const validationError = validateFile(file);

        if (validationError) {
          console.log("FileDrop: validation failed:", validationError);
          setError(validationError);
          setIsProcessing(false);
          return;
        }

        console.log("FileDrop: validation passed, calling onFileSelect");
        onFileSelect(file);
        // Reset processing state after a delay to allow parent to handle the file
        setTimeout(() => {
          console.log("FileDrop: resetting processing state");
          setIsProcessing(false);
          onProcessingComplete?.();
        }, 100);
      } catch (error) {
        console.error("FileDrop: Error handling file:", error);
        setError("An error occurred while processing the file");
        setIsProcessing(false);
      }
    },
    [onFileSelect, validateFile, isProcessing, onProcessingComplete]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log("FileDrop: handleFileInput called");
      const files = e.target.files;
      console.log("FileDrop: files from input:", files);
      if (files && files.length > 0) {
        console.log("FileDrop: processing file:", files[0].name);
        handleFile(files[0]);
      } else {
        console.log("FileDrop: no files selected");
      }
      // Clear the input value so the same file can be selected again
      // Use setTimeout to avoid interfering with the file selection process
      setTimeout(() => {
        console.log("FileDrop: clearing input value");
        e.target.value = "";
      }, 0);
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-xl text-center transition-all
          ${isDragOver ? "border-primary bg-primary/10" : "border-border"}
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-primary/50"
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          id="file-input"
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          disabled={disabled}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: "pointer",
            zIndex: 1,
          }}
        />

        <div className="flex flex-col items-center gap-md relative z-10 pointer-events-none">
          <div className="text-4xl">{isDragOver ? "📁" : "📸"}</div>

          <div>
            <p className="text-lg font-semibold mb-sm">
              {isDragOver ? "Drop your photo here" : "Upload a photo"}
            </p>
            <p className="text-sm text-text-secondary">
              Drag and drop or click to select
            </p>
            <p className="text-xs text-text-secondary mt-sm">
              JPG, PNG up to 5MB • One face only
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-md p-sm text-sm text-error bg-error/10 border border-error/20 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileDrop;
