// ─────────────────────────────────────────────────────
// TransitLK — Shared TypeScript types for Supabase tables
// ─────────────────────────────────────────────────────

/** Row from the `profiles` table */
export interface Profile {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  role: string;
  pass_category: string | null;
  created_at: string;
  updated_at: string;
}

/** Row from the `bus_locations` table */
export interface BusLocation {
  id: string;
  bus_number: string;
  route_name: string;
  latitude: number;
  longitude: number;
  eta_minutes: number;
  crowding_level: 'Low' | 'Medium' | 'High';
  last_updated: string;
}

/** Row from the `bus_schedules` table */
export interface BusSchedule {
  id: string;
  route_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string | null;
  frequency: string | null;
  bus_type: string;
  is_active: boolean;
  created_at: string;
}

/** Row from the `saved_routes` table */
export interface SavedRoute {
  id: string;
  user_id: string;
  route_number: string;
  origin: string | null;
  destination: string | null;
  created_at: string;
}
