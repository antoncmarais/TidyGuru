// Environment configuration
// Access environment variables through this centralized config

export const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || "TidyGuru",
    version: import.meta.env.VITE_APP_VERSION || "1.0.0",
  },
  upload: {
    maxFileSizeMB: Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 10,
    maxFileSize: (Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 10) * 1024 * 1024,
    maxRows: Number(import.meta.env.VITE_MAX_ROWS) || 50000,
  },
  features: {
    pdfExport: import.meta.env.VITE_ENABLE_PDF_EXPORT !== "false",
    csvExport: import.meta.env.VITE_ENABLE_CSV_EXPORT !== "false",
    keyboardShortcuts: import.meta.env.VITE_ENABLE_KEYBOARD_SHORTCUTS !== "false",
  },
  analytics: {
    id: import.meta.env.VITE_ANALYTICS_ID || null,
  },
  api: {
    url: import.meta.env.VITE_API_URL || null,
  },
} as const;

// Type-safe config access
export type Config = typeof config;
