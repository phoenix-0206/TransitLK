import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { fetchLiveBusLocations, type LiveBusLocation } from '../services/liveBusLocations';
import { supabase } from '../services/supabase';
import type { BusSchedule } from '../types/database';

export default function InteractiveRouteMapScreen() {
  const { busId, busNumber: requestedBusNumber } = useLocalSearchParams<{ busId?: string; busNumber?: string }>();
  const [liveBuses, setLiveBuses] = useState<LiveBusLocation[]>([]);
  const [selectedBusId, setSelectedBusId] = useState(busId ?? '');
  const [schedule, setSchedule] = useState<BusSchedule | null>(null);
  const mapRef = useRef<MapView>(null);
  const selectedBus = liveBuses.find((bus) => bus.bus_id === selectedBusId)
    ?? liveBuses.find((bus) => bus.bus_number === requestedBusNumber)
    ?? (busId || requestedBusNumber ? null : liveBuses[0] ?? null);

  useEffect(() => {
    if (busId) setSelectedBusId(busId);
  }, [busId]);

  useEffect(() => {
    let mounted = true;
    const loadLiveBuses = async () => {
      const { buses } = await fetchLiveBusLocations();
      if (!mounted) return;
      setLiveBuses(buses);
    };

    void loadLiveBuses();
    const timer = setInterval(() => void loadLiveBuses(), 8000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!selectedBus) {
      setSchedule(null);
      return;
    }

    let mounted = true;
    const loadSchedule = async () => {
      const { data } = await supabase
        .from('bus_schedules')
        .select('*')
        .eq('route_number', selectedBus.bus_number)
        .eq('is_active', true)
        .order('departure_time', { ascending: true })
        .limit(1)
        .returns<BusSchedule[]>();
      if (mounted) setSchedule(data?.[0] ?? null);
    };

    void loadSchedule();
    return () => { mounted = false; };
  }, [selectedBus?.bus_number]);

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

  function centerOnSelectedBus() {
    if (!selectedBus) return;
    mapRef.current?.animateToRegion({
      latitude: selectedBus.latitude,
      longitude: selectedBus.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }, 500);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Overlay */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#002060" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 8 }}>
            <View style={styles.badgeRow}>
              <View style={styles.busBadge}><Text style={styles.busBadgeText}>BUS {selectedBus?.bus_number ?? requestedBusNumber ?? '—'}</Text></View>
              <View style={styles.comfortBadge}><Text style={styles.comfortText}>{selectedBus?.source === 'admin' ? 'ADMIN LOCATION' : selectedBus?.source === 'conductor' ? 'LIVE CONDUCTOR GPS' : 'WAITING FOR LIVE BUS'}</Text></View>
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>{selectedBus?.route_name ?? 'Live bus route'}</Text>
          </View>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => selectedBus && router.push({
              pathname: '/vehicle-details',
              params: { busId: selectedBus.bus_id, busNumber: selectedBus.bus_number },
            })}
            accessibilityLabel="Open vehicle details"
            disabled={!selectedBus}
          >
            <Ionicons name="information-circle-outline" size={18} color="#002060" />
          </TouchableOpacity>
        </View>

        {/* Map Area */}
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{ latitude: 6.8893, longitude: 79.855, latitudeDelta: 0.08, longitudeDelta: 0.08 }}
        >
          {liveBuses.map((bus) => (
            <Marker
              key={bus.bus_id}
              coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
              title={`Bus ${bus.bus_number}${bus.vehicle_registration ? ` • ${bus.vehicle_registration}` : ''}`}
              description={`${bus.source === 'admin' ? 'Admin location' : 'Conductor GPS'} • ${bus.route_name} • Updated ${new Date(bus.updated_at).toLocaleTimeString()}`}
              pinColor={bus.source === 'admin' ? '#002060' : '#0D9488'}
              onPress={() => setSelectedBusId(bus.bus_id)}
            />
          ))}
        </MapView>

        {/* Route Details Bottom Sheet */}
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />

          {/* Quick Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>ESTIMATED ARRIVAL</Text>
              <Text style={styles.metricVal}>{selectedBus?.eta_minutes == null ? '—' : `${selectedBus.eta_minutes} min`}</Text>
              <Text style={styles.metricSub}>{selectedBus?.source === 'admin' ? 'Admin estimate' : 'Not reported'}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>GPS ACCURACY</Text>
              <Text style={styles.metricVal}>{selectedBus?.accuracy_meters == null ? '—' : `±${Math.round(selectedBus.accuracy_meters)} m`}</Text>
              <Text style={styles.metricSub}>{selectedBus?.vehicle_registration || 'Not reported'}</Text>
            </View>
            <TouchableOpacity
              style={styles.metricCard}
              activeOpacity={0.75}
              disabled={!selectedBus && !requestedBusNumber}
              onPress={() => {
                  const routeNumber =
                      selectedBus?.bus_number ?? requestedBusNumber;

                  if (!routeNumber) return;

                  router.push({
                    pathname: '/crowding',
                    params: { routeNumber: String(routeNumber) },
             });
          }}
            accessibilityRole="button"
            accessibilityLabel="View detailed crowding information"
          >
            <Text style={styles.metricLabel}>CROWDING</Text>

            <Text style={styles.metricVal}>
             {selectedBus?.crowding_level || '—'}
            </Text>

            <Text style={styles.metricSub}>
              Tap to view details ›
            </Text>
          </TouchableOpacity>
          </View>

          <View style={styles.crowdBar}>
            <Ionicons name={selectedBus ? 'location-outline' : 'information-circle-outline'} size={16} color="#0D9488" />
            <Text style={styles.crowdText}>{selectedBus ? `${selectedBus.source === 'admin' ? 'Admin location' : 'Conductor GPS'} • ${selectedBus.route_name}` : 'No active location for this bus.'}</Text>
          </View>

          {/* Stop Progression List */}
          <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.timelineHeader}>Stop Progression & Timings</Text>

            {schedule ? (
              <>
                <View style={styles.stopRow}>
                  <View style={styles.stopIndicator}><View style={[styles.stopDot, styles.stopDotActive]} /><View style={styles.stopLine} /></View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.stopTitle}>{schedule.origin}</Text>
                    <Text style={styles.stopSub}>Departure • {schedule.departure_time}</Text>
                  </View>
                  <Text style={styles.stopTime}>FROM</Text>
                </View>
                <View style={styles.stopRow}>
                  <View style={styles.stopIndicator}><View style={styles.stopDot} /></View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.stopTitle}>{schedule.destination}</Text>
                    <Text style={styles.stopSub}>{schedule.frequency || 'Scheduled route'}{schedule.arrival_time ? ` • Arrival ${schedule.arrival_time}` : ''}</Text>
                  </View>
                  <Text style={styles.stopTime}>TO</Text>
                </View>
              </>
            ) : (
              <View style={styles.noSchedule}>
                <Text style={styles.stopSub}>No admin timetable is available for this route yet.</Text>
              </View>
            )}
          </ScrollView>

          {/* Action Row */}
          <View style={styles.sheetActions}>
            <TouchableOpacity style={styles.trackBtn} onPress={centerOnSelectedBus} disabled={!selectedBus}>
              <Ionicons name="navigate-outline" size={18} color="#FFF" />
              <Text style={styles.trackBtnText}>{selectedBus ? 'Center on selected bus' : 'No live bus selected'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1 },
  map: { flex: 1 },
  headerOverlay: { position: 'absolute', top: 40, left: 15, right: 15, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center' },
  backBtn: { padding: 6, borderRadius: 20, backgroundColor: '#EEF2FF' },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 2 },
  busBadge: { backgroundColor: '#002060', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  busBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 9 },
  comfortBadge: { backgroundColor: '#CCFBF1', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  comfortText: { color: '#0D9488', fontWeight: 'bold', fontSize: 9 },
  headerTitle: { fontSize: 15, fontWeight: 'bold', color: '#002060' },
  iconBtn: { padding: 6, borderRadius: 20, backgroundColor: '#EEF2FF', marginLeft: 4 },
  bottomSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, elevation: 8 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  metricsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  metricCard: { flex: 1, backgroundColor: '#EEF2FF', padding: 10, borderRadius: 10 },
  metricLabel: { fontSize: 9, fontWeight: 'bold', color: '#002060' },
  metricVal: { fontSize: 18, fontWeight: 'bold', color: '#002060', marginVertical: 2 },
  metricSub: { fontSize: 9, color: '#64748B' },
  crowdBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#CCFBF1', padding: 10, borderRadius: 8, gap: 6, marginBottom: 10 },
  crowdText: { fontSize: 11, fontWeight: '600', color: '#0D9488' },
  timelineHeader: { fontSize: 13, fontWeight: 'bold', color: '#002060', marginBottom: 10 },
  stopRow: { flexDirection: 'row', marginBottom: 12 },
  stopIndicator: { alignItems: 'center', width: 16 },
  stopDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#CBD5E1' },
  stopDotActive: { backgroundColor: '#0D9488', width: 12, height: 12, borderRadius: 6 },
  stopLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginTop: 2 },
  stopTitle: { fontSize: 12, fontWeight: 'bold', color: '#334155' },
  stopTitleActive: { color: '#0D9488' },
  stopSub: { fontSize: 10, color: '#64748B' },
  stopTime: { fontSize: 11, fontWeight: 'bold', color: '#002060' },
  sheetActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  bellBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  payBtn: { flex: 1, backgroundColor: '#0D9488', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  payBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  trackBtn: { flex: 1, backgroundColor: '#002060', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  trackBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  noSchedule: { padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8 },
});