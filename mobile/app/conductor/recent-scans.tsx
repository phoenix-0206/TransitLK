import React from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

export default function RecentScansScreen() {
  const router = useRouter();

  // Temporary data.
  // Later this will come from the ticket_scans table.
  const scans: any[] = [];

  const validScans = scans.filter(
    (scan) => scan.scan_result === 'VALID',
  ).length;

  const failedScans = scans.filter(
    (scan) => scan.scan_result !== 'VALID',
  ).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ================= HEADER ================= */}

        <View style={styles.header}>

          <View>
            <Text style={styles.brand}>
              TransitLK
            </Text>

            <Text style={styles.title}>
              Recent Scans
            </Text>

            <Text style={styles.subtitle}>
              Your recent ticket validations
            </Text>
          </View>

          <View style={styles.profileCircle}>
            <Text style={styles.profileIcon}>
              ♙
            </Text>
          </View>

        </View>

        {/* ================= STATISTICS ================= */}

        <View style={styles.statsCard}>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {scans.length}
            </Text>

            <Text style={styles.statLabel}>
              Today's Scans
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text
              style={[
                styles.statNumber,
                styles.validNumber,
              ]}
            >
              {validScans}
            </Text>

            <Text style={styles.statLabel}>
              Valid
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text
              style={[
                styles.statNumber,
                styles.failedNumber,
              ]}
            >
              {failedScans}
            </Text>

            <Text style={styles.statLabel}>
              Failed
            </Text>
          </View>

        </View>

        {/* ================= TODAY ================= */}

        <View style={styles.sectionHeader}>

          <Text style={styles.sectionTitle}>
            Today's Scans
          </Text>

          <Text style={styles.scanCount}>
            {scans.length} scans
          </Text>

        </View>

        {/* ================= EMPTY STATE ================= */}

        {scans.length === 0 && (
          <View style={styles.emptyCard}>

            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>
                ✓
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No Recent Scans
            </Text>

            <Text style={styles.emptyText}>
              Your validated tickets will appear
              here after you scan a ticket.
            </Text>

            <Pressable
              style={styles.scanButton}
              onPress={() =>
                router.push('/conductor/scanner')
              }
            >
              <Text style={styles.scanButtonIcon}>
                ▣
              </Text>

              <Text style={styles.scanButtonText}>
                Scan Ticket
              </Text>
            </Pressable>

          </View>
        )}

        {/* ================= SCAN LIST ================= */}

        {scans.length > 0 && (
          <View style={styles.scanList}>
            {scans.map((scan, index) => (
              <View
                key={scan.id ?? index}
                style={styles.scanItem}
              >
                <View style={styles.scanItemIcon}>
                  <Text style={styles.scanItemIconText}>
                    {scan.scan_result === 'VALID'
                      ? '✓'
                      : '×'}
                  </Text>
                </View>

                <View style={styles.scanItemInfo}>
                  <Text style={styles.ticketId}>
                    {scan.ticket_id}
                  </Text>

                  <Text style={styles.scanTime}>
                    {scan.scanned_at ?? 'Recently'}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.scanStatus,
                    scan.scan_result === 'VALID'
                      ? styles.validStatus
                      : styles.failedStatus,
                  ]}
                >
                  {scan.scan_result}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ================= BACK ================= */}

        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.push('/conductor/dashboard')
          }
        >
          <Text style={styles.backIcon}>
            ←
          </Text>

          <Text style={styles.backText}>
            Back to Dashboard
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  // ================= HEADER =================

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  brand: {
    fontSize: 15,
    fontWeight: '800',
    color: '#087F80',
    letterSpacing: 0.5,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#123B56',
    marginTop: 2,
  },

  subtitle: {
    fontSize: 14,
    color: '#71808A',
    marginTop: 5,
  },

  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#123B56',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIcon: {
    color: '#FFFFFF',
    fontSize: 24,
  },

  // ================= STATS =================

  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 25,
    fontWeight: '800',
    color: '#123B56',
  },

  validNumber: {
    color: '#087F80',
  },

  failedNumber: {
    color: '#D33A3A',
  },

  statLabel: {
    fontSize: 12,
    color: '#77838B',
    marginTop: 5,
  },

  divider: {
    width: 1,
    height: 42,
    backgroundColor: '#E1E6EA',
  },

  // ================= SECTION =================

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#123B56',
  },

  scanCount: {
    fontSize: 12,
    color: '#7B858C',
  },

  // ================= EMPTY =================

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    minHeight: 330,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E3F4F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyIcon: {
    fontSize: 42,
    color: '#087F80',
    fontWeight: '700',
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#123B56',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: '#71808A',
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 330,
  },

  scanButton: {
    marginTop: 24,
    backgroundColor: '#087F80',
    borderRadius: 12,
    paddingHorizontal: 25,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  scanButtonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    marginRight: 8,
  },

  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // ================= LIST =================

  scanList: {
    gap: 10,
  },

  scanItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  scanItemIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E3F4F3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scanItemIconText: {
    color: '#087F80',
    fontSize: 22,
    fontWeight: '800',
  },

  scanItemInfo: {
    flex: 1,
    marginLeft: 12,
  },

  ticketId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#123B56',
  },

  scanTime: {
    fontSize: 12,
    color: '#7B858C',
    marginTop: 3,
  },

  scanStatus: {
    fontSize: 11,
    fontWeight: '800',
  },

  validStatus: {
    color: '#087F80',
  },

  failedStatus: {
    color: '#D33A3A',
  },

  // ================= BACK =================

  backButton: {
    marginTop: 20,
    backgroundColor: '#E8EDF1',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  backIcon: {
    fontSize: 18,
    color: '#123B56',
    marginRight: 8,
  },

  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#123B56',
  },
});