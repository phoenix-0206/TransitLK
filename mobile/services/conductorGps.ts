import * as Location from 'expo-location';
import { supabase } from './supabase';

export type TrackedBus = {
  id: string;
  bus_number: string;
  vehicle_registration: string;
  route_name: string;
};

type TrackerListener = (state: { busId: string | null; message: string; updatedAt: Date | null }) => void;

let subscription: Location.LocationSubscription | null = null;
let activeBus: TrackedBus | null = null;
let lastUpdate: Date | null = null;
let statusMessage = 'GPS is off. Your location is not being shared.';
const listeners = new Set<TrackerListener>();

function notify() {
  const state = { busId: activeBus?.id ?? null, message: statusMessage, updatedAt: lastUpdate };
  listeners.forEach((listener) => listener(state));
}

export function getConductorGpsState() {
  return { busId: activeBus?.id ?? null, message: statusMessage, updatedAt: lastUpdate };
}

export function subscribeToConductorGps(listener: TrackerListener) {
  listeners.add(listener);
  listener(getConductorGpsState());
  return () => {
    listeners.delete(listener);
  };
}

export async function startConductorGps(bus: TrackedBus) {
  if (subscription && activeBus?.id === bus.id) return;
  if (subscription) await stopConductorGps(activeBus?.id);

  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) throw new Error('Location permission is required. Allow location access in phone settings, then try again.');
  if (!(await Location.hasServicesEnabledAsync())) throw new Error('Turn on Location Services on your phone, then enable GPS here.');

  activeBus = bus;
  statusMessage = 'Waiting for a GPS fix… You can navigate to the live map while sharing stays on.';
  notify();

  try {
    subscription = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 15, timeInterval: 5000 },
      async (position) => {
        const currentBus = activeBus;
        if (!currentBus) return;

        const { error } = await supabase.from('conductor_bus_locations').upsert({
          bus_id: currentBus.id,
          bus_number: currentBus.bus_number,
          vehicle_registration: currentBus.vehicle_registration,
          route_name: currentBus.route_name,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy_meters: position.coords.accuracy,
          heading: position.coords.heading,
          speed_mps: position.coords.speed,
          updated_at: new Date(position.timestamp).toISOString(),
        }, { onConflict: 'bus_id' });

        if (error) {
          statusMessage = `GPS is on, but sharing failed: ${error.message}`;
        } else {
          lastUpdate = new Date(position.timestamp);
          statusMessage = `Sharing Bus ${currentBus.bus_number} • ${currentBus.vehicle_registration}`;
        }
        notify();
      },
      (reason) => {
        statusMessage = `GPS update issue: ${reason}`;
        notify();
      },
    );
  } catch (error) {
    activeBus = null;
    statusMessage = error instanceof Error ? error.message : 'Could not start GPS tracking.';
    notify();
    throw error;
  }
}

export async function stopConductorGps(busId?: string | null) {
  const busToStop = activeBus;
  subscription?.remove();
  subscription = null;
  activeBus = null;
  lastUpdate = null;
  statusMessage = 'GPS is off. Your location is not being shared.';
  notify();

  const id = busId ?? busToStop?.id;
  if (id) {
    const { error } = await supabase.from('conductor_bus_locations').delete().eq('bus_id', id);
    if (error) {
      statusMessage = `GPS stopped, but clearing its last map position failed: ${error.message}`;
      notify();
    }
  }
}
