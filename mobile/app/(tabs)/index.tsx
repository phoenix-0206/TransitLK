import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

export default function LiveMapTrackingTab() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.headerOverlay}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#64748B" />
            <Text style={styles.searchText}>Bus 138 • Maharagama - Pettah</Text>
            <Ionicons name="mic-outline" size={18} color="#64748B" />
          </View>
          <TouchableOpacity style={styles.filterBtn}><Ionicons name="options-outline" size={18} color="#FFF" /></TouchableOpacity>
        </View>

        {/* Transit Advisory Alert Banner */}
        <View style={styles.advisoryBanner}>
          <Ionicons name="warning-outline" size={16} color="#DC2626" />
          <Text style={styles.advisoryText}>
            High traffic near Thummulla & Bambalapitiya flyover (+12m on 138 & 120). Coastal rail running on time.
          </Text>
        </View>

        {/* Map Display */}
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 6.8893,
            longitude: 79.8550,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={{ latitude: 6.8893, longitude: 79.8550 }} title="Bus 138" description="WP-ND-8422 • 32 km/h" />
        </MapView>

        {/* Selected Bus Card Bottom Overlay */}
        <View style={styles.busCard}>
          <View style={styles.cardHeader}>
            <View style={styles.busBadgeBox}>
              <Text style={styles.busBadgeTag}>ROUTE</Text>
              <Text style={styles.busBadgeNum}>138</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.tagRow}>
                <View style={styles.sltbTag}><Text style={styles.sltbText}>SEMI-LUXURY SLTB</Text></View>
                <Text style={styles.regText}>Reg: WP-ND-8422</Text>
              </View>
              <Text style={styles.routeTitle}>Maharagama ⇄ Colombo Fort</Text>
            </View>
            <TouchableOpacity style={styles.heartBtn}><Ionicons name="heart-outline" size={20} color="#002060" /></TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBoxBlue}>
              <Text style={styles.statLabel}>ARRIVAL IN</Text>
              <Text style={styles.statValue}>4 <Text style={{ fontSize: 14 }}>mins</Text></Text>
              <Text style={styles.statSub}>Est. 14:24 (On-time)</Text>
            </View>
            <View style={styles.statBoxTeal}>
              <Text style={styles.statLabel}>CROWD DENSITY</Text>
              <Text style={styles.statValueTeal}>Moderate Crowding</Text>
              <Text style={styles.statSub}>~14 Seats Available</Text>
            </View>
          </View>

          {/* Approaching Stop Info */}
          <View style={styles.approachingBox}>
            <View style={styles.approachingHeader}>
              <Text style={styles.approachingLabel}>NEXT APPROACHING STOP</Text>
              <Text style={styles.timePill}>1 min away</Text>
            </View>
            <Text style={styles.stopName}>Havelock Town (Dickmans Rd)</Text>
            <Text style={styles.nextStopName}>Bambalapitiya Junction (Bay #2) • <Text style={{ color: '#64748B' }}>450m • Walk 4m</Text></Text>
          </View>

          <TouchableOpacity style={styles.primaryBtn}>
            <Ionicons name="list-outline" size={18} color="#FFF" />
            <Text style={styles.primaryBtnText}>View Route Stops & Timetable</Text>
          </TouchableOpacity>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Ionicons name="alarm-outline" size={16} color="#002060" />
              <Text style={styles.secondaryBtnText}>Wake Me 1 Stop Prior</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
              <Text style={[styles.secondaryBtnText, { color: '#DC2626' }]}>Report Delay</Text>
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
  headerOverlay: { position: 'absolute', top: 40, left: 15, right: 15, zIndex: 10, flexDirection: 'row', gap: 8 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 12, height: 44, borderRadius: 10, elevation: 3, gap: 8 },
  searchText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#0F172A' },
  filterBtn: { backgroundColor: '#002060', width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  advisoryBanner: { position: 'absolute', top: 92, left: 15, right: 15, zIndex: 10, backgroundColor: '#FEE2E2', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  advisoryText: { flex: 1, fontSize: 11, color: '#991B1B', lineHeight: 15 },
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