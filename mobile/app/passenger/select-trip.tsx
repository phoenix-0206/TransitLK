import React, { useState, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import TripCard, { TripItem } from '@/components/passenger/TripCard';
import BottomNavigation from '@/components/BottomNavigation';
import PassengerHomeHeader from '@/components/passenger/PassengerHomeHeader';

export default function SelectTripScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    origin?: string;
    originProvince?: string;
    destination?: string;
    destinationTag?: string;
    routeNumber?: string;
    travelDate?: string;
    departureTime?: string;
    transportMode?: string;
  }>();

  // Route parameters with fallbacks matching Figma
  const origin = params.origin || 'Colombo Fort';
  const destination = params.destination || 'Maharagama';
  const travelDate = params.travelDate || '24 Oct 2026';
  const departureTime = params.departureTime || '14:30';

  // Mode filter chip
  const [selectedModeFilter, setSelectedModeFilter] = useState<'all' | 'bus' | 'highway'>('bus');

  // Pre-configured trips based on route (Colombo Fort -> Maharagama matching Figma)
  const allTrips: TripItem[] = useMemo(() => [
    {
      id: 'trip-138-semi',
      routeNumber: '138',
      serviceName: 'SLTB Semi-Luxury',
      badgeType: 'selected',
      fare: 70.0,
      fareType: 'Standard Fare',
      statusBadge: 'On Time Live GPS',
      departureTime: departureTime,
      originName: origin,
      arrivalTime: '15:18',
      destinationName: destination,
      durationText: '48 mins',
      departsInText: 'Departs in 4m',
      seatsText: '14 seats available',
      featureText: 'Low Crowding',
      mode: 'bus',
    },
    {
      id: 'trip-138-1-highway',
      routeNumber: '138/1',
      serviceName: 'Highway Express AC',
      badgeType: 'fastest',
      badgeLabel: 'Fastest Option',
      fare: 100.0,
      fareType: 'Express Fare',
      departureTime: '14:55',
      originName: 'Fort',
      arrivalTime: '15:38',
      destinationName: destination,
      durationText: '43 mins',
      routeTagRight: 'AC',
      routeTagRightType: 'ac',
      departsInText: 'Next in 25m',
      seatsText: 'Air Conditioned',
      featureText: '8 seats open',
      mode: 'expressway',
    },
    {
      id: 'trip-122-budget',
      routeNumber: '122',
      serviceName: 'Pettah – Avissawella',
      viaText: `Via ${destination} Junction`,
      badgeType: 'budget',
      badgeLabel: 'Budget Fare',
      fare: 50.0,
      fareType: 'Normal Fare',
      departureTime: '15:10',
      originName: 'Fort',
      arrivalTime: '16:02',
      destinationName: destination,
      durationText: '52 mins',
      routeTagRight: 'High Crowding',
      routeTagRightType: 'crowd',
      departsInText: 'Next in 40m',
      seatsText: 'Normal Service',
      featureText: 'Standing available',
      mode: 'bus',
    },
    {
      id: 'trip-ex-express',
      routeNumber: 'EX 1-1',
      serviceName: 'Southern Highway Express',
      badgeType: 'fastest',
      badgeLabel: 'Super Luxury',
      fare: 150.0,
      fareType: 'Super Luxury',
      departureTime: '15:30',
      originName: origin,
      arrivalTime: '16:10',
      destinationName: destination,
      durationText: '40 mins',
      routeTagRight: 'Express',
      routeTagRightType: 'ac',
      departsInText: 'Next in 1h',
      seatsText: '22 seats open',
      featureText: 'Expressway Direct',
      mode: 'expressway',
    },
  ], [origin, destination, departureTime]);

  // Selected trip state
  const [selectedTrip, setSelectedTrip] = useState<TripItem>(allTrips[0]);

  // Filter trips by active mode chip
  const filteredTrips = useMemo(() => {
    if (selectedModeFilter === 'all') return allTrips;
    if (selectedModeFilter === 'bus') return allTrips.filter((t) => t.mode === 'bus' || t.mode === 'expressway');
    if (selectedModeFilter === 'highway') return allTrips.filter((t) => t.mode === 'expressway');
    return allTrips;
  }, [selectedModeFilter, allTrips]);

  // Handle proceed to next step (Ticket Details)
  const handleContinueToTicketDetails = () => {
    router.push({
      pathname: '/passenger/ticket-details' as any,
      params: {
        tripId: selectedTrip.id,
        routeNumber: selectedTrip.routeNumber,
        serviceName: selectedTrip.serviceName,
        fare: String(selectedTrip.fare),
        originName: selectedTrip.originName,
        destinationName: selectedTrip.destinationName,
        departureTime: selectedTrip.departureTime,
        arrivalTime: selectedTrip.arrivalTime,
        durationText: selectedTrip.durationText,
        travelDate,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <PassengerHomeHeader subtitle="Select Trip" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Progress Stepper Row */}
        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text style={styles.screenTitle}>Select Trip</Text>
            <Text style={styles.screenSubtitle}>Pick preferred bus schedule & service class</Text>
          </View>

          {/* Stepper Progress Bar (Step 2 of 5) */}
          <View style={styles.stepperPill}>
            <View style={styles.stepDotCompleted} />
            <View style={styles.stepBarActive} />
            <View style={styles.stepDotInactive} />
            <View style={styles.stepDotInactive} />
            <View style={styles.stepDotInactive} />
          </View>
        </View>

        {/* Route Summary Card with Edit Link */}
        <View style={styles.routeSummaryCard}>
          <View style={styles.routeSummaryIcon}>
            <Ionicons name="location-sharp" size={18} color="#2563EB" />
          </View>

          <View style={styles.routeSummaryContent}>
            <View style={styles.routePlacesRow}>
              <Text style={styles.routeOriginText}>{origin}</Text>
              <Ionicons name="arrow-forward" size={14} color="#64748B" style={styles.routeSummaryArrow} />
              <Text style={styles.routeDestText}>{destination}</Text>
            </View>
            <Text style={styles.routeDateText}>
              Today, {travelDate} • Departure from {departureTime}
            </Text>
          </View>

          <Pressable
            style={styles.editButton}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        </View>

        {/* Mode Filter Chips */}
        <View style={styles.chipsRow}>
          <Pressable
            style={[
              styles.chipItem,
              selectedModeFilter === 'all' && styles.chipItemActive,
            ]}
            onPress={() => setSelectedModeFilter('all')}
          >
            <Text
              style={[
                styles.chipText,
                selectedModeFilter === 'all' && styles.chipTextActive,
              ]}
            >
              All Modes
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.chipItem,
              selectedModeFilter === 'bus' && styles.chipItemActive,
            ]}
            onPress={() => setSelectedModeFilter('bus')}
          >
            <Ionicons
              name="bus"
              size={14}
              color={selectedModeFilter === 'bus' ? '#FFFFFF' : '#1E293B'}
              style={styles.chipIcon}
            />
            <Text
              style={[
                styles.chipText,
                selectedModeFilter === 'bus' && styles.chipTextActive,
              ]}
            >
              Bus
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.chipItem,
              selectedModeFilter === 'highway' && styles.chipItemActive,
            ]}
            onPress={() => setSelectedModeFilter('highway')}
          >
            <Text
              style={[
                styles.chipText,
                selectedModeFilter === 'highway' && styles.chipTextActive,
              ]}
            >
              Highway Express
            </Text>
          </Pressable>
        </View>

        {/* Results Counter & Live Sync Badge */}
        <View style={styles.resultsCounterRow}>
          <Text style={styles.availableCounterText}>
            {filteredTrips.length} available buses
          </Text>

          <View style={styles.liveSyncBadge}>
            <View style={styles.liveSyncDot} />
            <Text style={styles.liveSyncText}>Live GPS Synced</Text>
          </View>
        </View>

        {/* Trips List */}
        <View style={styles.tripListContainer}>
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              isSelected={selectedTrip.id === trip.id}
              onSelect={(t) => setSelectedTrip(t)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Bottom Selection Bar & Primary CTA Button */}
      <View style={styles.bottomBarContainer}>
        {/* Selection summary row */}
        <View style={styles.bottomSummaryRow}>
          <View style={styles.bottomSummaryLeft}>
            <View style={styles.bottomActiveDot} />
            <Text style={styles.bottomSelectedLabel}>
              Selected: <Text style={styles.bottomSelectedBold}>Bus {selectedTrip.routeNumber} ({selectedTrip.departureTime})</Text>
            </Text>
          </View>
          <Text style={styles.bottomFareAmount}>
            LKR {selectedTrip.fare.toFixed(2)}
          </Text>
        </View>

        {/* Continue Button */}
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.continueButtonPressed,
          ]}
          onPress={handleContinueToTicketDetails}
        >
          <Text style={styles.continueButtonText}>Continue to Ticket Details</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Bottom Navigation Tabs */}
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
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  pressedState: {
    backgroundColor: '#F1F5F9',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#002060',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextWrap: {
    marginLeft: 8,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#8E9CAE',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  langText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  langIcon: {
    marginLeft: 4,
  },
  avatarBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#3730A3',
  },

  // Title Section & Stepper
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  titleLeft: {
    flex: 1,
    marginRight: 12,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  screenSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: 'normal',
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  stepDotCompleted: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  stepBarActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#002060',
  },
  stepDotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },

  // Route Summary Card
  routeSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  routeSummaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  routeSummaryContent: {
    flex: 1,
  },
  routePlacesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  routeOriginText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  routeSummaryArrow: {
    marginHorizontal: 6,
  },
  routeDestText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  routeDateText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: 'normal',
    marginTop: 3,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563EB',
  },

  // Chips Row
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  chipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  chipItemActive: {
    backgroundColor: '#002060',
    borderColor: '#002060',
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // Results Counter & Live Sync
  resultsCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  availableCounterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  liveSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  liveSyncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveSyncText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
  },

  // Trip List Container
  tripListContainer: {
    marginBottom: 8,
  },

  // Bottom Floating Bar
  bottomBarContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bottomSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomActiveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  bottomSelectedLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: 'normal',
  },
  bottomSelectedBold: {
    fontWeight: 'bold',
    color: '#002060',
  },
  bottomFareAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#002060',
  },
  continueButton: {
    backgroundColor: '#002060',
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#002060',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonPressed: {
    backgroundColor: '#1C2766',
    transform: [{ scale: 0.99 }],
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
