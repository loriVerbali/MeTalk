// Voice diagnostics utility to help debug voice loading issues
import type { Voice } from "../types";

export interface VoiceDiagnostics {
  browserSupport: {
    hasWindow: boolean;
    hasSpeechSynthesis: boolean;
    hasSpeechUtterance: boolean;
    speechSynthesisType: string;
  };
  voiceLoading: {
    immediateVoices: number;
    voicesAfterEvent: number;
    totalVoices: number;
    filteredVoices: number;
    voiceDetails: Voice[];
  };
  timing: {
    loadStart: number;
    loadEnd: number;
    duration: number;
  };
  errors: string[];
}

export const runVoiceDiagnostics = async (): Promise<VoiceDiagnostics> => {
  const startTime = Date.now();
  const diagnostics: VoiceDiagnostics = {
    browserSupport: {
      hasWindow: typeof window !== "undefined",
      hasSpeechSynthesis: false,
      hasSpeechUtterance: false,
      speechSynthesisType: "undefined",
    },
    voiceLoading: {
      immediateVoices: 0,
      voicesAfterEvent: 0,
      totalVoices: 0,
      filteredVoices: 0,
      voiceDetails: [],
    },
    timing: {
      loadStart: startTime,
      loadEnd: 0,
      duration: 0,
    },
    errors: [],
  };

  try {
    // Check browser support
    if (typeof window !== "undefined") {
      diagnostics.browserSupport.hasSpeechSynthesis =
        "speechSynthesis" in window;
      diagnostics.browserSupport.speechSynthesisType =
        typeof window.speechSynthesis;
      // Test if SpeechUtterance can be created
      try {
        new SpeechSynthesisUtterance("");
        diagnostics.browserSupport.hasSpeechUtterance = true;
      } catch (error) {
        diagnostics.browserSupport.hasSpeechUtterance = false;
        diagnostics.errors.push(`SpeechUtterance creation failed: ${error}`);
      }
    }

    // Check immediate voice availability
    if (diagnostics.browserSupport.hasSpeechSynthesis) {
      const immediateVoices = window.speechSynthesis.getVoices();
      diagnostics.voiceLoading.immediateVoices = immediateVoices.length;
      diagnostics.voiceLoading.totalVoices = immediateVoices.length;

      // Filter voices for supported languages
      const filteredVoices = immediateVoices
        .filter((voice) => {
          const lang = voice.lang.toLowerCase();
          return (
            lang.startsWith("en") ||
            lang.startsWith("es") ||
            lang.startsWith("pt")
          );
        })
        .map((voice) => ({
          id: voice.voiceURI,
          name: voice.name,
          lang: voice.lang,
          default: voice.default || false,
        }));

      diagnostics.voiceLoading.filteredVoices = filteredVoices.length;
      diagnostics.voiceLoading.voiceDetails = filteredVoices;

      // If no voices immediately available, wait for voiceschanged event
      if (immediateVoices.length === 0) {
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            diagnostics.errors.push("Timeout waiting for voiceschanged event");
            resolve();
          }, 3000);

          const handleVoicesChanged = () => {
            clearTimeout(timeout);
            const voicesAfterEvent = window.speechSynthesis.getVoices();
            diagnostics.voiceLoading.voicesAfterEvent = voicesAfterEvent.length;
            diagnostics.voiceLoading.totalVoices = voicesAfterEvent.length;

            // Update filtered voices
            const newFilteredVoices = voicesAfterEvent
              .filter((voice) => {
                const lang = voice.lang.toLowerCase();
                return (
                  lang.startsWith("en") ||
                  lang.startsWith("es") ||
                  lang.startsWith("pt")
                );
              })
              .map((voice) => ({
                id: voice.voiceURI,
                name: voice.name,
                lang: voice.lang,
                default: voice.default || false,
              }));

            diagnostics.voiceLoading.filteredVoices = newFilteredVoices.length;
            diagnostics.voiceLoading.voiceDetails = newFilteredVoices;
            resolve();
          };

          window.speechSynthesis.addEventListener(
            "voiceschanged",
            handleVoicesChanged,
            {
              once: true,
            }
          );
        });
      }
    } else {
      diagnostics.errors.push("Speech synthesis not supported in this browser");
    }
  } catch (error) {
    diagnostics.errors.push(
      `Diagnostic error: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  const endTime = Date.now();
  diagnostics.timing.loadEnd = endTime;
  diagnostics.timing.duration = endTime - startTime;

  return diagnostics;
};

export const logVoiceDiagnostics = (diagnostics: VoiceDiagnostics): void => {
  console.group("🔊 Voice Diagnostics");

  console.group("Browser Support");
  console.log("Has Window:", diagnostics.browserSupport.hasWindow);
  console.log(
    "Has SpeechSynthesis:",
    diagnostics.browserSupport.hasSpeechSynthesis
  );
  console.log(
    "Has SpeechUtterance:",
    diagnostics.browserSupport.hasSpeechUtterance
  );
  console.log(
    "SpeechSynthesis Type:",
    diagnostics.browserSupport.speechSynthesisType
  );
  console.groupEnd();

  console.group("Voice Loading");
  console.log("Immediate Voices:", diagnostics.voiceLoading.immediateVoices);
  console.log("Voices After Event:", diagnostics.voiceLoading.voicesAfterEvent);
  console.log("Total Voices:", diagnostics.voiceLoading.totalVoices);
  console.log("Filtered Voices:", diagnostics.voiceLoading.filteredVoices);
  console.log("Voice Details:", diagnostics.voiceLoading.voiceDetails);
  console.groupEnd();

  console.group("Timing");
  console.log("Load Duration:", `${diagnostics.timing.duration}ms`);
  console.groupEnd();

  if (diagnostics.errors.length > 0) {
    console.group("Errors");
    diagnostics.errors.forEach((error, index) => {
      console.error(`Error ${index + 1}:`, error);
    });
    console.groupEnd();
  }

  console.groupEnd();
};

// Quick test function to run diagnostics and log results
export const testVoiceLoading = async (): Promise<boolean> => {
  console.log("🧪 Running voice loading diagnostics...");
  const diagnostics = await runVoiceDiagnostics();
  logVoiceDiagnostics(diagnostics);

  const hasVoices = diagnostics.voiceLoading.filteredVoices > 0;
  console.log(
    hasVoices ? "✅ Voices loaded successfully" : "❌ No voices available"
  );

  return hasVoices;
};
