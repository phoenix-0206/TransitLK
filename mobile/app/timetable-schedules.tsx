import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function TimetableSchedulesScreen() {
  const [selectedRoute, setSelectedRoute] = useState('138: Fort ⇄ Maharagama');
  const [origin, setOrigin] = useState('Colombo Fort');
  const [destination, setDestination] = useState('Maharagama');
  const [selectedDate, setSelectedDate] = useState('14 Oct');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Swap Origin and Destination
  function handleSwap() {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  }

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
          <TouchableOpacity style={styles.routeDropdown}>
            <Ionicons name="bus-outline" size={16} color="#002060" />
            <Text style={styles.routeDropdownText}>Route 138 • High Level Rd</Text>
            <Ionicons name="chevron-down" size={16} color="#002060" />
            <Text style={styles.activeBusesCount}>18 active buses</Text>
          </TouchableOpacity>

          {/* From Origin */}
          <View style={styles.locationInputBox}>
            <Ionicons name="radio-button-on" size={18} color="#002060" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.locationLabel}>From Origin</Text>
              <Text style={styles.locationVal}>{origin}</Text>
            </View>
          </View>

          {/* Swap Button Overlap */}
          <TouchableOpacity style={styles.swapBtn} onPress={handleSwap}>
            <Ionicons name="swap-vertical" size={18} color="#FFF" />
          </TouchableOpacity>

          {/* To Destination */}
          <View style={styles.locationInputBox}>
            <Ionicons name="location" size={18} color="#0D9488" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.locationLabel}>To Destination</Text>
              <Text style={styles.locationVal}>{destination}</Text>
            </View>
          </View>

          {/* Quick Route Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            {[
              '138: Fort ⇄ Maharagama',
              '177: Kollupitiya ⇄ Kaduwela',
              '120: Pettah ⇄ Horana',
            ].map((chip) => (
              <TouchableOpacity
                key={chip}
                style={[styles.routeChip, selectedRoute === chip && styles.routeChipActive]}
                onPress={() => setSelectedRoute(chip)}
              >
                <Text style={[styles.routeChipText, selectedRoute === chip && styles.routeChipTextActive]}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Mode Selector Pill */}
        <TouchableOpacity style={styles.modeBar}>
          <Ionicons name="bus" size={16} color="#FFF" />
          <Text style={styles.modeBarText}>Bus (SLTB & Pvt)</Text>
          <View style={styles.modeBadge}><Text style={styles.modeBadgeText}>18</Text></View>
        </TouchableOpacity>

        {/* Date Filter Bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {[
            { label: 'TODAY', date: '14 Oct' },
            { label: 'TOMORROW', date: '15 Oct' },
            { label: 'WED', date: '16 Oct' },
            { label: 'THU', date: '17 Oct' },
          ].map((item) => (
            <TouchableOpacity
              key={item.date}
              style={[styles.dateChip, selectedDate === item.date && styles.dateChipActive]}
              onPress={() => setSelectedDate(item.date)}
            >
              <Text style={[styles.dateLabel, selectedDate === item.date && styles.dateLabelActive]}>{item.label}</Text>
              <Text style={[styles.dateVal, selectedDate === item.date && styles.dateValActive]}>{item.date}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.calendarChip}>
            <Ionicons name="calendar-outline" size={18} color="#002060" />
          </TouchableOpacity>
        </ScrollView>

        {/* Time Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['All (18)', '⚡ Now / Next 1h', 'Afternoon (12–16)', 'Evening (16–20)'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[styles.timeFilterChip, selectedFilter === filter && styles.timeFilterChipActive]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.timeFilterText, selectedFilter === filter && styles.timeFilterTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Upcoming Departures Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Departures</Text>
          <Text style={styles.tariffTag}>Standard Tariff Band 1</Text>
        </View>

        {/* CARD 1: On-Time SLTB Leyland AC */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={styles.badgeNumBox}>
              <Text style={styles.badgeNumText}>138</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.busModelTitle}>SLTB Leyland AC</Text>
              <Text style={styles.busSubDetail}>WP-ND-8422 • Bay 4 Multi-Modal</Text>
            </View>
            <View style={styles.statusPillGreen}>
              <Text style={styles.statusGreenText}>● On Time • 6 mins</Text>
            </View>
          </View>

          {/* Trip Timeline */}
          <View style={styles.tripTimelineRow}>
            <View>
              <Text style={styles.tripTime}>14:30</Text>
              <Text style={styles.tripStation}>Colombo Fort</Text>
            </View>

            <View style={styles.timelineBar}>
              <Text style={styles.timelineDuration}>48m direct</Text>
              <View style={styles.timelineGraphic}>
                <View style={styles.dot} />
                <View style={styles.line} />
                <Ionicons name="bus-outline" size={14} color="#002060" />
                <View style={styles.line} />
                <View style={styles.dot} />
              </View>
              <Text style={styles.stopNote}>Non-Stop Nugegoda</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.tripTime}>15:18</Text>
              <Text style={styles.tripStation}>Maharagama</Text>
            </View>
          </View>

          {/* Capacity & Price */}
          <View style={styles.cardFooterRow}>
            <View style={styles.densityPillYellow}>
              <View style={styles.densityBars}>
                <View style={[styles.dBar, { backgroundColor: '#D97706' }]} />
                <View style={[styles.dBar, { backgroundColor: '#D97706' }]} />
                <View style={[styles.dBar, { backgroundColor: '#CBD5E1' }]} />
              </View>
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.densityTitle}>Moderate Density</Text>
                <Text style={styles.densitySub}>~16 seats left</Text>
              </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.fareLabel}>Fare</Text>
              <Text style={styles.fareAmount}>LKR 70<Text style={{ fontSize: 12 }}>.00</Text></Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionBtnRow}>
            <TouchableOpacity style={styles.trackMapBtn} onPress={() => router.push('/')}>
              <Ionicons name="navigate-outline" size={16} color="#FFF" />
              <Text style={styles.trackMapBtnText}>Track Live on Map</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconActionBtn}>
              <Ionicons name="notifications-outline" size={18} color="#002060" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.qrActionBtn}>
              <Ionicons name="qr-code-outline" size={18} color="#0D9488" />
            </TouchableOpacity>
          </View>
        </View>

        {/* CARD 2: Delayed Private Normal Transit */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={styles.badgeNumBoxTeal}>
              <Text style={styles.badgeNumText}>138</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.busModelTitle}>Private Normal Transit</Text>
              <Text style={styles.busSubDetail}>WP-NA-5120 • Stand 02</Text>
            </View>
            <View style={styles.statusPillRed}>
              <Text style={styles.statusRedText}>⚠️ Delayed +8m</Text>
            </View>
          </View>

          <View style={styles.tripTimelineRow}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.tripTime}>14:42</Text>
                <Text style={styles.strikethroughTime}>14:34</Text>
              </View>
              <Text style={styles.tripStation}>Departs in 18m</Text>
            </View>

            <View style={styles.timelineBar}>
              <Text style={styles.timelineDuration}>53m total</Text>
              <View style={styles.timelineGraphic}>
                <View style={styles.dot} />
                <View style={styles.line} />
                <View style={styles.dot} />
              </View>
              <Text style={styles.stopNote}>All Stops</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.tripTime}>15:35</Text>
              <Text style={styles.tripStation}>Est. Arrival</Text>
            </View>
          </View>

          <View style={styles.cardFooterRow}>
            <View style={styles.densityPillGreen}>
              <View style={styles.densityBars}>
                <View style={[styles.dBar, { backgroundColor: '#0D9488' }]} />
                <View style={[styles.dBar, { backgroundColor: '#CBD5E1' }]} />
                <View style={[styles.dBar, { backgroundColor: '#CBD5E1' }]} />
              </View>
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.densityTitleGreen}>Low Density</Text>
                <Text style={styles.densitySub}>~28 seats open</Text>
              </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.fareLabel}>Standard Fare</Text>
              <Text style={styles.fareAmountTeal}>LKR 40<Text style={{ fontSize: 12 }}>.00</Text></Text>
            </View>
          </View>

          <View style={styles.actionBtnRow}>
            <TouchableOpacity style={styles.liveGpsBtn}>
              <Ionicons name="radio-outline" size={16} color="#002060" />
              <Text style={styles.liveGpsBtnText}>Live GPS Track</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.remindBtn}>
              <Ionicons name="notifications-outline" size={16} color="#002060" />
              <Text style={styles.remindBtnText}>Remind Me</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CARD 3: Express SLTB Super Comfort */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={styles.badgeNumBoxNavy}>
              <Text style={styles.badgeNumText}>138/1</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.tagRow}>
                <Text style={styles.busModelTitle}>SLTB Super Comfort Express</Text>
                <View style={styles.bypassTag}><Text style={styles.bypassTagText}>BYPASS</Text></View>
              </View>
              <Text style={styles.busSubDetail}>Baseline Flyover Route</Text>
            </View>
            <View style={styles.statusPillGray}>
              <Text style={styles.statusGrayText}>Scheduled</Text>
            </View>
          </View>

          <View style={styles.tripTimelineRow}>
            <View>
              <Text style={styles.tripTime}>14:55</Text>
              <Text style={styles.tripStation}>Fort Terminal</Text>
            </View>

            <View style={styles.timelineBar}>
              <Text style={styles.timelineDurationFast}>43m (Fastest)</Text>
              <View style={styles.timelineGraphic}>
                <View style={styles.dot} />
                <View style={styles.line} />
                <View style={styles.dot} />
              </View>
              <Text style={styles.stopNote}>Direct Highway</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.tripTime}>15:38</Text>
              <Text style={styles.tripStation}>Maharagama</Text>
            </View>
          </View>

          <View style={styles.cardFooterRow}>
            <View style={styles.densityPillRed}>
              <View style={styles.densityBars}>
                <View style={[styles.dBar, { backgroundColor: '#DC2626' }]} />
                <View style={[styles.dBar, { backgroundColor: '#DC2626' }]} />
                <View style={[styles.dBar, { backgroundColor: '#DC2626' }]} />
              </View>
              <View style={{ marginLeft: 6 }}>
                <Text style={styles.densityTitleRed}>High Density</Text>
                <Text style={styles.densitySubRed}>Standing likely</Text>
              </View>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.fareLabel}>AC Luxury Fare</Text>
              <Text style={styles.fareAmountNavy}>LKR 100<Text style={{ fontSize: 12 }}>.00</Text></Text>
            </View>
          </View>

          <TouchableOpacity style={styles.reserveBtn}>
            <Ionicons name="bookmark-outline" size={16} color="#FFF" />
            <Text style={styles.reserveBtnText}>Reserve e-Seat</Text>
          </TouchableOpacity>
        </View>

        {/* CARD 4: Trip Cancelled Card */}
        <View style={styles.cancelledCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.badgeNumBoxLight}>
              <Text style={styles.badgeNumTextDark}>138</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.busModelTitle}>15:10 Semi–Luxury</Text>
              <Text style={styles.busSubDetail}>Private Transit</Text>
            </View>
            <View style={styles.statusPillCancelled}>
              <Text style={styles.statusCancelledText}>Trip Cancelled</Text>
            </View>
          </View>

          <View style={styles.cancellationNoticeBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.noticeTitle}>Vehicle Maintenance at Pettah Depot</Text>
              <Text style={styles.noticeSub}>Next scheduled Semi-Luxury service will depart at 15:22 from Platform 1.</Text>
            </View>
          </View>
        </View>

        {/* Night Owl Bus Schedule Banner */}
        <View style={styles.nightOwlCard}>
          <View style={styles.nightOwlHeader}>
            <Ionicons name="moon-outline" size={20} color="#002060" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.nightOwlTitle}>Night Owl Bus Schedule</Text>
              <Text style={styles.nightOwlSub}>10:00 PM – 4:00 AM Services</Text>
            </View>
          </View>
          <Text style={styles.nightOwlBody}>
            Night services depart every 30 minutes from Bastian Mawatha Central Terminal to Maharagama & Homagama. Save timetables for offline travel during spotty connectivity along inland routes.
          </Text>

          <View style={styles.nightOwlActions}>
            <TouchableOpacity style={styles.pdfBtn}>
              <Ionicons name="download-outline" size={16} color="#002060" />
              <Text style={styles.pdfBtnText}>Offline PDF (2.1 MB)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoCircleBtn}>
              <Ionicons name="information-circle-outline" size={20} color="#002060" />
            </TouchableOpacity>
          </View>
        </View>
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