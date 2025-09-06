import type { Lang, Voice } from "../types";

let currentUtterance: SpeechSynthesisUtterance | null = null;

// Check if speech synthesis is available
const isBrowserSpeechAvailable = (): boolean => {
  if (typeof window === "undefined") {
    console.log("🔊 isBrowserSpeechAvailable: No window object");
    return false;
  }
  if (!("speechSynthesis" in window)) {
    console.log("🔊 isBrowserSpeechAvailable: No speechSynthesis in window");
    return false;
  }
  if (typeof window.speechSynthesis === "undefined") {
    console.log("🔊 isBrowserSpeechAvailable: speechSynthesis is undefined");
    return false;
  }

  console.log("🔊 isBrowserSpeechAvailable: Speech synthesis is available");
  // If speechSynthesis exists, assume it works (we'll handle SpeechUtterance creation in the speak function)
  return true;
};

// Predefined Google voices for each language
const GOOGLE_VOICES = {
  en: "Google US English",
  es: "Google español",
  pt: "Google português do Brasil",
} as const;

// Get the specific Google voice for a language
export const getGoogleVoiceForLang = async (
  lang: Lang
): Promise<Voice | null> => {
  return new Promise((resolve) => {
    if (!isBrowserSpeechAvailable()) {
      console.warn("🔊 getGoogleVoiceForLang: Speech synthesis not available");
      resolve(null);
      return;
    }

    const findVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const targetVoiceName = GOOGLE_VOICES[lang];

      const googleVoice = voices.find(
        (voice) => voice.name === targetVoiceName
      );

      if (googleVoice) {
        const voice: Voice = {
          id: googleVoice.voiceURI,
          name: googleVoice.name,
          lang: googleVoice.lang,
          default: googleVoice.default || false,
        };
        console.log(`🔊 Found Google voice for ${lang}:`, voice);
        resolve(voice);
      } else {
        console.warn(
          `🔊 Google voice "${targetVoiceName}" not found for ${lang}`
        );
        resolve(null);
      }
    };

    // Try immediately
    const immediateVoices = window.speechSynthesis.getVoices();
    if (immediateVoices.length > 0) {
      findVoice();
    } else {
      // Wait for voices to load
      window.speechSynthesis.addEventListener("voiceschanged", findVoice, {
        once: true,
      });

      // Fallback timeout
      setTimeout(() => {
        console.warn("🔊 getGoogleVoiceForLang: Timeout waiting for voices");
        findVoice();
      }, 2000);
    }
  });
};

// Get best voice for a language (now uses Google voices)
export const getBestVoiceForLang = async (
  lang: Lang
): Promise<Voice | null> => {
  return await getGoogleVoiceForLang(lang);
};

// Speak text
export const speak = async (text: string, lang: Lang): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isBrowserSpeechAvailable()) {
      console.warn("Speech synthesis not available:", {
        hasWindow: typeof window !== "undefined",
        hasSpeechSynthesis:
          typeof window !== "undefined" && "speechSynthesis" in window,
        speechSynthesisType:
          typeof window !== "undefined"
            ? typeof window.speechSynthesis
            : "undefined",
        hasSpeechUtterance: typeof SpeechSynthesisUtterance !== "undefined",
      });
      reject(new Error("Speech synthesis not supported"));
      return;
    }

    try {
      // Cancel any ongoing speech
      if (currentUtterance) {
        window.speechSynthesis.cancel();
      }

      // Create SpeechUtterance - try different approaches for browser compatibility
      let utterance: SpeechSynthesisUtterance;
      try {
        utterance = new SpeechSynthesisUtterance(text);
      } catch (error) {
        console.error("🔊 Failed to create SpeechUtterance:", error);
        throw new Error("Speech synthesis not supported");
      }
      currentUtterance = utterance;

      // Set language
      const langCode =
        lang === "en" ? "en-US" : lang === "es" ? "es-ES" : "pt-BR";
      utterance.lang = langCode;

      // Get the Google voice for the language
      getGoogleVoiceForLang(lang).then((googleVoice) => {
        if (googleVoice) {
          const voices = window.speechSynthesis.getVoices();
          const selectedVoice = voices.find(
            (voice) => voice.voiceURI === googleVoice.id
          );
          if (selectedVoice) {
            utterance.voice = selectedVoice;
            console.log(
              `🔊 Using Google voice: ${googleVoice.name} for ${lang}`
            );
          }
        }
      });

      // Set speech parameters
      utterance.rate = 0.8; // Slightly slower for children
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Event handlers
      utterance.onend = () => {
        currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        currentUtterance = null;
        console.error("Speech synthesis error:", event);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      // Speak
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      currentUtterance = null;
      console.error("Speech synthesis exception:", error);
      reject(error);
    }
  });
};

// Stop current speech
export const stopSpeaking = () => {
  if (isBrowserSpeechAvailable() && currentUtterance) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
};

// Check if speech synthesis is supported
export const isSpeechSynthesisSupported = (): boolean => {
  return isBrowserSpeechAvailable();
};

// Initialize speech synthesis and preload voices
export const initializeSpeechSynthesis = async (): Promise<void> => {
  if (!isBrowserSpeechAvailable()) {
    throw new Error("Speech synthesis not supported");
  }

  // Force load voices by calling getVoices()
  const voices = window.speechSynthesis.getVoices();

  if (voices.length === 0) {
    // Wait for voices to load
    return new Promise((resolve) => {
      const checkVoices = () => {
        const loadedVoices = window.speechSynthesis.getVoices();
        if (loadedVoices.length > 0) {
          resolve();
        } else {
          setTimeout(checkVoices, 100);
        }
      };

      window.speechSynthesis.addEventListener(
        "voiceschanged",
        () => {
          resolve();
        },
        { once: true }
      );

      // Fallback timeout
      setTimeout(resolve, 2000);
    });
  }
};

// Test speech synthesis with a simple utterance
export const testSpeechSynthesis = async (): Promise<boolean> => {
  if (!isBrowserSpeechAvailable()) {
    return false;
  }

  try {
    await initializeSpeechSynthesis();

    // Create test utterance
    let testUtterance: SpeechSynthesisUtterance;
    try {
      testUtterance = new SpeechSynthesisUtterance("Test");
    } catch (error) {
      console.error("🔊 Failed to create test SpeechUtterance:", error);
      return false;
    }
    testUtterance.volume = 0.1; // Very quiet test

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 1000);

      testUtterance.onend = () => {
        clearTimeout(timeout);
        resolve(true);
      };

      testUtterance.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      window.speechSynthesis.speak(testUtterance);
    });
  } catch (error) {
    console.error("Speech synthesis test failed:", error);
    return false;
  }
};

// Manual test function for browser console debugging
export const manualVoiceTest = async (): Promise<void> => {
  console.log("🧪 Manual Voice Test Starting...");

  // Test 1: Check browser support
  console.log("1. Testing browser support...");
  const isSupported = isBrowserSpeechAvailable();
  console.log(`   Browser support: ${isSupported ? "✅" : "❌"}`);

  // Test 2: Get Google voices
  console.log("2. Testing Google voice loading...");
  const enVoice = await getGoogleVoiceForLang("en");
  const esVoice = await getGoogleVoiceForLang("es");
  const ptVoice = await getGoogleVoiceForLang("pt");
  console.log(`   English voice: ${enVoice ? enVoice.name : "Not found"}`);
  console.log(`   Spanish voice: ${esVoice ? esVoice.name : "Not found"}`);
  console.log(`   Portuguese voice: ${ptVoice ? ptVoice.name : "Not found"}`);

  // Test 3: Test speech synthesis
  console.log("3. Testing speech synthesis...");
  const speechWorks = await testSpeechSynthesis();
  console.log(`   Speech synthesis: ${speechWorks ? "✅" : "❌"}`);

  // Test 4: Try speaking a word
  if (speechWorks) {
    console.log("4. Testing actual speech...");
    try {
      await speak("Hello", "en");
      console.log("   Speech test: ✅");
    } catch (error) {
      console.log("   Speech test: ❌", error);
    }
  }

  console.log("🧪 Manual Voice Test Complete!");
};

// Make manual test available globally for debugging
if (typeof window !== "undefined") {
  (window as any).manualVoiceTest = manualVoiceTest;
}
