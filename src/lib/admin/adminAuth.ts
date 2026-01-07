import { supabase } from '../supabase';

/**
 * Check if the current user is an admin
 * @returns true if user has admin flag, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  return user.user_metadata?.is_admin === true;
}

/**
 * Throw an error if the current user is not an admin
 * @throws Error if user is not an admin
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
}
