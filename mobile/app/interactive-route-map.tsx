import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../services/supabase';

type LiveBus = {
  bus_id: string;
  bus_number: string;
  vehicle_registration: string;
  route_name: string;
  latitude: number;
  longitude: number;
  updated_at: string;
};

export default function InteractiveRouteMapScreen() {
  const [liveBuses, setLiveBuses] = useState<LiveBus[]>([]);
  const mapRef = useRef<MapView>(null);
  const routeCoords = [
    { latitude: 6.9344, longitude: 79.8503 },
    { latitude: 6.9147, longitude: 79.8778 },
    { latitude: 6.8893, longitude: 79.9015 },
    { latitude: 6.8885, longitude: 79.9174 },
    { latitude: 6.9061, longitude: 79.9686 },
  ];

  useEffect(() => {
    let mounted = true;
    const loadLiveBuses = async () => {
      const { data } = await supabase
        .from('conductor_bus_locations')
        .select('bus_id, bus_number, vehicle_registration, route_name, latitude, longitude, updated_at')
        .gte('updated_at', new Date(Date.now() - 2 * 60 * 1000).toISOString())
        .order('updated_at', { ascending: false });
      if (!mounted) return;
      const buses = (data ?? []) as LiveBus[];
      setLiveBuses(buses);
      const bus = buses[0];
      if (bus) mapRef.current?.animateToRegion({
        latitude: bus.latitude,
        longitude: bus.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 700);
    };

    void loadLiveBuses();
    const timer = setInterval(() => void loadLiveBuses(), 8000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

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
              <View style={styles.busBadge}><Text style={styles.busBadgeText}>BUS 177</Text></View>
              <View style={styles.comfortBadge}><Text style={styles.comfortText}>SLTB SUPER COMFORT</Text></View>
            </View>
            <Text style={styles.headerTitle}>Fort ⇄ Malabe Express</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="share-social-outline" size={18} color="#002060" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="bookmark-outline" size={18} color="#002060" /></TouchableOpacity>
        </View>

        {/* Map Area */}
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 6.9061,
            longitude: 79.9174,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          <Polyline coordinates={routeCoords} strokeColor="#0D9488" strokeWidth={4} />
          {liveBuses.map((bus) => (
            <Marker
              key={bus.bus_id}
              coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
              title={`Bus ${bus.bus_number} • ${bus.vehicle_registration}`}
              description={`${bus.route_name} • Updated ${new Date(bus.updated_at).toLocaleTimeString()}`}
              pinColor="#0D9488"
            />
          ))}
        </MapView>

        {/* Route Details Bottom Sheet */}
        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />

          {/* Quick Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>⏱ PICKUP ETA</Text>
              <Text style={styles.metricVal}>12 <Text style={{ fontSize: 12 }}>min</Text></Text>
              <Text style={styles.metricSub}>At Diyatha Uyana</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>🛤 TRIP LENGTH</Text>
              <Text style={styles.metricVal}>18.4 <Text style={{ fontSize: 12 }}>km</Text></Text>
              <Text style={styles.metricSub}>Approx 42 mins</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>💵 ADULT FARE</Text>
              <Text style={styles.metricVal}>Rs. 65</Text>
              <Text style={styles.metricSub}>LankaQR Ready</Text>
            </View>
          </View>

          <View style={styles.crowdBar}>
            <Ionicons name="people-outline" size={16} color="#0D9488" />
            <Text style={styles.crowdText}>Moderate Crowding • ~18 seats free • AC Com</Text>
          </View>

          {/* Stop Progression List */}
          <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.timelineHeader}>Stop Progression & Timings</Text>

            {[
              { title: 'Colombo Fort Terminal (Stand 04)', status: 'Passed on schedule', time: '14:15', state: 'passed' },
              { title: 'Borella Kanatte Roundabout', status: 'Departed', time: '14:28', state: 'passed' },
              { title: 'Rajagiriya Fairway Hub', status: 'Bus slowing for passenger drop • 1min away', time: '14:32', state: 'current' },
              { title: 'Battaramulla – Diyatha Bay #1', status: 'Your Selected Boarding Point • Arriving in 12m', time: '14:42', state: 'selected' },
              { title: 'Koswatte Junction', status: 'Scheduled intermediate', time: '14:50', state: 'upcoming' },
              { title: 'Malabe Central Bus Stand', status: 'Athurugiriya Road Terminal', time: '14:57', state: 'upcoming' },
            ].map((stop, i) => (
              <View key={i} style={styles.stopRow}>
                <View style={styles.stopIndicator}>
                  <View style={[styles.stopDot, stop.state === 'selected' && styles.stopDotActive]} />
                  {i < 5 && <View style={styles.stopLine} />}
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.stopTitle, stop.state === 'selected' && styles.stopTitleActive]}>{stop.title}</Text>
                  <Text style={styles.stopSub}>{stop.status}</Text>
                </View>
                <Text style={styles.stopTime}>{stop.time}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Action Row */}
          <View style={styles.sheetActions}>
            <TouchableOpacity style={styles.bellBtn}><Ionicons name="notifications-outline" size={20} color="#002060" /></TouchableOpacity>
            <TouchableOpacity style={styles.payBtn}>
              <Ionicons name="qr-code-outline" size={18} color="#FFF" />
              <Text style={styles.payBtnText}>Pay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.trackBtn}>
              <Ionicons name="navigate-outline" size={18} color="#FFF" />
              <Text style={styles.trackBtnText}>Track Bus</Text>
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
});