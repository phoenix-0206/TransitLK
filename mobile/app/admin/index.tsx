import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { supabase } from '../../services/supabase';

type TabType = 'profiles' | 'bus_locations' | 'conductor_buses' | 'bus_schedules' | 'saved_routes';

export default function AdminDashboardScreen() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // CRUD State
  const [activeTab, setActiveTab] = useState<TabType>('conductor_buses');
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [locatingGps, setLocatingGps] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [activeTab, isAdmin]);

  async function checkAdminAccess() {
    try {
      setCheckingAuth(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Authentication Required', 'Please log in to access this area.');
        router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        Alert.alert('Access Denied', 'You do not have administrator permissions.');
        router.replace('/(tabs)');
        return;
      }

      setIsAdmin(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to verify admin status.');
      router.replace('/(tabs)');
    } finally {
      setCheckingAuth(false);
    }
  }

  async function fetchData() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from(activeTab).select('*');
      if (error) throw error;
      setDataList(data || []);
    } catch (err: any) {
      Alert.alert('Error fetching data', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      if (activeTab === 'bus_locations' && (formData.latitude == null || formData.longitude == null)) {
        Alert.alert('GPS Location Required', 'Tap Get GPS Location before saving this live bus.');
        return;
      }

      if (activeTab === 'bus_locations') {
        const crowdingLevel = formData.crowding_level || 'Low';
        if (!formData.bus_number?.trim() || !formData.route_name?.trim()) {
          Alert.alert('Missing Details', 'Enter the bus number and route name before saving.');
          return;
        }
        if (!['Low', 'Medium', 'High'].includes(crowdingLevel)) {
          Alert.alert('Invalid Crowding Level', 'Use Low, Medium, or High.');
          return;
        }
      }

      if (activeTab === 'conductor_buses' &&
        (!formData.owner_id?.trim() || !formData.bus_number?.trim() ||
          !formData.vehicle_registration?.trim() || !formData.route_name?.trim())) {
        Alert.alert('Missing Details', 'Enter the conductor UUID, bus number, vehicle registration, and route name.');
        return;
      }

      const payload = activeTab === 'bus_locations'
        ? {
            bus_number: formData.bus_number.trim(),
            route_name: formData.route_name.trim(),
            latitude: Number(formData.latitude),
            longitude: Number(formData.longitude),
            eta_minutes: Number.isFinite(Number(formData.eta_minutes)) ? Number(formData.eta_minutes) : 0,
            crowding_level: formData.crowding_level || 'Low',
          }
        : activeTab === 'conductor_buses'
          ? {
              owner_id: formData.owner_id.trim(),
              bus_number: formData.bus_number.trim(),
              vehicle_registration: formData.vehicle_registration.trim().toUpperCase(),
              route_name: formData.route_name.trim(),
            }
          : formData;

      if (editingItem) {
        const { error } = await supabase
          .from(activeTab)
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
        Alert.alert('Success', 'Record updated successfully');
      } else {
        const { error } = await supabase.from(activeTab).insert([payload]);
        if (error) throw error;
        Alert.alert('Success', 'Record created successfully');
      }
      setModalVisible(false);
      fetchData();
    } catch (err: any) {
      Alert.alert('Save Failed', err.message);
    }
  }

  async function getGpsLocation() {
    setLocatingGps(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Location permission is required to add the bus GPS location.');
      }
      if (!(await Location.hasServicesEnabledAsync())) {
        throw new Error('Turn on Location Services, then try again.');
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setFormData((current: any) => ({
        ...current,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }));
    } catch (error) {
      Alert.alert('Could Not Get GPS Location', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLocatingGps(false);
    }
  }

  async function handleDelete(id: string) {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from(activeTab).delete().eq('id', id);
            if (error) throw error;
            fetchData();
          } catch (err: any) {
            Alert.alert('Delete Failed', err.message);
          }
        },
      },
    ]);
  }

  function openCreateModal() {
    setEditingItem(null);
    setFormData({});
    setModalVisible(true);
  }

  function openEditModal(item: any) {
    setEditingItem(item);
    setFormData(item);
    setModalVisible(true);
  }

  function getTabLabel(tab: TabType) {
    return tab === 'conductor_buses' ? 'Conductor GPS' : tab.replace('_', ' ');
  }

  if (checkingAuth) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#002060" />
        <Text style={styles.loadingText}>Verifying Admin Credentials...</Text>
      </View>
    );
  }

  if (!isAdmin) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Ionicons name="settings-outline" size={20} color="#FFF" />
        <Text style={styles.headerTitle}>TransitLK Admin Management</Text>
        <TouchableOpacity style={styles.closeHeaderBtn} onPress={() => router.replace('/(tabs)')}>
          <Ionicons name="close-circle-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {[
          { key: 'bus_locations', label: 'Live Buses' },
          { key: 'conductor_buses', label: 'Conductor GPS' },
          { key: 'bus_schedules', label: 'Timetables' },
          { key: 'profiles', label: 'Profiles' },
          { key: 'saved_routes', label: 'Saved Routes' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key as TabType)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.controlRow}>
        <Text style={styles.tableTitle}>{activeTab.toUpperCase()} ({dataList.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
          <Ionicons name="add-circle" size={18} color="#FFF" />
          <Text style={styles.addBtnText}>Add New Entry</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={dataList}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={fetchData}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.dataCard}>
            <View style={{ flex: 1 }}>
              {activeTab === 'bus_locations' && (
                <>
                  <Text style={styles.cardTitle}>Bus {item.bus_number} - {item.route_name}</Text>
                  <Text style={styles.cardSub}>ETA: {item.eta_minutes} mins • Crowding: {item.crowding_level || 'Medium'}</Text>
                  <Text style={styles.cardSub}>Coords: {item.latitude}, {item.longitude}</Text>
                </>
              )}

              {activeTab === 'conductor_buses' && (
                <>
                  <Text style={styles.cardTitle}>Bus {item.bus_number} - {item.vehicle_registration}</Text>
                  <Text style={styles.cardSub}>{item.route_name}</Text>
                  <Text style={styles.cardSub}>Conductor: {item.owner_id}</Text>
                </>
              )}

              {activeTab === 'bus_schedules' && (
                <>
                  <Text style={styles.cardTitle}>Route {item.route_number}: {item.origin} ⇄ {item.destination}</Text>
                  <Text style={styles.cardSub}>Departure: {item.departure_time} • {item.frequency}</Text>
                  <Text style={styles.cardSub}>Type: {item.transport_type || 'SLTB Bus'}</Text>
                </>
              )}

              {activeTab === 'profiles' && (
                <>
                  <Text style={styles.cardTitle}>{item.full_name || 'No Name'}</Text>
                  <Text style={styles.cardSub}>Phone: {item.phone_number || 'N/A'}</Text>
                  <Text style={styles.cardSub}>Role: {item.role || 'commuter'} • Category: {item.pass_category || 'regular'}</Text>
                </>
              )}

              {activeTab === 'saved_routes' && (
                <>
                  <Text style={styles.cardTitle}>Saved: Route {item.route_number}</Text>
                  <Text style={styles.cardSub}>{item.origin} ➔ {item.destination}</Text>
                </>
              )}
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}>
                <Ionicons name="pencil" size={16} color="#002060" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash" size={16} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit' : 'Create'} {getTabLabel(activeTab)}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#002060" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {activeTab === 'bus_locations' && (
                <>
                  <Text style={styles.label}>Bus Number</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.bus_number}
                    onChangeText={(val) => setFormData({ ...formData, bus_number: val })}
                    placeholder="144"
                  />
                  <Text style={styles.label}>Route Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.route_name}
                    onChangeText={(val) => setFormData({ ...formData, route_name: val })}
                    placeholder="Rajagiriya - Fort"
                  />
                  <Text style={styles.label}>ETA (Minutes)</Text>
                  <TextInput
                    style={styles.input}
                    value={String(formData.eta_minutes || '')}
                    keyboardType="numeric"
                    onChangeText={(val) => setFormData({ ...formData, eta_minutes: parseInt(val) || 0 })}
                    placeholder="5"
                  />
                  <Text style={styles.label}>Bus GPS Location</Text>
                  <TouchableOpacity
                    style={styles.gpsLocationBtn}
                    onPress={getGpsLocation}
                    disabled={locatingGps}
                  >
                    {locatingGps ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Ionicons name="navigate" size={17} color="#FFF" />
                    )}
                    <Text style={styles.gpsLocationBtnText}>
                      {locatingGps ? 'Getting GPS Location...' : 'Get GPS Location'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.locationStatus}>
                    {formData.latitude != null && formData.longitude != null
                      ? `Location selected: ${Number(formData.latitude).toFixed(5)}, ${Number(formData.longitude).toFixed(5)}`
                      : 'Use the button to select the current bus location.'}
                  </Text>
                  <Text style={styles.label}>Crowding Level</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.crowding_level}
                    onChangeText={(val) => setFormData({ ...formData, crowding_level: val })}
                    placeholder="Low / Medium / High"
                  />
                </>
              )}

              {activeTab === 'conductor_buses' && (
                <>
                  <Text style={styles.formHint}>Register a bus for a conductor to share its live GPS location.</Text>
                  <Text style={styles.label}>Conductor User UUID</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.owner_id}
                    onChangeText={(val) => setFormData({ ...formData, owner_id: val })}
                    placeholder="Auth user UUID"
                    autoCapitalize="none"
                  />
                  <Text style={styles.label}>Route / Bus Number</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.bus_number}
                    onChangeText={(val) => setFormData({ ...formData, bus_number: val })}
                    placeholder="e.g. 138"
                  />
                  <Text style={styles.label}>Vehicle Registration</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.vehicle_registration}
                    onChangeText={(val) => setFormData({ ...formData, vehicle_registration: val.toUpperCase() })}
                    placeholder="e.g. WP-ND-8422"
                    autoCapitalize="characters"
                  />
                  <Text style={styles.label}>Route Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.route_name}
                    onChangeText={(val) => setFormData({ ...formData, route_name: val })}
                    placeholder="e.g. Maharagama - Pettah"
                  />
                </>
              )}

              {activeTab === 'bus_schedules' && (
                <>
                  <Text style={styles.label}>Route Number</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.route_number}
                    onChangeText={(val) => setFormData({ ...formData, route_number: val })}
                    placeholder="177"
                  />
                  <Text style={styles.label}>Origin</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.origin}
                    onChangeText={(val) => setFormData({ ...formData, origin: val })}
                    placeholder="Kaduwela"
                  />
                  <Text style={styles.label}>Destination</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.destination}
                    onChangeText={(val) => setFormData({ ...formData, destination: val })}
                    placeholder="Kollupitiya"
                  />
                  <Text style={styles.label}>Departure Time</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.departure_time}
                    onChangeText={(val) => setFormData({ ...formData, departure_time: val })}
                    placeholder="06:30 AM"
                  />
                  <Text style={styles.label}>Arrival Time (optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.arrival_time || ''}
                    onChangeText={(val) => setFormData({ ...formData, arrival_time: val })}
                    placeholder="07:15 AM"
                  />
                  <Text style={styles.label}>Frequency</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.frequency}
                    onChangeText={(val) => setFormData({ ...formData, frequency: val })}
                    placeholder="Every 10 Mins"
                  />
                  <Text style={styles.label}>Bus Type (optional)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.bus_type || ''}
                    onChangeText={(val) => setFormData({ ...formData, bus_type: val })}
                    placeholder="SLTB / Private / A/C"
                  />
                </>
              )}

              {activeTab === 'profiles' && (
                <>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.full_name}
                    onChangeText={(val) => setFormData({ ...formData, full_name: val })}
                    placeholder="Kasun Jayasinghe"
                  />
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.phone_number}
                    onChangeText={(val) => setFormData({ ...formData, phone_number: val })}
                    placeholder="+94 77 123 4567"
                  />
                  <Text style={styles.label}>Role (admin / commuter)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.role}
                    onChangeText={(val) => setFormData({ ...formData, role: val })}
                    placeholder="commuter"
                  />
                </>
              )}

              {activeTab === 'saved_routes' && (
                <>
                  <Text style={styles.label}>User UUID</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.user_id}
                    onChangeText={(val) => setFormData({ ...formData, user_id: val })}
                    placeholder="User auth UUID"
                  />
                  <Text style={styles.label}>Route Number</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.route_number}
                    onChangeText={(val) => setFormData({ ...formData, route_number: val })}
                    placeholder="120"
                  />
                  <Text style={styles.label}>Origin</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.origin}
                    onChangeText={(val) => setFormData({ ...formData, origin: val })}
                    placeholder="Horana"
                  />
                  <Text style={styles.label}>Destination</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.destination}
                    onChangeText={(val) => setFormData({ ...formData, destination: val })}
                    placeholder="Pettah"
                  />
                </>
              )}

              <TouchableOpacity style={styles.saveSubmitBtn} onPress={handleSave}>
                <Text style={styles.saveSubmitText}>
                  {editingItem ? 'Save Changes' : 'Create Record'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { marginTop: 12, fontSize: 13, fontWeight: '600', color: '#002060' },
  header: { backgroundColor: '#002060', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16, flex: 1 },
  closeHeaderBtn: { padding: 2 },
  tabBar: { flexDirection: 'row', backgroundColor: '#E2E8F0', padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  tabBtnActive: { backgroundColor: '#002060' },
  tabText: { fontSize: 11, fontWeight: 'bold', color: '#64748B' },
  tabTextActive: { color: '#FFF' },
  controlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  tableTitle: { fontSize: 13, fontWeight: 'bold', color: '#002060' },
  addBtn: { backgroundColor: '#0D9488', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, gap: 4 },
  addBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  listContainer: { paddingHorizontal: 12, paddingBottom: 20 },
  dataCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  cardSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 6 },
  editBtn: { backgroundColor: '#EEF2FF', padding: 8, borderRadius: 6 },
  deleteBtn: { backgroundColor: '#FEE2E2', padding: 8, borderRadius: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#002060' },
  label: { fontSize: 11, fontWeight: 'bold', color: '#0F172A', marginTop: 8, marginBottom: 4 },
  formHint: { fontSize: 11, color: '#64748B', lineHeight: 16, marginBottom: 2 },
  gpsLocationBtn: { backgroundColor: '#0D9488', minHeight: 42, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 2 },
  gpsLocationBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  locationStatus: { color: '#64748B', fontSize: 11, lineHeight: 16, marginTop: 5 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, height: 40, fontSize: 13, color: '#0F172A' },
  saveSubmitBtn: { backgroundColor: '#002060', height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  saveSubmitText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});