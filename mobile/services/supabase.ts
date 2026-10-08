import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://yjdbmnkcjiqxcpnoovhz.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZGJtbmtjamlxeGNwbm9vdmh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwNzQ1ODEsImV4cCI6MjEwNjY1MDU4MX0.MpWeX1Qc8zs8VFdu0HXLhubSDEkOLsqjYF4kpPQQeuA';

// Safe storage adapter — wraps AsyncStorage with a fallback for Expo Go / Web
const memoryStore = new Map<string, string>();
const safeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return memoryStore.get(key) ?? null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      memoryStore.set(key, value);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      memoryStore.delete(key);
    }
  },
};

// Ensure WebSocket is available for Node.js / SSR (Node < 22 running Expo Router web SSR)
class DummyWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSING = 2;
  readonly CLOSED = 3;
  readyState = 3;
  url = '';
  protocol = '';
  onopen = null;
  onclose = null;
  onerror = null;
  onmessage = null;
  close() {}
  send() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return false;
  }
}

const resolveWebSocket = () => {
  if (typeof WebSocket !== 'undefined') {
    return WebSocket;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).WebSocket) {
    return (globalThis as any).WebSocket;
  }
  try {
    // In Node.js environment, ws package is available
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('ws');
  } catch {
    return DummyWebSocket;
  }
};

const CustomWebSocket = resolveWebSocket();
if (typeof WebSocket === 'undefined') {
  try {
    (globalThis as any).WebSocket = CustomWebSocket;
  } catch {
    // Ignore if globalThis is sealed
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage,
    autoRefreshToken: typeof window !== 'undefined',
    persistSession: typeof window !== 'undefined',
    detectSessionInUrl: false,
  },
  realtime: {
    transport: CustomWebSocket,
  },
});
