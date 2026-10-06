import { createClient } from '@supabase/supabase-js';

// Polyfill WebSocket for Node.js SSR environments
if (typeof window === 'undefined') {
  try {
    const ws = require('ws');
    if (typeof globalThis !== 'undefined' && !(globalThis as any).WebSocket) {
      (globalThis as any).WebSocket = ws;
    }
  } catch (e) {
    // ignore
  }
}


const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder-transitlk.supabase.co';
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: typeof window !== 'undefined',
      autoRefreshToken: typeof window !== 'undefined',
    },
  }
);
