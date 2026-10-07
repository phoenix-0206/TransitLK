import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { supabase } from '../../services/supabase';
import type { BusSchedule, SavedRoute } from '../../types/database';

export default function TimetableScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [schedules, setSchedules] = useState<BusSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, []);

  async function fetchSchedules(query = '') {
    setLoading(true);
    setLoadError('');
    try {
      let request = supabase.from('bus_schedules').select('*').eq('is_active', true);
      if (query.trim() !== '') {
        request = request.or(
          `route_number.ilike.%${query}%,origin.ilike.%${query}%,destination.ilike.%${query}%`
        );
      }

      const { data, error } = await request.returns<BusSchedule[]>();
      if (error) throw error;
      setSchedules(data ?? []);
    } catch (error) {
      setSchedules([]);
      setLoadError(error instanceof Error ? error.message : 'Unable to load schedules.');
    } finally {
      setLoading(false);
    }
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
      ) : loadError ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Unable to load schedules</Text>
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      ) : (
        <FlatList<BusSchedule>
          data={schedules}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchQuery ? `No schedules found for "${searchQuery}"` : 'No active bus schedules have been added yet.'}
            </Text>
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
  emptyState: { alignItems: 'center', paddingHorizontal: 12 },
  errorText: { textAlign: 'center', color: '#64748B', marginTop: 8, fontSize: 12 },
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