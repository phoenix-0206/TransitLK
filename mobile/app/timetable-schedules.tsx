import React, { useCallback, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../services/supabase';
import type { BusSchedule } from '../types/database';

export default function TimetableSchedulesScreen() {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<BusSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bus_schedules')
      .select('*')
      .eq('is_active', true)
      .order('departure_time', { ascending: true })
      .returns<BusSchedule[]>();

    if (error) {
      setLoadError(error.message);
      setSchedules([]);
    } else {
      setLoadError('');
      setSchedules(data ?? []);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchSchedules();
    }, [fetchSchedules])
  );

  const routeNumbers = Array.from(new Set(schedules.map((schedule) => schedule.route_number)));
  const visibleSchedules = schedules.filter(
    (schedule) => selectedRoute === null || schedule.route_number === selectedRoute
  );
  const selectedSchedule = schedules.find((schedule) => schedule.route_number === selectedRoute);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top App Bar Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="bus-outline" size={18} color="#FFF" />
            </View>
            <View>
              <Text style={styles.brandTitle}>TransitLK</Text>
              <Text style={styles.brandSub}>TRANSIT TIMETABLES</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.langPill}>
              <Text style={styles.langTextActive}>EN</Text>
              <Text style={styles.langText}>සි</Text>
            </View>
            <TouchableOpacity style={styles.profileCircle}>
              <Ionicons name="person" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Page Title & Status */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>Timetable & Schedules</Text>
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>● LIVE</Text>
          </View>
        </View>

        {/* Route Selector Box */}
        <View style={styles.selectorCard}>
          <View style={styles.routeDropdown}>
            <Ionicons name="bus-outline" size={16} color="#002060" />
            <Text style={styles.routeDropdownText}>
              {selectedRoute ? `Route ${selectedRoute}` : 'All bus routes'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#002060" />
            <Text style={styles.activeBusesCount}>{schedules.length} schedules</Text>
          </View>

          <View style={styles.locationInputBox}>
            <Ionicons name="radio-button-on" size={18} color="#002060" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.locationLabel}>From Origin</Text>
              <Text style={styles.locationVal}>{selectedSchedule?.origin || 'Choose a route below'}</Text>
            </View>
          </View>

          <View style={styles.locationInputBox}>
            <Ionicons name="location" size={18} color="#0D9488" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.locationLabel}>To Destination</Text>
              <Text style={styles.locationVal}>{selectedSchedule?.destination || 'Choose a route below'}</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            {[null, ...routeNumbers].map((routeNumber) => (
              <TouchableOpacity
                key={routeNumber ?? 'all'}
                style={[styles.routeChip, selectedRoute === routeNumber && styles.routeChipActive]}
                onPress={() => setSelectedRoute(routeNumber)}
              >
                <Text style={[styles.routeChipText, selectedRoute === routeNumber && styles.routeChipTextActive]}>
                  {routeNumber === null ? 'All routes' : `Route ${routeNumber}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.modeBar}>
          <Ionicons name="bus" size={16} color="#FFF" />
          <Text style={styles.modeBarText}>Admin-managed bus schedules</Text>
          <View style={styles.modeBadge}><Text style={styles.modeBadgeText}>{schedules.length}</Text></View>
        </View>

        {/* Upcoming Departures Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Departures</Text>
          <Text style={styles.tariffTag}>{visibleSchedules.length} shown</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#002060" style={{ marginVertical: 28 }} />
        ) : loadError ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Could not load bus schedules</Text>
            <Text style={styles.emptyMessage}>{loadError}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => void fetchSchedules()}>
              <Text style={styles.retryBtnText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : visibleSchedules.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bus-outline" size={26} color="#64748B" />
            <Text style={styles.emptyTitle}>
              {schedules.length === 0 ? 'No schedules have been added yet' : 'No schedules for this route'}
            </Text>
            <Text style={styles.emptyMessage}>Schedules created in Admin → Timetables will appear here.</Text>
          </View>
        ) : visibleSchedules.map((schedule) => (
          <View key={schedule.id} style={styles.card}>
            <View style={styles.cardTopRow}>
              <View style={styles.badgeNumBox}>
                <Text style={styles.badgeNumText}>{schedule.route_number}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.busModelTitle}>{schedule.bus_type || 'Bus service'}</Text>
                <Text style={styles.busSubDetail}>{schedule.frequency || 'Departure schedule'}</Text>
              </View>
              <View style={styles.statusPillGray}>
                <Text style={styles.statusGrayText}>Scheduled</Text>
              </View>
            </View>

            <Text style={styles.routeSummary}>{schedule.origin}  →  {schedule.destination}</Text>

            <View style={styles.tripTimelineRow}>
              <View>
                <Text style={styles.tripTime}>{schedule.departure_time}</Text>
                <Text style={styles.tripStation}>Departure</Text>
              </View>
              <View style={styles.timelineBar}>
                <Ionicons name="bus-outline" size={18} color="#0D9488" />
                <Text style={styles.stopNote}>Route {schedule.route_number}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.tripTime}>{schedule.arrival_time || '—'}</Text>
                <Text style={styles.tripStation}>Arrival</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.trackMapBtn} onPress={() => router.push('/')}>
              <Ionicons name="navigate-outline" size={16} color="#FFF" />
              <Text style={styles.trackMapBtnText}>View live bus map</Text>
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBadge: { backgroundColor: '#002060', padding: 6, borderRadius: 8 },
  brandTitle: { fontSize: 16, fontWeight: 'bold', color: '#002060' },
  brandSub: { fontSize: 9, color: '#64748B', fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langPill: { flexDirection: 'row', backgroundColor: '#002060', padding: 4, borderRadius: 12, gap: 4 },
  langTextActive: { color: '#FFF', fontWeight: 'bold', fontSize: 10 },
  langText: { color: '#94A3B8', fontSize: 10 },
  profileCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#002060', justifyContent: 'center', alignItems: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#002060' },
  liveBadge: { backgroundColor: '#CCFBF1', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  liveBadgeText: { color: '#0D9488', fontWeight: 'bold', fontSize: 10 },
  selectorCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 14, padding: 14, marginBottom: 12 },
  routeDropdown: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', padding: 10, borderRadius: 8, gap: 6, marginBottom: 12 },
  routeDropdownText: { fontSize: 12, fontWeight: 'bold', color: '#002060' },
  activeBusesCount: { marginLeft: 'auto', fontSize: 11, color: '#64748B' },
  locationInputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 10, marginBottom: 8 },
  locationLabel: { fontSize: 9, color: '#64748B', fontWeight: 'bold' },
  locationVal: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  swapBtn: { position: 'absolute', right: 25, top: 95, zIndex: 10, width: 34, height: 34, borderRadius: 17, backgroundColor: '#002060', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  chipScroll: { gap: 8, marginTop: 4 },
  routeChip: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  routeChipActive: { backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#002060' },
  routeChipText: { fontSize: 11, color: '#64748B' },
  routeChipTextActive: { color: '#002060', fontWeight: 'bold' },
  modeBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#002060', padding: 12, borderRadius: 10, gap: 8, marginBottom: 12 },
  modeBarText: { color: '#FFF', fontWeight: 'bold', fontSize: 13, flex: 1 },
  modeBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  modeBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 11 },
  dateScroll: { gap: 8, marginBottom: 12 },
  dateChip: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, alignItems: 'center' },
  dateChipActive: { backgroundColor: '#002060', borderColor: '#002060' },
  dateLabel: { fontSize: 9, color: '#64748B', fontWeight: 'bold' },
  dateLabelActive: { color: '#93C5FD' },
  dateVal: { fontSize: 13, fontWeight: 'bold', color: '#0F172A' },
  dateValActive: { color: '#FFF' },
  calendarChip: { backgroundColor: '#EEF2FF', width: 44, height: 48, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  filterScroll: { gap: 8, marginBottom: 16 },
  timeFilterChip: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  timeFilterChipActive: { backgroundColor: '#002060', borderColor: '#002060' },
  timeFilterText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  timeFilterTextActive: { color: '#FFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#002060' },
  tariffTag: { fontSize: 10, color: '#64748B' },
  routeSummary: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  emptyState: { alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 20, marginTop: 8 },
  emptyTitle: { color: '#002060', fontWeight: '700', fontSize: 14, textAlign: 'center', marginTop: 8 },
  emptyMessage: { color: '#64748B', fontSize: 12, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  retryBtn: { backgroundColor: '#002060', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 9, marginTop: 12 },
  retryBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 14, marginBottom: 12, elevation: 2 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  badgeNumBox: { backgroundColor: '#002060', width: 42, height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  badgeNumBoxTeal: { backgroundColor: '#0D9488', width: 42, height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  badgeNumBoxNavy: { backgroundColor: '#1E3A8A', width: 42, height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  badgeNumText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  busModelTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  busSubDetail: { fontSize: 10, color: '#64748B', marginTop: 1 },
  statusPillGreen: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  statusGreenText: { color: '#166534', fontWeight: 'bold', fontSize: 10 },
  statusPillRed: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  statusRedText: { color: '#991B1B', fontWeight: 'bold', fontSize: 10 },
  statusPillGray: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  statusGrayText: { color: '#475569', fontWeight: 'bold', fontSize: 10 },
  tripTimelineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tripTime: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  strikethroughTime: { fontSize: 11, color: '#94A3B8', textDecorationLine: 'line-through' },
  tripStation: { fontSize: 11, color: '#64748B' },
  timelineBar: { alignItems: 'center', flex: 1, marginHorizontal: 12 },
  timelineDuration: { fontSize: 10, fontWeight: 'bold', color: '#0D9488' },
  timelineDurationFast: { fontSize: 10, fontWeight: 'bold', color: '#1E3A8A' },
  timelineGraphic: { flexDirection: 'row', alignItems: 'center', gap: 4, marginVertical: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CBD5E1' },
  line: { flex: 1, height: 2, backgroundColor: '#CBD5E1' },
  stopNote: { fontSize: 9, color: '#94A3B8' },
  cardFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10, marginBottom: 12 },
  densityPillYellow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  densityPillGreen: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#CCFBF1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  densityPillRed: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  densityBars: { flexDirection: 'row', gap: 2 },
  dBar: { width: 4, height: 12, borderRadius: 2 },
  densityTitle: { fontSize: 10, fontWeight: 'bold', color: '#D97706' },
  densityTitleGreen: { fontSize: 10, fontWeight: 'bold', color: '#0D9488' },
  densityTitleRed: { fontSize: 10, fontWeight: 'bold', color: '#DC2626' },
  densitySub: { fontSize: 8, color: '#64748B' },
  densitySubRed: { fontSize: 8, color: '#991B1B' },
  fareLabel: { fontSize: 9, color: '#64748B' },
  fareAmount: { fontSize: 18, fontWeight: 'bold', color: '#002060' },
  fareAmountTeal: { fontSize: 18, fontWeight: 'bold', color: '#0D9488' },
  fareAmountNavy: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A' },
  actionBtnRow: { flexDirection: 'row', gap: 8 },
  trackMapBtn: { flex: 1, backgroundColor: '#002060', height: 42, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  trackMapBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  iconActionBtn: { width: 42, height: 42, borderRadius: 8, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  qrActionBtn: { width: 42, height: 42, borderRadius: 8, backgroundColor: '#CCFBF1', justifyContent: 'center', alignItems: 'center' },
  liveGpsBtn: { flex: 1, backgroundColor: '#EEF2FF', height: 42, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  liveGpsBtnText: { color: '#002060', fontWeight: 'bold', fontSize: 12 },
  remindBtn: { flex: 1, backgroundColor: '#EEF2FF', height: 42, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  remindBtnText: { color: '#002060', fontWeight: 'bold', fontSize: 12 },
  reserveBtn: { backgroundColor: '#002060', height: 42, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  reserveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bypassTag: { backgroundColor: '#EEF2FF', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  bypassTagText: { color: '#1E3A8A', fontSize: 8, fontWeight: 'bold' },
  cancelledCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 14, padding: 14, marginBottom: 12 },
  badgeNumBoxLight: { backgroundColor: '#E2E8F0', width: 42, height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  badgeNumTextDark: { color: '#002060', fontWeight: 'bold', fontSize: 14 },
  statusPillCancelled: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  statusCancelledText: { color: '#DC2626', fontWeight: 'bold', fontSize: 10 },
  cancellationNoticeBox: { flexDirection: 'row', backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8, marginTop: 10 },
  noticeTitle: { fontSize: 11, fontWeight: 'bold', color: '#991B1B' },
  noticeSub: { fontSize: 10, color: '#7F1D1D', marginTop: 2, lineHeight: 14 },
  nightOwlCard: { backgroundColor: '#EEF2FF', borderRadius: 14, padding: 14, marginBottom: 20 },
  nightOwlHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  nightOwlTitle: { fontSize: 14, fontWeight: 'bold', color: '#002060' },
  nightOwlSub: { fontSize: 10, color: '#64748B' },
  nightOwlBody: { fontSize: 11, color: '#475569', lineHeight: 16, marginBottom: 12 },
  nightOwlActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  pdfBtn: { flex: 1, backgroundColor: '#FFF', height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  pdfBtnText: { color: '#002060', fontWeight: 'bold', fontSize: 12 },
  infoCircleBtn: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
});