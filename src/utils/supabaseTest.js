/**
 * Supabase Connection Tester
 * Use this to verify Supabase is wired correctly on Render
 */

export async function testSupabaseConnection() {
  const apiBase = import.meta.env.VITE_API_BASE;

  if (!apiBase) {
    return {
      status: "error",
      message: "VITE_API_BASE not configured",
    };
  }

  try {
    const response = await fetch(`${apiBase}/api/health/supabase`);
    const data = await response.json();

    return {
      status: data.status,
      message: data.message,
      supabase: data.supabase,
      error: data.error,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: "error",
      message: "Failed to reach backend",
      error: err.message,
      apiBase,
    };
  }
}

/**
 * Example usage:
 * 
 * import { testSupabaseConnection } from './utils/supabaseTest';
 * 
 * async function checkConnection() {
 *   const result = await testSupabaseConnection();
 *   console.log('Supabase test:', result);
 * }
 */
