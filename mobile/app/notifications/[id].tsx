import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../../services/supabase';

type AlertType = 'delay' | 'diversion' | 'arrival' | 'cancellation';

type Notification = {
  id: string;
  created_at: string;
  title: string;
  message: string;
  type: AlertType;
  route_number: string | null;
  delay_minutes: number | null;
  is_read: boolean;
  is_active: boolean;
};

export default function NotificationDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [notification, setNotification] =
    useState<Notification | null>(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (id) {
      loadNotification();
    }
  }, [id]);

  const loadNotification = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      // READ the selected notification
      const { data, error } = await supabase
        .from('notifications')
        .select(
          'id, created_at, title, message, type, route_number, delay_minutes, is_read, is_active'
        )
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      setNotification(data as Notification);

      // UPDATE the notification as read
      if (!data.is_read) {
        const { error: updateError } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', id);

        if (updateError) {
          console.error(
            'Error marking notification as read:',
            updateError
          );
        } else {
          setNotification({
            ...(data as Notification),
            is_read: true,
          });
        }
      }
    } catch (error) {
      console.error('Error loading notification:', error);

      setErrorMessage(
        'Unable to load notification details. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getTypeDetails = (type: AlertType) => {
    switch (type) {
      case 'delay':
        return {
          label: 'DELAY ALERT',
          icon: 'warning-outline' as const,
          color: '#DC2626',
          background: '#FEE2E2',
        };

      case 'diversion':
        return {
          label: 'ROUTE DIVERSION',
          icon: 'git-branch-outline' as const,
          color: '#D97706',
          background: '#FEF3C7',
        };

      case 'arrival':
        return {
          label: 'ARRIVAL ALERT',
          icon: 'bus-outline' as const,
          color: '#2563EB',
          background: '#DBEAFE',
        };

      case 'cancellation':
        return {
          label: 'SERVICE CANCELLED',
          icon: 'close-circle-outline' as const,
          color: '#DC2626',
          background: '#FEE2E2',
        };

      default:
        return {
          label: 'TRANSIT ALERT',
          icon: 'notifications-outline' as const,
          color: '#2563EB',
          background: '#DBEAFE',
        };
    }
  };

  const getTimeAgo = (createdAt: string) => {
    const createdTime = new Date(createdAt).getTime();
    const currentTime = new Date().getTime();

    const differenceInMinutes = Math.max(
      0,
      Math.floor((currentTime - createdTime) / 60000)
    );

    if (differenceInMinutes < 1) {
      return 'Just now';
    }

    if (differenceInMinutes < 60) {
      return `${differenceInMinutes} min ago`;
    }

    const hours = Math.floor(differenceInMinutes / 60);

    if (hours < 24) {
      return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    }

    const days = Math.floor(hours / 24);

    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />

          <Text style={styles.loadingText}>
            Loading notification...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage || !notification) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={34}
            color="#DC2626"
          />

          <Text style={styles.errorText}>
            {errorMessage || 'Notification not found.'}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadNotification}
          >
            <Text style={styles.retryButtonText}>
              Try Again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToAlertsButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backToAlertsText}>
              Back to Alerts
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const appearance = getTypeDetails(notification.type);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#111827"
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Notification Details
          </Text>

          <Text style={styles.headerSubtitle}>
            Transit Alert
          </Text>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons
            name="ellipsis-horizontal"
            size={22}
            color="#374151"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Alert icon */}
        <View
          style={[
            styles.alertIcon,
            { backgroundColor: appearance.background },
          ]}
        >
          <Ionicons
            name={appearance.icon}
            size={30}
            color={appearance.color}
          />
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: appearance.background },
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              { color: appearance.color },
            ]}
          >
            {appearance.label}
          </Text>
        </View>

        <Text style={styles.title}>
          {notification.title}
        </Text>

        <Text style={styles.description}>
          {notification.message}
        </Text>

        {/* Bus information */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            BUS INFORMATION
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="bus-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <View>
              <Text style={styles.infoLabel}>
                Bus Number
              </Text>

              <Text style={styles.infoValue}>
                {notification.route_number ?? 'Not available'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="navigate-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <View style={styles.flex}>
              <Text style={styles.infoLabel}>
                Route
              </Text>

              <Text style={styles.infoValue}>
                Route {notification.route_number ?? 'Not available'}
              </Text>
            </View>
          </View>
        </View>

        {/* Delay information - only for delay alerts */}
        {notification.type === 'delay' && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>
              DELAY INFORMATION
            </Text>

            <View style={styles.delayRow}>
              <View>
                <Text style={styles.infoLabel}>
                  Current Delay
                </Text>

                <Text style={styles.delayValue}>
                  {notification.delay_minutes !== null
                    ? `+${notification.delay_minutes} min`
                    : 'Not available'}
                </Text>
              </View>

              <View style={styles.delayIcon}>
                <Ionicons
                  name="time-outline"
                  size={25}
                  color="#DC2626"
                />
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.infoLabel}>
              Details
            </Text>

            <Text style={styles.reasonText}>
              {notification.message}
            </Text>
          </View>
        )}

        {/* Status */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            CURRENT STATUS
          </Text>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.liveDot,
                {
                  backgroundColor: notification.is_active
                    ? '#16A34A'
                    : '#9CA3AF',
                },
              ]}
            />

            <View style={styles.flex}>
              <Text style={styles.statusTitle}>
                {notification.is_active
                  ? 'Alert still active'
                  : 'Alert no longer active'}
              </Text>

              <Text style={styles.statusText}>
                Updated {getTimeAgo(notification.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* View route button */}
        {notification.route_number && (
          <TouchableOpacity
            style={styles.routeButton}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: '/route-details/[id]',
                params: {
                  id: notification.route_number!,
                },
              })
            }
          >
            <Ionicons
              name="map-outline"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.routeButtonText}>
              View Route Details
            </Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        )}

        <Text style={styles.notificationId}>
          Notification #{notification.id.slice(0, 8)}
        </Text>
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
    paddingHorizontal: 18,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },

  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  alertIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    marginBottom: 22,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 15,
  },

  delayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  delayValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#DC2626',
  },

  delayIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  reasonText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },

  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  statusText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
  },

  routeButton: {
    height: 56,
    borderRadius: 17,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    marginTop: 5,
  },

  routeButtonText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  notificationId: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#6B7280',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
  },

  retryButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 18,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  backToAlertsButton: {
    marginTop: 15,
  },

  backToAlertsText: {
    color: '#2563EB',
    fontWeight: '700',
  },

  flex: {
    flex: 1,
  },
});