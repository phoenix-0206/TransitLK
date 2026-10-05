import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function NotificationDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
  style={styles.routeButton}
  activeOpacity={0.85}
  onPress={() =>
  router.push({
    pathname: '/route-details/[id]',
    params: { id: '138' },
  })
}
>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Notification Details</Text>
          <Text style={styles.headerSubtitle}>Transit Alert</Text>
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
        <View style={styles.alertIcon}>
          <Ionicons name="warning-outline" size={30} color="#DC2626" />
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>DELAY ALERT</Text>
        </View>

        <Text style={styles.title}>Bus 138 Delayed</Text>

        <Text style={styles.description}>
          Bus 138 is currently experiencing a delay due to heavy traffic
          conditions.
        </Text>

        {/* Bus information */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>BUS INFORMATION</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="bus-outline" size={21} color="#2563EB" />
            </View>

            <View>
              <Text style={styles.infoLabel}>Bus Number</Text>
              <Text style={styles.infoValue}>138</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="navigate-outline" size={21} color="#2563EB" />
            </View>

            <View style={styles.flex}>
              <Text style={styles.infoLabel}>Route</Text>
              <Text style={styles.infoValue}>
                Pettah → Homagama
              </Text>
            </View>
          </View>
        </View>

        {/* Delay information */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>DELAY INFORMATION</Text>

          <View style={styles.delayRow}>
            <View>
              <Text style={styles.infoLabel}>Current Delay</Text>
              <Text style={styles.delayValue}>+10 min</Text>
            </View>

            <View style={styles.delayIcon}>
              <Ionicons name="time-outline" size={25} color="#DC2626" />
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.infoLabel}>Reason</Text>
          <Text style={styles.reasonText}>
            Heavy traffic near Nugegoda is causing delays along the route.
          </Text>
        </View>

        {/* Status */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>CURRENT STATUS</Text>

          <View style={styles.statusRow}>
            <View style={styles.liveDot} />

            <View style={styles.flex}>
              <Text style={styles.statusTitle}>Delay still active</Text>
              <Text style={styles.statusText}>
                Last updated 5 minutes ago
              </Text>
            </View>
          </View>
        </View>

        {/* View route button */}
        <TouchableOpacity
          style={styles.routeButton}
          activeOpacity={0.85}
          onPress={() => {
            // Route Details will be connected later.
          }}
        >
          <Ionicons name="map-outline" size={20} color="#FFFFFF" />

          <Text style={styles.routeButtonText}>View Route Details</Text>

          <Ionicons
            name="chevron-forward"
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.notificationId}>
          Notification #{id}
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
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },

  statusBadgeText: {
    color: '#DC2626',
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
    backgroundColor: '#16A34A',
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

  flex: {
    flex: 1,
  },
});