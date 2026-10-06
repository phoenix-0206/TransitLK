import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../services/supabase';
import { fetchLiveBusLocations } from '../services/liveBusLocations';

export default function LiveMapScreen() {
  const [buses, setBuses] = useState<any[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    void fetchBusLocations();
    void fetchSavedRoutes();
    const timer = setInterval(() => void fetchBusLocations(), 8000);
    return () => clearInterval(timer);
  }, []);

  const fetchBusLocations = useCallback(async () => {
    const { buses: activeBuses, error } = await fetchLiveBusLocations();
    setLoadError(error ?? '');
    setBuses(activeBuses);
    setSelectedBus((current: any) => activeBuses.find((bus) => bus.bus_id === current?.bus_id) ?? activeBuses[0] ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedBus) {
      mapRef.current?.animateToRegion({
        latitude: selectedBus.latitude,
        longitude: selectedBus.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 700);
    }
  }, [selectedBus?.bus_id, selectedBus?.latitude, selectedBus?.longitude]);

  // CRUD Operation 2 (READ): Fetch current user's saved routes
  async function fetchSavedRoutes() {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { data } = await supabase.from('saved_routes').select('*').eq('user_id', user.id);
    if (data) setSavedRoutes(data);
  }

  // CRUD Operation 3 (CREATE): Add route to saved_routes table
  async function handleSaveRoute(bus: any) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      return Alert.alert('Authentication Required', 'Please log in to save favorite routes.');
    }

    const { error } = await supabase.from('saved_routes').insert([
      {
        user_id: user.id,
        route_number: bus.bus_number,
        origin: bus.route_name.split('-')[0]?.trim() || 'Origin',
        destination: bus.route_name.split('-')[1]?.trim() || 'Destination',
      },
    ]);

    if (error) {
      Alert.alert('Notice', 'Route is already in your saved list.');
    } else {
      Alert.alert('Success', `Route ${bus.bus_number} added to saved routes!`);
      fetchSavedRoutes();
    }
  }

  // CRUD Operation 4 (DELETE): Remove route from saved_routes table
  async function handleDeleteSavedRoute(id: string) {
    const { error } = await supabase.from('saved_routes').delete().eq('id', id);
    if (!error) {
      fetchSavedRoutes();
    }
  }

  return (
    <View style={styles.container}>
      {/* 1. Map Canvas */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002060" />
          <Text style={styles.loadingText}>Fetching live bus GPS coordinates...</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: selectedBus ? selectedBus.latitude : 6.8480,
            longitude: selectedBus ? selectedBus.longitude : 79.9265,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
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
      )}

      {/* 2. Top Saved Routes Bar Overlay */}
      <View style={styles.savedOverlay}>
        <Text style={styles.savedHeader}>⭐ Saved Favorite Routes:</Text>
        {savedRoutes.length === 0 ? (
          <Text style={styles.emptyText}>No saved routes. Select a bus marker below to save.</Text>
        ) : (
          <FlatList
            data={savedRoutes}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.savedChip}>
                <Text style={styles.savedChipText}>Bus {item.route_number}</Text>
                <TouchableOpacity onPress={() => handleDeleteSavedRoute(item.id)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      {/* 3. Bottom ETA & Crowding Details Card */}
      {selectedBus && (
        <View style={styles.bottomSheet}>
          <View style={styles.busHeader}>
            <Text style={styles.busBadge}>BUS {selectedBus.bus_number}</Text>
            <Text style={styles.routeTitle}>{selectedBus.route_name}</Text>
          </View>

          <View style={styles.etaContainer}>
            <Text style={styles.etaLabel}>{selectedBus.source === 'admin' ? 'LAST ADMIN UPDATE' : 'LAST GPS UPDATE'}</Text>
            <Text style={styles.etaValue}>{new Date(selectedBus.updated_at).toLocaleTimeString()}</Text>
          </View>

          <View style={styles.actionRow}>
            <View>
              <Text style={styles.crowdingLabel}>GPS accuracy</Text>
              <Text style={styles.crowdingValue}>
                {selectedBus.source === 'admin'
                  ? selectedBus.eta_minutes == null ? 'ETA not reported' : `ETA ${selectedBus.eta_minutes} min`
                  : selectedBus.accuracy_meters == null ? 'Not reported' : `±${Math.round(selectedBus.accuracy_meters)} m`}
              </Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={() => handleSaveRoute(selectedBus)}>
              <Text style={styles.saveBtnText}>⭐ Save Route</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!loading && !selectedBus && (
        <View style={styles.noBusCard}>
          <Text style={styles.noBusTitle}>{loadError ? 'Could not load live locations' : 'No bus locations available'}</Text>
          <Text style={styles.noBusText}>{loadError || 'Add a bus in Admin or enable GPS from the Conductor GPS profile.'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F7' },
  loadingText: { marginTop: 10, color: '#002060', fontWeight: '600' },
  noBusCard: { position: 'absolute', top: 150, left: 24, right: 24, backgroundColor: '#FFF', padding: 16, borderRadius: 12, elevation: 4, gap: 6 },
  noBusTitle: { color: '#002060', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  noBusText: { color: '#64748B', fontSize: 12, lineHeight: 17, textAlign: 'center' },
  savedOverlay: {
    position: 'absolute',
    top: 50,
    left: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  savedHeader: { fontSize: 13, fontWeight: 'bold', color: '#002060', marginBottom: 5 },
  emptyText: { fontSize: 12, color: '#888', fontStyle: 'italic' },
  savedChip: {
    backgroundColor: '#FFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savedChipText: { fontWeight: 'bold', fontSize: 12, color: '#002060' },
  removeText: { color: '#FF3B30', fontSize: 13, fontWeight: 'bold' },
  bottomSheet: {
    position: 'absolute',
    bottom: 25,
    left: 15,
    right: 15,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 14,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  busHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  busBadge: { backgroundColor: '#002060', color: '#FFF', fontWeight: 'bold', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 5, fontSize: 12 },
  routeTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', flex: 1 },
  etaContainer: { backgroundColor: '#EBF3FF', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 8 },
  etaLabel: { fontSize: 10, color: '#666', letterSpacing: 0.5 },
  etaValue: { fontSize: 26, fontWeight: 'bold', color: '#002060', marginTop: 2 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  crowdingLabel: { fontSize: 11, color: '#666' },
  crowdingValue: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  saveBtn: { backgroundColor: '#FFC000', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  saveBtnText: { fontWeight: 'bold', color: '#000', fontSize: 13 },
});