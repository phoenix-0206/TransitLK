import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { supabase } from '../services/supabase';

export default function LiveMapScreen() {
  const [buses, setBuses] = useState<any[]>([]);
  const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusLocations();
    fetchSavedRoutes();
  }, []);

  // CRUD Operation 1 (READ): Fetch live bus locations from Supabase
  async function fetchBusLocations() {
    setLoading(true);
    const { data, error } = await supabase.from('bus_locations').select('*');

    if (error) {
      // Sample data fallback if table is empty or offline
      const sampleBuses = [
        { id: '1', bus_number: '138', route_name: 'Maharagama - Pettah', latitude: 6.8480, longitude: 79.9265, eta_minutes: 4, crowding_level: 'Medium' },
        { id: '2', bus_number: '120', route_name: 'Horana - Pettah', latitude: 6.8700, longitude: 79.8800, eta_minutes: 12, crowding_level: 'High' },
        { id: '3', bus_number: '100', route_name: 'Panadura - Pettah', latitude: 6.8300, longitude: 79.8650, eta_minutes: 8, crowding_level: 'Low' },
      ];
      setBuses(sampleBuses);
      setSelectedBus(sampleBuses[0]);
    } else if (data && data.length > 0) {
      setBuses(data);
      setSelectedBus(data[0]);
    }
    setLoading(false);
  }

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
              key={bus.id}
              coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
              title={`Bus ${bus.bus_number}`}
              description={`ETA: ${bus.eta_minutes} min`}
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
            <Text style={styles.etaLabel}>ESTIMATED TIME OF ARRIVAL</Text>
            <Text style={styles.etaValue}>{selectedBus.eta_minutes} MINS</Text>
          </View>

          <View style={styles.actionRow}>
            <View>
              <Text style={styles.crowdingLabel}>Crowding Status</Text>
              <Text
                style={[
                  styles.crowdingValue,
                  {
                    color:
                      selectedBus.crowding_level === 'High'
                        ? '#FF3B30'
                        : selectedBus.crowding_level === 'Medium'
                        ? '#FF9500'
                        : '#34C759',
                  },
                ]}
              >
                ● {selectedBus.crowding_level}
              </Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={() => handleSaveRoute(selectedBus)}>
              <Text style={styles.saveBtnText}>⭐ Save Route</Text>
            </TouchableOpacity>
          </View>
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