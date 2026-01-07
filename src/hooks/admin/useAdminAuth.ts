import { useState, useEffect } from 'react';
import { isAdmin } from '../../lib/admin/adminAuth';

/**
 * Hook to check if current user is an admin
 * @returns Object with isAdminUser flag, loading state, and checkAdmin function
 */
export function useAdminAuth() {
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      const admin = await isAdmin();
      setIsAdminUser(admin);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdminUser(false);
    } finally {
      setLoading(false);
    }
  }

  return { isAdminUser, loading, checkAdmin };
}
