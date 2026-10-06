import { supabase } from './supabase';

const LOCATION_MAX_AGE_MS = 2 * 60 * 1000;

export type LiveBusLocation = {
  bus_id: string;
  bus_number: string;
  vehicle_registration: string | null;
  route_name: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  updated_at: string;
  eta_minutes: number | null;
  crowding_level: string | null;
  source: 'admin' | 'conductor';
};

type AdminBusLocation = {
  id: string;
  bus_number: string;
  route_name: string;
  latitude: number;
  longitude: number;
  eta_minutes: number | null;
  crowding_level: string | null;
  last_updated: string;
};

type ConductorBusLocation = Omit<LiveBusLocation, 'eta_minutes' | 'crowding_level' | 'source'>;

export async function fetchLiveBusLocations(): Promise<{
  buses: LiveBusLocation[];
  error: string | null;
}> {
  const [adminResult, conductorResult] = await Promise.all([
    supabase
      .from('bus_locations')
      .select('id, bus_number, route_name, latitude, longitude, eta_minutes, crowding_level, last_updated')
      .order('last_updated', { ascending: false }),
    supabase
      .from('conductor_bus_locations')
      .select('bus_id, bus_number, vehicle_registration, route_name, latitude, longitude, accuracy_meters, updated_at')
      .order('updated_at', { ascending: false }),
  ]);

  const cutoff = Date.now() - LOCATION_MAX_AGE_MS;
  const adminBuses: LiveBusLocation[] = ((adminResult.data ?? []) as AdminBusLocation[]).map((bus) => ({
    bus_id: `admin:${bus.id}`,
    bus_number: bus.bus_number,
    vehicle_registration: null,
    route_name: bus.route_name,
    latitude: bus.latitude,
    longitude: bus.longitude,
    accuracy_meters: null,
    updated_at: bus.last_updated,
    eta_minutes: bus.eta_minutes,
    crowding_level: bus.crowding_level,
    source: 'admin',
  }));
  const conductorBuses: LiveBusLocation[] = ((conductorResult.data ?? []) as ConductorBusLocation[])
    .filter((bus) => new Date(bus.updated_at).getTime() >= cutoff)
    .map((bus) => ({ ...bus, bus_id: `conductor:${bus.bus_id}`, eta_minutes: null, crowding_level: null, source: 'conductor' }));

  const buses = [...adminBuses, ...conductorBuses].sort(
    (first, second) => new Date(second.updated_at).getTime() - new Date(first.updated_at).getTime()
  );
  const errors = [adminResult.error, conductorResult.error]
    .filter((error) => error !== null)
    .map((error) => error.message);

  return { buses, error: errors.length > 0 ? errors.join(' • ') : null };
}