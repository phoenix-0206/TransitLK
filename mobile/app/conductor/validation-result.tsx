import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ValidationResultScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    status?: string;
  }>();

  // If status=invalid is passed, show invalid result.
  // Otherwise show valid result.
  const isValid = params.status !== 'invalid';

  const handleScanNext = () => {
    router.replace('/conductor/scanner');
  };

  const handleBackHome = () => {
    router.replace('/conductor/dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>TRANSITLK</Text>
            <Text style={styles.headerTitle}>CONDUCTOR</Text>

            <View style={styles.busInfoRow}>
              <View style={styles.routeBadge}>
                <Text style={styles.routeBadgeText}>138</Text>
              </View>

              <Text style={styles.busNumber}>WP ND-8422</Text>

              <Text style={styles.separator}>•</Text>

              <Text style={styles.syncText}>✓ Sync OK</Text>
            </View>
          </View>

          <View style={styles.profileCircle}>
            <Text style={styles.profileIcon}>♙</Text>
          </View>
        </View>

        {/* ================= RESULT CARD ================= */}

        <View
          style={[
            styles.resultCard,
            isValid ? styles.validCard : styles.invalidCard,
          ]}
        >
          <View
            style={[
              styles.resultIconCircle,
              isValid
                ? styles.validIconCircle
                : styles.invalidIconCircle,
            ]}
          >
            <Text style={styles.resultIcon}>
              {isValid ? '✓' : '×'}
            </Text>
          </View>

          <Text style={styles.resultTitle}>
            {isValid ? 'Ticket Valid' : 'Ticket Already Used'}
          </Text>

          <Text style={styles.resultSubtitle}>
            {isValid
              ? 'Ticket successfully validated'
              : 'This ticket cannot be accepted'}
          </Text>

          <View style={styles.resultTimeBadge}>
            <Text style={styles.resultTimeText}>
              {isValid
                ? '✓ Validated Just Now'
                : '⚠ Failed • Duplicate Scan'}
            </Text>
          </View>
        </View>

        {/* ================= INVALID REASON ================= */}

        {!isValid && (
          <View style={styles.warningCard}>
            <View style={styles.warningIconCircle}>
              <Text style={styles.warningIcon}>!</Text>
            </View>

            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>
                Ticket Already Used
              </Text>

              <Text style={styles.warningText}>
                This digital ticket has already been validated and
                cannot be used again.
              </Text>
            </View>
          </View>
        )}

        {/* ================= TRIP DETAILS ================= */}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.routeNumberBox}>
              <Text style={styles.routeNumber}>138</Text>
            </View>

            <View style={styles.routeTextContainer}>
              <Text style={styles.routeTitle}>
                Maharagama → Colombo Fort
              </Text>

              <Text style={styles.routeSubtitle}>
                SLTB Ashok Leyland
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>
                ORIGIN
              </Text>

              <Text style={styles.detailValue}>
                Maharagama Stand
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>
                DESTINATION
              </Text>

              <Text style={styles.detailValue}>
                Colombo Fort
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.smallInfoBox}>
              <Text style={styles.detailLabel}>
                BUS
              </Text>

              <Text style={styles.detailValue}>
                WP ND-8422
              </Text>
            </View>

            <View style={styles.smallInfoBox}>
              <Text style={styles.detailLabel}>
                FARE
              </Text>

              <Text
                style={[
                  styles.fareValue,
                  !isValid && styles.invalidFare,
                ]}
              >
                LKR 70.00
              </Text>
            </View>
          </View>
        </View>

        {/* ================= PASSENGER DETAILS ================= */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Passenger Details
          </Text>

          <View style={styles.passengerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>KJ</Text>
            </View>

            <View>
              <Text style={styles.detailLabel}>
                PASSENGER NAME
              </Text>

              <Text style={styles.passengerName}>
                Kasun Jayasuriya
              </Text>
            </View>
          </View>

          <View style={styles.ticketBox}>
            <View>
              <Text style={styles.detailLabel}>
                E-TICKET TOKEN
              </Text>

              <Text style={styles.ticketToken}>
                TLK-2024-8849-B
              </Text>
            </View>

            <Text style={styles.copyIcon}>▣</Text>
          </View>
        </View>

        {/* ================= STATUS ================= */}

        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusDot,
              isValid
                ? styles.statusDotValid
                : styles.statusDotInvalid,
            ]}
          />

          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>
              {isValid
                ? 'Ticket successfully validated'
                : 'Validation rejected'}
            </Text>

            <Text style={styles.statusDescription}>
              {isValid
                ? 'The ticket is valid for this journey.'
                : 'The ticket has already been used.'}
            </Text>
          </View>
        </View>

        {/* ================= ACTIONS ================= */}

        <Pressable
          style={styles.primaryButton}
          onPress={handleScanNext}
        >
          <Text style={styles.primaryButtonIcon}>▣</Text>

          <Text style={styles.primaryButtonText}>
            Scan Next Ticket
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={handleBackHome}
        >
          <Text style={styles.secondaryButtonIcon}>⌂</Text>

          <Text style={styles.secondaryButtonText}>
            Back to Home
          </Text>
        </Pressable>

        {/* ================= FOOTER ================= */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            TransitLK • Conductor Validation
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ======================================================
   STYLES
====================================================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  /* ================= HEADER ================= */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 14,
  },

  logo: {
    fontSize: 21,
    fontWeight: '800',
    color: '#062B78',
    letterSpacing: 0.3,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#062B78',
    marginTop: -2,
  },

  busInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  routeBadge: {
    backgroundColor: '#E2E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    marginRight: 8,
  },

  routeBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#142F75',
  },

  busNumber: {
    fontSize: 13,
    color: '#555B6E',
    fontWeight: '500',
  },

  separator: {
    marginHorizontal: 6,
    color: '#777C8D',
  },

  syncText: {
    fontSize: 13,
    color: '#008878',
    fontWeight: '600',
  },

  profileCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#062B78',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIcon: {
    color: '#FFFFFF',
    fontSize: 24,
  },

  /* ================= RESULT ================= */

  resultCard: {
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 14,
  },

  validCard: {
    backgroundColor: '#006B4F',
  },

  invalidCard: {
    backgroundColor: '#C51D24',
  },

  resultIconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 7,
  },

  validIconCircle: {
    backgroundColor: '#6EF0C0',
    borderColor: '#29C99A',
  },

  invalidIconCircle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E35A5A',
  },

  resultIcon: {
    fontSize: 52,
    fontWeight: '800',
    color: '#006B4F',
  },

  resultTitle: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '800',
    textAlign: 'center',
  },

  resultSubtitle: {
    color: '#E8FFF8',
    fontSize: 14,
    marginTop: 7,
    textAlign: 'center',
  },

  resultTimeBadge: {
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 15,
  },

  resultTimeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  /* ================= WARNING ================= */

  warningCard: {
    backgroundColor: '#FFF0EF',
    borderRadius: 14,
    padding: 15,
    flexDirection: 'row',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FFD0CD',
  },

  warningIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFD8D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  warningIcon: {
    fontSize: 20,
    fontWeight: '800',
    color: '#C51D24',
  },

  warningContent: {
    flex: 1,
  },

  warningTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#C51D24',
    marginBottom: 4,
  },

  warningText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#555',
  },

  /* ================= GENERAL CARD ================= */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  routeNumberBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#062B78',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  routeNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  routeTextContainer: {
    flex: 1,
  },

  routeTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#11275E',
  },

  routeSubtitle: {
    fontSize: 12,
    color: '#6B7080',
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: '#E8EAF1',
    marginVertical: 14,
  },

  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  detailItem: {
    flex: 1,
    paddingRight: 10,
  },

  smallInfoBox: {
    flex: 1,
    backgroundColor: '#F1F3FF',
    padding: 11,
    borderRadius: 10,
    marginRight: 8,
  },

  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#686D7C',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#20263A',
  },

  fareValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#007B68',
  },

  invalidFare: {
    color: '#C51D24',
  },

  /* ================= PASSENGER ================= */

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#11275E',
    marginBottom: 15,
  },

  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DDE5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  avatarText: {
    color: '#062B78',
    fontSize: 16,
    fontWeight: '800',
  },

  passengerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#20263A',
  },

  ticketBox: {
    backgroundColor: '#F1F3FF',
    borderRadius: 11,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  ticketToken: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1D294A',
    letterSpacing: 0.5,
  },

  copyIcon: {
    fontSize: 22,
    color: '#555B6E',
  },

  /* ================= STATUS ================= */

  statusCard: {
    backgroundColor: '#E9EDFF',
    borderRadius: 13,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 11,
  },

  statusDotValid: {
    backgroundColor: '#00A982',
  },

  statusDotInvalid: {
    backgroundColor: '#D52B32',
  },

  statusTextContainer: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#29304A',
  },

  statusDescription: {
    fontSize: 12,
    color: '#656B7B',
    marginTop: 3,
  },

  /* ================= BUTTONS ================= */

  primaryButton: {
    backgroundColor: '#062B78',
    minHeight: 58,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  primaryButtonIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    marginRight: 9,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  secondaryButton: {
    backgroundColor: '#E3E9FF',
    minHeight: 54,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonIcon: {
    color: '#1A2E67',
    fontSize: 21,
    marginRight: 8,
  },

  secondaryButtonText: {
    color: '#1A2E67',
    fontSize: 16,
    fontWeight: '700',
  },

  /* ================= FOOTER ================= */

  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },

  footerText: {
    fontSize: 11,
    color: '#9296A4',
  },
});