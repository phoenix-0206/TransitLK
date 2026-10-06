import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { fetchLiveBusLocations, type LiveBusLocation } from '../../services/liveBusLocations';

export default function LiveMapTrackingTab() {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - 30;
  const [buses, setBuses] = useState<LiveBusLocation[]>([]);
  const [selectedBus, setSelectedBus] = useState<LiveBusLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const mapRef = useRef<MapView>(null);
  const busCardsRef = useRef<FlatList<LiveBusLocation>>(null);
  const selectedIndex = buses.findIndex((bus) => bus.bus_id === selectedBus?.bus_id);

  const refreshLocations = useCallback(async () => {
    const { buses: locations, error } = await fetchLiveBusLocations();
    setLoadError(error ?? '');
    setBuses(locations);
    setSelectedBus((current) => locations.find((bus) => bus.bus_id === current?.bus_id) ?? locations[0] ?? null);
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
    if (selectedIndex >= 0) {
      busCardsRef.current?.scrollToIndex({ index: selectedIndex, animated: true });
    }
  }, [selectedBus?.bus_id, selectedBus?.latitude, selectedBus?.longitude]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.headerOverlay}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#64748B" />
            <Text style={styles.searchText}>Live buses • {buses.length} {buses.length === 1 ? 'location' : 'locations'}</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => router.push('/conductor')} accessibilityLabel="Open conductor GPS profile">
            <Ionicons name="navigate-outline" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Transit Advisory Alert Banner */}
        <View style={styles.advisoryBanner}>
          <Ionicons name="radio-outline" size={16} color="#0D9488" />
          <Text style={styles.advisoryText}>
            Admin-managed bus locations and current conductor GPS are shown together. Conductor positions older than two minutes are hidden.
          </Text>
        </View>

        {/* Map Display */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          onMapReady={() => console.info('[LiveMap] Google map view ready')}
          onMapLoaded={() => console.info('[LiveMap] map tiles loaded')}
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
              title={`Bus ${bus.bus_number}${bus.vehicle_registration ? ` • ${bus.vehicle_registration}` : ''}`}
              description={`${bus.source === 'admin' ? 'Admin location' : 'Conductor GPS'} • ${bus.route_name} • Updated ${new Date(bus.updated_at).toLocaleTimeString()}`}
              pinColor={bus.source === 'admin' ? '#002060' : '#0D9488'}
              onPress={() => setSelectedBus(bus)}
            />
          ))}
        </MapView>

        {loading && <View style={styles.emptyCard}><ActivityIndicator color="#002060" /><Text style={styles.emptyTitle}>Loading shared bus locations…</Text></View>}
        {!loading && buses.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name={loadError ? 'cloud-offline-outline' : 'bus-outline'} size={24} color={loadError ? '#B91C1C' : '#64748B'} />
            <Text style={styles.emptyTitle}>{loadError ? 'Could not load live locations' : 'No bus locations available'}</Text>
            <Text style={styles.emptySub}>{loadError || 'Add a bus location in Admin or enable GPS from a conductor profile.'}</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/conductor')}>
              <Text style={styles.emptyButtonText}>{loadError ? 'Check GPS setup' : 'Open conductor profile'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {buses.length > 0 && (
          <FlatList
            ref={busCardsRef}
            horizontal
            data={buses}
            keyExtractor={(bus) => bus.bus_id}
            showsHorizontalScrollIndicator={false}
            style={styles.busCarousel}
            contentContainerStyle={styles.busCarouselContent}
            snapToInterval={cardWidth + 10}
            snapToAlignment="start"
            decelerationRate="fast"
            getItemLayout={(_, index) => ({ length: cardWidth + 10, offset: (cardWidth + 10) * index, index })}
            onScrollToIndexFailed={({ index }) => {
              busCardsRef.current?.scrollToOffset({ offset: (cardWidth + 10) * index, animated: true });
            }}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / (cardWidth + 10));
              const bus = buses[index];
              if (bus) setSelectedBus(bus);
            }}
            renderItem={({ item: bus, index }) => (
              <View style={[styles.busCard, { width: cardWidth }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.busBadgeBox}>
                    <Text style={styles.busBadgeTag}>BUS</Text>
                    <Text style={styles.busBadgeNum}>{bus.bus_number}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={styles.tagRow}>
                      <View style={styles.sltbTag}><Text style={styles.sltbText}>{bus.source === 'admin' ? 'ADMIN LOCATION' : 'LIVE GPS'}</Text></View>
                      {bus.vehicle_registration ? <Text style={styles.regText}>{bus.vehicle_registration}</Text> : null}
                    </View>
                    <Text style={styles.routeTitle}>{bus.route_name}</Text>
                  </View>
                  <TouchableOpacity style={styles.heartBtn} onPress={() => void refreshLocations()} accessibilityLabel="Refresh live bus locations"><Ionicons name="refresh" size={20} color="#002060" /></TouchableOpacity>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statBoxBlue}>
                    <Text style={styles.statLabel}>LOCATION UPDATED</Text>
                    <Text style={styles.statValue}>{Math.max(0, Math.floor((Date.now() - new Date(bus.updated_at).getTime()) / 1000))} <Text style={{ fontSize: 14 }}>sec ago</Text></Text>
                    <Text style={styles.statSub}>{new Date(bus.updated_at).toLocaleTimeString()}</Text>
                  </View>
                  <View style={styles.statBoxTeal}>
                    <Text style={styles.statLabel}>{bus.source === 'admin' ? 'ESTIMATED ARRIVAL' : 'GPS ACCURACY'}</Text>
                    <Text style={styles.statValueTeal}>
                      {bus.source === 'admin'
                        ? bus.eta_minutes == null ? 'Not reported' : `${bus.eta_minutes} min`
                        : bus.accuracy_meters == null ? 'Not reported' : `±${Math.round(bus.accuracy_meters)} m`}
                    </Text>
                    <Text style={styles.statSub}>
                      {bus.source === 'admin' ? `Crowding: ${bus.crowding_level || 'Not reported'}` : 'From conductor’s phone'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/interactive-route-map')}>
                  <Ionicons name="list-outline" size={18} color="#FFF" />
                  <Text style={styles.primaryBtnText}>View Route Stops & Timetable</Text>
                </TouchableOpacity>

                <Text style={styles.carouselPosition}>{index + 1} of {buses.length} • Swipe to browse buses</Text>
              </View>
            )}
          />
        )}
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
  busCarousel: { position: 'absolute', left: 0, right: 0, bottom: 15 },
  busCarouselContent: { paddingHorizontal: 15 },
  busCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginRight: 10, elevation: 6 },
  carouselPosition: { color: '#64748B', fontSize: 10, fontWeight: '600', textAlign: 'center', marginTop: 2 },
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