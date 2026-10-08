import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
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
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/services/supabase';
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

export interface RouteCorridorOption {
  route_number: string;
  origin: string;
  destination: string;
  mode: TransportMode;
}

export const SRI_LANKA_ROUTES: RouteCorridorOption[] = [
  { route_number: '138', origin: 'Colombo Fort', destination: 'Maharagama', mode: 'bus' },
  { route_number: '138/1', origin: 'Colombo Fort', destination: 'Homagama', mode: 'bus' },
  { route_number: '01', origin: 'Colombo Fort', destination: 'Kandy', mode: 'bus' },
  { route_number: 'EX 1-1', origin: 'Colombo Fort', destination: 'Galle', mode: 'expressway' },
  { route_number: 'EX 1-2', origin: 'Kadawatha', destination: 'Matara', mode: 'expressway' },
  { route_number: '200', origin: 'Colombo Fort', destination: 'Gampaha', mode: 'bus' },
  { route_number: '240', origin: 'Colombo Fort', destination: 'Negombo', mode: 'bus' },
  { route_number: '05', origin: 'Colombo Fort', destination: 'Kurunegala', mode: 'bus' },
  { route_number: '122', origin: 'Pettah', destination: 'Avissawella', mode: 'bus' },
  { route_number: '100', origin: 'Colombo Fort', destination: 'Panadura', mode: 'bus' },
  { route_number: '120', origin: 'Pettah', destination: 'Horana', mode: 'bus' },
  { route_number: '177', origin: 'Kollupitiya', destination: 'Kaduwela', mode: 'bus' },
  { route_number: '255', origin: 'Mt Lavinia', destination: 'Kottawa', mode: 'bus' },
  { route_number: '57', origin: 'Colombo Fort', destination: 'Anuradhapura', mode: 'bus' },
  { route_number: 'A9', origin: 'Colombo Fort', destination: 'Jaffna', mode: 'bus' },
  { route_number: '02', origin: 'Colombo Fort', destination: 'Matara', mode: 'bus' },
];

export interface SavedCommuteItem {
  id: string;
  user_id?: string;
  route_number: string;
  origin: string;
  destination: string;
  label?: string;
  departure_time?: string;
  travel_date?: string;
  transport_mode?: TransportMode;
  created_at?: string;
}

const DEFAULT_COMMUTES: SavedCommuteItem[] = [
  {
    id: 'commute-1',
    route_number: '138',
    origin: 'Maharagama',
    destination: 'Colombo Fort',
    label: 'Daily Office',
    departure_time: '08:45',
    travel_date: 'Today',
    transport_mode: 'bus',
    created_at: new Date().toISOString(),
  },
  {
    id: 'commute-2',
    route_number: 'AC-01',
    origin: 'Pettah',
    destination: 'Kandy',
    label: 'Intercity AC',
    departure_time: '07:00',
    travel_date: 'Tomorrow',
    transport_mode: 'bus',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'commute-3',
    route_number: 'EX 1-1',
    origin: 'Colombo Fort',
    destination: 'Galle',
    label: 'Expressway',
    departure_time: '09:30',
    travel_date: 'Weekend',
    transport_mode: 'expressway',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
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

  // ══════════════════════════════════════════════════════
  // CRUD: Saved Commutes & Favorite Routes State
  // ══════════════════════════════════════════════════════
  const [savedCommutes, setSavedCommutes] = useState<SavedCommuteItem[]>(DEFAULT_COMMUTES);
  const [commutesLoading, setCommutesLoading] = useState(false);
  const [commuteModalVisible, setCommuteModalVisible] = useState(false);
  const [editingCommuteId, setEditingCommuteId] = useState<string | null>(null);

  // In-app Delete & Clear All Modal State (100% reliable across Web and Mobile)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [commuteToDelete, setCommuteToDelete] = useState<SavedCommuteItem | null>(null);
  const [clearAllModalVisible, setClearAllModalVisible] = useState(false);

  // Form State for Add / Edit Modal
  const [formRouteNumber, setFormRouteNumber] = useState('138');
  const [formOrigin, setFormOrigin] = useState('Colombo Fort');
  const [formDestination, setFormDestination] = useState('Maharagama');
  const [formLabel, setFormLabel] = useState('Office Commute');
  const [formTime, setFormTime] = useState('08:30');
  const [formMode, setFormMode] = useState<TransportMode>('bus');

  // Searchable Dropdowns State in Modal
  const [routeDropdownOpen, setRouteDropdownOpen] = useState(false);
  const [routeSearchText, setRouteSearchText] = useState('');
  const [originDropdownOpen, setOriginDropdownOpen] = useState(false);
  const [originSearchText, setOriginSearchText] = useState('');
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  const [destSearchText, setDestSearchText] = useState('');

  // ── 1. READ: Load saved routes from Supabase & AsyncStorage ──
  const loadSavedCommutes = useCallback(async () => {
    setCommutesLoading(true);
    try {
      let dbRoutes: SavedCommuteItem[] = [];
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          const { data, error } = await supabase
            .from('saved_routes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data) && data.length > 0) {
            dbRoutes = data.map((r: any) => ({
              id: r.id,
              user_id: r.user_id,
              route_number: r.route_number || '138',
              origin: r.origin || 'Colombo Fort',
              destination: r.destination || 'Maharagama',
              label: 'Saved Route',
              departure_time: '14:30',
              travel_date: 'Today',
              transport_mode: 'bus' as TransportMode,
              created_at: r.created_at,
            }));
          }
        }
      } catch {
        // Continue with local storage if not authenticated
      }

      const localRaw = await AsyncStorage.getItem('transitlk_saved_commutes');
      let localRoutes: SavedCommuteItem[] = [];
      if (localRaw) {
        try {
          const parsed = JSON.parse(localRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localRoutes = parsed;
          }
        } catch {
          // ignore
        }
      }

      // Merge local and remote
      const keySet = new Set<string>();
      const combined: SavedCommuteItem[] = [];

      [...localRoutes, ...dbRoutes].forEach((item) => {
        const key = `${item.origin.trim().toLowerCase()}_${item.destination.trim().toLowerCase()}_${item.route_number}`;
        if (!keySet.has(key)) {
          keySet.add(key);
          combined.push(item);
        }
      });

      if (combined.length > 0) {
        setSavedCommutes(combined);
      } else {
        setSavedCommutes(DEFAULT_COMMUTES);
        await AsyncStorage.setItem('transitlk_saved_commutes', JSON.stringify(DEFAULT_COMMUTES));
      }
    } catch (e) {
      console.warn('Error loading saved commutes:', e);
      setSavedCommutes(DEFAULT_COMMUTES);
    } finally {
      setCommutesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSavedCommutes();
  }, [loadSavedCommutes]);

  // ── 2. CREATE: Quick-Save current route on screen ──
  const handleSaveCurrentRoute = async () => {
    if (!origin.trim() || !destination.trim()) {
      Alert.alert('Incomplete Route', 'Please select both an Origin and Destination to save.');
      return;
    }

    const newId = `commute-${Date.now()}`;
    const newCommute: SavedCommuteItem = {
      id: newId,
      route_number: routeNumber || '138',
      origin: origin.trim(),
      destination: destination.trim(),
      label: 'Frequent Commute',
      departure_time: departureTime || '14:30',
      travel_date: travelDate || 'Today',
      transport_mode: transportMode || 'bus',
      created_at: new Date().toISOString(),
    };

    const updated = [newCommute, ...savedCommutes.filter((c) => !(c.origin === origin && c.destination === destination))];
    setSavedCommutes(updated);
    await AsyncStorage.setItem('transitlk_saved_commutes', JSON.stringify(updated.slice(0, 30)));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        await supabase.from('saved_routes').upsert({
          user_id: user.id,
          route_number: routeNumber || '138',
          origin: origin.trim(),
          destination: destination.trim(),
        });
      }
    } catch {
      // Continue
    }

    Alert.alert('★ Route Saved', `"${origin} ➔ ${destination}" (Route ${routeNumber || '138'}) is now saved to your commutes!`);
  };

  // Open modal to create a new commute
  const handleOpenAddModal = () => {
    setEditingCommuteId(null);
    setFormRouteNumber(routeNumber || '138');
    setFormOrigin(origin || 'Colombo Fort');
    setFormDestination(destination || 'Maharagama');
    setFormLabel('Daily Work');
    setFormTime(departureTime || '08:30');
    setFormMode('bus');
    setRouteDropdownOpen(false);
    setRouteSearchText('');
    setOriginDropdownOpen(false);
    setOriginSearchText('');
    setDestDropdownOpen(false);
    setDestSearchText('');
    setCommuteModalVisible(true);
  };

  // ── 3. UPDATE: Open modal to edit existing commute ──
  const handleOpenEditModal = (item: SavedCommuteItem) => {
    setEditingCommuteId(item.id);
    setFormRouteNumber(item.route_number || '138');
    setFormOrigin(item.origin);
    setFormDestination(item.destination);
    setFormLabel(item.label || 'Commute');
    setFormTime(item.departure_time || '14:30');
    setFormMode(item.transport_mode || 'bus');
    setRouteDropdownOpen(false);
    setRouteSearchText('');
    setOriginDropdownOpen(false);
    setOriginSearchText('');
    setDestDropdownOpen(false);
    setDestSearchText('');
    setCommuteModalVisible(true);
  };

  // Modal Submit: handles both CREATE & UPDATE
  const handleSaveCommuteForm = async () => {
    if (!formOrigin.trim() || !formDestination.trim()) {
      Alert.alert('Required Fields', 'Please enter both an origin and destination station.');
      return;
    }
    if (formOrigin.trim().toLowerCase() === formDestination.trim().toLowerCase()) {
      Alert.alert('Invalid Selection', 'Origin and Destination cannot be the same station.');
      return;
    }

    if (editingCommuteId) {
      // UPDATE existing
      const updatedList = savedCommutes.map((item) => {
        if (item.id === editingCommuteId) {
          return {
            ...item,
            route_number: formRouteNumber.trim() || '138',
            origin: formOrigin.trim(),
            destination: formDestination.trim(),
            label: formLabel.trim() || 'Commute',
            departure_time: formTime.trim() || '14:30',
            transport_mode: formMode,
          };
        }
        return item;
      });

      setSavedCommutes(updatedList);
      await AsyncStorage.setItem('transitlk_saved_commutes', JSON.stringify(updatedList));

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id && editingCommuteId.includes('-') && editingCommuteId.length > 20) {
          await supabase.from('saved_routes').update({
            route_number: formRouteNumber.trim() || '138',
            origin: formOrigin.trim(),
            destination: formDestination.trim(),
          }).eq('id', editingCommuteId);
        }
      } catch {
        // Continue
      }

      setCommuteModalVisible(false);
      Alert.alert('Commute Updated', `Saved changes for "${formOrigin} ➔ ${formDestination}".`);
    } else {
      // CREATE new
      const newId = `commute-${Date.now()}`;
      const newCommute: SavedCommuteItem = {
        id: newId,
        route_number: formRouteNumber.trim() || '138',
        origin: formOrigin.trim(),
        destination: formDestination.trim(),
        label: formLabel.trim() || 'Commute',
        departure_time: formTime.trim() || '14:30',
        travel_date: 'Today',
        transport_mode: formMode,
        created_at: new Date().toISOString(),
      };

      const updatedList = [newCommute, ...savedCommutes];
      setSavedCommutes(updatedList);
      await AsyncStorage.setItem('transitlk_saved_commutes', JSON.stringify(updatedList.slice(0, 30)));

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          await supabase.from('saved_routes').insert({
            user_id: user.id,
            route_number: formRouteNumber.trim() || '138',
            origin: formOrigin.trim(),
            destination: formDestination.trim(),
          });
        }
      } catch {
        // Continue
      }

      setCommuteModalVisible(false);
      Alert.alert('Commute Added', `Added "${formOrigin} ➔ ${formDestination}" to your saved commutes!`);
    }
  };

  // ── 4. DELETE: In-app confirmation modal (100% reliable across Web, Mobile & Desktop) ──
  const handlePromptDeleteCommute = (item: SavedCommuteItem) => {
    setCommuteToDelete(item);
    setDeleteModalVisible(true);
  };

  const handleConfirmDeleteCommute = async () => {
    if (!commuteToDelete) return;
    const target = commuteToDelete;
    setDeleteModalVisible(false);
    setCommuteToDelete(null);

    const filtered = savedCommutes.filter((c) => c.id !== target.id);
    setSavedCommutes(filtered);
    await AsyncStorage.setItem('transitlk_saved_commutes', JSON.stringify(filtered));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id && target.id.includes('-') && target.id.length > 20) {
        await supabase.from('saved_routes').delete().eq('id', target.id);
      }
    } catch {
      // Continue
    }
  };

  const handlePromptClearAll = () => {
    setClearAllModalVisible(true);
  };

  const handleConfirmClearAll = async () => {
    setClearAllModalVisible(false);
    setSavedCommutes([]);
    await AsyncStorage.removeItem('transitlk_saved_commutes');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        await supabase.from('saved_routes').delete().eq('user_id', user.id);
      }
    } catch {
      // Continue
    }
  };

  // One-tap apply commute to search form and navigate immediately
  const handleApplyCommute = (item: SavedCommuteItem) => {
    const selectedOrigin = item.origin;
    const selectedDestination = item.destination;
    const selectedRoute = item.route_number || '138';
    const selectedTime = item.departure_time || departureTime || '14:30';
    const selectedDate = item.travel_date || travelDate || '24 Oct 2026';
    const selectedMode = item.transport_mode || transportMode || 'bus';

    setOrigin(selectedOrigin);
    setDestination(selectedDestination);
    setRouteNumber(selectedRoute);
    setDepartureTime(selectedTime);
    setTravelDate(selectedDate);
    setTransportMode(selectedMode);

    // Directly navigate to Select Trip screen with route parameters
    router.push({
      pathname: '/passenger/select-trip' as any,
      params: {
        origin: selectedOrigin,
        destination: selectedDestination,
        routeNumber: selectedRoute,
        travelDate: selectedDate,
        departureTime: selectedTime,
        transportMode: selectedMode,
        acOnly: acOnly ? 'true' : 'false',
        directOnly: directOnly ? 'true' : 'false',
      },
    });
  };

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

  // Filtered options for Add / Edit Commute dropdowns
  const filteredRoutes = SRI_LANKA_ROUTES.filter((r) =>
    r.route_number.toLowerCase().includes(routeSearchText.toLowerCase()) ||
    r.origin.toLowerCase().includes(routeSearchText.toLowerCase()) ||
    r.destination.toLowerCase().includes(routeSearchText.toLowerCase())
  );

  const filteredOriginLocations = POPULAR_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(originSearchText.toLowerCase()) ||
    loc.province.toLowerCase().includes(originSearchText.toLowerCase())
  );

  const filteredDestLocations = POPULAR_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(destSearchText.toLowerCase()) ||
    loc.province.toLowerCase().includes(destSearchText.toLowerCase())
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

        {/* Main CTA Actions Row: Search Routes & Save Route */}
        <View style={styles.ctaButtonRow}>
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

          <Pressable
            style={({ pressed }) => [
              styles.saveRouteBtn,
              pressed && styles.saveRouteBtnPressed,
            ]}
            onPress={handleSaveCurrentRoute}
          >
            <Ionicons name="bookmark-outline" size={16} color="#002060" />
            <Text style={styles.saveRouteBtnText}>Save Route</Text>
          </Pressable>
        </View>

        {/* ══════════════════════════════════════════════════════ */}
        {/* Saved Commutes Section (Complete CRUD)                */}
        {/* ══════════════════════════════════════════════════════ */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <View style={styles.recentHeaderLeft}>
              <Ionicons name="bookmark" size={16} color="#002060" />
              <Text style={styles.recentHeaderTitle}>SAVED COMMUTES</Text>
              <View style={styles.commuteCountBadge}>
                <Text style={styles.commuteCountText}>{savedCommutes.length}</Text>
              </View>
            </View>

            <View style={styles.recentHeaderRightActions}>
              <TouchableOpacity
                style={styles.addCommuteHeaderBtn}
                onPress={handleOpenAddModal}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={16} color="#0D9488" />
                <Text style={styles.addCommuteHeaderText}>New</Text>
              </TouchableOpacity>

              {savedCommutes.length > 0 && (
                <TouchableOpacity
                  onPress={handlePromptClearAll}
                  style={styles.clearHeaderBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearRecentText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {commutesLoading ? (
            <View style={styles.loadingCommutesBox}>
              <ActivityIndicator size="small" color="#002060" />
              <Text style={styles.loadingCommutesText}>Loading saved routes...</Text>
            </View>
          ) : savedCommutes.length === 0 ? (
            <View style={styles.emptyRecentCard}>
              <Ionicons name="bookmark-outline" size={32} color="#94A3B8" style={{ marginBottom: 6 }} />
              <Text style={styles.emptyRecentTitle}>No Saved Commutes Yet</Text>
              <Text style={styles.emptyRecentText}>
                Bookmark your daily bus routes or tap &quot;New&quot; to add a custom commute.
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={handleOpenAddModal}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={16} color="#FFF" />
                <Text style={styles.emptyAddBtnText}>Add First Commute</Text>
              </TouchableOpacity>
            </View>
          ) : (
            savedCommutes.map((item) => (
              <View key={item.id} style={styles.savedCard}>
                <View style={styles.savedCardTopRow}>
                  <View style={styles.savedBadgeGroup}>
                    <View style={styles.savedRouteBadge}>
                      <Ionicons name="bus" size={10} color="#FFF" />
                      <Text style={styles.savedRouteBadgeText}>Route {item.route_number || '138'}</Text>
                    </View>
                    {item.label ? (
                      <View style={styles.savedLabelBadge}>
                        <Text style={styles.savedLabelText}>{item.label}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* CRUD Actions: Edit & Delete (Top-level touchable) */}
                  <View style={styles.savedCardActions}>
                    <TouchableOpacity
                      style={styles.cardActionIconBtn}
                      onPress={() => handleOpenEditModal(item)}
                      activeOpacity={0.7}
                      accessibilityLabel="Edit commute"
                    >
                      <Ionicons name="pencil" size={15} color="#002060" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cardActionDeleteBtn}
                      onPress={() => handlePromptDeleteCommute(item)}
                      activeOpacity={0.7}
                      accessibilityLabel="Delete commute"
                    >
                      <Ionicons name="trash-outline" size={15} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 1-Tap Apply to Search Area */}
                <TouchableOpacity
                  style={styles.savedCardBodyArea}
                  onPress={() => handleApplyCommute(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.savedRouteNameRow}>
                    <Text style={styles.savedPlaceName}>{item.origin}</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color="#002060"
                      style={styles.savedArrowIcon}
                    />
                    <Text style={styles.savedPlaceName}>{item.destination}</Text>
                  </View>

                  <View style={styles.savedSubRow}>
                    <Text style={styles.savedSubText}>
                      {item.departure_time || '14:30'} • {item.travel_date || 'Today'} • {item.transport_mode === 'expressway' ? 'Expressway' : 'Bus Network'}
                    </Text>
                    <View style={styles.tapToApplyBtn}>
                      <Text style={styles.tapToApplyText}>Tap to search ➔</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
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

      {/* ═══ Add / Edit Saved Commute Modal (CREATE & UPDATE) ═══ */}
      <Modal
        visible={commuteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommuteModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCommuteModalVisible(false)}
        >
          <Pressable
            style={styles.commuteModalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalDragHandle} />

            <View style={styles.commuteModalHeader}>
              <View>
                <Text style={styles.commuteModalTitle}>
                  {editingCommuteId ? 'Edit Saved Commute' : 'Add New Commute'}
                </Text>
                <Text style={styles.commuteModalSub}>
                  {editingCommuteId ? 'Update route details and personal label' : 'Save a frequent commute for 1-tap route search'}
                </Text>
              </View>
              <Pressable
                onPress={() => setCommuteModalVisible(false)}
                hitSlop={10}
              >
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollBody} keyboardShouldPersistTaps="handled">
              {/* Route Number / Corridor Dropdown with Search */}
              <Text style={styles.inputFieldLabel}>SELECT ROUTE / CORRIDOR</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => {
                  setRouteDropdownOpen(!routeDropdownOpen);
                  setOriginDropdownOpen(false);
                  setDestDropdownOpen(false);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.dropdownTriggerLeft}>
                  <View style={styles.routePillBadge}>
                    <Ionicons name="bus" size={12} color="#FFF" />
                    <Text style={styles.routePillBadgeText}>Route {formRouteNumber}</Text>
                  </View>
                  <Text style={styles.dropdownValueText} numberOfLines={1}>
                    {formOrigin} ⇄ {formDestination}
                  </Text>
                </View>
                <Ionicons
                  name={routeDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>

              {routeDropdownOpen && (
                <View style={styles.dropdownPanel}>
                  <View style={styles.dropdownSearchWrap}>
                    <Ionicons name="search" size={15} color="#64748B" />
                    <TextInput
                      style={styles.dropdownSearchInput}
                      placeholder="Search route number or city..."
                      placeholderTextColor="#94A3B8"
                      value={routeSearchText}
                      onChangeText={setRouteSearchText}
                      autoFocus={true}
                    />
                    {routeSearchText.length > 0 && (
                      <TouchableOpacity onPress={() => setRouteSearchText('')}>
                        <Ionicons name="close-circle" size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <ScrollView style={styles.dropdownListScroll} nestedScrollEnabled={true}>
                    {filteredRoutes.map((r) => (
                      <TouchableOpacity
                        key={r.route_number + r.destination}
                        style={[
                          styles.dropdownItem,
                          formRouteNumber === r.route_number && formDestination === r.destination && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setFormRouteNumber(r.route_number);
                          setFormOrigin(r.origin);
                          setFormDestination(r.destination);
                          setFormMode(r.mode);
                          setRouteDropdownOpen(false);
                          setRouteSearchText('');
                        }}
                      >
                        <View style={styles.itemBadge}>
                          <Text style={styles.itemBadgeText}>Route {r.route_number}</Text>
                        </View>
                        <View style={styles.itemTextWrap}>
                          <Text style={styles.itemTitle}>{r.origin} ⇄ {r.destination}</Text>
                          <Text style={styles.itemSub}>{r.mode === 'expressway' ? '⚡ Expressway Direct' : '● Regular Bus Corridor'}</Text>
                        </View>
                        {formRouteNumber === r.route_number && formDestination === r.destination && (
                          <Ionicons name="checkmark-circle" size={18} color="#002060" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Origin Station Dropdown with Search */}
              <Text style={styles.inputFieldLabel}>ORIGIN (DEPARTURE STATION)</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => {
                  setOriginDropdownOpen(!originDropdownOpen);
                  setRouteDropdownOpen(false);
                  setDestDropdownOpen(false);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.dropdownTriggerLeft}>
                  <View style={styles.stationIconWrapBlue}>
                    <Ionicons name="location" size={14} color="#2563EB" />
                  </View>
                  <Text style={styles.dropdownValueText}>{formOrigin || 'Select Departure Station'}</Text>
                </View>
                <Ionicons
                  name={originDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>

              {originDropdownOpen && (
                <View style={styles.dropdownPanel}>
                  <View style={styles.dropdownSearchWrap}>
                    <Ionicons name="search" size={15} color="#64748B" />
                    <TextInput
                      style={styles.dropdownSearchInput}
                      placeholder="Search departure stations..."
                      placeholderTextColor="#94A3B8"
                      value={originSearchText}
                      onChangeText={setOriginSearchText}
                      autoFocus={true}
                    />
                    {originSearchText.length > 0 && (
                      <TouchableOpacity onPress={() => setOriginSearchText('')}>
                        <Ionicons name="close-circle" size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <ScrollView style={styles.dropdownListScroll} nestedScrollEnabled={true}>
                    {filteredOriginLocations.map((loc) => (
                      <TouchableOpacity
                        key={'origin-' + loc.name}
                        style={[
                          styles.dropdownItem,
                          formOrigin === loc.name && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setFormOrigin(loc.name);
                          if (loc.route && loc.route !== 'All') {
                            setFormRouteNumber(loc.route);
                          }
                          setOriginDropdownOpen(false);
                          setOriginSearchText('');
                        }}
                      >
                        <Ionicons name="location-outline" size={16} color="#2563EB" style={{ marginRight: 8 }} />
                        <View style={styles.itemTextWrap}>
                          <Text style={styles.itemTitle}>{loc.name}</Text>
                          <Text style={styles.itemSub}>{loc.province} • {loc.tag}</Text>
                        </View>
                        {formOrigin === loc.name && (
                          <Ionicons name="checkmark-circle" size={18} color="#2563EB" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Swap Stations Button */}
              <View style={styles.modalSwapWrap}>
                <TouchableOpacity
                  style={styles.modalSwapBtn}
                  onPress={() => {
                    const temp = formOrigin;
                    setFormOrigin(formDestination);
                    setFormDestination(temp);
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="swap-vertical" size={18} color="#002060" />
                  <Text style={styles.modalSwapText}>Swap Stations</Text>
                </TouchableOpacity>
              </View>

              {/* Destination Station Dropdown with Search */}
              <Text style={styles.inputFieldLabel}>DESTINATION (ARRIVAL STATION)</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => {
                  setDestDropdownOpen(!destDropdownOpen);
                  setRouteDropdownOpen(false);
                  setOriginDropdownOpen(false);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.dropdownTriggerLeft}>
                  <View style={styles.stationIconWrapGreen}>
                    <Ionicons name="location" size={14} color="#10B981" />
                  </View>
                  <Text style={styles.dropdownValueText}>{formDestination || 'Select Arrival Station'}</Text>
                </View>
                <Ionicons
                  name={destDropdownOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>

              {destDropdownOpen && (
                <View style={styles.dropdownPanel}>
                  <View style={styles.dropdownSearchWrap}>
                    <Ionicons name="search" size={15} color="#64748B" />
                    <TextInput
                      style={styles.dropdownSearchInput}
                      placeholder="Search arrival stations..."
                      placeholderTextColor="#94A3B8"
                      value={destSearchText}
                      onChangeText={setDestSearchText}
                      autoFocus={true}
                    />
                    {destSearchText.length > 0 && (
                      <TouchableOpacity onPress={() => setDestSearchText('')}>
                        <Ionicons name="close-circle" size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <ScrollView style={styles.dropdownListScroll} nestedScrollEnabled={true}>
                    {filteredDestLocations.map((loc) => (
                      <TouchableOpacity
                        key={'dest-' + loc.name}
                        style={[
                          styles.dropdownItem,
                          formDestination === loc.name && styles.dropdownItemActive,
                        ]}
                        onPress={() => {
                          setFormDestination(loc.name);
                          if (loc.route && loc.route !== 'All') {
                            setFormRouteNumber(loc.route);
                          }
                          setDestDropdownOpen(false);
                          setDestSearchText('');
                        }}
                      >
                        <Ionicons name="location-outline" size={16} color="#10B981" style={{ marginRight: 8 }} />
                        <View style={styles.itemTextWrap}>
                          <Text style={styles.itemTitle}>{loc.name}</Text>
                          <Text style={styles.itemSub}>{loc.province} • {loc.tag}</Text>
                        </View>
                        {formDestination === loc.name && (
                          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Commute Label / Tag */}
              <Text style={styles.inputFieldLabel}>COMMUTE LABEL (NICKNAME)</Text>
              <View style={styles.commuteInputWrap}>
                <Ionicons name="pricetag-outline" size={18} color="#0D9488" />
                <TextInput
                  style={styles.commuteTextInput}
                  value={formLabel}
                  onChangeText={setFormLabel}
                  placeholder="e.g. Daily Office, Campus, Home"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Quick tags pills */}
              <View style={styles.labelPillsRow}>
                {['Daily Office', 'Campus', 'Home', 'Expressway', 'Weekend'].map((tag) => (
                  <Pressable
                    key={tag}
                    style={[
                      styles.labelPill,
                      formLabel === tag && styles.labelPillActive,
                    ]}
                    onPress={() => setFormLabel(tag)}
                  >
                    <Text
                      style={[
                        styles.labelPillText,
                        formLabel === tag && styles.labelPillTextActive,
                      ]}
                    >
                      {tag}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Departure Time */}
              <Text style={styles.inputFieldLabel}>PREFERRED DEPARTURE TIME</Text>
              <View style={styles.commuteInputWrap}>
                <Ionicons name="time-outline" size={18} color="#64748B" />
                <TextInput
                  style={styles.commuteTextInput}
                  value={formTime}
                  onChangeText={setFormTime}
                  placeholder="e.g. 08:30"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Transport Mode */}
              <Text style={styles.inputFieldLabel}>TRANSPORT NETWORK</Text>
              <View style={styles.modalModeRow}>
                <Pressable
                  style={[
                    styles.modalModeOption,
                    formMode === 'bus' && styles.modalModeOptionActive,
                  ]}
                  onPress={() => setFormMode('bus')}
                >
                  <Ionicons name="bus" size={16} color={formMode === 'bus' ? '#002060' : '#64748B'} />
                  <Text style={[styles.modalModeText, formMode === 'bus' && styles.modalModeTextActive]}>
                    Bus Network
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.modalModeOption,
                    formMode === 'expressway' && styles.modalModeOptionActive,
                  ]}
                  onPress={() => setFormMode('expressway')}
                >
                  <Ionicons name="flash-outline" size={16} color={formMode === 'expressway' ? '#002060' : '#64748B'} />
                  <Text style={[styles.modalModeText, formMode === 'expressway' && styles.modalModeTextActive]}>
                    Expressway
                  </Text>
                </Pressable>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActionRow}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setCommuteModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.modalSaveBtn}
                onPress={handleSaveCommuteForm}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                <Text style={styles.modalSaveText}>
                  {editingCommuteId ? 'Update Commute' : 'Save Commute'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══ In-App Delete Confirmation Modal (Cross-Platform) ═══ */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <Pressable
          style={styles.confirmBackdrop}
          onPress={() => setDeleteModalVisible(false)}
        >
          <View style={styles.confirmDialogContent}>
            <View style={styles.confirmDialogIconWrap}>
              <Ionicons name="trash" size={24} color="#EF4444" />
            </View>

            <Text style={styles.confirmDialogTitle}>Delete Commute?</Text>
            <Text style={styles.confirmDialogSub}>
              Are you sure you want to remove &quot;{commuteToDelete?.origin} ➔ {commuteToDelete?.destination}&quot; (Route {commuteToDelete?.route_number}) from your saved routes?
            </Text>

            <View style={styles.confirmDialogBtnRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setDeleteModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={handleConfirmDeleteCommute}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color="#FFF" />
                <Text style={styles.confirmDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* ═══ In-App Clear All Confirmation Modal (Cross-Platform) ═══ */}
      <Modal
        visible={clearAllModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setClearAllModalVisible(false)}
      >
        <Pressable
          style={styles.confirmBackdrop}
          onPress={() => setClearAllModalVisible(false)}
        >
          <View style={styles.confirmDialogContent}>
            <View style={styles.confirmDialogIconWrap}>
              <Ionicons name="alert-circle" size={24} color="#EF4444" />
            </View>

            <Text style={styles.confirmDialogTitle}>Clear All Commutes?</Text>
            <Text style={styles.confirmDialogSub}>
              Are you sure you want to delete all {savedCommutes.length} saved commutes? This action cannot be undone.
            </Text>

            <View style={styles.confirmDialogBtnRow}>
              <TouchableOpacity
                style={styles.confirmCancelBtn}
                onPress={() => setClearAllModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={handleConfirmClearAll}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color="#FFF" />
                <Text style={styles.confirmDeleteText}>Clear All</Text>
              </TouchableOpacity>
            </View>
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

  // Main CTA Actions Row
  ctaButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#002060',
    height: 44,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  saveRouteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    paddingHorizontal: 14,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    gap: 6,
  },
  saveRouteBtnPressed: {
    backgroundColor: '#E0E7FF',
  },
  saveRouteBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#002060',
  },

  // Saved Commutes Section
  recentSection: {
    marginTop: 22,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#002060',
    letterSpacing: 0.5,
  },
  commuteCountBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  commuteCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#002060',
  },
  recentHeaderRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addCommuteHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  addCommuteHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0D9488',
  },
  clearHeaderBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  clearRecentText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94A3B8',
  },

  loadingCommutesBox: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  loadingCommutesText: {
    fontSize: 12,
    color: '#64748B',
  },

  emptyRecentCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyRecentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptyRecentText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#002060',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyAddBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },

  // Saved Commute Card
  savedCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    overflow: 'hidden',
    padding: 12,
  },
  savedCardBodyArea: {
    paddingTop: 2,
    cursor: Platform.OS === 'web' ? ('pointer' as any) : undefined,
  },
  savedCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  savedBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savedRouteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#002060',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  savedRouteBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  savedLabelBadge: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  savedLabelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0D9488',
  },
  savedCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  cardActionIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: Platform.OS === 'web' ? ('pointer' as any) : undefined,
  },
  cardActionDeleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: Platform.OS === 'web' ? ('pointer' as any) : undefined,
  },
  savedRouteNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  savedPlaceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  savedArrowIcon: {
    marginHorizontal: 8,
  },
  savedSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  savedSubText: {
    fontSize: 11,
    color: '#64748B',
  },
  tapToApplyBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tapToApplyText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#002060',
  },

  // Add / Edit Commute Modal
  commuteModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingHorizontal: 18,
    paddingBottom: 28,
    paddingTop: 12,
  },
  commuteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  commuteModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002060',
  },
  commuteModalSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalScrollBody: {
    maxHeight: 480,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    cursor: Platform.OS === 'web' ? ('pointer' as any) : undefined,
  },
  dropdownTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  dropdownValueText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    flex: 1,
  },
  routePillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#002060',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  routePillBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  stationIconWrapBlue: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationIconWrapGreen: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 8,
    padding: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  dropdownSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 36,
    gap: 6,
    marginBottom: 6,
  },
  dropdownSearchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    padding: 0,
  },
  dropdownListScroll: {
    maxHeight: 160,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    cursor: Platform.OS === 'web' ? ('pointer' as any) : undefined,
  },
  dropdownItemActive: {
    backgroundColor: '#EEF2FF',
  },
  itemBadge: {
    backgroundColor: '#002060',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  itemBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  itemTextWrap: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  itemSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  inputFieldLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 10,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  commuteInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 42,
    gap: 8,
  },
  commuteTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    padding: 0,
  },
  modalSwapWrap: {
    alignItems: 'center',
    marginVertical: 4,
  },
  modalSwapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 4,
  },
  modalSwapText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#002060',
  },
  labelPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  labelPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  labelPillActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  labelPillText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  labelPillTextActive: {
    color: '#0D9488',
    fontWeight: 'bold',
  },
  modalModeRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalModeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalModeOptionActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#002060',
  },
  modalModeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  modalModeTextActive: {
    color: '#002060',
    fontWeight: 'bold',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSaveBtn: {
    flex: 2,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#002060',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
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

  // In-App Confirmation Dialog (Delete & Clear All)
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmDialogContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 22,
    width: '88%',
    maxWidth: 340,
    alignSelf: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmDialogIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmDialogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  confirmDialogSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  confirmDialogBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: Platform.OS === 'web' ? ('pointer' as any) : undefined,
  },
  confirmCancelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  confirmDeleteBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    cursor: Platform.OS === 'web' ? ('pointer' as any) : undefined,
  },
  confirmDeleteText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
