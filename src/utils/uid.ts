const UID_KEY = 'chess_clock_user_uid';

/**
 * Generates a simple random string for use as a UID.
 * @returns A random string.
 */
const generateUid = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Gets the user UID from localStorage, or creates and stores a new one if it doesn't exist.
 * @returns The user's UID.
 */
export const getOrCreateUserUid = (): string => {
  try {
    let uid = localStorage.getItem(UID_KEY);
    if (!uid) {
      uid = generateUid();
      localStorage.setItem(UID_KEY, uid);
    }
    return uid;
  } catch (error) {
    console.error("Error accessing localStorage for UID:", error);
    // Fallback to a temporary UID if localStorage is not available
    return 'temporary_uid';
  }
};
