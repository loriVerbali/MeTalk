// Plausible Analytics integration
declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, any> }
    ) => void;
  }
}

export const trackEvent = (event: string, props?: Record<string, any>) => {
  if (typeof window !== "undefined" && window.plausible) {
    window.plausible(event, { props });
  }

  // Fallback console logging for development
  if (process.env.NODE_ENV === "development") {
    console.log("Analytics Event:", event, props);
  }
};

// Specific event tracking functions
export const analytics = {
  uploadStarted: () => trackEvent("upload_started"),

  uploadBlockedModeration: () => trackEvent("upload_blocked_moderation"),

  avatarCreated: (latency: number, retries: number) =>
    trackEvent("avatar_created", { ms_latency: latency, retries }),

  boardGenerated: () => trackEvent("board_generated"),

  tileTapped: (key: string, lang: string) =>
    trackEvent("tile_tapped", { key, lang }),

  languageChanged: (lang: string) => trackEvent("language_changed", { lang }),

  voiceChanged: (voiceName: string) =>
    trackEvent("voice_changed", { voiceName }),

  printCollageStarted: () => trackEvent("print_collage_started"),

  printCollageCompleted: () => trackEvent("print_collage_completed"),

  error: (code: string, stage: string) => trackEvent("error", { code, stage }),
};
