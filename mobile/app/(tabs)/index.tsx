import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';

type LiveBus = {
  bus_id: string;
  bus_number: string;
  vehicle_registration: string;
  route_name: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  updated_at: string;
};

const LOCATION_MAX_AGE_MS = 2 * 60 * 1000;

export default function LiveMapTrackingTab() {
  const [buses, setBuses] = useState<LiveBus[]>([]);
  const [selectedBus, setSelectedBus] = useState<LiveBus | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const mapRef = useRef<MapView>(null);

  const refreshLocations = useCallback(async () => {
    const { data, error } = await supabase
      .from('conductor_bus_locations')
      .select('bus_id, bus_number, vehicle_registration, route_name, latitude, longitude, accuracy_meters, updated_at')
      .order('updated_at', { ascending: false });
    if (error) {
      setBuses([]);
      setSelectedBus(null);
      setLoadError(error.message);
      setLoading(false);
      return;
    }

    setLoadError('');
    const cutoff = Date.now() - LOCATION_MAX_AGE_MS;
    const active = ((data ?? []) as LiveBus[]).filter((bus) => new Date(bus.updated_at).getTime() >= cutoff);
    setBuses(active);
    setSelectedBus((current) => active.find((bus) => bus.bus_id === current?.bus_id) ?? active[0] ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refreshLocations();
    const timer = setInterval(() => void refreshLocations(), 8000);
    return () => clearInterval(timer);
  }, [refreshLocations]);

  useEffect(() => {
    if (!selectedBus) return;
    const region: Region = {
      latitude: selectedBus.latitude,
      longitude: selectedBus.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
    mapRef.current?.animateToRegion(region, 700);
  }, [selectedBus?.bus_id, selectedBus?.latitude, selectedBus?.longitude]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.headerOverlay}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#64748B" />
            <Text style={styles.searchText}>Live conductor GPS • {buses.length} {buses.length === 1 ? 'bus' : 'buses'}</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => router.push('/conductor')} accessibilityLabel="Open conductor GPS profile">
            <Ionicons name="navigate-outline" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Transit Advisory Alert Banner */}
        <View style={styles.advisoryBanner}>
          <Ionicons name="radio-outline" size={16} color="#0D9488" />
          <Text style={styles.advisoryText}>
            Map positions are shared by conductors who enabled GPS. Stale positions are automatically hidden.
          </Text>
        </View>

        {/* Map Display */}
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 6.8893,
            longitude: 79.8550,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {buses.map((bus) => (
            <Marker
              key={bus.bus_id}
              coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
              title={`Bus ${bus.bus_number} • ${bus.vehicle_registration}`}
              description={`${bus.route_name} • Updated ${new Date(bus.updated_at).toLocaleTimeString()}`}
              pinColor="#0D9488"
              onPress={() => setSelectedBus(bus)}
            />
          ))}
        </MapView>

        {loading && <View style={styles.emptyCard}><ActivityIndicator color="#002060" /><Text style={styles.emptyTitle}>Loading shared bus locations…</Text></View>}
        {!loading && buses.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name={loadError ? 'cloud-offline-outline' : 'bus-outline'} size={24} color={loadError ? '#B91C1C' : '#64748B'} />
            <Text style={styles.emptyTitle}>{loadError ? 'Could not load live locations' : 'No buses are sharing GPS right now'}</Text>
            <Text style={styles.emptySub}>{loadError || 'A conductor can register an assigned bus and switch GPS on.'}</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/conductor')}>
              <Text style={styles.emptyButtonText}>{loadError ? 'Check GPS setup' : 'Open conductor profile'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Selected Bus Card Bottom Overlay */}
        {selectedBus && <View style={styles.busCard}>
          <View style={styles.cardHeader}>
            <View style={styles.busBadgeBox}>
              <Text style={styles.busBadgeTag}>BUS</Text>
              <Text style={styles.busBadgeNum}>{selectedBus.bus_number}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.tagRow}>
                <View style={styles.sltbTag}><Text style={styles.sltbText}>LIVE GPS</Text></View>
                <Text style={styles.regText}>{selectedBus.vehicle_registration}</Text>
              </View>
              <Text style={styles.routeTitle}>{selectedBus.route_name}</Text>
            </View>
            <TouchableOpacity style={styles.heartBtn} onPress={() => void refreshLocations()} accessibilityLabel="Refresh live bus locations"><Ionicons name="refresh" size={20} color="#002060" /></TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBoxBlue}>
              <Text style={styles.statLabel}>LOCATION UPDATED</Text>
              <Text style={styles.statValue}>{Math.max(0, Math.floor((Date.now() - new Date(selectedBus.updated_at).getTime()) / 1000))} <Text style={{ fontSize: 14 }}>sec ago</Text></Text>
              <Text style={styles.statSub}>{new Date(selectedBus.updated_at).toLocaleTimeString()}</Text>
            </View>
            <View style={styles.statBoxTeal}>
              <Text style={styles.statLabel}>GPS ACCURACY</Text>
              <Text style={styles.statValueTeal}>{selectedBus.accuracy_meters == null ? 'Not reported' : `±${Math.round(selectedBus.accuracy_meters)} m`}</Text>
              <Text style={styles.statSub}>From conductor’s phone</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/conductor')}>
            <Ionicons name="navigate-outline" size={18} color="#FFF" />
            <Text style={styles.primaryBtnText}>Conductor GPS profile</Text>
          </TouchableOpacity>
        </View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1 },
  map: { flex: 1 },
  headerOverlay: { position: 'absolute', top: 40, left: 15, right: 15, zIndex: 10, flexDirection: 'row', gap: 8 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 12, height: 44, borderRadius: 10, elevation: 3, gap: 8 },
  searchText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#0F172A' },
  filterBtn: { backgroundColor: '#002060', width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  advisoryBanner: { position: 'absolute', top: 92, left: 15, right: 15, zIndex: 10, backgroundColor: '#CCFBF1', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  advisoryText: { flex: 1, fontSize: 11, color: '#115E59', lineHeight: 15 },
  emptyCard: { position: 'absolute', top: 155, left: 24, right: 24, alignItems: 'center', gap: 8, backgroundColor: '#FFF', padding: 18, borderRadius: 14, elevation: 4 },
  emptyTitle: { color: '#002060', fontWeight: '800', fontSize: 14, textAlign: 'center' },
  emptySub: { color: '#64748B', fontSize: 12, textAlign: 'center', lineHeight: 17 },
  emptyButton: { backgroundColor: '#002060', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, marginTop: 4 },
  emptyButtonText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  busCard: { position: 'absolute', bottom: 15, left: 15, right: 15, backgroundColor: '#FFF', borderRadius: 16, padding: 16, elevation: 6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  busBadgeBox: { backgroundColor: '#002060', padding: 8, borderRadius: 10, alignItems: 'center', width: 50 },
  busBadgeTag: { color: '#93C5FD', fontSize: 8, fontWeight: 'bold' },
  busBadgeNum: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sltbTag: { backgroundColor: '#CCFBF1', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sltbText: { color: '#0D9488', fontSize: 9, fontWeight: 'bold' },
  regText: { fontSize: 10, color: '#64748B' },
  routeTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginTop: 2 },
  heartBtn: { padding: 6, borderRadius: 20, backgroundColor: '#EEF2FF' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBoxBlue: { flex: 1, backgroundColor: '#EEF2FF', padding: 10, borderRadius: 10 },
  statLabel: { fontSize: 9, fontWeight: 'bold', color: '#002060' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#002060', marginVertical: 2 },
  statSub: { fontSize: 10, color: '#64748B' },
  statBoxTeal: { flex: 1, backgroundColor: '#CCFBF1', padding: 10, borderRadius: 10 },
  statValueTeal: { fontSize: 13, fontWeight: 'bold', color: '#0D9488', marginVertical: 4 },
  approachingBox: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 10, marginBottom: 12 },
  approachingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  approachingLabel: { fontSize: 9, fontWeight: 'bold', color: '#64748B' },
  timePill: { backgroundColor: '#E2E8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 9, fontWeight: 'bold', color: '#002060' },
  stopName: { fontSize: 13, fontWeight: 'bold', color: '#0F172A' },
  nextStopName: { fontSize: 11, fontWeight: '600', color: '#002060', marginTop: 2 },
  primaryBtn: { backgroundColor: '#002060', height: 44, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8 },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  btnRow: { flexDirection: 'row', gap: 8 },
  secondaryBtn: { flex: 1, backgroundColor: '#EEF2FF', height: 38, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  secondaryBtnText: { color: '#002060', fontWeight: 'bold', fontSize: 11 },
});