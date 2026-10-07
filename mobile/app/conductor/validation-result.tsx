import React from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

// ======================================================
// TYPES
// ======================================================

type TicketData = Record<string, any>;

type ValidationParams = {
  result?: string;
  message?: string;
  reason?: string;
  ticketToken?: string;
  scanMethod?: string;
  scanLogged?: string;
  ticket?: string;
};

// ======================================================
// SCREEN
// ======================================================

export default function ValidationResultScreen() {
  const router = useRouter();

  const params =
    useLocalSearchParams<ValidationParams>();

  // ====================================================
  // VALIDATION RESULT
  // ====================================================

  const resultType = String(
    params.result ?? 'INVALID',
  )
    .trim()
    .toUpperCase();

  const isValid =
    resultType === 'VALID';

  const isAlreadyUsed =
    resultType === 'ALREADY_USED';

  const isInvalid =
    !isValid;

  // ====================================================
  // PARSE TICKET FROM ROUTE PARAMS
  // ====================================================

  let ticket: TicketData | null = null;

  try {
    if (params.ticket) {
      ticket = JSON.parse(
        String(params.ticket),
      );
    }
  } catch (error) {
    console.error(
      'Could not parse ticket data:',
      error,
    );

    ticket = null;
  }

  // ====================================================
  // HELPER
  //
  // Supports different possible Supabase column names.
  // If a value does not exist, we do NOT show fake data.
  // ====================================================

  function getTicketValue(
    ...keys: string[]
  ): string {
    if (!ticket) {
      return '';
    }

    for (const key of keys) {
      const value = ticket[key];

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ''
      ) {
        return String(value).trim();
      }
    }

    return '';
  }

  // ====================================================
  // REAL TICKET VALUES
  // ====================================================

  const ticketToken =
    String(params.ticketToken ?? '').trim() ||
    getTicketValue(
      'ticket_token',
      'ticketToken',
      'token',
    ) ||
    'Not available';

  const ticketNumber =
    getTicketValue(
      'ticket_number',
      'ticketNumber',
      'ticket_no',
      'ticketNo',
      'id',
    );

  const routeNumber =
    getTicketValue(
      'route_number',
      'routeNumber',
      'route_no',
      'routeNo',
    );

  const routeName =
    getTicketValue(
      'route_name',
      'routeName',
    );

  const origin =
    getTicketValue(
      'origin',
      'origin_name',
      'originName',
      'from_location',
      'fromLocation',
      'start_location',
      'startLocation',
    );

  const destination =
    getTicketValue(
      'destination',
      'destination_name',
      'destinationName',
      'to_location',
      'toLocation',
      'end_location',
      'endLocation',
    );

  const busNumber =
    getTicketValue(
      'bus_number',
      'busNumber',
      'vehicle_number',
      'vehicleNumber',
      'registration_number',
      'registrationNumber',
    );

  const busModel =
    getTicketValue(
      'bus_model',
      'busModel',
      'bus_name',
      'busName',
      'vehicle_type',
      'vehicleType',
    );

  const passengerName =
    getTicketValue(
      'passenger_name',
      'passengerName',
      'customer_name',
      'customerName',
      'user_name',
      'userName',
    );

  const ticketStatus =
    getTicketValue(
      'status',
      'ticket_status',
      'ticketStatus',
    );

  const fareRaw =
    getTicketValue(
      'fare',
      'price',
      'amount',
      'ticket_fare',
      'ticketFare',
    );

  // ====================================================
  // FORMAT FARE
  // ====================================================

  function formatFare(
    value: string,
  ): string {
    if (!value) {
      return 'Not available';
    }

    const cleaned =
      value.replace(
        /[^0-9.-]/g,
        '',
      );

    const numeric =
      Number(cleaned);

    if (
      !Number.isNaN(numeric)
    ) {
      return `LKR ${numeric.toFixed(
        2,
      )}`;
    }

    return value;
  }

  const fare =
    formatFare(fareRaw);

  // ====================================================
  // ROUTE TITLE
  // ====================================================

  let journeyTitle =
    'Journey details unavailable';

  if (routeName) {
    journeyTitle = routeName;
  } else if (
    origin &&
    destination
  ) {
    journeyTitle =
      `${origin} → ${destination}`;
  } else if (origin) {
    journeyTitle = origin;
  } else if (destination) {
    journeyTitle = destination;
  }

  // ====================================================
  // PASSENGER INITIALS
  // ====================================================

  function getInitials(
    name: string,
  ): string {
    if (!name) {
      return 'P';
    }

    const parts =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[
        parts.length - 1
      ][0]
    ).toUpperCase();
  }

  const passengerInitials =
    getInitials(passengerName);

  // ====================================================
  // RESULT TEXT
  // ====================================================

  const resultTitle =
    isValid
      ? 'Ticket Valid'
      : isAlreadyUsed
        ? 'Ticket Already Used'
        : 'Invalid Ticket';

  const resultSubtitle =
    params.message ||
    (isValid
      ? 'Ticket successfully validated'
      : isAlreadyUsed
        ? 'This ticket has already been used'
        : 'This ticket cannot be accepted');

  const validationReason =
    params.reason ||
    (isValid
      ? 'Ticket is valid for this journey.'
      : isAlreadyUsed
        ? 'This ticket was already validated.'
        : 'Ticket validation failed.');

  const scanMethod =
    String(
      params.scanMethod ?? 'QR',
    ).toUpperCase();

  const scanLogged =
    params.scanLogged === 'true';

  // ====================================================
  // NAVIGATION
  // ====================================================

  const handleScanNext = () => {
    router.replace(
      '/conductor/scanner',
    );
  };

  const handleBackHome = () => {
    router.replace(
      '/conductor/dashboard',
    );
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ============================================= */}
        {/* HEADER */}
        {/* ============================================= */}

        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>
              TRANSITLK
            </Text>

            <Text
              style={
                styles.headerTitle
              }
            >
              CONDUCTOR
            </Text>

            <View
              style={
                styles.busInfoRow
              }
            >
              <View
                style={
                  styles.routeBadge
                }
              >
                <Text
                  style={
                    styles.routeBadgeText
                  }
                >
                  {routeNumber ||
                    'N/A'}
                </Text>
              </View>

              <Text
                style={
                  styles.busNumber
                }
              >
                {busNumber ||
                  'Bus unavailable'}
              </Text>

              <Text
                style={
                  styles.separator
                }
              >
                •
              </Text>

              <Text
                style={
                  styles.syncText
                }
              >
                {scanLogged
                  ? '✓ Sync OK'
                  : 'Validation Complete'}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.profileCircle
            }
          >
            <Text
              style={
                styles.profileIcon
              }
            >
              ♙
            </Text>
          </View>
        </View>

        {/* ============================================= */}
        {/* RESULT */}
        {/* ============================================= */}

        <View
          style={[
            styles.resultCard,

            isValid
              ? styles.validCard
              : styles.invalidCard,
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
            <Text
              style={[
                styles.resultIcon,

                !isValid &&
                  styles.invalidResultIcon,
              ]}
            >
              {isValid
                ? '✓'
                : '×'}
            </Text>
          </View>

          <Text
            style={
              styles.resultTitle
            }
          >
            {resultTitle}
          </Text>

          <Text
            style={
              styles.resultSubtitle
            }
          >
            {resultSubtitle}
          </Text>

          <View
            style={
              styles.resultTimeBadge
            }
          >
            <Text
              style={
                styles.resultTimeText
              }
            >
              {isValid
                ? `✓ Validated • ${scanMethod} Scan`
                : `⚠ Rejected • ${scanMethod} Scan`}
            </Text>
          </View>
        </View>

        {/* ============================================= */}
        {/* INVALID WARNING */}
        {/* ============================================= */}

        {isInvalid && (
          <View
            style={
              styles.warningCard
            }
          >
            <View
              style={
                styles.warningIconCircle
              }
            >
              <Text
                style={
                  styles.warningIcon
                }
              >
                !
              </Text>
            </View>

            <View
              style={
                styles.warningContent
              }
            >
              <Text
                style={
                  styles.warningTitle
                }
              >
                {isAlreadyUsed
                  ? 'Ticket Already Used'
                  : 'Ticket Rejected'}
              </Text>

              <Text
                style={
                  styles.warningText
                }
              >
                {validationReason}
              </Text>
            </View>
          </View>
        )}

        {/* ============================================= */}
        {/* JOURNEY DETAILS */}
        {/* ============================================= */}

        <View style={styles.card}>
          <View
            style={
              styles.cardHeader
            }
          >
            <View
              style={
                styles.routeNumberBox
              }
            >
              <Text
                style={
                  styles.routeNumber
                }
                numberOfLines={1}
              >
                {routeNumber ||
                  '—'}
              </Text>
            </View>

            <View
              style={
                styles.routeTextContainer
              }
            >
              <Text
                style={
                  styles.routeTitle
                }
              >
                {journeyTitle}
              </Text>

              <Text
                style={
                  styles.routeSubtitle
                }
              >
                {busModel ||
                  (ticketNumber
                    ? `Ticket ${ticketNumber}`
                    : 'TransitLK Digital Ticket')}
              </Text>
            </View>
          </View>

          <View
            style={styles.divider}
          />

          <View
            style={
              styles.detailRow
            }
          >
            <View
              style={
                styles.detailItem
              }
            >
              <Text
                style={
                  styles.detailLabel
                }
              >
                ORIGIN
              </Text>

              <Text
                style={
                  styles.detailValue
                }
              >
                {origin ||
                  'Not available'}
              </Text>
            </View>

            <View
              style={
                styles.detailItem
              }
            >
              <Text
                style={
                  styles.detailLabel
                }
              >
                DESTINATION
              </Text>

              <Text
                style={
                  styles.detailValue
                }
              >
                {destination ||
                  'Not available'}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.detailRow
            }
          >
            <View
              style={
                styles.smallInfoBox
              }
            >
              <Text
                style={
                  styles.detailLabel
                }
              >
                BUS
              </Text>

              <Text
                style={
                  styles.detailValue
                }
              >
                {busNumber ||
                  'Not available'}
              </Text>
            </View>

            <View
              style={[
                styles.smallInfoBox,
                styles.lastInfoBox,
              ]}
            >
              <Text
                style={
                  styles.detailLabel
                }
              >
                FARE
              </Text>

              <Text
                style={[
                  styles.fareValue,

                  !isValid &&
                    styles.invalidFare,
                ]}
              >
                {fare}
              </Text>
            </View>
          </View>

          {ticketStatus ? (
            <View
              style={
                styles.ticketStatusRow
              }
            >
              <Text
                style={
                  styles.detailLabel
                }
              >
                DATABASE STATUS
              </Text>

              <Text
                style={
                  styles.databaseStatus
                }
              >
                {ticketStatus.toUpperCase()}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ============================================= */}
        {/* PASSENGER DETAILS */}
        {/* ============================================= */}

        <View style={styles.card}>
          <Text
            style={
              styles.sectionTitle
            }
          >
            Passenger Details
          </Text>

          <View
            style={
              styles.passengerRow
            }
          >
            <View
              style={styles.avatar}
            >
              <Text
                style={
                  styles.avatarText
                }
              >
                {passengerInitials}
              </Text>
            </View>

            <View
              style={
                styles.passengerInfo
              }
            >
              <Text
                style={
                  styles.detailLabel
                }
              >
                PASSENGER NAME
              </Text>

              <Text
                style={
                  styles.passengerName
                }
              >
                {passengerName ||
                  'Not available'}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.ticketBox
            }
          >
            <View
              style={
                styles.ticketTokenContainer
              }
            >
              <Text
                style={
                  styles.detailLabel
                }
              >
                E-TICKET TOKEN
              </Text>

              <Text
                style={
                  styles.ticketToken
                }
                numberOfLines={2}
              >
                {ticketToken}
              </Text>
            </View>

            <Text
              style={styles.copyIcon}
            >
              ▣
            </Text>
          </View>

          {ticketNumber ? (
            <View
              style={
                styles.ticketNumberRow
              }
            >
              <Text
                style={
                  styles.detailLabel
                }
              >
                TICKET NUMBER
              </Text>

              <Text
                style={
                  styles.ticketNumberText
                }
              >
                {ticketNumber}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ============================================= */}
        {/* VALIDATION STATUS */}
        {/* ============================================= */}

        <View
          style={styles.statusCard}
        >
          <View
            style={[
              styles.statusDot,

              isValid
                ? styles.statusDotValid
                : styles.statusDotInvalid,
            ]}
          />

          <View
            style={
              styles.statusTextContainer
            }
          >
            <Text
              style={
                styles.statusTitle
              }
            >
              {isValid
                ? 'Ticket successfully validated'
                : isAlreadyUsed
                  ? 'Duplicate ticket rejected'
                  : 'Validation rejected'}
            </Text>

            <Text
              style={
                styles.statusDescription
              }
            >
              {validationReason}
            </Text>

            <Text
              style={
                styles.scanMethodText
              }
            >
              Scan method: {scanMethod}
            </Text>
          </View>
        </View>

        {/* ============================================= */}
        {/* DATABASE LOG STATUS */}
        {/* ============================================= */}

        <View
          style={[
            styles.logStatusCard,

            scanLogged
              ? styles.logSuccessCard
              : styles.logWarningCard,
          ]}
        >
          <Text
            style={
              styles.logStatusIcon
            }
          >
            {scanLogged
              ? '✓'
              : '!'}
          </Text>

          <View style={{ flex: 1 }}>
            <Text
              style={
                styles.logStatusTitle
              }
            >
              {scanLogged
                ? 'Scan saved'
                : 'Scan log not confirmed'}
            </Text>

            <Text
              style={
                styles.logStatusDescription
              }
            >
              {scanLogged
                ? 'This validation was saved to the scan history.'
                : 'The ticket validation completed, but the scan history entry was not confirmed.'}
            </Text>
          </View>
        </View>

        {/* ============================================= */}
        {/* ACTIONS */}
        {/* ============================================= */}

        <Pressable
          style={
            styles.primaryButton
          }
          onPress={
            handleScanNext
          }
        >
          <Text
            style={
              styles.primaryButtonIcon
            }
          >
            ▣
          </Text>

          <Text
            style={
              styles.primaryButtonText
            }
          >
            Scan Next Ticket
          </Text>
        </Pressable>

        <Pressable
          style={
            styles.secondaryButton
          }
          onPress={
            handleBackHome
          }
        >
          <Text
            style={
              styles.secondaryButtonIcon
            }
          >
            ⌂
          </Text>

          <Text
            style={
              styles.secondaryButtonText
            }
          >
            Back to Home
          </Text>
        </Pressable>

        {/* ============================================= */}
        {/* FOOTER */}
        {/* ============================================= */}

        <View style={styles.footer}>
          <Text
            style={
              styles.footerText
            }
          >
            TransitLK • Conductor Validation
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        '#F7F8FC',
    },

    container: {
      flex: 1,
      backgroundColor:
        '#F7F8FC',
    },

    content: {
      paddingHorizontal: 16,
      paddingBottom: 30,
    },

    // ==================================================
    // HEADER
    // ==================================================

    header: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
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
      backgroundColor:
        '#E2E8FF',
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
      backgroundColor:
        '#062B78',
      alignItems: 'center',
      justifyContent: 'center',
    },

    profileIcon: {
      color: '#FFFFFF',
      fontSize: 24,
    },

    // ==================================================
    // RESULT
    // ==================================================

    resultCard: {
      borderRadius: 18,
      paddingVertical: 28,
      paddingHorizontal: 20,
      alignItems: 'center',
      marginBottom: 14,
    },

    validCard: {
      backgroundColor:
        '#006B4F',
    },

    invalidCard: {
      backgroundColor:
        '#C51D24',
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
      backgroundColor:
        '#6EF0C0',
      borderColor: '#29C99A',
    },

    invalidIconCircle: {
      backgroundColor:
        '#FFFFFF',
      borderColor: '#E35A5A',
    },

    resultIcon: {
      fontSize: 52,
      fontWeight: '800',
      color: '#006B4F',
    },

    invalidResultIcon: {
      color: '#C51D24',
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
      backgroundColor:
        'rgba(0,0,0,0.22)',
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

    // ==================================================
    // WARNING
    // ==================================================

    warningCard: {
      backgroundColor:
        '#FFF0EF',
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
      backgroundColor:
        '#FFD8D5',
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

    // ==================================================
    // CARDS
    // ==================================================

    card: {
      backgroundColor:
        '#FFFFFF',
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
      backgroundColor:
        '#062B78',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    routeNumber: {
      color: '#FFFFFF',
      fontSize: 16,
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
      backgroundColor:
        '#E8EAF1',
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
      backgroundColor:
        '#F1F3FF',
      padding: 11,
      borderRadius: 10,
      marginRight: 8,
    },

    lastInfoBox: {
      marginRight: 0,
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

    ticketStatusRow: {
      marginTop: 3,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor:
        '#E8EAF1',
    },

    databaseStatus: {
      fontSize: 13,
      fontWeight: '800',
      color: '#11275E',
    },

    // ==================================================
    // PASSENGER
    // ==================================================

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
      backgroundColor:
        '#DDE5FF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    avatarText: {
      color: '#062B78',
      fontSize: 16,
      fontWeight: '800',
    },

    passengerInfo: {
      flex: 1,
    },

    passengerName: {
      fontSize: 18,
      fontWeight: '800',
      color: '#20263A',
    },

    ticketBox: {
      backgroundColor:
        '#F1F3FF',
      borderRadius: 11,
      padding: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    ticketTokenContainer: {
      flex: 1,
      paddingRight: 10,
    },

    ticketToken: {
      fontSize: 15,
      fontWeight: '800',
      color: '#1D294A',
      letterSpacing: 0.3,
    },

    copyIcon: {
      fontSize: 22,
      color: '#555B6E',
    },

    ticketNumberRow: {
      marginTop: 12,
    },

    ticketNumberText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#20263A',
    },

    // ==================================================
    // STATUS
    // ==================================================

    statusCard: {
      backgroundColor:
        '#E9EDFF',
      borderRadius: 13,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 11,
    },

    statusDotValid: {
      backgroundColor:
        '#00A982',
    },

    statusDotInvalid: {
      backgroundColor:
        '#D52B32',
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

    scanMethodText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#52607D',
      marginTop: 6,
    },

    // ==================================================
    // LOG STATUS
    // ==================================================

    logStatusCard: {
      borderRadius: 13,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
    },

    logSuccessCard: {
      backgroundColor:
        '#EBF8F2',
      borderColor: '#B8E5D1',
    },

    logWarningCard: {
      backgroundColor:
        '#FFF7E8',
      borderColor: '#F1D79D',
    },

    logStatusIcon: {
      width: 28,
      fontSize: 20,
      fontWeight: '800',
      color: '#087F80',
      marginRight: 8,
    },

    logStatusTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: '#29304A',
    },

    logStatusDescription: {
      fontSize: 11,
      color: '#656B7B',
      marginTop: 3,
      lineHeight: 16,
    },

    // ==================================================
    // BUTTONS
    // ==================================================

    primaryButton: {
      backgroundColor:
        '#062B78',
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
      backgroundColor:
        '#E3E9FF',
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

    // ==================================================
    // FOOTER
    // ==================================================

    footer: {
      alignItems: 'center',
      paddingTop: 20,
    },

    footerText: {
      fontSize: 11,
      color: '#9296A4',
    },
  });