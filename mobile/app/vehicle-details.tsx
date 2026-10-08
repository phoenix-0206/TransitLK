import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Share, View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { fetchLiveBusLocations, type LiveBusLocation } from '../services/liveBusLocations';
import { supabase } from '../services/supabase';
import type { BusSchedule } from '../types/database';

export default function VehicleDetailsScreen() {
  const { height } = useWindowDimensions();
  const { busId, busNumber: requestedBusNumber } = useLocalSearchParams<{
    busId?: string;
    busNumber?: string;
  }>();
  const mapRef = useRef<MapView>(null);
  const [buses, setBuses] = useState<LiveBusLocation[]>([]);
  const [schedule, setSchedule] = useState<BusSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedRouteId, setSavedRouteId] = useState<string | null>(null);
  const bus = buses.find((item) => item.bus_id === busId)
    ?? buses.find((item) => item.bus_number === requestedBusNumber)
    ?? (busId || requestedBusNumber ? null : buses[0] ?? null);
  const displayBusNumber = bus?.bus_number ?? requestedBusNumber ?? '—';
  const routeName = schedule
    ? `${schedule.origin} ⇄ ${schedule.destination}`
    : bus?.route_name ?? 'Route details unavailable';
  const mapRegion = bus
    ? { latitude: bus.latitude, longitude: bus.longitude, latitudeDelta: 0.055, longitudeDelta: 0.055 }
    : { latitude: 6.8893, longitude: 79.855, latitudeDelta: 0.08, longitudeDelta: 0.08 };
  const updatedLabel = bus
    ? new Date(bus.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Not available';

  useEffect(() => {
    let mounted = true;
    const loadBus = async () => {
      const { buses: liveBuses } = await fetchLiveBusLocations();
      if (mounted) {
        setBuses(liveBuses);
        setLoading(false);
      }
    };
    void loadBus();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!bus) {
      setSchedule(null);
      setSavedRouteId(null);
      return;
    }

    let mounted = true;
    const loadRouteDetails = async () => {
      const [{ data: schedules }, { data: { user } }] = await Promise.all([
        supabase.from('bus_schedules').select('*').eq('route_number', bus.bus_number).eq('is_active', true).order('departure_time').limit(1).returns<BusSchedule[]>(),
        supabase.auth.getUser(),
      ]);
      if (!mounted) return;
      setSchedule(schedules?.[0] ?? null);

      if (user) {
        const { data: savedRoute } = await supabase
          .from('saved_routes')
          .select('id')
          .eq('user_id', user.id)
          .eq('route_number', bus.bus_number)
          .maybeSingle();
        if (mounted) setSavedRouteId(savedRoute?.id ?? null);
      } else {
        setSavedRouteId(null);
      }
    };

    void loadRouteDetails();
    return () => { mounted = false; };
  }, [bus?.bus_id]);

  async function shareVehicle() {
    if (!bus) return;
    await Share.share({ message: `Bus ${displayBusNumber}: ${routeName}.` });
  }

  async function toggleSavedRoute() {
    if (!bus) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Sign in required', 'Sign in to save this route.');
      return;
    }

    if (savedRouteId) {
      const { error } = await supabase.from('saved_routes').delete().eq('id', savedRouteId);
      if (error) {
        Alert.alert('Could not remove route', error.message);
      } else {
        setSavedRouteId(null);
      }
      return;
    }

    const { data, error } = await supabase.from('saved_routes').insert({
      user_id: user.id,
      route_number: bus.bus_number,
      origin: schedule?.origin ?? bus.route_name.split('-')[0]?.trim() ?? null,
      destination: schedule?.destination ?? bus.route_name.split('-').slice(1).join('-').trim() ?? null,
    }).select('id').single();
    if (error) {
      Alert.alert('Could not save route', error.message);
    } else {
      setSavedRouteId(data.id);
    }
  }

  function centerOnBus() {
    if (!bus) return;
    const region: Region = { latitude: bus.latitude, longitude: bus.longitude, latitudeDelta: 0.025, longitudeDelta: 0.025 };
    mapRef.current?.animateToRegion(region, 500);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={mapRegion}
        >
          {bus && (
            <Marker
              coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
              title={`Bus ${bus.bus_number}${bus.vehicle_registration ? ` • ${bus.vehicle_registration}` : ''}`}
              description={`${bus.route_name} • ${bus.source === 'admin' ? 'Admin location' : 'Conductor GPS'}`}
            >
              <View style={styles.mapBusMarker}><Ionicons name="bus" size={17} color="#FFF" /></View>
            </Marker>
          )}
        </MapView>

        <View style={styles.topControls}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={20} color="#13264A" />
          </TouchableOpacity>
          <View style={styles.gpsPill}>
            <View style={styles.liveDot} />
            <Text style={styles.gpsPillText}>
              {loading ? 'LOADING BUS…' : bus ? `${bus.source === 'admin' ? 'ADMIN LOCATION' : 'GPS'} • UPDATED ${updatedLabel}` : 'NO LIVE BUS SELECTED'}
            </Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={centerOnBus} accessibilityLabel="Center map on bus">
            <Ionicons name="locate-outline" size={20} color="#13264A" />
          </TouchableOpacity>
        </View>

        <View style={[styles.sheetContainer, { top: Math.max(86, height * 0.14), bottom: 0 }]}>
          <View style={styles.sheetHandle} />
          <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
            <View style={styles.busHeaderRow}>
              <View style={styles.busBadgeBox}>
                <Text style={styles.busBadgeTag}>BUS</Text>
                <Text style={styles.busBadgeNum}>{displayBusNumber}</Text>
              </View>
              <View style={styles.busIdentity}>
                <View style={styles.tagRow}>
                  <View style={styles.sltbPill}><Text style={styles.sltbText}>{bus?.source === 'admin' ? 'ADMIN LOCATION' : bus?.source === 'conductor' ? 'LIVE CONDUCTOR GPS' : 'LIVE BUS DETAILS'}</Text></View>
                </View>
                {bus?.vehicle_registration ? <Text style={styles.regText}>{bus.vehicle_registration}</Text> : null}
                <Text style={styles.routeText}>{routeName}</Text>
              </View>
              <View style={styles.actionIcons}>
                  <TouchableOpacity style={styles.smallIconBtn} onPress={() => void toggleSavedRoute()} accessibilityLabel={savedRouteId ? 'Remove saved route' : 'Save route'} disabled={!bus}>
                    <Ionicons name={savedRouteId ? 'heart' : 'heart-outline'} size={19} color={savedRouteId ? '#DC2626' : '#13264A'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallIconBtn} onPress={() => void shareVehicle()} accessibilityLabel="Share bus details">
                  <Ionicons name="share-social-outline" size={18} color="#13264A" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallIconBtn} onPress={() => router.back()} accessibilityLabel="Close vehicle details">
                  <Ionicons name="close" size={19} color="#13264A" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sheetDivider} />

            <View style={styles.arrivalBanner}>
              <View style={styles.arrivalTop}>
                <View style={styles.onTimePill}><View style={styles.onTimeDot} /><Text style={styles.onTimeText}>{bus ? 'Live location' : loading ? 'Loading' : 'Unavailable'}</Text></View>
                <View style={styles.gpsLock}><Ionicons name="radio-outline" size={14} color="#007F75" /><Text style={styles.gpsLockText}>{bus ? (bus.source === 'admin' ? 'Admin location' : 'Conductor GPS') : 'No GPS data'}</Text></View>
              </View>
              <View style={styles.etaRow}>
                <View style={styles.etaBlock}>
                  <Text style={styles.mainEta}>{bus?.eta_minutes == null ? 'ETA N/A' : `${bus.eta_minutes} MIN`}</Text>
                  <Text style={styles.targetStop}>
                    {bus?.eta_minutes == null ? 'No arrival estimate is available' : 'Admin-provided estimate'}
                  </Text>
                </View>
                <View style={styles.targetBlock}>
                  <Text style={styles.targetLabel}>DESTINATION</Text>
                  <Text style={styles.targetName}>{schedule?.destination || 'Not provided'}</Text>
                </View>
              </View>
              <View style={styles.metricsStrip}>
                <View style={styles.metric}><Ionicons name="time-outline" size={14} color="#163B83" /><Text style={styles.stripText}>{updatedLabel}</Text></View>
                <Text style={styles.dot}>•</Text>
                <View style={styles.metric}><Ionicons name="locate-outline" size={14} color="#163B83" /><Text style={styles.stripText}>{bus?.accuracy_meters == null ? 'Accuracy N/A' : `±${Math.round(bus.accuracy_meters)} m`}</Text></View>
                <Text style={styles.dot}>•</Text>
                <View style={styles.metric}><Ionicons name="radio-outline" size={13} color="#64748B" /><Text style={styles.syncText}>{bus ? 'Live' : 'Offline'}</Text></View>
              </View>
            </View>

            <View style={styles.crowdingCard}>
              <View style={styles.crowdingHeader}>
                <Ionicons name="people-outline" size={19} color="#007F75" />
                <Text style={styles.crowdingTitle}>Passenger Capacity & Crowding</Text>
                  <View style={styles.seatsPill}><Text style={styles.seatsText}>{bus?.crowding_level || 'Not reported'}</Text></View>
              </View>
              <View style={styles.crowdBarTrack}>
                {bus?.crowding_level ? (
                  <View style={[styles.crowdBarFill, { backgroundColor: bus.crowding_level === 'High' ? '#DC2626' : bus.crowding_level === 'Low' ? '#0D9488' : '#F59E0B' }]} />
                ) : <View style={[styles.crowdBarFill, styles.crowdAvailable]} />}
              </View>
              <View style={styles.crowdDetailRow}>
                <Text style={styles.crowdNote}>● {bus?.crowding_level ? `${bus.crowding_level} crowding` : 'Crowding not reported'}</Text>
                <Text style={styles.crowdComfort}>{bus?.source === 'admin' ? 'Admin-provided status' : bus ? 'No occupancy data' : 'No live bus selected'}</Text>
              </View>
            </View>

            <View style={styles.approachingCard}>
              <View style={styles.approachingIcon}><Ionicons name="bus" size={17} color="#FFF" /></View>
              <View style={styles.approachingInfo}>
                <Text style={styles.approachingSub}>ROUTE DESTINATION</Text>
                <Text style={styles.approachingName}>{schedule?.destination || 'No timetable destination'}</Text>
              </View>
              {schedule?.frequency ? <View style={styles.minPill}><Text style={styles.minText}>{schedule.frequency}</Text></View> : null}
            </View>

            <View style={styles.timelineHeader}>
              <View style={styles.timelineTitleRow}><Ionicons name="git-branch-outline" size={16} color="#163B83" /><Text style={styles.timelineTitle}>Admin Timetable</Text></View>
              <Text style={styles.fareLabel}>Fare not provided</Text>
            </View>

            <View style={styles.timelineList}>
              {schedule ? (
                <>
                  <View style={styles.timelineRow}>
                    <View style={styles.stopRail}><View style={[styles.stopNode, styles.stopNodeCurrent]} /><View style={styles.stopLine} /></View>
                    <View style={styles.stopInfo}><Text style={styles.stopName}>{schedule.origin}</Text><Text style={styles.stopSub}>Departure • {schedule.departure_time}</Text></View>
                  </View>
                  <View style={styles.timelineRow}>
                    <View style={styles.stopRail}><View style={styles.stopNode} /></View>
                    <View style={styles.stopInfo}><Text style={styles.stopName}>{schedule.destination}</Text><Text style={styles.stopSub}>{schedule.arrival_time ? `Arrival • ${schedule.arrival_time}` : 'Arrival time not provided'}</Text></View>
                  </View>
                </>
              ) : (
                <View style={styles.noSchedule}><Text style={styles.stopSub}>{loading ? 'Loading bus details…' : 'No active admin timetable exists for this bus route.'}</Text></View>
              )}
            </View>
          </ScrollView>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#DCE8F2' },
  container: { flex: 1, backgroundColor: '#E8EEF6' },
  map: { ...StyleSheet.absoluteFill },
  mapBusMarker: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#123B8B', borderWidth: 3, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  topControls: { position: 'absolute', top: 8, left: 14, right: 14, zIndex: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  gpsPill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#FFF', paddingHorizontal: 13, paddingVertical: 8, borderRadius: 18, elevation: 3 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#008B78' },
  gpsPillText: { fontSize: 10, fontWeight: '800', color: '#163B83' },
  sheetContainer: { position: 'absolute', left: 0, right: 0, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, elevation: 12 },
  sheetContent: { paddingHorizontal: 16, paddingBottom: 18 },
  sheetHandle: { width: 42, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  busHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 14 },
  busBadgeBox: { backgroundColor: '#123B8B', padding: 8, borderRadius: 11, alignItems: 'center', width: 54 },
  busBadgeTag: { color: '#DCE9FF', fontSize: 8, fontWeight: '800' },
  busBadgeNum: { color: '#FFF', fontSize: 23, lineHeight: 25, fontWeight: '800' },
  busIdentity: { flex: 1, marginLeft: 10, gap: 2 },
  tagRow: { flexDirection: 'row' },
  sltbPill: { backgroundColor: '#E5EBFF', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  sltbText: { color: '#163B83', fontSize: 8, fontWeight: '800' },
  regText: { fontSize: 10, color: '#64748B' },
  routeText: { fontSize: 15, lineHeight: 19, fontWeight: '800', color: '#15223B' },
  actionIcons: { flexDirection: 'row', gap: 3 },
  smallIconBtn: { width: 32, height: 34, justifyContent: 'center', alignItems: 'center' },
  sheetDivider: { height: 1, backgroundColor: '#E8EDF4', marginHorizontal: -16, marginBottom: 14 },
  arrivalBanner: { backgroundColor: '#F0F2FF', borderRadius: 15, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E4E8F8' },
  arrivalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  onTimePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#75F1C5', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
  onTimeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#007F75' },
  onTimeText: { color: '#064A46', fontWeight: '800', fontSize: 10 },
  gpsLock: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  gpsLockText: { fontSize: 10, color: '#007F75', fontWeight: '700' },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  etaBlock: { flex: 1 },
  targetBlock: { width: 118, alignItems: 'flex-end' },
  mainEta: { fontSize: 30, lineHeight: 35, fontWeight: '900', color: '#123B8B' },
  targetStop: { fontSize: 11, lineHeight: 16, color: '#475569' },
  targetLabel: { color: '#64748B', fontSize: 8, fontWeight: '800', marginBottom: 4 },
  targetName: { color: '#123B8B', fontSize: 12, fontWeight: '800', textAlign: 'right' },
  metricsStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5, borderTopWidth: 1, borderTopColor: '#DDE2F1', paddingTop: 9 },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stripText: { fontSize: 9, color: '#152B59', fontWeight: '800' },
  syncText: { fontSize: 9, color: '#64748B', fontWeight: '700' },
  dot: { color: '#AAB4C5', fontSize: 10 },
  crowdingCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 12, marginBottom: 11 },
  crowdingHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  crowdingTitle: { flex: 1, fontSize: 12, fontWeight: '800', color: '#17233A' },
  seatsPill: { backgroundColor: '#82F0D9', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12 },
  seatsText: { color: '#075E5A', fontSize: 9, fontWeight: '800' },
  crowdBarTrack: { height: 9, flexDirection: 'row', gap: 4, marginBottom: 8 },
  crowdBarFill: { flex: 1, height: 9, borderRadius: 6 },
  crowdLow: { backgroundColor: '#38D9A5' },
  crowdModerate: { backgroundColor: '#F5A000' },
  crowdAvailable: { backgroundColor: '#E0E7FF' },
  crowdDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  crowdNote: { fontSize: 10, color: '#C45B00', fontWeight: '800' },
  crowdComfort: { flex: 1, fontSize: 9, color: '#475569' },
  approachingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2FF', padding: 10, borderRadius: 13, marginBottom: 13, gap: 9 },
  approachingIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: '#123B8B', justifyContent: 'center', alignItems: 'center' },
  approachingInfo: { flex: 1 },
  approachingSub: { fontSize: 8, fontWeight: '800', color: '#64748B', marginBottom: 2 },
  approachingName: { fontSize: 12, fontWeight: '800', color: '#17233A' },
  minPill: { backgroundColor: '#DFE7FF', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 },
  minText: { color: '#123B8B', fontWeight: '800', fontSize: 10 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  timelineTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timelineTitle: { fontSize: 12, fontWeight: '800', color: '#17233A' },
  fareLabel: { fontSize: 9, fontWeight: '800', color: '#007F75' },
  timelineList: { paddingBottom: 8 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', minHeight: 50 },
  stopRail: { width: 24, alignItems: 'center', alignSelf: 'stretch' },
  stopNode: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  stopNodeCurrent: { width: 23, height: 23, borderRadius: 12, backgroundColor: '#DCE8FF', borderColor: '#123B8B' },
  stopNodeUpcoming: { backgroundColor: '#FFF', borderColor: '#94A3B8' },
  stopLine: { position: 'absolute', top: 18, bottom: -3, width: 2, backgroundColor: '#D5DCE8' },
  stopInfo: { flex: 1, paddingLeft: 6 },
  stopName: { fontSize: 11, fontWeight: '800', color: '#17233A' },
  stopSub: { fontSize: 9, color: '#123B8B', marginTop: 2 },
  stopStatus: { fontSize: 9, fontWeight: '700', color: '#123B8B', marginLeft: 8 },
  passedStop: { color: '#8791A2', textDecorationLine: 'line-through' },
  noSchedule: { padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8 },
});