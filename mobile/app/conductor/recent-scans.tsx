import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { supabase } from '@/services/supabase';

// ======================================================
// TYPES
// ======================================================

type TicketInfo = {
  ticket_number?: string | null;
  ticket_token?: string | null;
};

type TicketScan = {
  id: string;
  ticket_id: string;
  scan_result: string;
  scan_method: string | null;
  terminal_id: string | null;
  scanned_at: string | null;
  notes: string | null;
  created_at: string | null;

  tickets?:
    | TicketInfo
    | TicketInfo[]
    | null;
};

// ======================================================
// SCREEN
// ======================================================

export default function RecentScansScreen() {
  const router = useRouter();

  const [scans, setScans] =
    useState<TicketScan[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  // ====================================================
  // FETCH TODAY'S SCANS
  // ====================================================

  const fetchScans =
    useCallback(async () => {
      try {
        setErrorMessage('');

        // Start of today using device local time
        const startOfToday =
          new Date();

        startOfToday.setHours(
          0,
          0,
          0,
          0,
        );

        const {
          data,
          error,
        } = await supabase
          .from('ticket_scans')
          .select(`
            id,
            ticket_id,
            scan_result,
            scan_method,
            terminal_id,
            scanned_at,
            notes,
            created_at,
            tickets (
              ticket_number,
              ticket_token
            )
          `)
          .gte(
            'scanned_at',
            startOfToday.toISOString(),
          )
          .order(
            'scanned_at',
            {
              ascending: false,
            },
          );

        if (error) {
          console.error(
            'Recent scans fetch error:',
            error,
          );

          setErrorMessage(
            error.message,
          );

          setScans([]);

          return;
        }

        setScans(
          (data ?? []) as TicketScan[],
        );
      } catch (error) {
        console.error(
          'Recent scans error:',
          error,
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load recent scans.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  // ====================================================
  // LOAD WHEN SCREEN OPENS
  // ====================================================

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  // ====================================================
  // PULL TO REFRESH
  // ====================================================

  function handleRefresh() {
    setRefreshing(true);

    fetchScans();
  }

  // ====================================================
  // STATISTICS
  // ====================================================

  const validScans =
    scans.filter(
      (scan) =>
        String(
          scan.scan_result,
        ).toUpperCase() ===
        'VALID',
    ).length;

  const failedScans =
    scans.length -
    validScans;

  // ====================================================
  // TICKET INFORMATION
  // ====================================================

  function getTicketInfo(
    scan: TicketScan,
  ): TicketInfo | null {
    if (!scan.tickets) {
      return null;
    }

    if (
      Array.isArray(
        scan.tickets,
      )
    ) {
      return (
        scan.tickets[0] ??
        null
      );
    }

    return scan.tickets;
  }

  function getTicketDisplay(
    scan: TicketScan,
  ): string {
    const ticket =
      getTicketInfo(scan);

    if (
      ticket?.ticket_number
    ) {
      return String(
        ticket.ticket_number,
      );
    }

    if (
      ticket?.ticket_token
    ) {
      return String(
        ticket.ticket_token,
      );
    }

    return scan.ticket_id;
  }

  // ====================================================
  // FORMAT TIME
  // ====================================================

  function formatScanTime(
    value:
      | string
      | null,
  ): string {
    if (!value) {
      return 'Recently';
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return 'Recently';
    }

    return date.toLocaleTimeString(
      [],
      {
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  }

  // ====================================================
  // FORMAT RESULT
  // ====================================================

  function getResultLabel(
    result: string,
  ) {
    const value =
      String(result)
        .trim()
        .toUpperCase();

    if (
      value ===
      'ALREADY_USED'
    ) {
      return 'ALREADY USED';
    }

    return value;
  }

  function isValidResult(
    result: string,
  ) {
    return (
      String(result)
        .trim()
        .toUpperCase() ===
      'VALID'
    );
  }

  function isAlreadyUsed(
    result: string,
  ) {
    return (
      String(result)
        .trim()
        .toUpperCase() ===
      'ALREADY_USED'
    );
  }

  // ====================================================
  // UI
  // ====================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
          />
        }
      >
        {/* ============================================= */}
        {/* HEADER */}
        {/* ============================================= */}

        <View
          style={styles.header}
        >
          <View>
            <Text
              style={styles.brand}
            >
              TransitLK
            </Text>

            <Text
              style={styles.title}
            >
              Recent Scans
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Today's ticket
              validation history
            </Text>
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
        {/* STATISTICS */}
        {/* ============================================= */}

        <View
          style={
            styles.statsCard
          }
        >
          <View
            style={styles.statItem}
          >
            <Text
              style={
                styles.statNumber
              }
            >
              {scans.length}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Today's Scans
            </Text>
          </View>

          <View
            style={styles.divider}
          />

          <View
            style={styles.statItem}
          >
            <Text
              style={[
                styles.statNumber,
                styles.validNumber,
              ]}
            >
              {validScans}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Valid
            </Text>
          </View>

          <View
            style={styles.divider}
          />

          <View
            style={styles.statItem}
          >
            <Text
              style={[
                styles.statNumber,
                styles.failedNumber,
              ]}
            >
              {failedScans}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Failed
            </Text>
          </View>
        </View>

        {/* ============================================= */}
        {/* SECTION HEADER */}
        {/* ============================================= */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <Text
            style={
              styles.sectionTitle
            }
          >
            Today's Scans
          </Text>

          <Text
            style={
              styles.scanCount
            }
          >
            {scans.length}{' '}
            {scans.length === 1
              ? 'scan'
              : 'scans'}
          </Text>
        </View>

        {/* ============================================= */}
        {/* LOADING */}
        {/* ============================================= */}

        {loading && (
          <View
            style={
              styles.loadingCard
            }
          >
            <ActivityIndicator
              size="large"
              color="#087F80"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading scan
              history...
            </Text>
          </View>
        )}

        {/* ============================================= */}
        {/* ERROR */}
        {/* ============================================= */}

        {!loading &&
          errorMessage !== '' && (
            <View
              style={
                styles.errorCard
              }
            >
              <View
                style={
                  styles.errorIconCircle
                }
              >
                <Text
                  style={
                    styles.errorIcon
                  }
                >
                  !
                </Text>
              </View>

              <Text
                style={
                  styles.errorTitle
                }
              >
                Could not load
                scans
              </Text>

              <Text
                style={
                  styles.errorText
                }
              >
                {errorMessage}
              </Text>

              <Pressable
                style={
                  styles.retryButton
                }
                onPress={() => {
                  setLoading(true);

                  fetchScans();
                }}
              >
                <Text
                  style={
                    styles.retryButtonText
                  }
                >
                  TRY AGAIN
                </Text>
              </Pressable>
            </View>
          )}

        {/* ============================================= */}
        {/* EMPTY STATE */}
        {/* ============================================= */}

        {!loading &&
          !errorMessage &&
          scans.length ===
            0 && (
            <View
              style={
                styles.emptyCard
              }
            >
              <View
                style={
                  styles.emptyIconCircle
                }
              >
                <Text
                  style={
                    styles.emptyIcon
                  }
                >
                  ✓
                </Text>
              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                No Recent Scans
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                Your ticket
                validations will
                appear here after
                you scan a ticket.
              </Text>

              <Pressable
                style={
                  styles.scanButton
                }
                onPress={() =>
                  router.push(
                    '/conductor/scanner',
                  )
                }
              >
                <Text
                  style={
                    styles.scanButtonIcon
                  }
                >
                  ▣
                </Text>

                <Text
                  style={
                    styles.scanButtonText
                  }
                >
                  Scan Ticket
                </Text>
              </Pressable>
            </View>
          )}

        {/* ============================================= */}
        {/* SCAN LIST */}
        {/* ============================================= */}

        {!loading &&
          !errorMessage &&
          scans.length >
            0 && (
            <View
              style={
                styles.scanList
              }
            >
              {scans.map(
                (
                  scan,
                  index,
                ) => {
                  const valid =
                    isValidResult(
                      scan.scan_result,
                    );

                  const alreadyUsed =
                    isAlreadyUsed(
                      scan.scan_result,
                    );

                  return (
                    <View
                      key={
                        scan.id ??
                        index
                      }
                      style={
                        styles.scanItem
                      }
                    >
                      <View
                        style={[
                          styles.scanItemIcon,

                          valid
                            ? styles.validIconBackground
                            : styles.failedIconBackground,
                        ]}
                      >
                        <Text
                          style={[
                            styles.scanItemIconText,

                            valid
                              ? styles.validIconText
                              : styles.failedIconText,
                          ]}
                        >
                          {valid
                            ? '✓'
                            : '×'}
                        </Text>
                      </View>

                      <View
                        style={
                          styles.scanItemInfo
                        }
                      >
                        <Text
                          style={
                            styles.ticketId
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {getTicketDisplay(
                            scan,
                          )}
                        </Text>

                        <Text
                          style={
                            styles.scanTime
                          }
                        >
                          {formatScanTime(
                            scan.scanned_at ??
                              scan.created_at,
                          )}

                          {'  •  '}

                          {scan.scan_method ??
                            'QR'}
                        </Text>

                        {alreadyUsed && (
                          <Text
                            style={
                              styles.duplicateText
                            }
                          >
                            Duplicate
                            scan
                          </Text>
                        )}
                      </View>

                      <View
                        style={[
                          styles.statusBadge,

                          valid
                            ? styles.validBadge
                            : styles.failedBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.scanStatus,

                            valid
                              ? styles.validStatus
                              : styles.failedStatus,
                          ]}
                        >
                          {getResultLabel(
                            scan.scan_result,
                          )}
                        </Text>
                      </View>
                    </View>
                  );
                },
              )}
            </View>
          )}

        {/* ============================================= */}
        {/* ACTIONS */}
        {/* ============================================= */}

        <Pressable
          style={
            styles.scanAnotherButton
          }
          onPress={() =>
            router.push(
              '/conductor/scanner',
            )
          }
        >
          <Text
            style={
              styles.scanAnotherIcon
            }
          >
            ▣
          </Text>

          <Text
            style={
              styles.scanAnotherText
            }
          >
            Scan Another Ticket
          </Text>
        </Pressable>

        <Pressable
          style={
            styles.backButton
          }
          onPress={() =>
            router.replace(
              '/conductor/dashboard',
            )
          }
        >
          <Text
            style={
              styles.backIcon
            }
          >
            ←
          </Text>

          <Text
            style={
              styles.backText
            }
          >
            Back to Dashboard
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        '#F5F8FA',
    },

    content: {
      padding: 20,
      paddingBottom: 40,
    },

    // ==================================================
    // HEADER
    // ==================================================

    header: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
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
      backgroundColor:
        '#123B56',
      alignItems: 'center',
      justifyContent: 'center',
    },

    profileIcon: {
      color: '#FFFFFF',
      fontSize: 24,
    },

    // ==================================================
    // STATS
    // ==================================================

    statsCard: {
      backgroundColor:
        '#FFFFFF',
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
      backgroundColor:
        '#E1E6EA',
    },

    // ==================================================
    // SECTION
    // ==================================================

    sectionHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
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

    // ==================================================
    // LOADING
    // ==================================================

    loadingCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 18,
      minHeight: 250,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
    },

    loadingText: {
      marginTop: 15,
      color: '#71808A',
      fontSize: 14,
    },

    // ==================================================
    // ERROR
    // ==================================================

    errorCard: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 18,
      minHeight: 300,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
    },

    errorIconCircle: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor:
        '#FDEAEA',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },

    errorIcon: {
      color: '#D33A3A',
      fontSize: 36,
      fontWeight: '800',
    },

    errorTitle: {
      fontSize: 19,
      fontWeight: '800',
      color: '#123B56',
    },

    errorText: {
      fontSize: 13,
      color: '#71808A',
      textAlign: 'center',
      lineHeight: 20,
      marginTop: 8,
    },

    retryButton: {
      marginTop: 20,
      backgroundColor:
        '#087F80',
      borderRadius: 10,
      paddingHorizontal: 22,
      paddingVertical: 11,
    },

    retryButtonText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 13,
    },

    // ==================================================
    // EMPTY
    // ==================================================

    emptyCard: {
      backgroundColor:
        '#FFFFFF',
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
      backgroundColor:
        '#E3F4F3',
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
      backgroundColor:
        '#087F80',
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

    // ==================================================
    // LIST
    // ==================================================

    scanList: {
      gap: 10,
    },

    scanItem: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 14,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',

      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 4,

      shadowOffset: {
        width: 0,
        height: 2,
      },

      elevation: 1,
    },

    scanItemIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
    },

    validIconBackground: {
      backgroundColor:
        '#E3F4F3',
    },

    failedIconBackground: {
      backgroundColor:
        '#FDEAEA',
    },

    scanItemIconText: {
      fontSize: 22,
      fontWeight: '800',
    },

    validIconText: {
      color: '#087F80',
    },

    failedIconText: {
      color: '#D33A3A',
    },

    scanItemInfo: {
      flex: 1,
      marginLeft: 12,
      paddingRight: 8,
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

    duplicateText: {
      fontSize: 11,
      color: '#D33A3A',
      marginTop: 3,
      fontWeight: '600',
    },

    statusBadge: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 6,
      maxWidth: 100,
    },

    validBadge: {
      backgroundColor:
        '#E5F5F2',
    },

    failedBadge: {
      backgroundColor:
        '#FDEAEA',
    },

    scanStatus: {
      fontSize: 9,
      fontWeight: '800',
      textAlign: 'center',
    },

    validStatus: {
      color: '#087F80',
    },

    failedStatus: {
      color: '#D33A3A',
    },

    // ==================================================
    // ACTIONS
    // ==================================================

    scanAnotherButton: {
      marginTop: 20,
      backgroundColor:
        '#087F80',
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },

    scanAnotherIcon: {
      color: '#FFFFFF',
      fontSize: 18,
      marginRight: 8,
    },

    scanAnotherText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },

    backButton: {
      marginTop: 10,
      backgroundColor:
        '#E8EDF1',
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