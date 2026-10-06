import React from 'react';

import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import BottomNavigation from '../../components/BottomNavigation';

// ======================================================
// CONDUCTOR DASHBOARD
// ======================================================

export default function ConductorDashboardScreen() {
  const router = useRouter();

  // ======================================================
  // TEMPORARY DASHBOARD DATA
  // ======================================================

  const conductor = {
    name: 'Sunil Perera',
    badgeId: '#7842',
    position: 'Senior Conductor',
    depot: 'Pettah Central',
    shift: '06:00 - 14:30',
  };

  const journey = {
    route: '138',
    busNumber: 'WPND-8422',
    busModel: 'Ashok Leyland Viking',
    from: 'Maharagama',
    to: 'Colombo Fort (Pettah)',
    trip: 'Trip 3 of 4',
    status: 'LIVE',
  };

  const nextBay = {
    name: 'Nugegoda Supermarket Jnc.',
    bay: 'Bay 2',
    time: '3 min',
    distance: '450m ahead',
    direction: 'Inbound to Pettah Fort',
  };

  const statistics = {
    scanned: 142,
    qrPercentage: 98,
    fare: '9,940',
    cash: '4.8k',
    lankaQr: '5.1k',
    seated: 35,
    reserved: 13,
    totalSeats: 54,
    seatsLeft: 6,
  };

  // ======================================================
  // ACTIONS
  // ======================================================

  function handleIssueCashTicket() {
    Alert.alert(
      'Issue Cash Ticket',
      'Cash ticket issuing will be connected here.',
    );
  }

  function handleWaybill() {
    Alert.alert(
      'Waybill & Revenue',
      'Waybill and revenue management will be connected here.',
    );
  }

  function handleCloudSync() {
    Alert.alert(
      'Depot Cloud Sync',
      'Cloud synchronization will be connected here.',
    );
  }

  function handleManifest() {
    Alert.alert(
      'Passenger Manifest',
      'Passenger manifest will be connected here.',
    );
  }

  async function handleCallControlRoom() {
    try {
      await Linking.openURL('tel:1955');
    } catch {
      Alert.alert(
        'Control Room',
        'Call Pettah Control Room: 1955 / EXT 12',
      );
    }
  }

  function handleEndShift() {
    Alert.alert(
      'End Shift',
      'Are you sure you want to handover the waybill and end your shift?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => {
            Alert.alert(
              'Shift Handover',
              'Waybill handover process will be connected here.',
            );
          },
        },
      ],
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <View style={styles.container}>

      {/* ==================================================
          HEADER
      ================================================== */}

      <View style={styles.header}>

        <View style={styles.headerLeft}>

          <View style={styles.logoRow}>
            <Text style={styles.logo}>
              TransitLK
            </Text>

            <Text style={styles.conductorLabel}>
              CONDUCTOR
            </Text>
          </View>

          <Text style={styles.depotText}>
            Fort Central Depot
          </Text>

        </View>

        <Pressable
          style={styles.profileButton}
          onPress={() =>
            router.push('/conductor/profile')
          }
        >
          <Text style={styles.profileIcon}>
            ♙
          </Text>
        </Pressable>

      </View>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ==================================================
            CONDUCTOR CARD
        ================================================== */}

        <View style={styles.conductorCard}>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              SP
            </Text>
          </View>

          <View style={styles.conductorInfo}>

            <View style={styles.nameRow}>

              <Text style={styles.conductorName}>
                {conductor.name}
              </Text>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {conductor.badgeId}
                </Text>
              </View>

            </View>

            <Text style={styles.positionText}>
              {conductor.position} • {conductor.depot}
            </Text>

          </View>

          <Text style={styles.shiftText}>
            {conductor.shift}
          </Text>

        </View>

        {/* ==================================================
            NEXT OFFICIAL PASSENGER BAY
        ================================================== */}

        <View style={styles.nextBayCard}>

          <View style={styles.nextBayTop}>

            <View style={styles.nextBayTitleRow}>

              <View style={styles.liveDot} />

              <Text style={styles.nextBayTitle}>
                NEXT OFFICIAL PASSENGER BAY
              </Text>

            </View>

            <View style={styles.bayBadge}>
              <Text style={styles.bayBadgeText}>
                {nextBay.bay}
              </Text>
            </View>

          </View>

          <View style={styles.nextBayMainRow}>

            <View style={styles.nextBayLocation}>
              <Text style={styles.nextBayName}>
                {nextBay.name}
              </Text>

              <Text style={styles.nextBayDirection}>
                • {nextBay.direction}
              </Text>
            </View>

            <View style={styles.nextBayTime}>

              <Text style={styles.timeValue}>
                {nextBay.time}
              </Text>

              <Text style={styles.distanceText}>
                {nextBay.distance}
              </Text>

            </View>

          </View>

        </View>

        {/* ==================================================
            BUS / ROUTE CARD
        ================================================== */}

        <View style={styles.routeCard}>

          <View style={styles.routeHeader}>

            <View style={styles.routeNumberBox}>

              <Text style={styles.lineSmall}>
                LINE
              </Text>

              <Text style={styles.lineNumber}>
                {journey.route}
              </Text>

            </View>

            <View style={styles.busInfo}>

              <View style={styles.busNumberRow}>

                <Text style={styles.busNumber}>
                  {journey.busNumber}
                </Text>

                <Text style={styles.busModel}>
                  {journey.busModel}
                </Text>

              </View>

              <Text style={styles.routePath}>
                {journey.from} → {journey.to}
              </Text>

            </View>

            <View style={styles.tripBadge}>

              <Text style={styles.tripText}>
                {journey.trip}
              </Text>

            </View>

          </View>

          {/* Statistics */}

          <View style={styles.statsRow}>

            {/* Passes */}

            <View style={styles.statCard}>

              <View style={styles.statHeader}>

                <Text style={styles.statLabel}>
                  Passes Scanned
                </Text>

                <Text style={styles.statIcon}>
                  ◉
                </Text>

              </View>

              <Text style={styles.statNumber}>
                {statistics.scanned}
              </Text>

              <Text style={styles.statSmallGreen}>
                {statistics.qrPercentage}% QR/NFC
              </Text>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${statistics.qrPercentage}%`,
                    },
                  ]}
                />
              </View>

            </View>

            {/* Fare */}

            <View style={styles.statCard}>

              <View style={styles.statHeader}>

                <Text style={styles.statLabel}>
                  Fare Collection
                </Text>

                <Text style={styles.statIcon}>
                  Rs.
                </Text>

              </View>

              <Text style={styles.fareNumber}>
                Rs. {statistics.fare}
              </Text>

              <View style={styles.fareRow}>

                <Text style={styles.cashText}>
                  Cash: {statistics.cash}
                </Text>

                <Text style={styles.qrText}>
                  LankaQR: {statistics.lankaQr}
                </Text>

              </View>

            </View>

          </View>

          {/* Occupancy */}

          <View style={styles.occupancyBox}>

            <View style={styles.occupancyHeader}>

              <Text style={styles.occupancyTitle}>
                ♿ Occupancy: {statistics.seated + statistics.reserved} / {statistics.totalSeats} Seats
              </Text>

              <View style={styles.densityBadge}>
                <Text style={styles.densityText}>
                  ● High Density
                </Text>
              </View>

            </View>

            <View style={styles.occupancyBarBackground}>

              <View
                style={[
                  styles.occupancyBar,
                  {
                    width: `${
                      ((statistics.seated +
                        statistics.reserved) /
                        statistics.totalSeats) *
                      100
                    }%`,
                  },
                ]}
              />

            </View>

            <View style={styles.occupancyDetails}>

              <Text style={styles.occupancyDetail}>
                {statistics.seated} Seated Normal
              </Text>

              <Text style={styles.occupancyDetail}>
                {statistics.reserved} Reserved/Senior
              </Text>

              <Text style={styles.seatsLeft}>
                {statistics.seatsLeft} Seats Left
              </Text>

            </View>

          </View>

        </View>

        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <View style={styles.sectionHeaderRow}>

          <Text style={styles.sectionTitle}>
            QUICK ACTIONS
          </Text>

          <Text style={styles.activeActionText}>
            One-Touch Active
          </Text>

        </View>

        {/* Scan */}

        <Pressable
          style={styles.scanCard}
          onPress={() =>
            router.push('/conductor/scanner')
          }
        >

          <View style={styles.scanIconContainer}>
            <Text style={styles.scanIcon}>
              QR
            </Text>
          </View>

          <View style={styles.scanContent}>

            <Text style={styles.scanTitle}>
              SCAN PASS /{'\n'}TICKET
            </Text>

            <Text style={styles.scanSubtitle}>
              • Tap SmartCard or Read QR
            </Text>

          </View>

          <View style={styles.scanArrowCircle}>
            <Text style={styles.scanArrow}>
              ›
            </Text>
          </View>

        </Pressable>

        {/* Action Grid */}

        <View style={styles.actionGrid}>

          {/* Issue Cash Ticket */}

          <Pressable
            style={styles.gridActionCard}
            onPress={handleIssueCashTicket}
          >

            <View style={styles.gridIcon}>
              <Text style={styles.gridIconText}>
                ▣
              </Text>
            </View>

            <Text style={styles.gridTitle}>
              Issue Cash Ticket
            </Text>

          </Pressable>

          {/* Recent Scans */}

          <Pressable
            style={styles.gridActionCard}
            onPress={() =>
              router.push(
                '/conductor/recent-scans',
              )
            }
          >

            <View style={styles.gridIcon}>
              <Text style={styles.gridIconText}>
                ◔
              </Text>
            </View>

            <Text style={styles.gridTitle}>
              Recent Scans
            </Text>

          </Pressable>

          {/* Waybill */}

          <Pressable
            style={styles.gridActionCard}
            onPress={handleWaybill}
          >

            <View style={styles.gridIcon}>
              <Text style={styles.gridIconText}>
                →
              </Text>
            </View>

            <Text style={styles.gridTitle}>
              Waybill & Revenue
            </Text>

          </Pressable>

          {/* Cloud Sync */}

          <Pressable
            style={styles.gridActionCard}
            onPress={handleCloudSync}
          >

            <View style={styles.gridIcon}>
              <Text style={styles.gridIconText}>
                ☁
              </Text>
            </View>

            <Text style={styles.gridTitle}>
              Depot Cloud Sync
            </Text>

          </Pressable>

        </View>

        {/* ==================================================
            ROUTE PROGRESSION
        ================================================== */}

        <View style={styles.sectionHeaderRow}>

          <Text style={styles.sectionTitle}>
            Route Progression
          </Text>

          <Text style={styles.progressCount}>
            4 / 16 Stations{'\n'}Passed
          </Text>

        </View>

        <View style={styles.progressionCard}>

          {/* Station 1 */}

          <View style={styles.stationRow}>

            <View style={styles.timeline}>

              <View style={styles.completedCircle}>
                <Text style={styles.checkMark}>
                  ✓
                </Text>
              </View>

              <View style={styles.timelineLine} />

            </View>

            <View style={styles.stationContent}>

              <Text style={styles.completedStation}>
                Maharagama Bus Stand
              </Text>

              <Text style={styles.stationTime}>
                07:15 AM • 42 Boarded
              </Text>

              <View style={styles.departedBadge}>
                <Text style={styles.departedText}>
                  Departed
                </Text>
              </View>

            </View>

          </View>

          {/* Station 2 */}

          <View style={styles.stationRow}>

            <View style={styles.timeline}>

              <View style={styles.currentCircle}>
                <View style={styles.currentInnerCircle} />
              </View>

              <View style={styles.timelineLine} />

            </View>

            <View style={styles.currentStationContent}>

              <View style={styles.currentStationTop}>

                <View>
                  <Text style={styles.currentStation}>
                    Nugegoda Supermarket
                  </Text>

                  <Text style={styles.stationTime}>
                    Approaching Now • 18
                  </Text>

                  <Text style={styles.stationStatus}>
                    Disembarking
                  </Text>
                </View>

                <View style={styles.etaBox}>

                  <Text style={styles.etaLabel}>
                    ETA
                  </Text>

                  <Text style={styles.etaTime}>
                    07:44
                  </Text>

                </View>

              </View>

            </View>

          </View>

          {/* Station 3 */}

          <View style={styles.stationRow}>

            <View style={styles.timeline}>

              <View style={styles.futureCircle} />

              <View style={styles.timelineLine} />

            </View>

            <View style={styles.stationContent}>

              <Text style={styles.futureStation}>
                Bambalapitiya Junction (Galle Rd)
              </Text>

              <Text style={styles.stationTime}>
                Transfer to Coast Line
              </Text>

              <Text style={styles.futureTime}>
                08:05 AM
              </Text>

            </View>

          </View>

          {/* Station 4 */}

          <View style={styles.stationRowLast}>

            <View style={styles.timeline}>

              <View style={styles.futureCircle} />

            </View>

            <View style={styles.stationContent}>

              <Text style={styles.futureStation}>
                Colombo Fort / Pettah Central
              </Text>

              <Text style={styles.stationTime}>
                Trip End Point
              </Text>

              <Text style={styles.futureTime}>
                08:35 AM
              </Text>

            </View>

          </View>

        </View>

        {/* ==================================================
            TRAFFIC ALERT
        ================================================== */}

        <View style={styles.trafficCard}>

          <View style={styles.trafficIcon}>
            <Text style={styles.trafficIconText}>
              ⚑
            </Text>
          </View>

          <View style={styles.trafficContent}>

            <Text style={styles.trafficTitle}>
              Highlink Congestion around Havelock Road
            </Text>

            <Text style={styles.trafficSubtitle}>
              Delays estimated +6 mins. Follow SLTB Dispatch Protocol.
            </Text>

          </View>

        </View>

        {/* ==================================================
            CONTROL ROOM
        ================================================== */}

        <Pressable
          style={styles.controlRoomButton}
          onPress={handleCallControlRoom}
        >

          <Text style={styles.controlRoomIcon}>
            ☎
          </Text>

          <Text style={styles.controlRoomText}>
            CALL PETTAH CONTROL ROOM (1955 / EXT 12)
          </Text>

        </Pressable>

        {/* ==================================================
            END SHIFT
        ================================================== */}

        <Pressable
          style={styles.endShiftButton}
          onPress={handleEndShift}
        >

          <Text style={styles.endShiftIcon}>
            ✓
          </Text>

          <Text style={styles.endShiftText}>
            Handover Waybill & End Shift
          </Text>

        </Pressable>

        <View style={styles.bottomSpace} />

      </ScrollView>

      {/* ==================================================
          BOTTOM NAVIGATION
      ================================================== */}

      <BottomNavigation
        items={[
          { key: 'duty', label: 'Duty Hub', icon: 'grid-outline', active: true, onPress: () => {} },
          { key: 'validate', label: 'Validate', icon: 'scan-outline', onPress: () => router.push('/conductor/scanner') },
          { key: 'fare', label: 'Issue Fare', icon: 'ticket-outline', onPress: handleIssueCashTicket },
          { key: 'manifest', label: 'Manifest', icon: 'list-outline', onPress: handleManifest },
          { key: 'staff', label: 'Staff ID', icon: 'person-outline', onPress: () => router.push('/conductor/profile') },
        ]}
      />

    </View>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({

  // ====================================================
  // CONTAINER
  // ====================================================

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  // ====================================================
  // HEADER
  // ====================================================

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 16,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF5',
  },

  headerLeft: {
    flex: 1,
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#087F80',
  },

  conductorLabel: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: '900',
    color: '#087F80',
    letterSpacing: 0.5,
  },

  depotText: {
    marginTop: 2,
    fontSize: 12,
    color: '#58717F',
  },

  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0A3287',

    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIcon: {
    fontSize: 23,
    color: '#FFFFFF',
  },

  // ====================================================
  // CONTENT
  // ====================================================

  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 25,
  },

  // ====================================================
  // CONDUCTOR CARD
  // ====================================================

  conductorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 13,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 14,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,

    elevation: 2,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DCE9EA',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 11,
  },

  avatarText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#087F80',
  },

  conductorInfo: {
    flex: 1,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  conductorName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#103851',
  },

  badge: {
    backgroundColor: '#EEF0F7',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },

  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#667085',
  },

  positionText: {
    marginTop: 3,
    fontSize: 11,
    color: '#6B7785',
  },

  shiftText: {
    fontSize: 11,
    color: '#4F5864',
    fontWeight: '700',
    marginLeft: 8,
  },

  // ====================================================
  // NEXT BAY
  // ====================================================

  nextBayCard: {
    backgroundColor: '#062A78',
    borderRadius: 17,
    padding: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },

  nextBayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  nextBayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5EE7DF',
    marginRight: 6,
  },

  nextBayTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#67E8E0',
  },

  bayBadge: {
    backgroundColor: '#3156A6',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  bayBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  nextBayMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  nextBayLocation: {
    flex: 1,
    paddingRight: 10,
  },

  nextBayName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },

  nextBayDirection: {
    color: '#C8D7F4',
    fontSize: 11,
    marginTop: 5,
  },

  nextBayTime: {
    alignItems: 'flex-end',
  },

  timeValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#5CE6DC',
  },

  distanceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D5E1F5',
  },

  // ====================================================
  // ROUTE CARD
  // ====================================================

  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 13,
    marginBottom: 17,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,

    elevation: 2,
  },

  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  routeNumberBox: {
    width: 58,
    height: 58,
    borderRadius: 10,
    backgroundColor: '#E8EDFF',

    alignItems: 'center',
    justifyContent: 'center',
  },

  lineSmall: {
    fontSize: 8,
    fontWeight: '800',
    color: '#294997',
  },

  lineNumber: {
    fontSize: 25,
    fontWeight: '900',
    color: '#183E91',
  },

  busInfo: {
    flex: 1,
    marginLeft: 10,
  },

  busNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  busNumber: {
    fontSize: 15,
    fontWeight: '900',
    color: '#24344B',
  },

  busModel: {
    fontSize: 9,
    color: '#8B91A0',
    marginLeft: 7,
  },

  routePath: {
    marginTop: 4,
    fontSize: 11,
    color: '#6D7583',
  },

  tripBadge: {
    backgroundColor: '#E9EDFC',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  tripText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#31477E',
  },

  // ====================================================
  // STATS
  // ====================================================

  statsRow: {
    flexDirection: 'row',
    marginTop: 12,
  },

 

  statCard: {
    flex: 1,
    backgroundColor: '#F3F5FF',
    borderRadius: 11,
    padding: 10,
    marginHorizontal: 3,
  },

  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#5F6777',
  },

  statIcon: {
    fontSize: 12,
    fontWeight: '900',
    color: '#087F80',
  },

  statNumber: {
    marginTop: 7,
    fontSize: 24,
    fontWeight: '900',
    color: '#1B2B46',
  },

  statSmallGreen: {
    fontSize: 9,
    fontWeight: '800',
    color: '#087F80',
    marginTop: 1,
  },

  progressBackground: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#DCE2E6',
    marginTop: 7,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#087F80',
    borderRadius: 3,
  },

  fareNumber: {
    marginTop: 7,
    fontSize: 21,
    fontWeight: '900',
    color: '#1B2B46',
  },

  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },

  cashText: {
    fontSize: 8,
    color: '#6B7381',
  },

  qrText: {
    fontSize: 8,
    color: '#087F80',
    fontWeight: '800',
  },

  // ====================================================
  // OCCUPANCY
  // ====================================================

  occupancyBox: {
    marginTop: 10,
    backgroundColor: '#F7F8FC',
    borderRadius: 11,
    padding: 10,
  },

  occupancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  occupancyTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#26354A',
  },

  densityBadge: {
    backgroundColor: '#FDE4E2',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  densityText: {
    fontSize: 8,
    color: '#C6312C',
    fontWeight: '800',
  },

  occupancyBarBackground: {
    height: 6,
    backgroundColor: '#DDE3EA',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },

  occupancyBar: {
    height: '100%',
    backgroundColor: '#173C8E',
    borderRadius: 3,
  },

  occupancyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  occupancyDetail: {
    fontSize: 8,
    color: '#626B79',
  },

  seatsLeft: {
    fontSize: 8,
    color: '#D3312E',
    fontWeight: '800',
  },

  // ====================================================
  // SECTION
  // ====================================================

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 9,
    marginTop: 2,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#172A43',
    textTransform: 'uppercase',
  },

  activeActionText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#087F80',
  },

  progressCount: {
    fontSize: 9,
    fontWeight: '800',
    color: '#5E6775',
    textAlign: 'right',
  },

  // ====================================================
  // SCAN
  // ====================================================

  scanCard: {
    backgroundColor: '#006247',
    borderRadius: 16,
    padding: 14,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 11,
  },

  scanIconContainer: {
    width: 51,
    height: 51,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  scanIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },

  scanContent: {
    flex: 1,
  },

  scanTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 21,
  },

  scanSubtitle: {
    color: '#CDEBE3',
    fontSize: 10,
    marginTop: 3,
  },

  scanArrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  scanArrow: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '300',
  },

  // ====================================================
  // ACTION GRID
  // ====================================================

  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 19,
  },

 

  gridActionCard: {
    width: '50%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 13,
    margin: 4,
    minHeight: 91,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,

    elevation: 2,
  },

  gridIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#EEF7F7',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 8,
  },

  gridIconText: {
    color: '#087F80',
    fontSize: 16,
    fontWeight: '900',
  },

  gridTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1B2D45',
  },

  // ====================================================
  // ROUTE PROGRESSION
  // ====================================================

  progressionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,

    elevation: 2,
  },

  stationRow: {
    flexDirection: 'row',
    minHeight: 72,
  },

  stationRowLast: {
    flexDirection: 'row',
    minHeight: 61,
  },

  timeline: {
    width: 29,
    alignItems: 'center',
  },

  completedCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#087F80',

    alignItems: 'center',
    justifyContent: 'center',
  },

  checkMark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  currentCircle: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#D9E7FF',

    borderWidth: 3,
    borderColor: '#1748A2',

    alignItems: 'center',
    justifyContent: 'center',
  },

  currentInnerCircle: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#087F80',
  },

  futureCircle: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#D8DDEA',
  },

  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#DDE2EB',
    marginTop: 2,
  },

  stationContent: {
    flex: 1,
    paddingLeft: 4,
    position: 'relative',
  },

  currentStationContent: {
    flex: 1,
    backgroundColor: '#E4F8F5',
    borderRadius: 10,
    padding: 9,
    marginBottom: 7,
  },

  currentStationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  completedStation: {
    fontSize: 12,
    fontWeight: '700',
    color: '#68707D',
    textDecorationLine: 'line-through',
  },

  currentStation: {
    fontSize: 14,
    fontWeight: '900',
    color: '#123D6A',
  },

  futureStation: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2D40',
  },

  stationTime: {
    fontSize: 10,
    color: '#737D8A',
    marginTop: 3,
  },

  stationStatus: {
    fontSize: 10,
    color: '#697583',
    marginTop: 2,
  },

  futureTime: {
    position: 'absolute',
    right: 0,
    top: 3,
    fontSize: 10,
    fontWeight: '800',
    color: '#5F6976',
  },

  departedBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#E9ECF8',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  departedText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#5F6574',
  },

  etaBox: {
    backgroundColor: '#6BE2D9',
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  etaLabel: {
    fontSize: 7,
    fontWeight: '900',
    color: '#277C78',
  },

  etaTime: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1B5553',
  },

  // ====================================================
  // TRAFFIC
  // ====================================================

  trafficCard: {
    backgroundColor: '#EEF1FF',
    borderRadius: 13,
    padding: 12,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 13,
  },

  trafficIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E0E5F8',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  trafficIconText: {
    fontSize: 18,
    color: '#273F84',
  },

  trafficContent: {
    flex: 1,
  },

  trafficTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#26344D',
  },

  trafficSubtitle: {
    fontSize: 9,
    color: '#6B7380',
    marginTop: 2,
  },

  // ====================================================
  // CONTROL ROOM
  // ====================================================

  controlRoomButton: {
    height: 49,
    borderRadius: 12,
    backgroundColor: '#FFE0DD',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 10,
  },

  controlRoomIcon: {
    fontSize: 17,
    color: '#B82D2B',
    marginRight: 8,
  },

  controlRoomText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#B82D2B',
  },

  // ====================================================
  // END SHIFT
  // ====================================================

  endShiftButton: {
    height: 49,
    borderRadius: 12,
    backgroundColor: '#E8EBFB',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  endShiftIcon: {
    fontSize: 16,
    color: '#535C72',
    marginRight: 8,
  },

  endShiftText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#535C72',
  },

  bottomSpace: {
    height: 18,
  },

  // ====================================================
  // BOTTOM NAV
  // ====================================================

  bottomNav: {
    height: 72,
    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#E8ECF1',

    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',

    paddingHorizontal: 5,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIconActive: {
    width: 27,
    height: 27,
    borderRadius: 7,
    backgroundColor: '#E8F4F4',

    alignItems: 'center',
    justifyContent: 'center',
  },

  navIconTextActive: {
    fontSize: 16,
    color: '#087F80',
    fontWeight: '900',
  },

  navIcon: {
    fontSize: 18,
    color: '#5F6674',
  },

  navLabelActive: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: '900',
    color: '#123B83',
  },

  navLabel: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: '700',
    color: '#626A77',
  },

});