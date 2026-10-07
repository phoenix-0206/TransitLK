import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface TripItem {
  id: string;
  routeNumber: string;
  serviceName: string;
  viaText?: string;
  badgeType?: 'selected' | 'fastest' | 'budget';
  badgeLabel?: string;
  fare: number;
  fareType: string;
  statusBadge?: string;
  departureTime: string;
  originName: string;
  arrivalTime: string;
  destinationName: string;
  durationText: string;
  routeTagRight?: string;
  routeTagRightType?: 'ac' | 'crowd' | 'normal';
  departsInText: string;
  seatsText: string;
  featureText: string;
  mode: 'bus' | 'expressway' | 'train';
}

interface TripCardProps {
  trip: TripItem;
  isSelected: boolean;
  onSelect: (trip: TripItem) => void;
}

export default function TripCard({ trip, isSelected, onSelect }: TripCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardContainer,
        isSelected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onSelect(trip)}
    >
      {/* Top Header Row with Route Badge, Service Name and Option Badge */}
      <View style={styles.topRow}>
        <View style={styles.routeHeaderLeft}>
          <View
            style={[
              styles.routeBadge,
              isSelected ? styles.routeBadgeSelected : styles.routeBadgeDefault,
            ]}
          >
            <Text
              style={[
                styles.routeBadgeText,
                isSelected ? styles.routeBadgeTextSelected : styles.routeBadgeTextDefault,
              ]}
            >
              {trip.routeNumber}
            </Text>
          </View>
          <View style={styles.serviceNameWrap}>
            <Text style={styles.serviceNameText}>{trip.serviceName}</Text>
            {trip.viaText ? (
              <Text style={styles.viaText}>{trip.viaText}</Text>
            ) : null}
          </View>
        </View>

        {/* Selected or Feature Badge */}
        {isSelected ? (
          <View style={styles.selectedOptionBadge}>
            <Text style={styles.selectedOptionBadgeText}>SELECTED OPTION</Text>
          </View>
        ) : trip.badgeLabel ? (
          <View
            style={[
              styles.tagBadge,
              trip.badgeType === 'fastest' && styles.fastestBadge,
              trip.badgeType === 'budget' && styles.budgetBadge,
            ]}
          >
            <Text
              style={[
                styles.tagBadgeText,
                trip.badgeType === 'fastest' && styles.fastestBadgeText,
                trip.badgeType === 'budget' && styles.budgetBadgeText,
              ]}
            >
              {trip.badgeLabel}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Fare and Status Badge Row */}
      <View style={styles.fareRow}>
        <View style={styles.fareLeftCol}>
          <Text style={styles.fareAmount}>
            LKR {trip.fare.toFixed(2)}
          </Text>
          <Text style={styles.fareType}>{trip.fareType}</Text>
        </View>

        {trip.statusBadge ? (
          <View style={styles.liveGpsBadge}>
            <Text style={styles.liveGpsBadgeText}>{trip.statusBadge}</Text>
          </View>
        ) : (
          <Text style={styles.durationTopText}>{trip.durationText}</Text>
        )}
      </View>

      {/* Schedule Box (Departure -> Arrival + Duration) */}
      <View style={styles.scheduleBox}>
        <View style={styles.scheduleTimelineRow}>
          <Text style={styles.scheduleTimeText}>{trip.departureTime}</Text>
          <Text style={styles.scheduleStationText}>{trip.originName}</Text>
          <Ionicons name="arrow-forward" size={13} color="#64748B" style={styles.scheduleArrow} />
          <Text style={styles.scheduleTimeText}>{trip.arrivalTime}</Text>
          <Text style={styles.scheduleStationText}>{trip.destinationName}</Text>
        </View>

        <View style={styles.scheduleRightBadge}>
          {trip.routeTagRight ? (
            <View
              style={[
                styles.smallRouteTag,
                trip.routeTagRightType === 'ac' && styles.acTag,
                trip.routeTagRightType === 'crowd' && styles.crowdTag,
              ]}
            >
              <Text
                style={[
                  styles.smallRouteTagText,
                  trip.routeTagRightType === 'ac' && styles.acTagText,
                  trip.routeTagRightType === 'crowd' && styles.crowdTagText,
                ]}
              >
                {trip.routeTagRight}
              </Text>
            </View>
          ) : (
            <Text style={styles.durationRightText}>{trip.durationText}</Text>
          )}
        </View>
      </View>

      {/* Footer Info Row with Departure in Xm, Seats, Crowding & Radio/Checkmark */}
      <View style={styles.footerRow}>
        <View style={styles.footerTags}>
          <Text
            style={[
              styles.footerText,
              isSelected && styles.footerTextHighlight,
            ]}
          >
            {trip.departsInText}
          </Text>
          <Text style={styles.footerDot}>•</Text>
          <Text style={styles.footerText}>{trip.seatsText}</Text>
          <Text style={styles.footerDot}>•</Text>
          <Text
            style={[
              styles.footerText,
              isSelected && styles.footerTextHighlight,
            ]}
          >
            {trip.featureText}
          </Text>
        </View>

        {/* Selection Indicator: Filled Checkmark or Outline Circle */}
        <View style={styles.selectIndicator}>
          {isSelected ? (
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </View>
          ) : (
            <View style={styles.unselectedRow}>
              <Text style={styles.selectLabel}>Select</Text>
              <View style={styles.uncheckCircle} />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#EDF2F7',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#002060',
    borderWidth: 2,
    shadowColor: '#002060',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.95,
  },

  // Top Row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  routeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  routeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 10,
  },
  routeBadgeSelected: {
    backgroundColor: '#002060',
  },
  routeBadgeDefault: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  routeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  routeBadgeTextSelected: {
    color: '#FFFFFF',
  },
  routeBadgeTextDefault: {
    color: '#2563EB',
  },
  serviceNameWrap: {
    flex: 1,
  },
  serviceNameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  viaText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },

  // Option Badges
  selectedOptionBadge: {
    backgroundColor: '#002060',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectedOptionBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  fastestBadge: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  fastestBadgeText: {
    color: '#9333EA',
  },
  budgetBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  budgetBadgeText: {
    color: '#B45309',
  },

  // Fare Row
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  fareLeftCol: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  fareAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',  },
  fareType: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: 'normal',
  },
  liveGpsBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveGpsBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
  },
  durationTopText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
  },

  // Schedule Box
  scheduleBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  scheduleTimelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    gap: 5,
  },
  scheduleTimeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  scheduleStationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
  },
  scheduleArrow: {
    marginHorizontal: 2,
  },
  scheduleRightBadge: {
    marginLeft: 6,
  },
  durationRightText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
  },
  smallRouteTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  smallRouteTagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  acTag: {
    backgroundColor: '#EFF6FF',
  },
  acTagText: {
    color: '#2563EB',
  },
  crowdTag: {
    backgroundColor: '#FFF7ED',
  },
  crowdTagText: {
    color: '#EA580C',
  },

  // Footer Row
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  footerTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    gap: 4,
  },
  footerText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: 'normal',
  },
  footerTextHighlight: {
    color: '#059669',
    fontWeight: 'bold',
  },
  footerDot: {
    color: '#CBD5E1',
    fontSize: 10,
  },
  selectIndicator: {
    marginLeft: 8,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#002060',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  selectLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: 'normal',
  },
  uncheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
});
