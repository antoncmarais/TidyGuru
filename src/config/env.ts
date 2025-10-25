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
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || "https://scgfirihidgzhbybzzim.supabase.co",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjZ2ZpcmloaWRnemhieWJ6emltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzODcyMTEsImV4cCI6MjA3Njk2MzIxMX0.oe-K0VdpLHi1UWCxypCrIfS8CA_tSN3swU4zl-QU0H8",
  },
  whop: {
    apiKey: import.meta.env.VITE_WHOP_API_KEY || "Q0WhMhL6t_0ikYsEv4mXXu6qVxbFcK4XXTRynmw-tOw",
    appId: import.meta.env.VITE_WHOP_APP_ID || "app_wVdyARQtud19dp",
    companyId: import.meta.env.VITE_WHOP_COMPANY_ID || "biz_2aQGHyyRc3Krt1",
    productId: import.meta.env.VITE_WHOP_PRODUCT_ID || "prod_e9FW7tzlTTPQe",
  },
} as const;

// Type-safe config access
export type Config = typeof config;
