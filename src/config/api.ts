// API Configuration
// Centralizes all API URLs to use environment variables

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

if (!SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL is not defined in environment variables');
}

export const API_CONFIG = {
  // Base Supabase URL
  supabaseUrl: SUPABASE_URL,

  // Storage URL for file access
  storageUrl: `${SUPABASE_URL}/storage/v1/object/`,

  // Functions URL for edge functions
  functionsUrl: `${SUPABASE_URL}/functions/v1`,

  // REST API URL
  restUrl: `${SUPABASE_URL}/rest/v1`,
} as const;

// Export individual endpoints for convenience
export const ENDPOINTS = {
  contactForm: `${API_CONFIG.functionsUrl}/contact-form`,
  agent: `${API_CONFIG.functionsUrl}/agent`,
} as const;
