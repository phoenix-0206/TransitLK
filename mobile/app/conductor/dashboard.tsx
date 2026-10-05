import React from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';


// ======================================================
// CONDUCTOR DASHBOARD
// ======================================================

export default function ConductorDashboardScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* ==================================================
          HEADER
      ================================================== */}

      <View style={styles.header}>

        <View>
          <Text style={styles.logo}>
            TransitLK
          </Text>

          <Text style={styles.welcome}>
            Welcome, Conductor
          </Text>

          <Text style={styles.subtitle}>
            Manage your journey and tickets
          </Text>
        </View>

        <Pressable
          style={styles.profileButton}
          onPress={() =>
            router.push('/conductor/profile')
          }
        >
          <Text style={styles.profileIcon}>
            👤
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
            TODAY'S JOURNEY
        ================================================== */}

        <Text style={styles.sectionTitle}>
          Today's Journey
        </Text>

        <View style={styles.journeyCard}>

          <View style={styles.journeyTop}>

            <View>
              <Text style={styles.smallLabel}>
                ASSIGNED ROUTE
              </Text>

              <Text style={styles.routeNumber}>
                Route 245
              </Text>
            </View>

            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />

              <Text style={styles.activeText}>
                ACTIVE
              </Text>
            </View>

          </View>


          <View style={styles.routeRow}>

            <View style={styles.locationBlock}>
              <Text style={styles.locationLabel}>
                FROM
              </Text>

              <Text style={styles.location}>
                Nittambuwa
              </Text>
            </View>

            <Text style={styles.arrow}>
              →
            </Text>

            <View style={styles.locationBlock}>
              <Text style={styles.locationLabel}>
                TO
              </Text>

              <Text style={styles.location}>
                Colombo
              </Text>
            </View>

          </View>


          <View style={styles.journeyDetails}>

            <View>
              <Text style={styles.detailLabel}>
                BUS
              </Text>

              <Text style={styles.detailValue}>
                NB-2456
              </Text>
            </View>

            <View>
              <Text style={styles.detailLabel}>
                SHIFT
              </Text>

              <Text style={styles.detailValue}>
                Morning
              </Text>
            </View>

            <View>
              <Text style={styles.detailLabel}>
                STATUS
              </Text>

              <Text style={styles.detailValue}>
                On Duty
              </Text>
            </View>

          </View>

        </View>


        {/* ==================================================
            QUICK ACTION
        ================================================== */}

        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>


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
              Scan Passenger Ticket
            </Text>

            <Text style={styles.scanSubtitle}>
              Scan a passenger QR ticket
              for validation
            </Text>

          </View>

          <Text style={styles.chevron}>
            ›
          </Text>

        </Pressable>


        <View style={styles.actionRow}>

          {/* Recent Scans */}

          <Pressable
            style={styles.actionCard}
            onPress={() =>
              router.push(
                '/conductor/recent-scans',
              )
            }
          >

            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>
                ✓
              </Text>
            </View>

            <Text style={styles.actionTitle}>
              Recent Scans
            </Text>

            <Text style={styles.actionSubtitle}>
              View ticket history
            </Text>

          </Pressable>


          {/* Profile */}

          <Pressable
            style={styles.actionCard}
            onPress={() =>
              router.push(
                '/conductor/profile',
              )
            }
          >

            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>
                👤
              </Text>
            </View>

            <Text style={styles.actionTitle}>
              My Profile
            </Text>

            <Text style={styles.actionSubtitle}>
              View conductor details
            </Text>

          </Pressable>

        </View>


        {/* ==================================================
            TODAY'S SUMMARY
        ================================================== */}

        <Text style={styles.sectionTitle}>
          Today's Summary
        </Text>


        <View style={styles.summaryGrid}>

          {/* Tickets */}

          <View style={styles.summaryCard}>

            <Text style={styles.summaryIcon}>
              🎟️
            </Text>

            <Text style={styles.summaryNumber}>
              24
            </Text>

            <Text style={styles.summaryLabel}>
              Tickets Scanned
            </Text>

          </View>


          {/* Passengers */}

          <View style={styles.summaryCard}>

            <Text style={styles.summaryIcon}>
              👥
            </Text>

            <Text style={styles.summaryNumber}>
              18
            </Text>

            <Text style={styles.summaryLabel}>
              Passengers
            </Text>

          </View>


          {/* Revenue */}

          <View style={styles.summaryCard}>

            <Text style={styles.summaryIcon}>
              Rs.
            </Text>

            <Text style={styles.summaryNumber}>
              2,450
            </Text>

            <Text style={styles.summaryLabel}>
              Fare Collected
            </Text>

          </View>


          {/* Occupancy */}

          <View style={styles.summaryCard}>

            <Text style={styles.summaryIcon}>
              🚌
            </Text>

            <Text style={styles.summaryNumber}>
              62%
            </Text>

            <Text style={styles.summaryLabel}>
              Occupancy
            </Text>

          </View>

        </View>


        {/* ==================================================
            DUTY INFORMATION
        ================================================== */}

        <Text style={styles.sectionTitle}>
          Duty Information
        </Text>


        <View style={styles.infoCard}>

          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>
              Employee ID
            </Text>

            <Text style={styles.infoValue}>
              CON-001
            </Text>

          </View>


          <View style={styles.divider} />


          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>
              Assigned Depot
            </Text>

            <Text style={styles.infoValue}>
              Nittambuwa
            </Text>

          </View>


          <View style={styles.divider} />


          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>
              Duty Status
            </Text>

            <View style={styles.dutyStatus}>

              <View style={styles.dutyDot} />

              <Text style={styles.dutyText}>
                On Duty
              </Text>

            </View>

          </View>

        </View>


        {/* ==================================================
            FOOTER SPACE
        ================================================== */}

        <View style={styles.bottomSpace} />

      </ScrollView>

    </View>
  );
}


// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F4F8FA',
  },


  // ====================================================
  // HEADER
  // ====================================================

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 20,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: '#E8EFF2',
  },

  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#087F80',
    marginBottom: 5,
  },

  welcome: {
    fontSize: 22,
    fontWeight: '800',
    color: '#103851',
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#58717F',
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E8F5F5',

    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIcon: {
    fontSize: 21,
  },


  // ====================================================
  // CONTENT
  // ====================================================

  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#103851',
    marginBottom: 12,
    marginTop: 5,
  },


  // ====================================================
  // JOURNEY CARD
  // ====================================================

  journeyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 25,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,

    elevation: 2,
  },

  journeyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  smallLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8A9AA6',
    letterSpacing: 0.7,
  },

  routeNumber: {
    fontSize: 23,
    fontWeight: '800',
    color: '#103851',
    marginTop: 3,
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#E7F6EE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#258A55',
    marginRight: 5,
  },

  activeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#258A55',
  },


  // ====================================================
  // ROUTE
  // ====================================================

  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 20,
  },

  locationBlock: {
    flex: 1,
  },

  locationLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8A9AA6',
    marginBottom: 4,
  },

  location: {
    fontSize: 15,
    fontWeight: '700',
    color: '#103851',
  },

  arrow: {
    fontSize: 22,
    color: '#087F80',
    marginHorizontal: 12,
  },


  // ====================================================
  // JOURNEY DETAILS
  // ====================================================

  journeyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    borderTopWidth: 1,
    borderTopColor: '#EEF2F4',

    paddingTop: 15,
  },

  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8A9AA6',
    marginBottom: 3,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#103851',
  },


  // ====================================================
  // SCAN CARD
  // ====================================================

  scanCard: {
    backgroundColor: '#087F80',
    borderRadius: 18,
    padding: 18,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 12,
  },

  scanIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,

    backgroundColor: 'rgba(255,255,255,0.18)',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  scanIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },

  scanContent: {
    flex: 1,
  },

  scanTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  scanSubtitle: {
    color: '#D8F1F1',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },

  chevron: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '300',
    marginLeft: 8,
  },


  // ====================================================
  // ACTION CARDS
  // ====================================================

  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },

  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,

    minHeight: 135,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,

    elevation: 2,
  },

  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,

    backgroundColor: '#E8F5F5',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 12,
  },

  actionIconText: {
    fontSize: 17,
    color: '#087F80',
    fontWeight: '800',
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#103851',
  },

  actionSubtitle: {
    fontSize: 11,
    color: '#58717F',
    marginTop: 4,
    lineHeight: 16,
  },


  // ====================================================
  // SUMMARY
  // ====================================================

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 25,
  },

  summaryCard: {
    width: '48%',
    flexGrow: 1,

    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,

    minHeight: 125,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,

    elevation: 2,
  },

  summaryIcon: {
    fontSize: 18,
    marginBottom: 8,
  },

  summaryNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#103851',
  },

  summaryLabel: {
    fontSize: 11,
    color: '#58717F',
    marginTop: 3,
  },


  // ====================================================
  // DUTY INFORMATION
  // ====================================================

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 17,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,

    elevation: 2,
  },

  infoRow: {
    minHeight: 55,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: 13,
    color: '#58717F',
  },

  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#103851',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF2F4',
  },

  dutyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dutyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#258A55',
    marginRight: 6,
  },

  dutyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#258A55',
  },


  bottomSpace: {
    height: 40,
  },

});