/// <reference types="vite/client" />

const IS_DEBUG = import.meta.env.DEV;

export const logger = {
  error: (...args: unknown[]) => {
    if (IS_DEBUG) {
      console.error(...args);
    }
  },
};
