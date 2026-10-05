import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type AlertType = 'delay' | 'diversion' | 'arrival' | 'cancellation';

type Alert = {
  id: string;
  bus: string;
  title: string;
  message: string;
  time: string;
  type: AlertType;
  badge?: string;
};

const alerts: Alert[] = [
  {
    id: '1',
    bus: 'BUS 138',
    title: 'Bus 138 Delayed',
    message: 'Bus 138 is running 10 minutes late due to heavy traffic.',
    time: '5 min ago',
    type: 'delay',
    badge: '+10m Delay',
  },
  {
    id: '2',
    bus: 'ROUTE 205',
    title: 'Route 205 Diversion',
    message: 'Temporary diversion due to road construction. Expect minor delays.',
    time: '12 min ago',
    type: 'diversion',
    badge: 'Diversion',
  },
  {
    id: '3',
    bus: 'BUS 177',
    title: 'Your Bus is Arriving',
    message: 'Bus 177 will arrive at your selected stop in approximately 3 minutes.',
    time: '18 min ago',
    type: 'arrival',
    badge: '3 min',
  },
  {
    id: '4',
    bus: 'BUS 120',
    title: 'Service Cancelled',
    message: 'The next scheduled Bus 120 service has been cancelled.',
    time: '32 min ago',
    type: 'cancellation',
    badge: 'Cancelled',
  },
];

export default function NotificationsScreen() {
  const router = useRouter();

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
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Alerts Feed</Text>
          <Text style={styles.headerSubtitle}>
            Live transit updates
          </Text>
        </View>

        <TouchableOpacity style={styles.headerButton}>
          <Ionicons
            name="options-outline"
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
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons
              name="notifications"
              size={22}
              color="#DC2626"
            />
          </View>

          <View>
            <Text style={styles.summaryNumber}>3 Active Transit Delays</Text>
            <Text style={styles.summaryText}>
              Updates affecting your nearby routes
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>LATEST ALERTS</Text>

        {alerts.map((alert) => {
          const appearance = getAlertStyle(alert.type);

          return (
            <TouchableOpacity
              key={alert.id}
              activeOpacity={0.8}
              style={[
                styles.alertCard,
                {
                  backgroundColor: appearance.background,
                  borderLeftColor: appearance.color,
                },
              ]}
              onPress={() =>
                router.push({
  pathname: '/notifications/[id]',
  params: { id: alert.id },
})
              }
            >
              <View style={styles.cardTopRow}>
                <View style={styles.busInfo}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: `${appearance.color}15` },
                    ]}
                  >
                    <Ionicons
                      name={appearance.icon}
                      size={20}
                      color={appearance.color}
                    />
                  </View>

                  <Text style={styles.busLabel}>{alert.bus}</Text>
                </View>

                <View
                  style={[
                    styles.badge,
                    { backgroundColor: appearance.color },
                  ]}
                >
                  <Text style={styles.badgeText}>{alert.badge}</Text>
                </View>
              </View>

              <Text style={styles.alertTitle}>{alert.title}</Text>

              <Text style={styles.alertMessage}>
                {alert.message}
              </Text>

              <View style={styles.cardBottom}>
                <View style={styles.timeContainer}>
                  <Ionicons
                    name="time-outline"
                    size={15}
                    color="#6B7280"
                  />
                  <Text style={styles.timeText}>{alert.time}</Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#6B7280"
                />
              </View>
            </TouchableOpacity>
          );
        })}

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
});