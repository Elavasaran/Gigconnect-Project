const KEY_PREFIX = 'gigconnect_';

export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(KEY_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(KEY_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  remove: (key) => {
    localStorage.removeItem(KEY_PREFIX + key);
  },

  clear: () => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(KEY_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  },
};
