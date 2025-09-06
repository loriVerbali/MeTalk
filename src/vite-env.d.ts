/// <reference types="vite/client" />

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechUtterance: typeof SpeechSynthesisUtterance;
  }

  var SpeechUtterance: {
    prototype: SpeechSynthesisUtterance;
    new (text?: string): SpeechSynthesisUtterance;
  };
}
