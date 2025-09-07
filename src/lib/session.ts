// Session management for MeTalk demo
// Uses sessionStorage to persist data only for the current session

const SESSION_KEYS = {
  AVATARS_CREATED: "metalk_avatars_created",
  LAST_GENERATION_TIME: "metalk_last_generation_time",
  SESSION_START: "metalk_session_start",
} as const;

const SESSION_LIMITS = {
  COOLDOWN_MS: 5000, // 5 seconds between generations
} as const;

// Initialize session
export const initSession = (): void => {
  const sessionStart = sessionStorage.getItem(SESSION_KEYS.SESSION_START);
  if (!sessionStart) {
    sessionStorage.setItem(SESSION_KEYS.SESSION_START, Date.now().toString());
  }
};

// Get number of avatars created in this session
export const getAvatarsCreated = (): number => {
  const count = sessionStorage.getItem(SESSION_KEYS.AVATARS_CREATED);
  return count ? parseInt(count, 10) : 0;
};

// Increment avatar count
export const incrementAvatarsCreated = (): number => {
  const current = getAvatarsCreated();
  const newCount = current + 1;
  sessionStorage.setItem(SESSION_KEYS.AVATARS_CREATED, newCount.toString());
  return newCount;
};

// Check if user can create another avatar (only checks cooldown, no session limit)
export const canCreateAvatar = (): { allowed: boolean; reason?: string } => {
  const lastGeneration = sessionStorage.getItem(
    SESSION_KEYS.LAST_GENERATION_TIME
  );
  if (lastGeneration) {
    const timeSinceLastGeneration = Date.now() - parseInt(lastGeneration, 10);
    if (timeSinceLastGeneration < SESSION_LIMITS.COOLDOWN_MS) {
      const remainingTime = Math.ceil(
        (SESSION_LIMITS.COOLDOWN_MS - timeSinceLastGeneration) / 1000
      );
      return {
        allowed: false,
        reason: `Please wait ${remainingTime} more seconds before creating another avatar.`,
      };
    }
  }

  return { allowed: true };
};

// Record avatar generation time
export const recordAvatarGeneration = (): void => {
  sessionStorage.setItem(
    SESSION_KEYS.LAST_GENERATION_TIME,
    Date.now().toString()
  );
};

// Get session info
export const getSessionInfo = () => {
  const sessionStart = sessionStorage.getItem(SESSION_KEYS.SESSION_START);
  const avatarsCreated = getAvatarsCreated();
  const lastGeneration = sessionStorage.getItem(
    SESSION_KEYS.LAST_GENERATION_TIME
  );

  return {
    sessionStart: sessionStart ? new Date(parseInt(sessionStart, 10)) : null,
    avatarsCreated,
    lastGeneration: lastGeneration
      ? new Date(parseInt(lastGeneration, 10))
      : null,
    canCreateAvatar: canCreateAvatar(),
  };
};

// Clear session data
export const clearSession = (): void => {
  Object.values(SESSION_KEYS).forEach((key) => {
    sessionStorage.removeItem(key);
  });
};

// Reset avatar count (for testing)
export const resetAvatarCount = (): void => {
  sessionStorage.removeItem(SESSION_KEYS.AVATARS_CREATED);
  sessionStorage.removeItem(SESSION_KEYS.LAST_GENERATION_TIME);
};

// Check if session is new (less than 5 minutes old)
export const isNewSession = (): boolean => {
  const sessionStart = sessionStorage.getItem(SESSION_KEYS.SESSION_START);
  if (!sessionStart) return true;

  const sessionAge = Date.now() - parseInt(sessionStart, 10);
  return sessionAge < 5 * 60 * 1000; // 5 minutes
};
