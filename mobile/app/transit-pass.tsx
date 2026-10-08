import React, {
  useEffect,
  useState,
} from 'react';

import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';

export default function TransitPassScreen() {
  const params = useLocalSearchParams<{
    bookingRef?: string;
    ticketToken?: string;
    ticketId?: string;

    routeNumber?: string;
    serviceName?: string;

    originName?: string;
    destinationName?: string;

    travelDate?: string;
    departureTime?: string;
    arrivalTime?: string;

    totalPayable?: string;
    passengerDetails?: string;
    totalTickets?: string;

    paymentMethod?: string;
  }>();

  /*
   * Used when Transit Pass is opened later,
   * without navigation params.
   */
  const [storedTicket, setStoredTicket] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadLatestTicket = async () => {
      try {
        const raw =
          await AsyncStorage.getItem(
            'transitlk_tickets',
          );

        if (!raw) {
          return;
        }

        const tickets =
          JSON.parse(raw);

        if (
          Array.isArray(tickets) &&
          tickets.length > 0
        ) {
          /*
           * If a ticketToken was passed,
           * find that exact ticket.
           *
           * Otherwise use latest ticket.
           */
          if (params.ticketToken) {
            const selected =
              tickets.find(
                (item: any) =>
                  item.ticket_token ===
                  params.ticketToken,
              );

            if (selected) {
              setStoredTicket(selected);
              return;
            }
          }

          setStoredTicket(tickets[0]);
        }
      } catch (error) {
        console.warn(
          'Failed to load TransitLK ticket:',
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    void loadLatestTicket();
  }, [params.ticketToken]);

  /*
   * Priority:
   *
   * 1. Real values passed after payment
   * 2. Locally stored latest ticket
   * 3. Fallback demo values
   */
  const bookingRef =
    params.bookingRef ||
    storedTicket?.ticket_number ||
    'TRX-TEST-LK';

  /*
   * MOST IMPORTANT FIELD.
   *
   * This must be the SAME value stored in:
   *
   * Supabase:
   * tickets.ticket_token
   */
  const ticketToken =
    params.ticketToken ||
    storedTicket?.ticket_token ||
    bookingRef;

  const ticketId =
    params.ticketId ||
    storedTicket?.id ||
    '';

  const routeNumber =
    params.routeNumber ||
    storedTicket?.route_number ||
    '138';

  const serviceName =
    params.serviceName ||
    storedTicket?.service_name ||
    storedTicket?.route_name ||
    'SLTB';

  const originName =
    params.originName ||
    storedTicket?.origin_name ||
    storedTicket?.origin ||
    'Maharagama';

  const destinationName =
    params.destinationName ||
    storedTicket?.destination_name ||
    storedTicket?.destination ||
    'Colombo Fort';

  const travelDate =
    params.travelDate ||
    storedTicket?.travel_date ||
    'Today';

  const departureTime =
    params.departureTime ||
    storedTicket?.departure_time ||
    '--:--';

  const arrivalTime =
    params.arrivalTime ||
    storedTicket?.arrival_time ||
    '--:--';

  const totalPayable =
    params.totalPayable ||
    storedTicket?.fare ||
    storedTicket?.amount ||
    '0.00';

  const passengerDetails =
    params.passengerDetails ||
    storedTicket?.passenger_type ||
    'Passenger';

  const totalTickets =
    params.totalTickets ||
    storedTicket?.passenger_count ||
    '1';

  const paymentMethod =
    params.paymentMethod ||
    storedTicket?.payment_method ||
    'Online Payment';

  const openConductorScanner = () => {
    router.push({
      pathname:
        '/conductor/scanner' as any,

      params: {
        /*
         * Same real database token.
         */
        testToken: ticketToken,
      },
    });
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8FAFC"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}

        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logo}>
              <Ionicons
                name="bus"
                size={22}
                color="#FFFFFF"
              />
            </View>

            <View>
              <Text style={styles.brand}>
                TransitLK
              </Text>

              <Text style={styles.brandSub}>
                PAY & PASS
              </Text>
            </View>
          </View>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />

            <Text style={styles.liveText}>
              Active
            </Text>
          </View>
        </View>

        {/* Title */}

        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>
              My Transit Pass
            </Text>

            <Text style={styles.subtitle}>
              Digital ticket for your current journey
            </Text>
          </View>

          <View style={styles.nfcBadge}>
            <Ionicons
              name="wifi-outline"
              size={15}
              color="#007F78"
            />

            <Text style={styles.nfcText}>
              NFC Ready
            </Text>
          </View>
        </View>

        {/* Main Transit Card */}

        <View style={styles.transitCard}>
          <View style={styles.transitTopRow}>
            <View>
              <Text style={styles.transitLabel}>
                TRANSITLK DIGITAL PASS
              </Text>

              <Text style={styles.transitId}>
                {bookingRef}
              </Text>
            </View>

            <MaterialCommunityIcons
              name="contactless-payment"
              size={34}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.routeLabel}>
            CURRENT ROUTE
          </Text>

          <View style={styles.routeRow}>
            <View style={styles.routeNumberBadge}>
              <Text style={styles.routeNumber}>
                {routeNumber}
              </Text>
            </View>

            <View style={styles.routeTextContainer}>
              <Text style={styles.routeText}>
                {originName} → {destinationName}
              </Text>

              <Text style={styles.serviceText}>
                {serviceName}
              </Text>
            </View>
          </View>

          <View style={styles.transitBottomRow}>
            <View>
              <Text style={styles.smallLabel}>
                PASSENGERS
              </Text>

              <Text style={styles.smallValue}>
                {passengerDetails}
              </Text>
            </View>

            <View style={styles.alignRight}>
              <Text style={styles.smallLabel}>
                FARE
              </Text>

              <Text style={styles.fare}>
                LKR {totalPayable}
              </Text>
            </View>
          </View>
        </View>

        {/* QR Section */}

        <View style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <View>
              <Text style={styles.qrTitle}>
                Ticket QR Code
              </Text>

              <Text style={styles.qrSubtitle}>
                Show this to the conductor
              </Text>
            </View>

            <View style={styles.verifiedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={15}
                color="#047857"
              />

              <Text style={styles.verifiedText}>
                PAID
              </Text>
            </View>
          </View>

          <View style={styles.qrWrapper}>
            {/*
             * CRITICAL:
             *
             * QR VALUE IS THE REAL
             * tickets.ticket_token VALUE.
             *
             * Example:
             * TLK-2026-5678-B
             */}

            <QRCode
              value={ticketToken}
              size={210}
              color="#002060"
              backgroundColor="#FFFFFF"
              ecl="M"
              quietZone={10}
            />
          </View>

          <Text style={styles.tokenLabel}>
            TICKET TOKEN
          </Text>

          <Text style={styles.tokenValue}>
            {ticketToken}
          </Text>

          <View style={styles.offlineBox}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#007F78"
            />

            <View style={styles.offlineTextContainer}>
              <Text style={styles.offlineTitle}>
                Ready for validation
              </Text>

              <Text style={styles.offlineText}>
                Scan this QR using the conductor
                application.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.scanTestButton}
            onPress={openConductorScanner}
          >
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.scanTestText}>
              Test in Conductor Scanner
            </Text>
          </Pressable>
        </View>

        {/* Current Journey */}

        <Pressable
          style={styles.journeyCard}
          onPress={() =>
            router.push({
              pathname: '/passenger/search' as any,
              params: {
                busNumber: routeNumber,
              },
            })
          }
        >
          <View style={styles.journeyHeader}>
            <View style={styles.journeyHeaderLeft}>
              <Ionicons
                name="bus-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.journeyHeaderText}>
                CURRENT JOURNEY
              </Text>
            </View>

            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>
                ACTIVE
              </Text>
            </View>
          </View>

          <View style={styles.journeyBody}>
            <View style={styles.stationRow}>
              <View style={styles.stationIconStart}>
                <Ionicons
                  name="enter-outline"
                  size={17}
                  color="#007F78"
                />
              </View>

              <View style={styles.stationDetails}>
                <Text style={styles.stationLabel}>
                  BOARDING
                </Text>

                <Text style={styles.stationName}>
                  {originName}
                </Text>
              </View>

              <Text style={styles.stationTime}>
                {departureTime}
              </Text>
            </View>

            <View style={styles.timeline}>
              <View style={styles.timelineLine} />
            </View>

            <View style={styles.stationRow}>
              <View style={styles.stationIconEnd}>
                <Ionicons
                  name="exit-outline"
                  size={17}
                  color="#64748B"
                />
              </View>

              <View style={styles.stationDetails}>
                <Text style={styles.stationLabel}>
                  DESTINATION
                </Text>

                <Text style={styles.stationName}>
                  {destinationName}
                </Text>
              </View>

              <Text style={styles.stationTime}>
                {arrivalTime}
              </Text>
            </View>
          </View>

          <View style={styles.journeyFooter}>
            <View>
              <Text style={styles.footerLabel}>
                DATE
              </Text>

              <Text style={styles.footerValue}>
                {travelDate}
              </Text>
            </View>

            <View style={styles.alignRight}>
              <Text style={styles.footerLabel}>
                PAYMENT
              </Text>

              <Text style={styles.footerValue}>
                {paymentMethod}
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Ticket information */}

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>
            Ticket Information
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Booking Reference
            </Text>

            <Text style={styles.detailValue}>
              {bookingRef}
            </Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Ticket Token
            </Text>

            <Text
              style={styles.detailValue}
              numberOfLines={1}
            >
              {ticketToken}
            </Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>
              Number of Tickets
            </Text>

            <Text style={styles.detailValue}>
              {totalTickets}
            </Text>
          </View>

          {ticketId ? (
            <>
              <View style={styles.detailDivider} />

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  Database Ticket ID
                </Text>

                <Text
                  style={styles.detailValueSmall}
                  numberOfLines={1}
                >
                  {ticketId}
                </Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Actions */}

        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            router.push(
              '/passenger/search' as any,
            )
          }
        >
          <Ionicons
            name="add-circle-outline"
            size={19}
            color="#FFFFFF"
          />

          <Text style={styles.primaryButtonText}>
            Purchase Another Ticket
          </Text>
        </Pressable>

        {loading ? (
          <Text style={styles.loadingText}>
            Loading saved ticket...
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#002060',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  brand: {
    fontSize: 18,
    fontWeight: '900',
    color: '#002060',
  },

  brandSub: {
    marginTop: 1,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: '#64748B',
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },

  liveText: {
    color: '#047857',
    fontSize: 10,
    fontWeight: '800',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  title: {
    fontSize: 22,
    color: '#0F172A',
    fontWeight: '900',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748B',
  },

  nfcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FFFA',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  nfcText: {
    color: '#007F78',
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 4,
  },

  transitCard: {
    backgroundColor: '#002060',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
  },

  transitTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  transitLabel: {
    color: '#A5B4FC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },

  transitId: {
    color: '#FFFFFF',
    marginTop: 4,
    fontSize: 15,
    fontWeight: '800',
  },

  routeLabel: {
    marginTop: 28,
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
  },

  routeRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  routeNumberBadge: {
    minWidth: 52,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },

  routeNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#002060',
  },

  routeTextContainer: {
    marginLeft: 12,
    flex: 1,
  },

  routeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  serviceText: {
    color: '#CBD5E1',
    marginTop: 3,
    fontSize: 10,
  },

  transitBottomRow: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  smallLabel: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '700',
  },

  smallValue: {
    marginTop: 4,
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  fare: {
    marginTop: 3,
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },

  alignRight: {
    alignItems: 'flex-end',
  },

  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },

  qrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  qrTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },

  qrSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },

  verifiedText: {
    marginLeft: 4,
    fontSize: 9,
    fontWeight: '900',
    color: '#047857',
  },

  qrWrapper: {
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
  },

  tokenLabel: {
    textAlign: 'center',
    marginTop: 14,
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
  },

  tokenValue: {
    textAlign: 'center',
    marginTop: 4,
    color: '#002060',
    fontSize: 11,
    fontWeight: '900',
  },

  offlineBox: {
    marginTop: 15,
    flexDirection: 'row',
    backgroundColor: '#F0FDFA',
    padding: 12,
    borderRadius: 14,
  },

  offlineTextContainer: {
    flex: 1,
    marginLeft: 9,
  },

  offlineTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
  },

  offlineText: {
    marginTop: 2,
    fontSize: 9,
    lineHeight: 14,
    color: '#64748B',
  },

  scanTestButton: {
    marginTop: 14,
    backgroundColor: '#002060',
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scanTestText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '800',
    fontSize: 12,
  },

  journeyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },

  journeyHeader: {
    backgroundColor: '#002060',
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  journeyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  journeyHeaderText: {
    marginLeft: 7,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  activeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  activeBadgeText: {
    color: '#047857',
    fontWeight: '900',
    fontSize: 8,
  },

  journeyBody: {
    padding: 16,
  },

  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stationIconStart: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stationIconEnd: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  stationDetails: {
    flex: 1,
    marginLeft: 11,
  },

  stationLabel: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: '700',
  },

  stationName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },

  stationTime: {
    fontSize: 11,
    fontWeight: '800',
    color: '#002060',
  },

  timeline: {
    height: 24,
    marginLeft: 16,
  },

  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: '#CBD5E1',
  },

  journeyFooter: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  footerLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
  },

  footerValue: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },

  detailsTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 12,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  detailLabel: {
    fontSize: 10,
    color: '#64748B',
  },

  detailValue: {
    flex: 1,
    marginLeft: 20,
    textAlign: 'right',
    fontSize: 10,
    fontWeight: '800',
    color: '#002060',
  },

  detailValueSmall: {
    flex: 1,
    marginLeft: 20,
    textAlign: 'right',
    fontSize: 8,
    fontWeight: '700',
    color: '#334155',
  },

  detailDivider: {
    marginVertical: 11,
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  primaryButton: {
    backgroundColor: '#002060',
    paddingVertical: 14,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  loadingText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 9,
    marginTop: 10,
  },
});