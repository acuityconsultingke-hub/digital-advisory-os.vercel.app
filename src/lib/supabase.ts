import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Initialize the client only if configured
const client = isConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

/**
 * Export a proxy that throws a descriptive error only when accessed.
 * This prevents the app from crashing on startup if environment variables are missing.
 */
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (!isConfigured) {
      // We log to console to help developers, but don't throw at module load
      console.warn('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
      
      // Return a dummy object for common properties to avoid immediate crashes in some cases
      // but throw when actual methods are called.
      if (prop === 'auth') {
        return new Proxy({}, {
          get(_, authProp) {
            return () => {
              throw new Error('Supabase Auth is not configured. Missing environment variables.');
            };
          }
        });
      }
      
      if (prop === 'from' || prop === 'channel') {
        return () => ({
          select: () => ({ order: () => ({}) }),
          on: () => ({ subscribe: () => ({}) }),
          upsert: () => ({}),
          eq: () => ({ single: () => ({}) }),
        });
      }

      throw new Error(
        `Supabase is not configured. Cannot access property "${String(prop)}". ` +
        'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.'
      );
    }
    return (client as any)[prop];
  }
});
