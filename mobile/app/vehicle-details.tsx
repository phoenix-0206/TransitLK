import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function VehicleDetailsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header Controls */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#002060" />
          </TouchableOpacity>
          <View style={styles.gpsPill}>
            <Text style={styles.gpsPillText}>● GPS ACTIVE • 3S AGO</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="locate-outline" size={20} color="#002060" /></TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        {/* Detailed Bottom Sheet */}
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandle} />

          {/* Bus Info Header */}
          <View style={styles.busHeaderRow}>
            <View style={styles.busBadgeBox}>
              <Text style={styles.busBadgeTag}>BUS</Text>
              <Text style={styles.busBadgeNum}>138</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.tagRow}>
                <View style={styles.sltbPill}><Text style={styles.sltbText}>SLTB SEMI-LUXURY</Text></View>
              </View>
              <Text style={styles.regText}>WP-ND-8422</Text>
              <Text style={styles.routeText}>Colombo Fort ⇄ Maharagama</Text>
            </View>
            <View style={styles.actionIcons}>
              <TouchableOpacity style={styles.smallIconBtn}><Ionicons name="heart-outline" size={18} color="#002060" /></TouchableOpacity>
              <TouchableOpacity style={styles.smallIconBtn}><Ionicons name="share-social-outline" size={18} color="#002060" /></TouchableOpacity>
              <TouchableOpacity style={styles.smallIconBtn} onPress={() => router.back()}><Ionicons name="close" size={18} color="#002060" /></TouchableOpacity>
            </View>
          </View>

          {/* Main Arrival Banner */}
          <View style={styles.arrivalBanner}>
            <View style={styles.arrivalTop}>
              <View style={styles.onTimePill}><Text style={styles.onTimeText}>● On Time</Text></View>
              <Text style={styles.gpsLockText}>📡 Live 4G GPS Lock</Text>
            </View>
            <Text style={styles.mainEta}>4 MINS</Text>
            <Text style={styles.targetStop}>
              Estimated arrival at 14:28 PM <Text style={{ fontWeight: 'bold', color: '#002060' }}>Bambalapitiya Bay 2</Text>
            </Text>

            <View style={styles.metricsStrip}>
              <Text style={styles.stripText}>📍 650m away</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.stripText}>⚡ 32 km/h</Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.stripText}>🔄 Sync 3s</Text>
            </View>
          </View>

          {/* Crowding Card */}
          <View style={styles.crowdingCard}>
            <View style={styles.crowdingHeader}>
              <Ionicons name="people-outline" size={18} color="#0D9488" />
              <Text style={styles.crowdingTitle}>Passenger Capacity & Crowding</Text>
              <View style={styles.seatsPill}><Text style={styles.seatsText}>~14 Seats Left</Text></View>
            </View>
            <View style={styles.crowdBarTrack}>
              <View style={[styles.crowdBarFill, { width: '40%', backgroundColor: '#0D9488' }]} />
              <View style={[styles.crowdBarFill, { width: '30%', backgroundColor: '#D97706' }]} />
            </View>
            <Text style={styles.crowdNote}>● Moderate Crowding • Comfortable boarding • A/C working</Text>
          </View>

          {/* Approaching Station */}
          <View style={styles.approachingCard}>
            <Ionicons name="bus" size={18} color="#002060" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.approachingSub}>NOW APPROACHING</Text>
              <Text style={styles.approachingName}>Havelock Town (Dickmans Rd)</Text>
            </View>
            <View style={styles.minPill}><Text style={styles.minText}>1 min</Text></View>
          </View>

          {/* Route Timeline */}
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineTitle}>Route Timeline & Stops</Text>
            <Text style={styles.fareLabel}>Fare: LKR 70.00</Text>
          </View>

          <ScrollView style={{ maxHeight: 150 }} showsVerticalScrollIndicator={false}>
            {[
              { name: 'Nugegoda Supermarket', sub: 'Departed 14:15', status: 'Passed' },
              { name: 'Kirulapone Market', sub: 'Departed 14:21', status: 'Passed' },
              { name: 'Havelock Town', sub: 'Passing Thummulla Junction', status: '14:25 PM' },
            ].map((item, idx) => (
              <View key={idx} style={styles.timelineRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#94A3B8" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.stopName}>{item.name}</Text>
                  <Text style={styles.stopSub}>{item.sub}</Text>
                </View>
                <Text style={styles.stopStatus}>{item.status}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  topHeader: { position: 'absolute', top: 40, left: 15, right: 15, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { padding: 8, borderRadius: 20, backgroundColor: '#FFF', elevation: 3 },
  gpsPill: { backgroundColor: '#CCFBF1', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  gpsPillText: { fontSize: 10, fontWeight: 'bold', color: '#0D9488' },
  sheetContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, elevation: 10 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  busHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  busBadgeBox: { backgroundColor: '#002060', padding: 8, borderRadius: 10, alignItems: 'center', width: 48 },
  busBadgeTag: { color: '#93C5FD', fontSize: 8, fontWeight: 'bold' },
  busBadgeNum: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  tagRow: { flexDirection: 'row' },
  sltbPill: { backgroundColor: '#EEF2FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sltbText: { color: '#002060', fontSize: 8, fontWeight: 'bold' },
  regText: { fontSize: 10, color: '#64748B', marginTop: 2 },
  routeText: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  actionIcons: { flexDirection: 'row', gap: 4 },
  smallIconBtn: { padding: 6, borderRadius: 16, backgroundColor: '#F1F5F9' },
  arrivalBanner: { backgroundColor: '#EEF2FF', borderRadius: 12, padding: 14, marginBottom: 12 },
  arrivalTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  onTimePill: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  onTimeText: { color: '#166534', fontWeight: 'bold', fontSize: 10 },
  gpsLockText: { fontSize: 10, color: '#002060', fontWeight: '600' },
  mainEta: { fontSize: 28, fontWeight: 'bold', color: '#002060' },
  targetStop: { fontSize: 11, color: '#475569', marginBottom: 8 },
  metricsStrip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: '#CBD5E1', paddingTop: 8 },
  stripText: { fontSize: 10, color: '#002060', fontWeight: 'bold' },
  dot: { color: '#CBD5E1' },
  crowdingCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 10, marginBottom: 10 },
  crowdingHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  crowdingTitle: { flex: 1, fontSize: 12, fontWeight: 'bold', color: '#0F172A' },
  seatsPill: { backgroundColor: '#CCFBF1', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  seatsText: { color: '#0D9488', fontSize: 9, fontWeight: 'bold' },
  crowdBarTrack: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, flexDirection: 'row', overflow: 'hidden', marginBottom: 6 },
  crowdBarFill: { height: '100%' },
  crowdNote: { fontSize: 10, color: '#D97706', fontWeight: '600' },
  approachingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', padding: 10, borderRadius: 10, marginBottom: 10 },
  approachingSub: { fontSize: 8, fontWeight: 'bold', color: '#64748B' },
  approachingName: { fontSize: 12, fontWeight: 'bold', color: '#0F172A' },
  minPill: { backgroundColor: '#002060', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  minText: { color: '#FFF', fontWeight: 'bold', fontSize: 10 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  timelineTitle: { fontSize: 12, fontWeight: 'bold', color: '#0F172A' },
  fareLabel: { fontSize: 11, fontWeight: 'bold', color: '#0D9488' },
  timelineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  stopName: { fontSize: 12, fontWeight: 'bold', color: '#334155' },
  stopSub: { fontSize: 10, color: '#64748B' },
  stopStatus: { fontSize: 10, fontWeight: 'bold', color: '#002060' },
});