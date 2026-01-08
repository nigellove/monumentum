import { createClient } from '@supabase/supabase-js';

// Set up test environment variables
if (!process.env.VITE_SUPABASE_URL) {
  process.env.VITE_SUPABASE_URL = process.env.SUPABASE_URL || '';
}

if (!process.env.VITE_SUPABASE_ANON_KEY) {
  process.env.VITE_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
}

// Global test utilities
export const getTestSupabaseClient = () => {
  return createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!
  );
};

// Helper to generate unique test IDs
export const generateTestId = (prefix: string) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};

// Cleanup helper
export const cleanupTestData = async (tableName: string, field: string, value: string) => {
  const supabase = getTestSupabaseClient();
  await supabase.from(tableName).delete().eq(field, value);
};
