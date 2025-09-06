import React, { useState, useRef } from "react";
import type { TileSpec, Lang } from "../types";
import {
  speak,
  isSpeechSynthesisSupported,
  initializeSpeechSynthesis,
} from "../lib/tts";
import { analytics } from "../lib/analytics";

interface TileProps {
  tile: TileSpec;
  language: Lang;
  composedImageUrl?: string;
  disabled?: boolean;
}

const Tile: React.FC<TileProps> = ({
  tile,
  language,
  composedImageUrl,
  disabled = false,
}) => {
  // Debug: Log what image URL this tile is receiving
  console.log(`🖼️ Tile ${tile.key} - composedImageUrl:`, composedImageUrl);
  console.log(`📁 Tile ${tile.key} - original assetPath:`, tile.assetPath);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rippleActive, setRippleActive] = useState(false);
  const tileRef = useRef<HTMLButtonElement>(null);

  const handleClick = async () => {
    if (disabled || isSpeaking) return;

    // Add ripple effect immediately for better UX
    setRippleActive(true);
    setTimeout(() => setRippleActive(false), 600);

    // Track analytics regardless of speech success
    analytics.tileTapped(tile.key, language);

    // Try to speak if supported
    if (isSpeechSynthesisSupported()) {
      try {
        setIsSpeaking(true);

        // Initialize speech synthesis on first user interaction
        await initializeSpeechSynthesis();

        const text = tile.label[language];
        console.log(`🔊 Attempting to speak: "${text}" in ${language}`);
        await speak(text, language);
        console.log(`✅ Speech completed for: "${text}"`);
      } catch (error) {
        console.error("Speech synthesis failed:", error);
        // App continues to work even if speech fails
      } finally {
        setIsSpeaking(false);
      }
    } else {
      console.log(
        "Speech synthesis not supported, showing visual feedback only"
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      ref={tileRef}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || isSpeaking}
      className={`
        tile relative flex flex-col items-center p-sm rounded-lg border-2 transition-all
        ${
          isSpeaking
            ? "border-primary bg-primary/10"
            : "border-border hover:border-primary/50"
        }
        ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-surface"
        }
        ${rippleActive ? "ripple active" : "ripple"}
      `}
      style={{
        aspectRatio: "1",
        backgroundColor: tile.backgroundColor || "var(--color-surface)",
      }}
      aria-label={`${tile.label[language]} - Tap to speak`}
    >
      {/* Image */}
      <div className="flex-1 overflow-hidden rounded-t-lg">
        {composedImageUrl ? (
          <img
            src={composedImageUrl}
            alt={tile.label[language]}
            className="w-full h-full object-cover"
            style={{
              filter: isSpeaking ? "brightness(1.1)" : "none",
              transition: "filter 0.2s ease",
            }}
          />
        ) : (
          // Show original image as fallback while personalized version loads
          <img
            src={tile.assetPath}
            alt={tile.label[language]}
            className="w-full h-full object-cover opacity-50"
            style={{
              filter: isSpeaking ? "brightness(1.1)" : "none",
              transition: "filter 0.2s ease",
            }}
          />
        )}
      </div>

      {/* Label */}
      <div className="text-center p-xs bg-white">
        <span
          className={`
            text-xs sm:text-sm md:text-base font-bold break-words block
            ${isSpeaking ? "text-primary" : "text-text"}
          `}
          style={{
            color: isSpeaking ? "var(--color-primary)" : "var(--color-text)",
          }}
        >
          {tile.label[language]}
        </span>
      </div>

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      )}

      {/* Focus ring for accessibility */}
      <div className="absolute inset-0 rounded-lg pointer-events-none" />
    </button>
  );
};

export default Tile;
