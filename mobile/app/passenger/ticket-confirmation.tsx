import React, { useEffect, useState } from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
} from '@expo/vector-icons';

import {
  useRouter,
  useLocalSearchParams,
} from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';

import QRCode from 'react-native-qrcode-svg';

import BottomNavigation from '@/components/BottomNavigation';

import PassengerHomeHeader from '@/components/passenger/PassengerHomeHeader';

export default function TicketConfirmationScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    bookingRef?: string;

    // Real Supabase ticket values
    ticketToken?: string;
    ticketId?: string;

    routeNumber?: string;
    serviceName?: string;

    originName?: string;
    destinationName?: string;

    travelDate?: string;
    departureTime?: string;
    arrivalTime?: string;

    totalTickets?: string;
    totalPayable?: string;

    paymentMethod?: string;
    passengerDetails?: string;
  }>();

  // Booking / payment values
  const bookingRef =
    params.bookingRef || 'TRX-948210-LK';

  /*
   * IMPORTANT:
   * ticketToken is the real value stored in:
   *
   * Supabase:
   * tickets.ticket_token
   *
   * bookingRef is only the ticket / booking reference.
   */
  const ticketToken =
    params.ticketToken || bookingRef;

  const ticketId =
    params.ticketId || '';

  const routeNumber =
    params.routeNumber || '138';

  const serviceName =
    params.serviceName || 'SLTB AC EXPRESS';

  const originName =
    params.originName || 'Maharagama';

  const destinationName =
    params.destinationName || 'Colombo Fort';

  const departureTime =
    params.departureTime || '08:45 AM';

  const arrivalTime =
    params.arrivalTime || '09:30 AM';

  const travelDate =
    params.travelDate || 'Today, 24 Oct 2026';

  const totalPayable =
    params.totalPayable || '240.00';

  const paymentMethod =
    params.paymentMethod ||
    'LankaPay / Visa •••• 4242';

  const passengerDetails =
    params.passengerDetails || '2 Adults';

  /*
   * Save latest ticket locally.
   *
   * Supabase tickets table is still the real source of truth.
   * AsyncStorage is used as a local copy so Transit Pass can
   * show the latest ticket later.
   */
  useEffect(() => {
    async function persistTicket() {
      try {
        const ticketRecord = {
          id: ticketId || undefined,

          // Keep these as two different values
          ticket_number: bookingRef,
          ticket_token: ticketToken,

          route_number: routeNumber,
          route_name: serviceName,
          service_name: serviceName,

          origin: originName,
          origin_name: originName,

          destination: destinationName,
          destination_name: destinationName,

          departure_time: departureTime,
          arrival_time: arrivalTime,

          travel_date: travelDate,

          fare: totalPayable,
          amount: totalPayable,

          passenger_count:
            params.totalTickets || '1',

          passenger_type:
            passengerDetails,

          payment_method:
            paymentMethod,

          status: 'ACTIVE',
          payment_status: 'PAID',

          created_at:
            new Date().toISOString(),
        };

        const existingRaw =
          await AsyncStorage.getItem(
            'transitlk_tickets',
          );

        const list: any[] =
          existingRaw
            ? JSON.parse(existingRaw)
            : [];

        const existingIdx =
          list.findIndex(
            (item: any) =>
              item.ticket_token === ticketToken,
          );

        if (existingIdx >= 0) {
          list[existingIdx] = ticketRecord;
        } else {
          list.unshift(ticketRecord);
        }

        await AsyncStorage.setItem(
          'transitlk_tickets',
          JSON.stringify(
            list.slice(0, 50),
          ),
        );
      } catch (err) {
        console.warn(
          'Could not persist ticket to local storage:',
          err,
        );
      }
    }

    void persistTicket();
  }, [
    ticketId,
    ticketToken,
    bookingRef,
    routeNumber,
    serviceName,
    originName,
    destinationName,
    departureTime,
    arrivalTime,
    travelDate,
    totalPayable,
    params.totalTickets,
    passengerDetails,
    paymentMethod,
  ]);

  // UI countdown
  const [countdown, setCountdown] =
    useState(41);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) =>
        prev > 1 ? prev - 1 : 45,
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle Copy Booking Reference
  const handleCopyRef = () => {
    Alert.alert(
      'Reference Copied',
      `Booking reference #${bookingRef} copied to clipboard!`,
    );
  };

  // Handle Wallet addition
  const handleAddToWallet = () => {
    Alert.alert(
      'Digital Pass Added',
      'Ticket pass added to your mobile wallet for offline NFC boarding.',
    );
  };

  // Handle Share
  const handleShare = () => {
    Alert.alert(
      'Share Ticket',
      `Share booking #${bookingRef} (${originName} ➔ ${destinationName})`,
    );
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

      <PassengerHomeHeader subtitle="Confirmation" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Stepper */}

        <View style={styles.stepperContainer}>
          {/* Step 1 */}

          <View style={styles.stepperItem}>
            <View
              style={
                styles.stepCircleCompleted
              }
            >
              <Ionicons
                name="checkmark"
                size={13}
                color="#FFFFFF"
              />
            </View>

            <Text
              style={
                styles.stepLabelCompleted
              }
            >
              1. Trip
            </Text>
          </View>

          <View
            style={
              styles.stepConnectorActive
            }
          />

          {/* Step 2 */}

          <View style={styles.stepperItem}>
            <View
              style={
                styles.stepCircleCompleted
              }
            >
              <Ionicons
                name="checkmark"
                size={13}
                color="#FFFFFF"
              />
            </View>

            <Text
              style={
                styles.stepLabelCompleted
              }
            >
              2. Details
            </Text>
          </View>

          <View
            style={
              styles.stepConnectorActive
            }
          />

          {/* Step 3 */}

          <View style={styles.stepperItem}>
            <View
              style={
                styles.stepCircleCompleted
              }
            >
              <Ionicons
                name="checkmark"
                size={13}
                color="#FFFFFF"
              />
            </View>

            <Text
              style={
                styles.stepLabelCompleted
              }
            >
              3. Pay
            </Text>
          </View>

          <View
            style={
              styles.stepConnectorActive
            }
          />

          {/* Step 4 */}

          <View style={styles.stepperItem}>
            <View
              style={styles.stepCircleTicket}
            >
              <MaterialCommunityIcons
                name="ticket-percent"
                size={13}
                color="#FFFFFF"
              />
            </View>

            <Text
              style={
                styles.stepLabelTicket
              }
            >
              4. Ticket
            </Text>
          </View>
        </View>

        {/* Payment Successful Hero Section */}

        <View style={styles.successHeroCard}>
          <View
            style={
              styles.successCheckCircle
            }
          >
            <Ionicons
              name="checkmark"
              size={28}
              color="#FFFFFF"
            />
          </View>

          <Text
            style={styles.successHeading}
          >
            Payment Successful!
          </Text>

          <Text
            style={styles.successSubtext}
          >
            Your digital bus pass is
            active and ready for conductor
            inspection or validator tap.
          </Text>

          {/* Reference Banner */}

          <View
            style={styles.referenceBanner}
          >
            <View
              style={styles.referenceLeft}
            >
              <Ionicons
                name="shield-checkmark"
                size={15}
                color="#2563EB"
              />

              <Text
                style={
                  styles.referenceText
                }
              >
                Ref #{bookingRef}
              </Text>
            </View>

            <Pressable
              style={styles.copyButton}
              onPress={handleCopyRef}
              hitSlop={8}
            >
              <Feather
                name="copy"
                size={12}
                color="#002060"
              />

              <Text
                style={
                  styles.copyButtonText
                }
              >
                Copy
              </Text>
            </Pressable>
          </View>

          {/* Payment meta */}

          <View
            style={
              styles.paymentMetaLine
            }
          >
            <Ionicons
              name="card-outline"
              size={14}
              color="#64748B"
            />

            <Text
              style={
                styles.paymentMetaText
              }
            >
              {travelDate} • 08:34 AM via{' '}
              {paymentMethod}
            </Text>
          </View>
        </View>

        {/* Digital Boarding Pass */}

        <View
          style={styles.boardingPassCard}
        >
          {/* Header */}

          <View
            style={styles.passHeaderStrip}
          >
            <View
              style={styles.passHeaderLeft}
            >
              <View
                style={
                  styles.passRouteBadge
                }
              >
                <Text
                  style={
                    styles.passRouteBadgeText
                  }
                >
                  {routeNumber}
                </Text>
              </View>

              <Text
                style={
                  styles.passServiceName
                }
              >
                {serviceName}
              </Text>
            </View>

            <View
              style={
                styles.reservedPassBadge
              }
            >
              <View
                style={
                  styles.reservedDot
                }
              />

              <Text
                style={
                  styles.reservedPassText
                }
              >
                Reserved Pass
              </Text>
            </View>
          </View>

          {/* Departure & Arrival */}

          <View
            style={
              styles.passStationsSection
            }
          >
            <View style={styles.stationCol}>
              <Text
                style={
                  styles.stationTimeText
                }
              >
                {departureTime}
              </Text>

              <Text
                style={
                  styles.stationNameText
                }
              >
                {originName}
              </Text>

              <Text
                style={
                  styles.stationSubText
                }
              >
                Station Terminal (Bay 2)
              </Text>
            </View>

            {/* Middle */}

            <View
              style={
                styles.middleCorridorCol
              }
            >
              <Text
                style={
                  styles.corridorMinsText
                }
              >
                ~45 mins
              </Text>

              <View
                style={
                  styles.corridorIconRow
                }
              >
                <View
                  style={
                    styles.corridorDot
                  }
                />

                <View
                  style={
                    styles.corridorLine
                  }
                />

                <Ionicons
                  name="bus"
                  size={16}
                  color="#002060"
                  style={{
                    marginHorizontal: 2,
                  }}
                />

                <View
                  style={
                    styles.corridorLine
                  }
                />

                <View
                  style={
                    styles.corridorDot
                  }
                />
              </View>

              <Text
                style={
                  styles.corridorSubText
                }
              >
                Express Highway
              </Text>
            </View>

            <View
              style={[
                styles.stationCol,
                {
                  alignItems:
                    'flex-end',
                },
              ]}
            >
              <Text
                style={
                  styles.stationTimeText
                }
              >
                {arrivalTime}
              </Text>

              <Text
                style={
                  styles.stationNameText
                }
              >
                {destinationName}
              </Text>

              <Text
                style={
                  styles.stationSubText
                }
              >
                Pettah Central Stand
              </Text>
            </View>
          </View>

          {/* Pass Details */}

          <View
            style={
              styles.passDetailsStrip
            }
          >
            <View>
              <Text
                style={
                  styles.passDetailsLabel
                }
              >
                Pass Type & Seats
              </Text>

              <Text
                style={
                  styles.passDetailsValue
                }
              >
                {passengerDetails} • Bay
                04, 05
              </Text>
            </View>

            <View
              style={{
                alignItems: 'flex-end',
              }}
            >
              <Text
                style={
                  styles.passDetailsLabel
                }
              >
                Fare Total (Paid in Full)
              </Text>

              <Text
                style={
                  styles.passFareTotal
                }
              >
                LKR {totalPayable}
              </Text>
            </View>
          </View>

          {/* Perforated Divider */}

          <View
            style={styles.perforatedRow}
          >
            <View
              style={styles.notchLeft}
            />

            <View
              style={styles.dashedLine}
            />

            <View
              style={styles.notchRight}
            />
          </View>

          {/* Live QR */}

          <View style={styles.qrSection}>
            <View
              style={styles.liveBadgeRow}
            >
              <View style={styles.liveDot} />

              <Text
                style={
                  styles.liveTicketText
                }
              >
                LIVE VALID TICKET
              </Text>

              <Text
                style={
                  styles.liveDivider
                }
              >
                •
              </Text>

              <Text
                style={
                  styles.refreshesText
                }
              >
                Refreshes in {countdown}s
              </Text>
            </View>

            {/* REAL QR CODE */}

            <View
              style={styles.qrContainer}
            >
              <View
                style={styles.qrFrame}
              >
                <QRCode
                  /*
                   * CRITICAL:
                   * QR contains the exact
                   * Supabase tickets.ticket_token
                   */
                  value={ticketToken}
                  size={180}
                  color="#002060"
                  backgroundColor="#FFFFFF"
                  ecl="M"
                  quietZone={8}
                />
              </View>
            </View>

            <Text
              style={
                styles.qrInstructionText
              }
            >
              Show this QR code to the bus
              conductor or tap device against
              the contactless gate validator.
            </Text>

            {/* Conductor Test */}

            <Pressable
              style={
                styles.conductorButton
              }
              onPress={() => {
                router.push({
                  pathname:
                    '/conductor/scanner' as any,

                  params: {
                    /*
                     * Send real DB ticket token,
                     * not bookingRef.
                     */
                    testToken:
                      ticketToken,
                  },
                });
              }}
            >
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={15}
                color="#002060"
              />

              <Text
                style={
                  styles.conductorButtonText
                }
              >
                Test in Conductor Scanner
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Wallet & Share */}

        <View
          style={styles.actionButtonsRow}
        >
          <Pressable
            style={styles.walletButton}
            onPress={handleAddToWallet}
          >
            <Ionicons
              name="wallet-outline"
              size={16}
              color="#002060"
            />

            <Text
              style={
                styles.walletButtonText
              }
            >
              Add to Apple / Google Wallet
            </Text>
          </Pressable>

          <Pressable
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons
              name="share-social-outline"
              size={16}
              color="#334155"
            />

            <Text
              style={
                styles.shareButtonText
              }
            >
              Share
            </Text>
          </Pressable>
        </View>

        {/* Live Bus Dispatch */}

        <View style={styles.dispatchCard}>
          <View
            style={
              styles.dispatchHeaderRow
            }
          >
            <View
              style={
                styles.dispatchTitleWrap
              }
            >
              <Ionicons
                name="location-outline"
                size={16}
                color="#059669"
              />

              <Text
                style={
                  styles.dispatchHeading
                }
              >
                Live Bus Dispatch
              </Text>
            </View>

            <View
              style={styles.busPlateBadge}
            >
              <Text
                style={styles.busPlateText}
              >
                WP-ND-8422
              </Text>
            </View>
          </View>

          {/* Approaching */}

          <View
            style={styles.approachingBox}
          >
            <View
              style={
                styles.approachingIconWrap
              }
            >
              <MaterialCommunityIcons
                name="bus-clock"
                size={20}
                color="#059669"
              />
            </View>

            <View
              style={
                styles.approachingTextCol
              }
            >
              <Text
                style={
                  styles.approachingTitle
                }
              >
                Approaching Maharagama Bay
                2
              </Text>

              <Text
                style={
                  styles.approachingEta
                }
              >
                ETA: ~8 minutes away
              </Text>
            </View>
          </View>

          {/* Track Bus */}

          <Pressable
            style={styles.trackBusButton}
            onPress={() =>
              router.push(
                '/passenger/search' as any,
              )
            }
          >
            <View
              style={styles.trackBusLeft}
            >
              <MaterialCommunityIcons
                name="radar"
                size={18}
                color="#2563EB"
              />

              <Text
                style={
                  styles.trackBusText
                }
              >
                Track Bus on Live GPS Map
              </Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={16}
              color="#2563EB"
            />
          </Pressable>

          {/* Receipt */}

          <Pressable
            style={styles.receiptButton}
            onPress={() =>
              Alert.alert(
                'E-Receipt',
                'Downloading official NTC tax invoice PDF...',
              )
            }
          >
            <View
              style={styles.receiptLeft}
            >
              <Ionicons
                name="download-outline"
                size={16}
                color="#475569"
              />

              <Text
                style={
                  styles.receiptText
                }
              >
                Download PDF E-Receipt
              </Text>
            </View>

            <Text
              style={
                styles.receiptSizeText
              }
            >
              124 KB
            </Text>
          </Pressable>

          {/* Hotline */}

          <View style={styles.hotlineRow}>
            <View
              style={styles.hotlineLeft}
            >
              <Ionicons
                name="call-outline"
                size={14}
                color="#64748B"
              />

              <Text
                style={
                  styles.hotlineLabel
                }
              >
                SLTB / NTC Hotline
              </Text>
            </View>

            <Text
              style={styles.hotlineDial}
            >
              Dial 1955 (24/7)
            </Text>
          </View>
        </View>

        {/* View in My Tickets */}

        <Pressable
          style={({ pressed }) => [
            styles.viewTicketsButton,
            pressed &&
              styles.viewTicketsButtonPressed,
          ]}
          onPress={() =>
            router.push({
              pathname:
                '/transit-pass' as any,

              params: {
                bookingRef,

                /*
                 * Pass these real DB values
                 * to Transit Pass.
                 */
                ticketToken,
                ticketId,

                routeNumber,
                serviceName,

                originName,
                destinationName,

                travelDate,
                departureTime,
                arrivalTime,

                totalPayable,
                passengerDetails,

                totalTickets: String(
                  params.totalTickets ||
                    '1',
                ),

                paymentMethod,
              },
            })
          }
        >
          <MaterialCommunityIcons
            name="ticket-outline"
            size={18}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.viewTicketsButtonText
            }
          >
            View in My Tickets
          </Text>
        </Pressable>

        {/* Back Home */}

        <Pressable
          style={styles.backHomeButton}
          onPress={() =>
            router.replace(
              '/home' as any,
            )
          }
        >
          <Ionicons
            name="home-outline"
            size={15}
            color="#475569"
            style={{
              marginRight: 6,
            }}
          />

          <Text
            style={
              styles.backHomeButtonText
            }
          >
            Back to Home
          </Text>
        </Pressable>
      </ScrollView>

      <BottomNavigation />
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

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // Top Header

  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pressedState: {
    backgroundColor: '#F1F5F9',
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#002060',
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandTitleCol: {
    marginLeft: 8,
  },

  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  brandTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  liveGpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },

  liveGpsDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },

  liveGpsText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#059669',
  },

  brandSubtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 1,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
  },

  // Stepper

  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  stepperItem: {
    alignItems: 'center',
  },

  stepCircleCompleted: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  stepLabelCompleted: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
  },

  stepConnectorActive: {
    flex: 1,
    height: 2,
    backgroundColor: '#059669',
    marginHorizontal: 6,
    marginBottom: 14,
  },

  stepCircleTicket: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#002060',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  stepLabelTicket: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#002060',
  },

  // Success Hero Card

  successHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  successCheckCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  successHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },

  successSubtext: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 10,
    marginBottom: 14,
  },

  referenceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  referenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  referenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#002060',
  },

  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },

  copyButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#002060',
  },

  paymentMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  paymentMetaText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: 'normal',
  },

  // Boarding Pass Ticket Card

  boardingPassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  passHeaderStrip: {
    backgroundColor: '#002060',
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  passHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  passRouteBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  passRouteBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#002060',
  },

  passServiceName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  reservedPassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 5,
  },

  reservedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },

  reservedPassText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#A7F3D0',
  },

  passStationsSection: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    padding: 16,
  },

  stationCol: {
    flex: 1,
  },

  stationTimeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  stationNameText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 2,
  },

  stationSubText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },

  middleCorridorCol: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },

  corridorMinsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 2,
  },

  corridorIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  corridorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },

  corridorLine: {
    width: 14,
    height: 1.5,
    backgroundColor: '#CBD5E1',
  },

  corridorSubText: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },

  passDetailsStrip: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  passDetailsLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: 'bold',
  },

  passDetailsValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 2,
  },

  passFareTotal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#002060',
    marginTop: 2,
  },

  // Perforated Divider

  perforatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    position: 'relative',
  },

  notchLeft: {
    width: 16,
    height: 24,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },

  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginHorizontal: 8,
  },

  notchRight: {
    width: 16,
    height: 24,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 1,
    borderColor: '#E2E8F0',
  },

  // QR Code Section

  qrSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
    marginBottom: 16,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },

  liveTicketText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
  },

  liveDivider: {
    fontSize: 10,
    color: '#A7F3D0',
  },

  refreshesText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
  },

  qrContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  qrFrame: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 12,
  },

  qrInstructionText: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },

  conductorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  conductorButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#002060',
  },

  // Wallet & Share

  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  walletButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    paddingVertical: 12,
    gap: 6,
  },

  walletButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#002060',
  },

  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    gap: 6,
  },

  shareButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
  },

  // Live Bus Dispatch

  dispatchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  dispatchHeaderRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  dispatchTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  dispatchHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  busPlateBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  busPlateText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
  },

  approachingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  approachingIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  approachingTextCol: {
    flex: 1,
  },

  approachingTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  approachingEta: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 2,
  },

  trackBusButton: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 8,
  },

  trackBusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  trackBusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },

  receiptButton: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 10,
  },

  receiptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  receiptText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#334155',
  },

  receiptSizeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: 'bold',
  },

  hotlineRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },

  hotlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  hotlineLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: 'normal',
  },

  hotlineDial: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
  },

  // Primary Action

  viewTicketsButton: {
    backgroundColor: '#002060',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#002060',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },

  viewTicketsButtonPressed: {
    backgroundColor: '#152052',
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  viewTicketsButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Back Home

  backHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },

  backHomeButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
  },
});