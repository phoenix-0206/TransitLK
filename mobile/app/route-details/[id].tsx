import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../../services/supabase';
const stops = [
  {
    name: 'Pettah',
    time: 'Departed',
    status: 'completed',
  },
  {
    name: 'Town Hall',
    time: 'Departed',
    status: 'completed',
  },
  {
    name: 'Nugegoda',
    time: 'Current location',
    status: 'current',
  },
  {
    name: 'Maharagama',
    time: '10 min',
    status: 'upcoming',
  },
  {
    name: 'Homagama',
    time: '25 min',
    status: 'upcoming',
  },
];

export default function RouteDetailsScreen() {
const router = useRouter();
const { id } = useLocalSearchParams();

const routeNumber = Array.isArray(id) ? id[0] : id || '138';

const [userId, setUserId] = useState<string | null>(null);
const [savedRouteId, setSavedRouteId] = useState<string | null>(null);
const [saving, setSaving] = useState(false);

useEffect(() => {
  const loadSavedRoute = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('ROUTE DETAILS USER: NO USER');
      return;
    }

    setUserId(user.id);

    const { data, error } = await supabase
      .from('saved_routes')
      .select('id')
      .eq('user_id', user.id)
      .eq('route_number', routeNumber)
      .maybeSingle();

    if (error) {
      console.log('SAVED ROUTE READ ERROR:', error);
      return;
    }

    setSavedRouteId(data?.id ?? null);
  };

  loadSavedRoute();
}, [routeNumber]);

const handleSaveRoute = async () => {
  if (!userId || saving) {
    return;
  }

  setSaving(true);

  try {
    if (savedRouteId) {
      const { error } = await supabase
        .from('saved_routes')
        .delete()
        .eq('id', savedRouteId)
        .eq('user_id', userId);

      if (error) {
        console.log('REMOVE ROUTE ERROR:', error);
        return;
      }

      setSavedRouteId(null);
      console.log('ROUTE REMOVED SUCCESSFULLY');
    } else {
      const { data, error } = await supabase
        .from('saved_routes')
        .insert({
          user_id: userId,
          route_number: routeNumber,
          origin: 'Pettah',
          destination: 'Homagama',
        })
        .select('id')
        .single();

      if (error) {
        console.log('SAVE ROUTE ERROR:', error);
        return;
      }

      setSavedRouteId(data.id);
      console.log('ROUTE SAVED SUCCESSFULLY');
    }
  } finally {
    setSaving(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Route Details</Text>
          <Text style={styles.headerSubtitle}>Bus {id || '138'}</Text>
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
        {/* Main route card */}
        <View style={styles.routeCard}>
          <View style={styles.routeTop}>
            <View>
              <Text style={styles.routeLabel}>BUS ROUTE</Text>
              <Text style={styles.routeNumber}>{id || '138'}</Text>
            </View>

            <View style={styles.busIcon}>
              <Ionicons name="bus" size={29} color="#2563EB" />
            </View>
          </View>

          <View style={styles.locationRow}>
            <View style={styles.locationDot} />

            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>From</Text>
              <Text style={styles.locationName}>Pettah</Text>
            </View>
          </View>

          <View style={styles.locationLine} />

          <View style={styles.locationRow}>
            <View style={styles.destinationDot} />

            <View style={styles.locationTextContainer}>
              <Text style={styles.locationLabel}>To</Text>
              <Text style={styles.locationName}>Homagama</Text>
            </View>
          </View>
        </View>

        {/* Information cards */}
        <View style={styles.quickInfoRow}>
          <View style={styles.quickInfoCard}>
            <View style={styles.quickIconBlue}>
              <Ionicons name="time-outline" size={21} color="#2563EB" />
            </View>

            <Text style={styles.quickLabel}>Arrival</Text>
            <Text style={styles.quickValue}>25 min</Text>
          </View>

          <TouchableOpacity
            style={styles.quickInfoCard}
            activeOpacity={0.8}
            onPress={() =>
  router.push({
    pathname: '/crowding',
  })
}
          >
            <View style={styles.quickIconOrange}>
              <Ionicons name="people-outline" size={21} color="#D97706" />
            </View>

            <Text style={styles.quickLabel}>Crowding</Text>
            <Text style={styles.crowdingValue}>Medium</Text>
          </TouchableOpacity>
        </View>

        {/* Route progress */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ROUTE PROGRESS</Text>

          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.timelineCard}>
          {stops.map((stop, index) => {
            const isCompleted = stop.status === 'completed';
            const isCurrent = stop.status === 'current';

            return (
              <View key={stop.name} style={styles.stopRow}>
                <View style={styles.timelineColumn}>
                  <View
                    style={[
                      styles.stopCircle,
                      isCompleted && styles.completedCircle,
                      isCurrent && styles.currentCircle,
                    ]}
                  >
                    {isCompleted && (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color="#FFFFFF"
                      />
                    )}

                    {isCurrent && <View style={styles.currentInnerDot} />}
                  </View>

                  {index !== stops.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        isCompleted && styles.completedLine,
                      ]}
                    />
                  )}
                </View>

                <View style={styles.stopInformation}>
                  <View style={styles.stopTop}>
                    <Text
                      style={[
                        styles.stopName,
                        isCurrent && styles.currentStopName,
                      ]}
                    >
                      {stop.name}
                    </Text>

                    <Text
                      style={[
                        styles.stopTime,
                        isCurrent && styles.currentStopTime,
                      ]}
                    >
                      {stop.time}
                    </Text>
                  </View>

                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Ionicons
                        name="navigate"
                        size={12}
                        color="#2563EB"
                      />
                      <Text style={styles.currentBadgeText}>
                        Bus is currently near this stop
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Service information */}
        <Text style={styles.sectionTitle}>SERVICE INFORMATION</Text>

        <View style={styles.serviceCard}>
          <View style={styles.serviceRow}>
            <View style={styles.serviceIcon}>
              <Ionicons
                name="speedometer-outline"
                size={21}
                color="#2563EB"
              />
            </View>

            <View style={styles.serviceText}>
              <Text style={styles.serviceLabel}>Service Status</Text>
              <Text style={styles.serviceValue}>Running with delay</Text>
            </View>

            <View style={styles.delayBadge}>
              <Text style={styles.delayBadgeText}>+10 min</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.serviceRow}>
            <View style={styles.serviceIcon}>
              <Ionicons
                name="people-outline"
                size={21}
                color="#D97706"
              />
            </View>

            <View style={styles.serviceText}>
              <Text style={styles.serviceLabel}>Passenger Capacity</Text>
              <Text style={styles.serviceValue}>Medium crowding</Text>
            </View>

            <TouchableOpacity onPress={() =>
  router.push({
    pathname: '/crowding',
  })
}>
              <Ionicons
                name="chevron-forward"
                size={21}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save route */}
        <TouchableOpacity
  style={styles.saveButton}
  activeOpacity={0.85}
  onPress={handleSaveRoute}
  disabled={saving || !userId}
>
  <Ionicons
    name={savedRouteId ? 'bookmark' : 'bookmark-outline'}
    size={20}
    color="#FFFFFF"
  />

  <Text style={styles.saveButtonText}>
    {saving
      ? 'Please wait...'
      : savedRouteId
        ? 'Remove Saved Route'
        : 'Save Route'}
  </Text>
</TouchableOpacity>

        <Text style={styles.disclaimer}>
          Arrival times and route information may change due to traffic and
          service conditions.
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

  headerText: {
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
    paddingBottom: 45,
  },

  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 15,
  },

  routeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  routeLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.7,
  },

  routeNumber: {
    fontSize: 34,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },

  busIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#2563EB',
    marginRight: 13,
  },

  destinationDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#16A34A',
    marginRight: 13,
  },

  locationLine: {
    width: 2,
    height: 25,
    backgroundColor: '#D1D5DB',
    marginLeft: 5.5,
  },

  locationTextContainer: {
    flex: 1,
  },

  locationLabel: {
    fontSize: 11,
    color: '#6B7280',
  },

  locationName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 1,
  },

  quickInfoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },

  quickInfoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  quickIconBlue: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  quickIconOrange: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  quickLabel: {
    fontSize: 11,
    color: '#6B7280',
  },

  quickValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },

  crowdingValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#D97706',
    marginTop: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 5,
  },

  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },

  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 25,
  },

  stopRow: {
    flexDirection: 'row',
    minHeight: 72,
  },

  timelineColumn: {
    width: 26,
    alignItems: 'center',
  },

  stopCircle: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  completedCircle: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  currentCircle: {
    width: 19,
    height: 19,
    borderRadius: 10,
    borderColor: '#2563EB',
    backgroundColor: '#DBEAFE',
  },

  currentInnerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },

  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 3,
  },

  completedLine: {
    backgroundColor: '#2563EB',
  },

  stopInformation: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 18,
  },

  stopTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  stopName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },

  currentStopName: {
    color: '#2563EB',
  },

  stopTime: {
    fontSize: 12,
    color: '#6B7280',
  },

  currentStopTime: {
    color: '#2563EB',
    fontWeight: '700',
  },

  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 7,
  },

  currentBadgeText: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
    marginLeft: 5,
  },

  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },

  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  serviceText: {
    flex: 1,
  },

  serviceLabel: {
    fontSize: 11,
    color: '#6B7280',
  },

  serviceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },

  delayBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  delayBadgeText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },

  saveButton: {
    height: 55,
    borderRadius: 17,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },

  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
});