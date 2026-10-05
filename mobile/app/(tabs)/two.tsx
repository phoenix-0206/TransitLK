import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { supabase } from '../../services/supabase';
import type { BusSchedule, SavedRoute } from '../../types/database';

const SAMPLE_SCHEDULES: BusSchedule[] = [
  { id: '1', route_number: '138', origin: 'Maharagama', destination: 'Pettah', departure_time: '06:30 AM', arrival_time: '07:15 AM', frequency: 'Every 10 mins', bus_type: 'Normal',     is_active: true, created_at: '' },
  { id: '2', route_number: '120', origin: 'Horana',     destination: 'Pettah', departure_time: '07:00 AM', arrival_time: '08:30 AM', frequency: 'Every 15 mins', bus_type: 'Normal',     is_active: true, created_at: '' },
  { id: '3', route_number: '100', origin: 'Panadura',   destination: 'Pettah', departure_time: '06:15 AM', arrival_time: '07:15 AM', frequency: 'Every 12 mins', bus_type: 'Normal',     is_active: true, created_at: '' },
  { id: '4', route_number: '255', origin: 'Kandy',      destination: 'Colombo', departure_time: '06:00 AM', arrival_time: '09:30 AM', frequency: 'Every 30 mins', bus_type: 'A/C Luxury', is_active: true, created_at: '' },
];

export default function TimetableScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [schedules, setSchedules] = useState<BusSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  async function fetchSchedules(query = '') {
    setLoading(true);
    let q = supabase.from('bus_schedules').select('*');

    if (query.trim() !== '') {
      q = q.or(
        `route_number.ilike.%${query}%,origin.ilike.%${query}%,destination.ilike.%${query}%`
      );
    }

    const { data, error } = await q.returns<BusSchedule[]>();

    if (error || !data) {
      // Filter sample data locally if DB not populated yet
      const filtered = query.trim()
        ? SAMPLE_SCHEDULES.filter(
            (s) =>
              s.route_number.includes(query) ||
              s.origin.toLowerCase().includes(query.toLowerCase()) ||
              s.destination.toLowerCase().includes(query.toLowerCase())
          )
        : SAMPLE_SCHEDULES;
      setSchedules(filtered);
    } else {
      setSchedules(data);
    }
    setLoading(false);
  }

  async function handleBookmarkSchedule(schedule: BusSchedule) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Notice', 'Please log in to bookmark schedules.');
      return;
    }
    const { error } = await supabase.from('saved_routes').insert<Omit<SavedRoute, 'id' | 'created_at'>>({
      user_id: user.id,
      route_number: schedule.route_number,
      origin: schedule.origin,
      destination: schedule.destination,
    });
    if (error) {
      Alert.alert('Notice', 'Schedule already bookmarked or an error occurred.');
    } else {
      Alert.alert('Bookmarked!', `Route ${schedule.route_number} saved.`);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transit Timetables</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by route number or city (e.g. 138, Pettah)..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            fetchSchedules(text);
          }}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#002060" style={{ marginTop: 30 }} />
      ) : (
        <FlatList<BusSchedule>
          data={schedules}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No routes found for "{searchQuery}"</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.routeBadgeContainer}>
                  <Text style={styles.routeBadge}>Route {item.route_number}</Text>
                  {item.bus_type !== 'Normal' && (
                    <Text style={styles.busTypeBadge}>{item.bus_type}</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.bookmarkBtn} onPress={() => handleBookmarkSchedule(item)}>
                  <Text style={styles.bookmarkBtnText}>⭐ Save</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.routeText}>{item.origin} ➔ {item.destination}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoText}>
                  ⏱ Departs: <Text style={styles.bold}>{item.departure_time}</Text>
                </Text>
                {item.frequency ? (
                  <Text style={styles.infoText}>
                    🔄 <Text style={styles.bold}>{item.frequency}</Text>
                  </Text>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7', padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#002060', marginTop: 10, marginBottom: 15 },
  searchContainer: { marginBottom: 15 },
  searchInput: {
    backgroundColor: '#FFF', padding: 13, borderRadius: 10,
    borderWidth: 1, borderColor: '#DDD', fontSize: 14, color: '#333',
  },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 14 },
  card: {
    backgroundColor: '#FFF', padding: 15, borderRadius: 12,
    marginBottom: 12, borderWidth: 1, borderColor: '#E5E5EA', elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  routeBadgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  routeBadge: {
    backgroundColor: '#002060', color: '#FFF', fontWeight: 'bold',
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, fontSize: 13,
  },
  busTypeBadge: {
    backgroundColor: '#FFC000', color: '#000', fontWeight: 'bold',
    paddingVertical: 3, paddingHorizontal: 8, borderRadius: 5, fontSize: 11,
  },
  bookmarkBtn: { backgroundColor: '#EBF3FF', paddingVertical: 5, paddingHorizontal: 12, borderRadius: 8 },
  bookmarkBtnText: { fontWeight: 'bold', fontSize: 12, color: '#002060' },
  routeText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 5,
    borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10,
  },
  infoText: { fontSize: 12, color: '#666' },
  bold: { color: '#333', fontWeight: '600' },
});