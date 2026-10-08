
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../../services/supabase';

type AlertType =
  | 'delay'
  | 'diversion'
  | 'arrival'
  | 'cancellation';

type FilterType =
  | 'all'
  | 'delay'
  | 'diversion'
  | 'alerts';

type TransitAlert = {
  id: string;
  title: string;
  message: string;
  type: AlertType;
  route_number: string | null;
  delay_minutes: number | null;
  is_read: boolean;
  is_active: boolean;
  created_at: string;
};

export default function NotificationsScreen() {
  const router = useRouter();

  const [alerts, setAlerts] = useState<TransitAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFilter, setSelectedFilter] =
    useState<FilterType>('all');

  // Tracks alerts dismissed during this screen session.
  const [deletedAlertIds, setDeletedAlertIds] =
    useState<string[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const { data, error } = await supabase
        .from('notifications')
        .select(
          'id, title, message, type, route_number, delay_minutes, is_read, is_active, created_at'
        )
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAlerts((data ?? []) as TransitAlert[]);
    } catch (error) {
      console.error('Error loading notifications:', error);

      setErrorMessage(
        'Unable to load transit alerts. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // NEW: Delete confirmation dialog.
  const handleDeleteAlert = (alertId: string) => {
    Alert.alert(
      'Delete Alert?',
      'Are you sure you want to remove this alert from your list?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDeletedAlertIds((previousIds) =>
              previousIds.includes(alertId)
                ? previousIds
                : [...previousIds, alertId]
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getAlertStyle = (type: AlertType) => {
    switch (type) {
      case 'delay':
        return {
          icon: 'warning-outline' as const,
          color: '#DC2626',
          background: '#FEF2F2',
        };

      case 'diversion':
        return {
          icon: 'git-branch-outline' as const,
          color: '#D97706',
          background: '#FFFBEB',
        };

      case 'arrival':
        return {
          icon: 'bus-outline' as const,
          color: '#2563EB',
          background: '#EFF6FF',
        };

      case 'cancellation':
        return {
          icon: 'close-circle-outline' as const,
          color: '#DC2626',
          background: '#FEF2F2',
        };

      default:
        return {
          icon: 'notifications-outline' as const,
          color: '#2563EB',
          background: '#EFF6FF',
        };
    }
  };

  const getBusLabel = (alert: TransitAlert) => {
    if (!alert.route_number) {
      return 'TRANSIT ALERT';
    }

    if (alert.type === 'diversion') {
      return `ROUTE ${alert.route_number}`;
    }

    return `BUS ${alert.route_number}`;
  };

  const getBadge = (alert: TransitAlert) => {
    switch (alert.type) {
      case 'delay':
        return alert.delay_minutes
          ? `+${alert.delay_minutes}m Delay`
          : 'Delay';

      case 'diversion':
        return 'Diversion';

      case 'arrival':
        return 'Arrival';

      case 'cancellation':
        return 'Cancelled';

      default:
        return 'Alert';
    }
  };

  const getTimeAgo = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    const currentTime = Date.now();

    const differenceInMinutes = Math.max(
      0,
      Math.floor(
        (currentTime - createdTime) / 60000
      )
    );

    if (differenceInMinutes < 1) {
      return 'Just now';
    }

    if (differenceInMinutes < 60) {
      return `${differenceInMinutes} min ago`;
    }

    const hours = Math.floor(
      differenceInMinutes / 60
    );

    if (hours < 24) {
      return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    }

    const days = Math.floor(hours / 24);

    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Only display alerts that haven't been dismissed.
  const visibleAlerts = alerts.filter(
    (alert) => !deletedAlertIds.includes(alert.id)
  );

  const activeDelayCount = visibleAlerts.filter(
    (alert) =>
      alert.type === 'delay' && alert.is_active
  ).length;

  const filters: {
    key: FilterType;
    label: string;
    count: number;
  }[] = [
    {
      key: 'all',
      label: 'All',
      count: visibleAlerts.length,
    },
    {
      key: 'delay',
      label: 'Delays',
      count: visibleAlerts.filter(
        (alert) => alert.type === 'delay'
      ).length,
    },
    {
      key: 'diversion',
      label: 'Route Changes',
      count: visibleAlerts.filter(
        (alert) => alert.type === 'diversion'
      ).length,
    },
    {
      key: 'alerts',
      label: 'Alerts',
      count: visibleAlerts.filter(
        (alert) =>
          alert.type === 'arrival' ||
          alert.type === 'cancellation'
      ).length,
    },
  ];

  const filteredAlerts = visibleAlerts.filter(
    (alert) => {
      if (selectedFilter === 'all') {
        return true;
      }

      if (selectedFilter === 'alerts') {
        return (
          alert.type === 'arrival' ||
          alert.type === 'cancellation'
        );
      }

      return alert.type === selectedFilter;
    }
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            Alerts Feed
          </Text>

          <Text style={styles.headerSubtitle}>
            Live transit updates
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() =>
            router.push('/settings-preferences')
          }
          accessibilityLabel="Open settings"
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color="#1F2937"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Horizontal filter tabs */}
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={
            styles.filterContainer
          }
        >
          {filters.map((filter) => {
            const isSelected =
              selectedFilter === filter.key;

            return (
              <TouchableOpacity
                key={filter.key}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{
                  selected: isSelected,
                }}
                style={[
                  styles.filterTab,
                  isSelected &&
                    styles.filterTabSelected,
                ]}
                onPress={() =>
                  setSelectedFilter(filter.key)
                }
              >
                <Text
                  style={[
                    styles.filterLabel,
                    isSelected &&
                      styles.filterLabelSelected,
                  ]}
                >
                  {filter.label}
                </Text>

                <View
                  style={[
                    styles.filterCount,
                    isSelected &&
                      styles.filterCountSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountText,
                      isSelected &&
                        styles.filterCountTextSelected,
                    ]}
                  >
                    {filter.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Active delay summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="notifications"
              size={22}
              color="#DC2626"
            />
          </View>

          <View style={styles.summaryInfo}>
            <Text style={styles.summaryNumber}>
              {activeDelayCount} Active Transit{' '}
              {activeDelayCount === 1
                ? 'Delay'
                : 'Delays'}
            </Text>

            <Text style={styles.summaryText}>
              Updates affecting your nearby routes
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          LATEST ALERTS
        </Text>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#2563EB"
            />

            <Text style={styles.loadingText}>
              Loading transit alerts...
            </Text>
          </View>
        )}

        {/* Error */}
        {!loading && errorMessage !== '' && (
          <View style={styles.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={24}
              color="#DC2626"
            />

            <Text style={styles.errorText}>
              {errorMessage}
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchNotifications}
            >
              <Text style={styles.retryButtonText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notification cards */}
        {!loading &&
          errorMessage === '' &&
          filteredAlerts.map((alert) => {
            const appearance = getAlertStyle(
              alert.type
            );

            return (
              <View
                key={alert.id}
                style={[
                  styles.alertCard,
                  {
                    backgroundColor:
                      appearance.background,
                    borderLeftColor:
                      appearance.color,
                  },
                ]}
              >
                {/* Card top row */}
                <View style={styles.cardTopRow}>
                  <View style={styles.busInfo}>
                    <View
                      style={[
                        styles.iconBox,
                        {
                          backgroundColor:
                            `${appearance.color}15`,
                        },
                      ]}
                    >
                      <Ionicons
                        name={appearance.icon}
                        size={20}
                        color={appearance.color}
                      />
                    </View>

                    <Text style={styles.busLabel}>
                      {getBusLabel(alert)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor:
                          appearance.color,
                      },
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {getBadge(alert)}
                    </Text>
                  </View>
                </View>

                {/* Tapping notification content opens details */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname:
                        '/notifications/[id]',
                      params: {
                        id: alert.id,
                      },
                    })
                  }
                >
                  <Text style={styles.alertTitle}>
                    {alert.title}
                  </Text>

                  <Text style={styles.alertMessage}>
                    {alert.message}
                  </Text>
                </TouchableOpacity>

                {/* Bottom row */}
                <View style={styles.cardBottom}>
                  <View style={styles.timeContainer}>
                    <Ionicons
                      name="time-outline"
                      size={15}
                      color="#6B7280"
                    />

                    <Text style={styles.timeText}>
                      {getTimeAgo(
                        alert.created_at
                      )}
                    </Text>
                  </View>

                  <View style={styles.cardActions}>
                    {/* NEW: Delete icon */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() =>
                        handleDeleteAlert(alert.id)
                      }
                      accessibilityRole="button"
                      accessibilityLabel={
                        `Delete ${alert.title}`
                      }
                      hitSlop={8}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#DC2626"
                      />
                    </TouchableOpacity>

                    {/* Existing details navigation */}
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname:
                            '/notifications/[id]',
                          params: {
                            id: alert.id,
                          },
                        })
                      }
                      accessibilityRole="button"
                      accessibilityLabel={
                        `View ${alert.title} details`
                      }
                      hitSlop={8}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={19}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}

        {/* Empty state */}
        {!loading &&
          errorMessage === '' &&
          filteredAlerts.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={30}
                color="#9CA3AF"
              />

              <Text style={styles.emptyText}>
                {selectedFilter === 'all'
                  ? 'No active transit alerts'
                  : 'No notifications in this category'}
              </Text>
            </View>
          )}

        {/* End message */}
        {!loading &&
          errorMessage === '' &&
          filteredAlerts.length > 0 && (
            <View style={styles.endMessage}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#16A34A"
              />

              <Text style={styles.endText}>
                You're all caught up
              </Text>
            </View>
          )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 3,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },

  filterScroll: {
    marginBottom: 20,
    flexGrow: 0,
  },

  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    gap: 10,
  },

  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  filterTabSelected: {
    backgroundColor: '#173A87',
    borderColor: '#173A87',
  },

  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },

  filterLabelSelected: {
    color: '#FFFFFF',
  },

  filterCount: {
    marginLeft: 8,
    minWidth: 23,
    height: 23,
    paddingHorizontal: 5,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterCountSelected: {
    backgroundColor: '#385BA4',
  },

  filterCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#173A87',
  },

  filterCountTextSelected: {
    color: '#FFFFFF',
  },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  summaryInfo: {
    flex: 1,
  },

  summaryNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  summaryText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 12,
  },

  alertCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  busInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },

  iconBox: {
    width: 35,
    height: 35,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  busLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#374151',
    letterSpacing: 0.4,
  },

  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  alertTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },

  alertMessage: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4B5563',
  },

  cardBottom: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  timeText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#6B7280',
  },

  // NEW: Delete and details action row
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // NEW: Trash icon button
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  endMessage: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 15,
  },

  endText: {
    marginLeft: 6,
    color: '#6B7280',
    fontSize: 13,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#6B7280',
  },

  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },

  errorText: {
    marginTop: 10,
    fontSize: 13,
    color: '#991B1B',
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 14,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },

  emptyText: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
});
