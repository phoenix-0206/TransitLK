import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function LoadingSyncScreen() {
  const [progress, setProgress] = useState(73);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="bus" size={18} color="#FFF" />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>TransitLK</Text>
              <View style={styles.syncBadge}>
                <Text style={styles.syncBadgeText}>LIVE SYNC</Text>
              </View>
            </View>
            <Text style={styles.langSubtitle}>තථ්‍ය කාලීන දත්ත • நேரடி தரவு</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={20} color="#002060" />
          </TouchableOpacity>
        </View>

        {/* Sync Wheel */}
        <View style={styles.wheelOuter}>
          <View style={styles.routePillTop}>
            <Text style={styles.routePillText}>● SLTB #87</Text>
          </View>
          <View style={styles.wheelInner}>
            <Ionicons name="bus-outline" size={36} color="#FFF" />
          </View>
          <View style={styles.routePillBottom}>
            <Text style={styles.routePillText}>● FORT ⇄ KANDY</Text>
          </View>
        </View>

        <Text style={styles.mainTitle}>Fetching Live Transit Data...</Text>
        <Text style={styles.subTitle}>
          Connecting to NTC GPS Beacons & SLTB Western Province fleet telemetry
        </Text>

        {/* Progress Box */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>● Synchronizing Hub Telemetry</Text>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.gpsSignalPill}>
          <Ionicons name="radio-outline" size={16} color="#0D9488" />
          <Text style={styles.gpsSignalText}>GPS Signal Strong • 14ms Stream (Colombo Fort Hub)</Text>
        </View>

        {/* Estimated Arrivals Skeletons */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>● ESTIMATED ARRIVALS</Text>
          <Text style={styles.sectionHeaderSub}>Populating real-time feeds</Text>
        </View>

        {[1, 2].map((key) => (
          <View key={key} style={styles.skeletonCard}>
            <View style={styles.skeletonTop}>
              <View style={styles.skeletonSquare} />
              <View style={styles.skeletonLines}>
                <View style={styles.skeletonLineLong} />
                <View style={styles.skeletonLineShort} />
              </View>
              <View style={styles.skeletonBadge} />
            </View>
            <View style={styles.skeletonBottom}>
              <View style={styles.skeletonDot} />
              <View style={styles.skeletonBar} />
            </View>
          </View>
        ))}

        {/* Pro Tip Box */}
        <View style={styles.tipBox}>
          <View style={styles.tipIconBox}>
            <Ionicons name="wifi-outline" size={18} color="#FFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.tipTitle}>Commuter Pro-Tip</Text>
            <Text style={styles.tipBody}>
              Keep NFC enabled on your device for instant tap-to-ride boarding at Colombo Fort and Pettah terminal turnstiles.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.primaryBtn}>
          <Ionicons name="refresh-outline" size={18} color="#FFF" />
          <Text style={styles.primaryBtnText}>Refresh Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/(tabs)/two')}>
          <Text style={styles.secondaryBtnText}>Cancel & Search Offline Timetables</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 18, paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  logoBadge: { backgroundColor: '#002060', padding: 8, borderRadius: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandTitle: { fontSize: 18, fontWeight: 'bold', color: '#002060' },
  syncBadge: { backgroundColor: '#CCFBF1', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  syncBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#0D9488' },
  langSubtitle: { fontSize: 10, color: '#64748B' },
  closeBtn: { padding: 6, borderRadius: 20, backgroundColor: '#EEF2FF' },
  wheelOuter: { width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderColor: '#38BDF8', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginVertical: 15 },
  wheelInner: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#002060', justifyContent: 'center', alignItems: 'center' },
  routePillTop: { position: 'absolute', top: -10, backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1' },
  routePillBottom: { position: 'absolute', bottom: -10, backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1' },
  routePillText: { fontSize: 10, fontWeight: 'bold', color: '#0D9488' },
  mainTitle: { fontSize: 20, fontWeight: 'bold', color: '#002060', textAlign: 'center', marginTop: 10 },
  subTitle: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 15, paddingHorizontal: 20 },
  progressCard: { backgroundColor: '#EEF2FF', padding: 12, borderRadius: 10, marginBottom: 10 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, fontWeight: 'bold', color: '#002060' },
  progressValue: { fontSize: 12, fontWeight: 'bold', color: '#002060' },
  track: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#0D9488' },
  gpsSignalPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', padding: 10, borderRadius: 10, gap: 8, justifyContent: 'center', marginBottom: 20 },
  gpsSignalText: { fontSize: 11, fontWeight: '600', color: '#002060' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionHeaderTitle: { fontSize: 12, fontWeight: 'bold', color: '#002060' },
  sectionHeaderSub: { fontSize: 11, color: '#64748B' },
  skeletonCard: { backgroundColor: '#FFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 10 },
  skeletonTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  skeletonSquare: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#E2E8F0' },
  skeletonLines: { flex: 1, gap: 6 },
  skeletonLineLong: { height: 12, backgroundColor: '#E2E8F0', borderRadius: 4, width: '80%' },
  skeletonLineShort: { height: 10, backgroundColor: '#F1F5F9', borderRadius: 4, width: '50%' },
  skeletonBadge: { width: 50, height: 24, borderRadius: 12, backgroundColor: '#E2E8F0' },
  skeletonBottom: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  skeletonDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E2E8F0' },
  skeletonBar: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4 },
  tipBox: { flexDirection: 'row', backgroundColor: '#EEF2FF', padding: 12, borderRadius: 10, marginVertical: 15 },
  tipIconBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0D9488', justifyContent: 'center', alignItems: 'center' },
  tipTitle: { fontSize: 12, fontWeight: 'bold', color: '#002060' },
  tipBody: { fontSize: 11, color: '#475569', lineHeight: 16, marginTop: 2 },
  primaryBtn: { backgroundColor: '#002060', height: 48, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8 },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  secondaryBtn: { backgroundColor: '#EEF2FF', height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  secondaryBtnText: { color: '#002060', fontWeight: '600', fontSize: 13 },
});