import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import BottomNavigation from '@/components/BottomNavigation';
import { RecentSearchItem, TransportMode } from '@/types/passenger';

// Popular transit hubs in Sri Lanka for quick autocomplete/selection
const POPULAR_LOCATIONS = [
  { name: 'Colombo Fort', province: 'Western Province', tag: 'Central Terminal', route: 'All' },
  { name: 'Pettah', province: 'Western Province', tag: 'Bastian Mawatha', route: 'All' },
  { name: 'Maharagama', province: 'Western Province', tag: 'High-Level Rd', route: '138' },
  { name: 'Kandy', province: 'Central Province', tag: 'Goodshed Terminal', route: '01' },
  { name: 'Kurunegala', province: 'North Western Province', tag: 'Central Stand', route: '05' },
  { name: 'Galle', province: 'Southern Province', tag: 'Southern Expressway', route: 'EX 1-1' },
  { name: 'Negombo', province: 'Western Province', tag: 'Colombo - Negombo Rd', route: '240' },
  { name: 'Matara', province: 'Southern Province', tag: 'Expressway Interchange', route: 'EX 1-2' },
  { name: 'Kadawatha', province: 'Western Province', tag: 'Kandy Road', route: '200' },
  { name: 'Gampaha', province: 'Western Province', tag: 'Main Street', route: '201' },
  { name: 'Anuradhapura', province: 'North Central Province', tag: 'Old Bus Stand', route: '57' },
  { name: 'Jaffna', province: 'Northern Province', tag: 'Central Station', route: 'A9' },
];

export default function SearchRouteScreen() {
  const router = useRouter();

  // Route selection states
  const [origin, setOrigin] = useState('Colombo Fort');
  const [originProvince, setOriginProvince] = useState('Western Province');

  const [destination, setDestination] = useState('Maharagama');
  const [destinationTag, setDestinationTag] = useState('High-Level Rd');
  const [routeNumber, setRouteNumber] = useState('138');

  // Date and Time states
  const [travelDate, setTravelDate] = useState('24 Oct 2026');
  const [departureTime, setDepartureTime] = useState('14:30');

  // Transport mode selection
  const [transportMode, setTransportMode] = useState<TransportMode>('bus');

  // Modal selectors
  const [pickerType, setPickerType] = useState<'origin' | 'destination' | null>(null);
  const [searchFilterText, setSearchFilterText] = useState('');
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [preferencesModalVisible, setPreferencesModalVisible] = useState(false);

  // Preference filters
  const [acOnly, setAcOnly] = useState(false);
  const [directOnly, setDirectOnly] = useState(true);

  // Recent searches list
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([
    {
      id: 'rec-1',
      origin: 'Pettah',
      destination: 'Kandy',
      routeTag: 'AC-01',
      subText: 'Tomorrow â€¢ 07:00 â€¢ Bus (Intercity AC)',
      dateStr: '25 Oct 2026',
      timeStr: '07:00',
      mode: 'bus',
    },
    {
      id: 'rec-2',
      origin: 'Kurunegala',
      destination: 'Colombo Fort',
      subText: '18 Oct â€¢ Route 05 Semi-Luxury',
      dateStr: '18 Oct 2026',
      timeStr: '06:30',
      mode: 'bus',
    },
  ]);

  // Handle swap origin and destination
  const handleSwapStops = () => {
    const tempOrigin = origin;
    const tempOriginProvince = originProvince;

    setOrigin(destination);
    setOriginProvince(destinationTag);

    setDestination(tempOrigin);
    setDestinationTag(tempOriginProvince);
  };

  // Set departure time to current local time
  const handleSetTimeToNow = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setDepartureTime(`${hours}:${minutes}`);
  };

  // Clear recent searches
  const handleClearRecent = () => {
    Alert.alert(
      'Clear Recent Searches',
      'Are you sure you want to remove your recent search history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setRecentSearches([]),
        },
      ]
    );
  };

  // Apply a recent search item
  const handleApplyRecent = (item: RecentSearchItem) => {
    setOrigin(item.origin);
    setDestination(item.destination);
    setTravelDate(item.dateStr || '24 Oct 2026');
    setDepartureTime(item.timeStr || '14:30');
    if (item.mode) setTransportMode(item.mode);
  };

  // Handle search action
  const handleSearchRoutes = () => {
    if (!origin.trim()) {
      Alert.alert('Required Field', 'Please select or enter an origin location.');
      return;
    }
    if (!destination.trim()) {
      Alert.alert('Required Field', 'Please select or enter a destination.');
      return;
    }
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      Alert.alert('Invalid Selection', 'Origin and Destination cannot be the same.');
      return;
    }

    // Navigate to Select Trip screen (the next step in the flow)
    router.push({
      pathname: '/passenger/select-trip' as any,
      params: {
        origin,
        originProvince,
        destination,
        destinationTag,
        routeNumber,
        travelDate,
        departureTime,
        transportMode,
        acOnly: acOnly ? 'true' : 'false',
        directOnly: directOnly ? 'true' : 'false',
      },
    });
  };

  // Filtered locations for modal picker
  const filteredLocations = POPULAR_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(searchFilterText.toLowerCase()) ||
    loc.province.toLowerCase().includes(searchFilterText.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Bar (matches Home) */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Ionicons name="bus" size={18} color="#FFF" />
            </View>
            <View>
              <Text style={styles.brandTitle}>TransitLK</Text>
              <Text style={styles.brandSub}>Search</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <View style={styles.langPill}>
              <Text style={styles.langTextActive}>EN</Text>
              <Text style={styles.langText}>à·ƒà·’</Text>
            </View>

            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => router.push('/modal')}
            >
              <Ionicons name="notifications-outline" size={18} color="#002060" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileCircle}
              onPress={() => router.push('/profile')}
            >
              <Ionicons name="person" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Page Title & Filter Row */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Search / Select Route</Text>

          <Pressable
            style={({ pressed }) => [styles.filterIconButton, pressed && styles.pressedState]}
            onPress={() => setPreferencesModalVisible(true)}
            accessibilityLabel="Filter preferences"
          >
            <Feather name="sliders" size={18} color="#1E293B" />
          </Pressable>
        </View>

        {/* Combined Origin & Destination Card */}
        <View style={styles.routeCardContainer}>
          {/* FROM (ORIGIN) SECTION */}
          <Pressable
            style={styles.stopInputCard}
            onPress={() => {
              setSearchFilterText('');
              setPickerType('origin');
            }}
          >
            <View style={styles.stopHeaderRow}>
              <View style={styles.dotLabelRow}>
                <View style={styles.blueDot} />
                <Text style={styles.stopLabelText}>FROM (ORIGIN)</Text>
              </View>
              {originProvince ? (
                <View style={styles.originTagBadge}>
                  <Text style={styles.originTagText}>{originProvince}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.stopValueRow}>
              <View style={styles.originIconSquare}>
                <Ionicons name="location-sharp" size={18} color="#2563EB" />
              </View>
              <Text
                style={[
                  styles.stopValueText,
                  !origin && styles.placeholderText,
                ]}
                numberOfLines={1}
              >
                {origin || 'Select departure station'}
              </Text>
              {origin ? (
                <Pressable
                  hitSlop={10}
                  onPress={() => setOrigin('')}
                  style={styles.clearIconPressable}
                >
                  <Ionicons name="close" size={18} color="#94A3B8" />
                </Pressable>
              ) : null}
            </View>
          </Pressable>

          {/* Floating Swap Button */}
          <View style={styles.swapButtonWrapper}>
            <Pressable
              style={({ pressed }) => [
                styles.swapButton,
                pressed && styles.swapButtonPressed,
              ]}
              onPress={handleSwapStops}
              accessibilityLabel="Swap origin and destination"
            >
              <MaterialCommunityIcons name="swap-vertical" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* TO (DESTINATION) SECTION */}
          <Pressable
            style={styles.stopInputCard}
            onPress={() => {
              setSearchFilterText('');
              setPickerType('destination');
            }}
          >
            <View style={styles.stopHeaderRow}>
              <View style={styles.dotLabelRow}>
                <View style={styles.greenDot} />
                <Text style={styles.stopLabelText}>TO (DESTINATION)</Text>
              </View>
              {destinationTag ? (
                <View style={styles.destTagBadge}>
                  <Text style={styles.destTagText}>{destinationTag}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.stopValueRow}>
              <View style={styles.destIconSquare}>
                <MaterialCommunityIcons name="steering" size={18} color="#10B981" />
              </View>
              <Text
                style={[
                  styles.stopValueText,
                  !destination && styles.placeholderText,
                ]}
                numberOfLines={1}
              >
                {destination || 'Select arrival station'}
              </Text>
              {routeNumber ? (
                <View style={styles.routeBadge}>
                  <Text style={styles.routeBadgeText}>{routeNumber}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        </View>

        {/* Travel Date & Departure Time Row */}
        <View style={styles.dateTimeRow}>
          {/* Travel Date Card */}
          <Pressable
            style={styles.dateTimeCard}
            onPress={() => setDateModalVisible(true)}
          >
            <Text style={styles.dateTimeLabel}>TRAVEL DATE</Text>
            <View style={styles.dateTimeValueRow}>
              <Ionicons name="calendar-outline" size={18} color="#1E2B6D" />
              <Text style={styles.dateTimeValueText}>{travelDate}</Text>
            </View>
          </Pressable>

          {/* Departure Time Card */}
          <Pressable
            style={styles.dateTimeCard}
            onPress={() => setTimeModalVisible(true)}
          >
            <Text style={styles.dateTimeLabel}>DEPARTURE</Text>
            <View style={styles.dateTimeValueRow}>
              <Ionicons name="time-outline" size={18} color="#1E2B6D" />
              <Text style={styles.dateTimeValueText}>{departureTime}</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.nowBadge,
                  pressed && styles.nowBadgePressed,
                ]}
                onPress={handleSetTimeToNow}
                hitSlop={6}
              >
                <Text style={styles.nowBadgeText}>NOW</Text>
              </Pressable>
            </View>
          </Pressable>
        </View>

        {/* Transport Mode Toggle Segmented Bar */}
        <View style={styles.modeToggleContainer}>
          <Pressable
            style={[
              styles.modeSegment,
              transportMode === 'bus' && styles.modeSegmentActive,
            ]}
            onPress={() => setTransportMode('bus')}
          >
            {transportMode === 'bus' && <View style={styles.modeActiveDot} />}
            <Ionicons
              name="bus"
              size={17}
              color={transportMode === 'bus' ? '#1E2B6D' : '#64748B'}
            />
            <Text
              style={[
                styles.modeSegmentText,
                transportMode === 'bus' && styles.modeSegmentTextActive,
              ]}
            >
              Bus Network Only
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.modeSegment,
              transportMode === 'expressway' && styles.modeSegmentActive,
            ]}
            onPress={() => setTransportMode('expressway')}
          >
            <Ionicons
              name="flash-outline"
              size={17}
              color={transportMode === 'expressway' ? '#1E2B6D' : '#64748B'}
            />
            <Text
              style={[
                styles.modeSegmentText,
                transportMode === 'expressway' && styles.modeSegmentTextActive,
              ]}
            >
              Expressway
            </Text>
          </Pressable>
        </View>

        {/* Main CTA: Search Routes */}
        <Pressable
          style={({ pressed }) => [
            styles.searchButton,
            pressed && styles.searchButtonPressed,
          ]}
          onPress={handleSearchRoutes}
        >
          <Text style={styles.searchButtonText}>Search Routes</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>

        {/* Recent Searches Section */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <View style={styles.recentHeaderLeft}>
              <Ionicons name="time-outline" size={16} color="#64748B" />
              <Text style={styles.recentHeaderTitle}>RECENT SEARCHES</Text>
            </View>
            {recentSearches.length > 0 && (
              <Pressable onPress={handleClearRecent}>
                <Text style={styles.clearRecentText}>Clear</Text>
              </Pressable>
            )}
          </View>

          {recentSearches.length === 0 ? (
            <View style={styles.emptyRecentCard}>
              <Text style={styles.emptyRecentText}>No recent searches</Text>
            </View>
          ) : (
            recentSearches.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.recentCard,
                  pressed && styles.recentCardPressed,
                ]}
                onPress={() => handleApplyRecent(item)}
              >
                <View style={styles.recentCardTopRow}>
                  <View style={styles.recentRouteNameRow}>
                    <Text style={styles.recentPlaceName}>{item.origin}</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color="#3B82F6"
                      style={styles.recentArrowIcon}
                    />
                    <Text style={styles.recentPlaceName}>{item.destination}</Text>
                    {item.routeTag ? (
                      <View style={styles.recentTagBadge}>
                        <Text style={styles.recentTagText}>{item.routeTag}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.chevronCircle}>
                    <Ionicons name="chevron-forward" size={16} color="#64748B" />
                  </View>
                </View>

                <Text style={styles.recentSubText}>{item.subText}</Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      {/* Interactive Location Picker Modal */}
      <Modal
        visible={pickerType !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPickerType(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.locationModalSheet}>
            <View style={styles.modalDragHandle} />

            <View style={styles.modalHeaderRow}>
              <Text style={styles.locationModalTitle}>
                {pickerType === 'origin' ? 'Select Origin Station' : 'Select Destination'}
              </Text>
              <Pressable onPress={() => setPickerType(null)} hitSlop={10}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </Pressable>
            </View>

            {/* Search Input Bar */}
            <View style={styles.locationSearchInputRow}>
              <Ionicons name="search" size={18} color="#64748B" />
              <TextInput
                style={styles.locationSearchInput}
                placeholder="Search city, station, or route..."
                placeholderTextColor="#94A3B8"
                value={searchFilterText}
                onChangeText={setSearchFilterText}
                autoFocus={true}
              />
              {searchFilterText.length > 0 && (
                <Pressable onPress={() => setSearchFilterText('')}>
                  <Ionicons name="close" size={16} color="#94A3B8" />
                </Pressable>
              )}
            </View>

            {/* List of Locations */}
            <FlatList
              data={filteredLocations}
              keyExtractor={(item) => item.name}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.locationListItem,
                    pressed && styles.locationListItemPressed,
                  ]}
                  onPress={() => {
                    if (pickerType === 'origin') {
                      setOrigin(item.name);
                      setOriginProvince(item.province);
                    } else {
                      setDestination(item.name);
                      setDestinationTag(item.tag);
                      setRouteNumber(item.route !== 'All' ? item.route : '138');
                    }
                    setPickerType(null);
                  }}
                >
                  <View style={styles.locationListIconWrap}>
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={pickerType === 'origin' ? '#2563EB' : '#10B981'}
                    />
                  </View>
                  <View style={styles.locationListTextCol}>
                    <Text style={styles.locationListName}>{item.name}</Text>
                    <Text style={styles.locationListSubtitle}>
                      {item.province} â€¢ {item.tag}
                    </Text>
                  </View>
                  {item.route !== 'All' && (
                    <View style={styles.locationRouteBadge}>
                      <Text style={styles.locationRouteBadgeText}>{item.route}</Text>
                    </View>
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={dateModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDateModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setDateModalVisible(false)}
        >
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerModalTitle}>Select Travel Date</Text>
            {['24 Oct 2026 (Today)', '25 Oct 2026 (Tomorrow)', '26 Oct 2026', '27 Oct 2026', '28 Oct 2026'].map(
              (d) => {
                const cleanDate = d.split(' (')[0];
                return (
                  <Pressable
                    key={d}
                    style={[
                      styles.pickerOption,
                      travelDate === cleanDate && styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      setTravelDate(cleanDate);
                      setDateModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        travelDate === cleanDate && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {d}
                    </Text>
                    {travelDate === cleanDate && (
                      <Ionicons name="checkmark" size={18} color="#1E2B6D" />
                    )}
                  </Pressable>
                );
              }
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={timeModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setTimeModalVisible(false)}
        >
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerModalTitle}>Select Departure Time</Text>
            {['Now', '06:30', '08:00', '10:30', '12:00', '14:30', '16:00', '18:30', '20:00'].map(
              (t) => {
                const isNow = t === 'Now';
                return (
                  <Pressable
                    key={t}
                    style={[
                      styles.pickerOption,
                      (departureTime === t || (isNow && departureTime === 'Now')) &&
                        styles.pickerOptionSelected,
                    ]}
                    onPress={() => {
                      if (isNow) {
                        handleSetTimeToNow();
                      } else {
                        setDepartureTime(t);
                      }
                      setTimeModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        (departureTime === t || (isNow && departureTime === 'Now')) &&
                          styles.pickerOptionTextSelected,
                      ]}
                    >
                      {t}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Filter Preferences Modal */}
      <Modal
        visible={preferencesModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPreferencesModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setPreferencesModalVisible(false)}
        >
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerModalTitle}>Search Filters & Options</Text>

            <Pressable
              style={styles.preferenceRow}
              onPress={() => setAcOnly(!acOnly)}
            >
              <View>
                <Text style={styles.prefHeading}>Air Conditioned (AC) Only</Text>
                <Text style={styles.prefSub}>Show luxury & highway express buses</Text>
              </View>
              <Ionicons
                name={acOnly ? 'checkbox' : 'square-outline'}
                size={22}
                color={acOnly ? '#2563EB' : '#94A3B8'}
              />
            </Pressable>

            <Pressable
              style={styles.preferenceRow}
              onPress={() => setDirectOnly(!directOnly)}
            >
              <View>
                <Text style={styles.prefHeading}>Direct Routes Only</Text>
                <Text style={styles.prefSub}>Avoid transit transfer connections</Text>
              </View>
              <Ionicons
                name={directOnly ? 'checkbox' : 'square-outline'}
                size={22}
                color={directOnly ? '#2563EB' : '#94A3B8'}
              />
            </Pressable>

            <Pressable
              style={styles.doneFilterButton}
              onPress={() => setPreferencesModalVisible(false)}
            >
              <Text style={styles.doneFilterButtonText}>Apply Filters</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Bottom Navigation (same as Home) */}
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
    padding: 16,
    paddingBottom: 40,
  },

  // Header (matches Home)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    backgroundColor: '#002060',
    padding: 6,
    borderRadius: 8,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002060',
  },
  brandSub: {
    fontSize: 10,
    color: '#64748B',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    flexDirection: 'row',
    backgroundColor: '#002060',
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  langTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
  langText: {
    color: '#94A3B8',
    fontSize: 10,
  },
  iconCircle: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
  },
  profileCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#002060',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Title section
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002060',
  },
  filterIconButton: {
    backgroundColor: '#EEF2FF',
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressedState: {
    backgroundColor: '#E0E7FF',
  },

  // Route card container
  routeCardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    position: 'relative',
  },

  // Inner Stop Input Cards
  stopInputCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  stopHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dotLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#002060',
    marginRight: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0D9488',
    marginRight: 6,
  },
  stopLabelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
  },
  originTagBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  originTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#002060',
  },
  destTagBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  destTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0D9488',
  },

  // Stop Value row
  stopValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originIconSquare: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  destIconSquare: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stopValueText: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: 'normal',
  },
  clearIconPressable: {
    padding: 4,
  },
  routeBadge: {
    backgroundColor: '#002060',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  routeBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },

  // Floating swap button
  swapButtonWrapper: {
    alignItems: 'flex-end',
    paddingRight: 20,
    height: 12,
    zIndex: 10,
    justifyContent: 'center',
  },
  swapButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#002060',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -1,
  },
  swapButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },

  // Date and Time Row
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  dateTimeCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  dateTimeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 4,
  },
  dateTimeValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeValueText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#002060',
    marginLeft: 6,
    flex: 1,
  },
  nowBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  nowBadgePressed: {
    backgroundColor: '#BBF7D0',
  },
  nowBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#166534',
  },

  // Mode Toggle Bar
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    padding: 3,
    marginTop: 12,
  },
  modeSegment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  modeSegmentActive: {
    backgroundColor: '#FFF',
  },
  modeActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0D9488',
  },
  modeSegmentText: {
    fontSize: 12,
    color: '#64748B',
  },
  modeSegmentTextActive: {
    fontWeight: 'bold',
    color: '#002060',
  },

  // Main CTA Button
  searchButton: {
    backgroundColor: '#002060',
    height: 42,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 8,
  },
  searchButtonPressed: {
    opacity: 0.9,
  },
  searchButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },

  // Recent Searches
  recentSection: {
    marginTop: 20,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recentHeaderTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#002060',
  },
  clearRecentText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#002060',
  },
  emptyRecentCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  emptyRecentText: {
    fontSize: 12,
    color: '#64748B',
  },
  recentCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  recentCardPressed: {
    backgroundColor: '#F8FAFC',
  },
  recentCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentRouteNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  recentPlaceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  recentArrowIcon: {
    marginHorizontal: 6,
  },
  recentTagBadge: {
    backgroundColor: '#002060',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  recentTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  chevronCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  recentSubText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },

  // Location Picker Sheet Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  locationModalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 12,
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationModalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#002060',
  },
  locationSearchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
    marginBottom: 12,
    gap: 8,
  },
  locationSearchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    padding: 0,
  },
  locationListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  locationListItemPressed: {
    backgroundColor: '#F8FAFC',
  },
  locationListIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  locationListTextCol: {
    flex: 1,
  },
  locationListName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  locationListSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  locationRouteBadge: {
    backgroundColor: '#002060',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  locationRouteBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },

  // Option Picker Modal (Date/Time/Preferences)
  pickerModalContent: {
    margin: 20,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 340,
  },
  pickerModalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#002060',
    marginBottom: 12,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
  },
  pickerOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  pickerOptionText: {
    fontSize: 12,
    color: '#475569',
  },
  pickerOptionTextSelected: {
    color: '#002060',
    fontWeight: 'bold',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  prefHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  prefSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  doneFilterButton: {
    backgroundColor: '#002060',
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  doneFilterButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
