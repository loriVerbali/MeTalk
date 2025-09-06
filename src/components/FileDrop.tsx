import React, { useCallback, useState } from "react";

interface FileDropProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
}

const FileDrop: React.FC<FileDropProps> = ({
  onFileSelect,
  disabled = false,
  acceptedTypes = ["image/*"],
  maxSize = 5 * 1024 * 1024, // 5MB
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      const validationError = validateFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect, validateFile]
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
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
      // Clear the input value so the same file can be selected again
      e.target.value = "";
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
        onClick={() =>
          !disabled && document.getElementById("file-input")?.click()
        }
      >
        <input
          id="file-input"
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-md">
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
