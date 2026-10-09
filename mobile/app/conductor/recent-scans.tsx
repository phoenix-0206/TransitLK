import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
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
  // FETCH ALL SCANS
  // ====================================================

  const fetchScans =
    useCallback(async () => {
      try {
        setErrorMessage('');

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
  // UPDATE SCAN
  // ====================================================

  async function handleMarkReviewed(
    scanId: string,
  ) {
    try {
      const { error } = await supabase
        .from('ticket_scans')
        .update({
          notes: 'Reviewed by conductor',
        })
        .eq('id', scanId);

      if (error) {
        Alert.alert(
          'Update Failed',
          error.message,
        );

        return;
      }

      Alert.alert(
        'Updated',
        'Scan marked as reviewed.',
      );

      fetchScans();
    } catch (error) {
      console.error(
        'Update scan error:',
        error,
      );

      Alert.alert(
        'Update Failed',
        'Unable to update scan.',
      );
    }
  }

  // ====================================================
  // DELETE SCAN
  // ====================================================

  function handleDeleteScan(
    scanId: string,
  ) {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan record?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {
            try {
              const { error } =
                await supabase
                  .from('ticket_scans')
                  .delete()
                  .eq('id', scanId);

              if (error) {
                console.error(
                  'Delete scan error:',
                  error,
                );

                Alert.alert(
                  'Delete Failed',
                  error.message,
                );

                return;
              }

              // Remove immediately from screen
              setScans(
                currentScans =>
                  currentScans.filter(
                    scan =>
                      scan.id !==
                      scanId,
                  ),
              );

              Alert.alert(
                'Deleted',
                'Scan record deleted successfully.',
              );
            } catch (error) {
              console.error(
                'Delete scan error:',
                error,
              );

              Alert.alert(
                'Delete Failed',
                'Unable to delete scan.',
              );
            }
          },
        },
      ],
    );
  }

  // ====================================================
  // STATISTICS
  // ====================================================

  const validScans =
    scans.filter(
      (scan) =>
        String(
          scan.scan_result,
        )
          .trim()
          .toUpperCase() ===
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
        {/* HEADER */}

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
              All ticket
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

        {/* STATISTICS */}

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
              All Scans
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

        {/* SECTION HEADER */}

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
            All Scans
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

        {/* LOADING */}

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

        {/* ERROR */}

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

        {/* EMPTY STATE */}

        {!loading &&
          !errorMessage &&
          scans.length === 0 && (
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

        {/* SCAN LIST */}

        {!loading &&
          !errorMessage &&
          scans.length > 0 && (
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

                  const reviewed =
                    scan.notes ===
                    'Reviewed by conductor';

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
                            Duplicate scan
                          </Text>
                        )}

                        <View
                          style={
                            styles.crudActions
                          }
                        >
                          <Pressable
                            style={
                              styles.updateButton
                            }
                            disabled={
                              reviewed
                            }
                            onPress={() => {
                              if (
                                !reviewed
                              ) {
                                handleMarkReviewed(
                                  scan.id,
                                );
                              }
                            }}
                          >
                            <Text
                              style={
                                styles.crudButtonText
                              }
                            >
                              {reviewed
                                ? '✓ Reviewed'
                                : 'Mark Reviewed'}
                            </Text>
                          </Pressable>

                          <Pressable
                            style={
                              styles.deleteButton
                            }
                            onPress={() =>
                              handleDeleteScan(
                                scan.id,
                              )
                            }
                          >
                            <Text
                              style={
                                styles.crudButtonText
                              }
                            >
                              Delete
                            </Text>
                          </Pressable>
                        </View>
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

        {/* ACTIONS */}

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

    reviewedText: {
      fontSize: 11,
      color: '#087F80',
      marginTop: 4,
      fontWeight: '700',
    },

    crudActions: {
      flexDirection: 'row',
      marginTop: 8,
      gap: 6,
    },

    updateButton: {
      backgroundColor:
        '#087F80',
      borderRadius: 7,
      paddingVertical: 6,
      paddingHorizontal: 9,
    },

    deleteButton: {
      backgroundColor:
        '#D33A3A',
      borderRadius: 7,
      paddingVertical: 6,
      paddingHorizontal: 9,
    },

    crudButtonText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
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