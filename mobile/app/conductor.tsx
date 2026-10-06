import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../services/supabase';
import {
  startConductorGps,
  stopConductorGps,
  subscribeToConductorGps,
} from '../services/conductorGps';

type ConductorBus = {
  id: string;
  bus_number: string;
  vehicle_registration: string;
  route_name: string;
};

export default function ConductorTrackerScreen() {
  const [buses, setBuses] = useState<ConductorBus[]>([]);
  const [selectedBusId, setSelectedBusId] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [vehicleRegistration, setVehicleRegistration] = useState('');
  const [routeName, setRouteName] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingBus, setSavingBus] = useState(false);
  const [startingGps, setStartingGps] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('GPS is off. Your location is not being shared.');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const ownerIdRef = useRef<string | null>(null);

  const selectedBus = buses.find((bus) => bus.id === selectedBusId) ?? null;

  const loadBuses = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      ownerIdRef.current = null;
      setBuses([]);
      setLoading(false);
      return;
    }
    ownerIdRef.current = user.id;

    const { data, error } = await supabase
      .from('conductor_buses')
      .select('id, bus_number, vehicle_registration, route_name')
      .order('created_at', { ascending: false });
    if (error) {
      setStatusMessage(`Could not load your registered buses: ${error.message}`);
      setBuses([]);
    } else {
      const rows = (data ?? []) as ConductorBus[];
      setBuses(rows);
      setSelectedBusId((current) => current || rows[0]?.id || '');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadBuses();
  }, [loadBuses]);

  useEffect(() => subscribeToConductorGps((state) => {
    setSharing(!!state.busId);
    setLastUpdate(state.updatedAt);
    setStatusMessage(state.message);
    if (state.busId) setSelectedBusId(state.busId);
  }), []);

  const stopGps = useCallback(async () => {
    setSharing(false);
    await stopConductorGps(selectedBusId);
  }, [selectedBusId]);

  async function registerBus() {
    const number = busNumber.trim();
    const registration = vehicleRegistration.trim().toUpperCase();
    const route = routeName.trim();
    if (!number || !registration || !route) {
      setStatusMessage('Enter the bus route number, vehicle registration, and route name.');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    setSavingBus(true);
    const { data, error } = await supabase
      .from('conductor_buses')
      .insert({ bus_number: number, vehicle_registration: registration, route_name: route })
      .select('id, bus_number, vehicle_registration, route_name')
      .single();
    setSavingBus(false);
    if (error) {
      setStatusMessage(error.code === '23505' ? 'This vehicle registration is already registered to your account.' : `Could not register bus: ${error.message}`);
      return;
    }
    const bus = data as ConductorBus;
    setBuses((current) => [bus, ...current]);
    setSelectedBusId(bus.id);
    setBusNumber('');
    setVehicleRegistration('');
    setRouteName('');
    setStatusMessage('Bus registered to this conductor account. Turn on GPS when ready.');
  }

  async function startGps() {
    if (!selectedBus) {
      setStatusMessage('Register a bus and select it before enabling GPS.');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    setStartingGps(true);
    try {
      await startConductorGps(selectedBus);
    } catch (error) {
      setSharing(false);
      setStatusMessage(error instanceof Error ? error.message : 'Could not start GPS tracking.');
    } finally {
      setStartingGps(false);
    }
  }

  async function toggleGps(enabled: boolean) {
    if (enabled) await startGps();
    else await stopGps();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={20} color="#002060" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.eyebrow}>TEMPORARY CONDUCTOR PROFILE</Text>
            <Text style={styles.title}>Bus GPS Tracker</Text>
          </View>
          <Ionicons name="bus" size={25} color="#0D9488" />
        </View>

        <View style={styles.noticeCard}>
          <Ionicons name="information-circle-outline" size={20} color="#0F766E" />
          <Text style={styles.noticeText}>Register the bus assigned to you, then enable GPS. Sharing continues as you move between screens while TransitLK remains open.</Text>
        </View>

        {!ownerIdRef.current && !loading ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Sign in as a conductor</Text>
            <Text style={styles.helper}>Use your TransitLK account to register a bus and control its location sharing.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/login')}>
              <Text style={styles.primaryButtonText}>Go to login</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {loading ? <ActivityIndicator color="#002060" style={styles.loader} /> : null}

        {!!ownerIdRef.current && !loading && (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Your registered buses</Text>
              {buses.length === 0 ? (
                <Text style={styles.helper}>No buses registered on this account yet. Add your assigned bus below.</Text>
              ) : buses.map((bus) => (
                <TouchableOpacity
                  key={bus.id}
                  style={[styles.busOption, selectedBusId === bus.id && styles.busOptionSelected]}
                  onPress={() => {
                    if (sharing) void stopGps();
                    setSelectedBusId(bus.id);
                  }}
                  disabled={sharing}
                >
                  <View style={styles.busIcon}><Ionicons name="bus-outline" size={20} color="#002060" /></View>
                  <View style={styles.busInfo}>
                    <Text style={styles.busName}>Route {bus.bus_number} • {bus.vehicle_registration}</Text>
                    <Text style={styles.busRoute}>{bus.route_name}</Text>
                  </View>
                  <Ionicons name={selectedBusId === bus.id ? 'radio-button-on' : 'radio-button-off'} size={20} color="#0D9488" />
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.card, styles.gpsCard, sharing && styles.gpsCardActive]}>
              <View style={styles.gpsHeader}>
                <View style={[styles.gpsIcon, sharing && styles.gpsIconActive]}>
                  <Ionicons name="navigate" size={22} color={sharing ? '#FFF' : '#002060'} />
                </View>
                <View style={styles.gpsCopy}>
                  <Text style={styles.sectionTitle}>Share live bus location</Text>
                  <Text style={styles.helper}>{selectedBus ? `Bus ${selectedBus.bus_number} • ${selectedBus.vehicle_registration}` : 'Select a registered bus first'}</Text>
                </View>
                {startingGps ? <ActivityIndicator color="#0D9488" /> : <Switch value={sharing} onValueChange={toggleGps} disabled={!selectedBus || startingGps} trackColor={{ false: '#CBD5E1', true: '#5EEAD4' }} thumbColor={sharing ? '#0D9488' : '#F8FAFC'} />}
              </View>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, sharing && styles.statusDotActive]} />
                <Text style={styles.statusText}>{statusMessage}</Text>
              </View>
              {lastUpdate && <Text style={styles.lastUpdate}>Last location sent: {lastUpdate.toLocaleTimeString()}</Text>}
              <Text style={styles.privacyNote}>Turn GPS off to remove the bus from the live map. Leaving this screen stops updates; old positions expire from the map.</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Register an assigned bus</Text>
              <Text style={styles.label}>Route / bus number</Text>
              <TextInput style={styles.input} value={busNumber} onChangeText={setBusNumber} placeholder="e.g. 138" placeholderTextColor="#94A3B8" />
              <Text style={styles.label}>Vehicle registration</Text>
              <TextInput style={styles.input} value={vehicleRegistration} onChangeText={setVehicleRegistration} placeholder="e.g. WP-ND-8422" placeholderTextColor="#94A3B8" autoCapitalize="characters" />
              <Text style={styles.label}>Route name</Text>
              <TextInput style={styles.input} value={routeName} onChangeText={setRouteName} placeholder="e.g. Maharagama - Pettah" placeholderTextColor="#94A3B8" />
              <TouchableOpacity style={styles.primaryButton} onPress={registerBus} disabled={savingBus}>
                {savingBus ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Register bus to my account</Text>}
              </TouchableOpacity>
              <Text style={styles.privacyNote}>Temporary self-registration for testing; confirm conductor and vehicle credentials before public production use.</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F5F9' },
  container: { padding: 18, paddingBottom: 36, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center' },
  headerTitleWrap: { flex: 1 },
  eyebrow: { fontSize: 9, color: '#0D9488', fontWeight: '800', letterSpacing: 0.6 },
  title: { fontSize: 22, color: '#002060', fontWeight: '800' },
  noticeCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#CCFBF1', borderRadius: 12, padding: 12 },
  noticeText: { flex: 1, color: '#115E59', fontSize: 12, lineHeight: 18 },
  card: { backgroundColor: '#FFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  sectionTitle: { color: '#002060', fontSize: 15, fontWeight: '800' },
  helper: { color: '#64748B', fontSize: 12, lineHeight: 17 },
  loader: { marginTop: 28 },
  busOption: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, marginTop: 4 },
  busOptionSelected: { backgroundColor: '#EEF2FF', borderColor: '#002060' },
  busIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E0E7FF', borderRadius: 10 },
  busInfo: { flex: 1 },
  busName: { color: '#0F172A', fontWeight: '700', fontSize: 13 },
  busRoute: { color: '#64748B', fontSize: 11, marginTop: 2 },
  gpsCard: { borderColor: '#CBD5E1' },
  gpsCardActive: { borderColor: '#0D9488', backgroundColor: '#F0FDFA' },
  gpsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  gpsIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center' },
  gpsIconActive: { backgroundColor: '#0D9488' },
  gpsCopy: { flex: 1, gap: 3 },
  statusRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#94A3B8', marginTop: 4 },
  statusDotActive: { backgroundColor: '#0D9488' },
  statusText: { flex: 1, color: '#334155', fontSize: 12, lineHeight: 17 },
  lastUpdate: { color: '#0F766E', fontWeight: '700', fontSize: 11, marginLeft: 16 },
  privacyNote: { color: '#64748B', fontSize: 10, lineHeight: 15, marginTop: 3 },
  label: { fontSize: 11, color: '#334155', fontWeight: '700', marginTop: 4 },
  input: { minHeight: 44, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 9, paddingHorizontal: 12, color: '#0F172A', backgroundColor: '#FFF' },
  primaryButton: { backgroundColor: '#002060', minHeight: 46, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginTop: 8, paddingHorizontal: 12 },
  primaryButtonText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
});
