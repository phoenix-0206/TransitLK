import React, { useRef, useState } from 'react';
import { Share, View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';

export default function VehicleDetailsScreen() {
  const { height } = useWindowDimensions();
  const { busNumber, routeName, vehicleRegistration, source, etaMinutes, crowdingLevel, latitude, longitude } = useLocalSearchParams<{
    busNumber?: string;
    routeName?: string;
    vehicleRegistration?: string;
    source?: string;
    etaMinutes?: string;
    crowdingLevel?: string;
    latitude?: string;
    longitude?: string;
  }>();
  const mapRef = useRef<MapView>(null);
  const [isSaved, setIsSaved] = useState(false);
  const displayBusNumber = busNumber || '138';
  const displayRouteName = routeName || 'Colombo Fort ⇄ Maharagama';
  const busLocation = {
    latitude: Number(latitude) || 6.8924,
    longitude: Number(longitude) || 79.8612,
  };
  const routeCoordinates = [
    { latitude: 6.9344, longitude: 79.8503 },
    { latitude: 6.9147, longitude: 79.8578 },
    { latitude: 6.9018, longitude: 79.8602 },
    busLocation,
    { latitude: 6.8885, longitude: 79.8794 },
  ];
  const stops = [
    { name: 'Nugegoda Supermarket', sub: 'Departed 14:15', time: 'Passed', state: 'passed' },
    { name: 'Kirulapone Market', sub: 'Departed 14:21', time: 'Passed', state: 'passed' },
    { name: 'Havelock Town', sub: 'Passing Thummulla Junction', time: '14:25 PM', state: 'current' },
    { name: 'Bambalapitiya Junction (Bay #2)', sub: 'Estimated arrival', time: '14:28 PM', state: 'upcoming' },
  ];

  async function shareVehicle() {
    await Share.share({ message: `Bus ${displayBusNumber}: ${displayRouteName}.` });
  }

  function centerOnBus() {
    const region: Region = { ...busLocation, latitudeDelta: 0.025, longitudeDelta: 0.025 };
    mapRef.current?.animateToRegion(region, 500);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{ ...busLocation, latitudeDelta: 0.055, longitudeDelta: 0.055 }}
        >
          <Polyline coordinates={routeCoordinates} strokeColor="#0D9488" strokeWidth={4} />
          <Marker coordinate={busLocation} title="Bus 138 • WP-ND-8422" description="Colombo Fort to Maharagama">
            <View style={styles.mapBusMarker}><Ionicons name="bus" size={17} color="#FFF" /></View>
          </Marker>
        </MapView>

        <View style={styles.topControls}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={20} color="#13264A" />
          </TouchableOpacity>
          <View style={styles.gpsPill}>
            <View style={styles.liveDot} />
            <Text style={styles.gpsPillText}>{source === 'admin' ? 'ADMIN LOCATION' : 'GPS ACTIVE • 3S AGO'}</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={centerOnBus} accessibilityLabel="Center map on bus">
            <Ionicons name="locate-outline" size={20} color="#13264A" />
          </TouchableOpacity>
        </View>

        <View style={[styles.sheetContainer, { top: Math.max(86, height * 0.14), bottom: 62 }]}>
          <View style={styles.sheetHandle} />
          <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
            <View style={styles.busHeaderRow}>
              <View style={styles.busBadgeBox}>
                <Text style={styles.busBadgeTag}>BUS</Text>
                <Text style={styles.busBadgeNum}>{displayBusNumber}</Text>
              </View>
              <View style={styles.busIdentity}>
                <View style={styles.tagRow}>
                  <View style={styles.sltbPill}><Text style={styles.sltbText}>{source === 'admin' ? 'ADMIN LOCATION' : source === 'conductor' ? 'LIVE CONDUCTOR GPS' : 'SLTB SEMI-LUXURY'}</Text></View>
                </View>
                {vehicleRegistration ? <Text style={styles.regText}>{vehicleRegistration}</Text> : null}
                <Text style={styles.routeText}>{displayRouteName}</Text>
              </View>
              <View style={styles.actionIcons}>
                <TouchableOpacity style={styles.smallIconBtn} onPress={() => setIsSaved((saved) => !saved)} accessibilityLabel={isSaved ? 'Remove saved bus' : 'Save bus'}>
                  <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={19} color={isSaved ? '#DC2626' : '#13264A'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallIconBtn} onPress={() => void shareVehicle()} accessibilityLabel="Share bus details">
                  <Ionicons name="share-social-outline" size={18} color="#13264A" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallIconBtn} onPress={() => router.back()} accessibilityLabel="Close vehicle details">
                  <Ionicons name="close" size={19} color="#13264A" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sheetDivider} />

            <View style={styles.arrivalBanner}>
              <View style={styles.arrivalTop}>
                <View style={styles.onTimePill}><View style={styles.onTimeDot} /><Text style={styles.onTimeText}>On Time</Text></View>
                <View style={styles.gpsLock}><Ionicons name="radio-outline" size={14} color="#007F75" /><Text style={styles.gpsLockText}>Live 4G GPS Lock</Text></View>
              </View>
              <View style={styles.etaRow}>
                <View style={styles.etaBlock}>
                  <Text style={styles.mainEta}>{etaMinutes ? `${etaMinutes} MINS` : source ? 'LIVE GPS' : '4 MINS'}</Text>
                  <Text style={styles.targetStop}>
                    {etaMinutes ? 'Admin estimated arrival' : source ? 'Current bus location' : 'Estimated arrival at 14:28 PM'}
                  </Text>
                </View>
                <View style={styles.targetBlock}>
                  <Text style={styles.targetLabel}>TARGET STOP</Text>
                  <Text style={styles.targetName}>Bambalapitiya Bay 2</Text>
                </View>
              </View>
              <View style={styles.metricsStrip}>
                <View style={styles.metric}><Ionicons name="location-outline" size={14} color="#163B83" /><Text style={styles.stripText}>650m away</Text></View>
                <Text style={styles.dot}>•</Text>
                <View style={styles.metric}><Ionicons name="speedometer-outline" size={14} color="#163B83" /><Text style={styles.stripText}>32 km/h</Text></View>
                <Text style={styles.dot}>•</Text>
                <View style={styles.metric}><Ionicons name="sync-outline" size={13} color="#64748B" /><Text style={styles.syncText}>Sync 3s</Text></View>
              </View>
            </View>

            <View style={styles.crowdingCard}>
              <View style={styles.crowdingHeader}>
                <Ionicons name="people-outline" size={19} color="#007F75" />
                <Text style={styles.crowdingTitle}>Passenger Capacity & Crowding</Text>
                  <View style={styles.seatsPill}><Text style={styles.seatsText}>{source ? crowdingLevel || 'Crowding N/A' : '~14 Seats Left'}</Text></View>
              </View>
              <View style={styles.crowdBarTrack}>
                <View style={[styles.crowdBarFill, styles.crowdLow]} />
                <View style={[styles.crowdBarFill, styles.crowdModerate]} />
                <View style={[styles.crowdBarFill, styles.crowdAvailable]} />
              </View>
              <View style={styles.crowdDetailRow}>
                <Text style={styles.crowdNote}>● {source ? crowdingLevel ? `${crowdingLevel} Crowding` : 'Crowding not reported' : 'Moderate Crowding'}</Text>
                <Text style={styles.crowdComfort}>Comfortable boarding • A/C working</Text>
              </View>
            </View>

            <View style={styles.approachingCard}>
              <View style={styles.approachingIcon}><Ionicons name="bus" size={17} color="#FFF" /></View>
              <View style={styles.approachingInfo}>
                <Text style={styles.approachingSub}>NOW APPROACHING</Text>
                <Text style={styles.approachingName}>Havelock Town (Dickmans Rd)</Text>
              </View>
              <View style={styles.minPill}><Text style={styles.minText}>1 min</Text></View>
            </View>

            <View style={styles.timelineHeader}>
              <View style={styles.timelineTitleRow}><Ionicons name="git-branch-outline" size={16} color="#163B83" /><Text style={styles.timelineTitle}>Route Timeline & Stops</Text></View>
              <Text style={styles.fareLabel}>Fare: LKR 70.00</Text>
            </View>

            <View style={styles.timelineList}>
              {stops.map((stop, index) => (
                <View key={stop.name} style={styles.timelineRow}>
                  <View style={styles.stopRail}>
                    <View style={[styles.stopNode, stop.state === 'current' && styles.stopNodeCurrent, stop.state === 'upcoming' && styles.stopNodeUpcoming]}>
                      <Ionicons name={stop.state === 'passed' ? 'checkmark' : stop.state === 'current' ? 'bus' : 'ellipse'} size={stop.state === 'current' ? 12 : 9} color={stop.state === 'passed' ? '#64748B' : '#163B83'} />
                    </View>
                    {index < stops.length - 1 && <View style={styles.stopLine} />}
                  </View>
                  <View style={styles.stopInfo}>
                    <Text style={[styles.stopName, stop.state === 'passed' && styles.passedStop]}>{stop.name}</Text>
                    <Text style={[styles.stopSub, stop.state === 'passed' && styles.passedStop]}>{stop.sub}</Text>
                  </View>
                  <Text style={[styles.stopStatus, stop.state === 'passed' && styles.passedStop]}>{stop.time}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.bottomNav}>
          {[
            { label: 'Home', icon: 'home-outline' as const, route: '/home' as const },
            { label: 'Map / Track', icon: 'map-outline' as const, route: '/' as const },
            { label: 'Tickets', icon: 'ticket-outline' as const, route: '/two' as const },
            { label: 'Profile', icon: 'person-outline' as const, route: '/profile' as const },
          ].map((item, index) => (
            <TouchableOpacity key={item.label} style={styles.navItem} onPress={() => router.replace(item.route)}>
              <Ionicons name={item.icon} size={19} color={index === 1 ? '#123B8B' : '#64748B'} />
              <Text style={[styles.navLabel, index === 1 && styles.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#DCE8F2' },
  container: { flex: 1, backgroundColor: '#E8EEF6' },
  map: { ...StyleSheet.absoluteFill },
  mapBusMarker: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#123B8B', borderWidth: 3, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  topControls: { position: 'absolute', top: 8, left: 14, right: 14, zIndex: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  gpsPill: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#FFF', paddingHorizontal: 13, paddingVertical: 8, borderRadius: 18, elevation: 3 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#008B78' },
  gpsPillText: { fontSize: 10, fontWeight: '800', color: '#163B83' },
  sheetContainer: { position: 'absolute', left: 0, right: 0, backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, elevation: 12 },
  sheetContent: { paddingHorizontal: 16, paddingBottom: 18 },
  sheetHandle: { width: 42, height: 4, backgroundColor: '#CBD5E1', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  busHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 14 },
  busBadgeBox: { backgroundColor: '#123B8B', padding: 8, borderRadius: 11, alignItems: 'center', width: 54 },
  busBadgeTag: { color: '#DCE9FF', fontSize: 8, fontWeight: '800' },
  busBadgeNum: { color: '#FFF', fontSize: 23, lineHeight: 25, fontWeight: '800' },
  busIdentity: { flex: 1, marginLeft: 10, gap: 2 },
  tagRow: { flexDirection: 'row' },
  sltbPill: { backgroundColor: '#E5EBFF', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  sltbText: { color: '#163B83', fontSize: 8, fontWeight: '800' },
  regText: { fontSize: 10, color: '#64748B' },
  routeText: { fontSize: 15, lineHeight: 19, fontWeight: '800', color: '#15223B' },
  actionIcons: { flexDirection: 'row', gap: 3 },
  smallIconBtn: { width: 32, height: 34, justifyContent: 'center', alignItems: 'center' },
  sheetDivider: { height: 1, backgroundColor: '#E8EDF4', marginHorizontal: -16, marginBottom: 14 },
  arrivalBanner: { backgroundColor: '#F0F2FF', borderRadius: 15, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E4E8F8' },
  arrivalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  onTimePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#75F1C5', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
  onTimeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#007F75' },
  onTimeText: { color: '#064A46', fontWeight: '800', fontSize: 10 },
  gpsLock: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  gpsLockText: { fontSize: 10, color: '#007F75', fontWeight: '700' },
  etaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  etaBlock: { flex: 1 },
  targetBlock: { width: 118, alignItems: 'flex-end' },
  mainEta: { fontSize: 30, lineHeight: 35, fontWeight: '900', color: '#123B8B' },
  targetStop: { fontSize: 11, lineHeight: 16, color: '#475569' },
  targetLabel: { color: '#64748B', fontSize: 8, fontWeight: '800', marginBottom: 4 },
  targetName: { color: '#123B8B', fontSize: 12, fontWeight: '800', textAlign: 'right' },
  metricsStrip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5, borderTopWidth: 1, borderTopColor: '#DDE2F1', paddingTop: 9 },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stripText: { fontSize: 9, color: '#152B59', fontWeight: '800' },
  syncText: { fontSize: 9, color: '#64748B', fontWeight: '700' },
  dot: { color: '#AAB4C5', fontSize: 10 },
  crowdingCard: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 12, marginBottom: 11 },
  crowdingHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  crowdingTitle: { flex: 1, fontSize: 12, fontWeight: '800', color: '#17233A' },
  seatsPill: { backgroundColor: '#82F0D9', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12 },
  seatsText: { color: '#075E5A', fontSize: 9, fontWeight: '800' },
  crowdBarTrack: { height: 9, flexDirection: 'row', gap: 4, marginBottom: 8 },
  crowdBarFill: { flex: 1, height: 9, borderRadius: 6 },
  crowdLow: { backgroundColor: '#38D9A5' },
  crowdModerate: { backgroundColor: '#F5A000' },
  crowdAvailable: { backgroundColor: '#E0E7FF' },
  crowdDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  crowdNote: { fontSize: 10, color: '#C45B00', fontWeight: '800' },
  crowdComfort: { flex: 1, fontSize: 9, color: '#475569' },
  approachingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2FF', padding: 10, borderRadius: 13, marginBottom: 13, gap: 9 },
  approachingIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: '#123B8B', justifyContent: 'center', alignItems: 'center' },
  approachingInfo: { flex: 1 },
  approachingSub: { fontSize: 8, fontWeight: '800', color: '#64748B', marginBottom: 2 },
  approachingName: { fontSize: 12, fontWeight: '800', color: '#17233A' },
  minPill: { backgroundColor: '#DFE7FF', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 },
  minText: { color: '#123B8B', fontWeight: '800', fontSize: 10 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  timelineTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timelineTitle: { fontSize: 12, fontWeight: '800', color: '#17233A' },
  fareLabel: { fontSize: 9, fontWeight: '800', color: '#007F75' },
  timelineList: { paddingBottom: 8 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', minHeight: 50 },
  stopRail: { width: 24, alignItems: 'center', alignSelf: 'stretch' },
  stopNode: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: '#CBD5E1', backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  stopNodeCurrent: { width: 23, height: 23, borderRadius: 12, backgroundColor: '#DCE8FF', borderColor: '#123B8B' },
  stopNodeUpcoming: { backgroundColor: '#FFF', borderColor: '#94A3B8' },
  stopLine: { position: 'absolute', top: 18, bottom: -3, width: 2, backgroundColor: '#D5DCE8' },
  stopInfo: { flex: 1, paddingLeft: 6 },
  stopName: { fontSize: 11, fontWeight: '800', color: '#17233A' },
  stopSub: { fontSize: 9, color: '#123B8B', marginTop: 2 },
  stopStatus: { fontSize: 9, fontWeight: '700', color: '#123B8B', marginLeft: 8 },
  passedStop: { color: '#8791A2', textDecorationLine: 'line-through' },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 62, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 8 },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  navLabel: { fontSize: 9, color: '#64748B', fontWeight: '600' },
  navLabelActive: { color: '#123B8B', fontWeight: '800' },
});