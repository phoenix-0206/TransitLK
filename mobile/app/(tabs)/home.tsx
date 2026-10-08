import React, { useState, useEffect, useCallback, useMemo } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import { router, useFocusEffect } from 'expo-router';

import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';

import { supabase } from '../../services/supabase';
import { getPassengerTickets, type TicketRecord } from '../../services/ticketService';

import {
  fetchLiveBusLocations,
  type LiveBusLocation,
} from '../../services/liveBusLocations';

import type { Profile, SavedRoute } from '../../types/database';

const DEFAULT_SMART_PASS: TicketRecord = {
  ticket_number: 'TRX-948210-LK',
  ticket_token: 'TRX-948210-LK',
  ticket_type: 'SMARTPASS',
  fare: 240.0,
  route_number: '138',
  service_name: 'SLTB AC EXPRESS',
  origin: 'Maharagama',
  origin_name: 'Maharagama Central',
  destination: 'Colombo Fort',
  destination_name: 'Colombo Fort Stand',
  departure_time: '08:45 AM',
  arrival_time: '09:30 AM',
  travel_date: 'Today, 24 Oct 2026',
  passenger_count: '2',
  passenger_type: '2 Adults',
  payment_method: 'LankaPay / Visa •••• 4242',
  status: 'ACTIVE',
  payment_status: 'PAID',
  purchased_at: new Date().toISOString(),
};

export default function HomeDashboardScreen() {
  // ── Auth & Profile State ──
  const [userName, setUserName] = useState<string>('Commuter');
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── SmartPass & Ticket State ──
  const [smartPassTicket, setSmartPassTicket] = useState<TicketRecord | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  // ── Data State ──
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [nearbyBuses, setNearbyBuses] = useState<LiveBusLocation[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(true);
  const [nearbyError, setNearbyError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Load session, tickets & profile on mount and when tab gains focus ──
  useFocusEffect(
    useCallback(() => {
      void loadSession();
      void loadNearbyBuses();
      void loadSmartPassTicket();
    }, [])
  );

  async function loadSession() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        setIsAuthenticated(true);

        // Fetch profile for display name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone_number, pass_category')
          .eq('id', user.id)
          .single<Profile>();

        if (profile?.full_name) {
          // Extract first name for greeting
          const firstName = profile.full_name.split(' ')[0];
          setUserName(firstName);
        } else if (user.email) {
          setUserName(user.email.split('@')[0]);
        }

        // Fetch saved routes
        await loadSavedRoutes(user.id);
      } else {
        setIsAuthenticated(false);
        setUserName('Commuter');
      }
    } catch (err) {
      console.log('Session load error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadSavedRoutes(uid: string) {
    try {
      const { data } = await supabase
        .from('saved_routes')
        .select('*')
        .eq('user_id', uid)
        .limit(5);

      if (data) setSavedRoutes(data);
    } catch (err) {
      // Fallback: use empty array
    }
  }

  async function loadNearbyBuses() {
    setNearbyLoading(true);

    try {
      const { buses, error } = await fetchLiveBusLocations();

      setNearbyBuses(buses);
      setNearbyError(error ?? '');
    } catch (error) {
      setNearbyBuses([]);

      setNearbyError(
        error instanceof Error
          ? error.message
          : 'Unable to load live buses.'
      );
    } finally {
      setNearbyLoading(false);
    }
  }

  async function loadSmartPassTicket(uid?: string | null) {
    try {
      // 1. Fetch tickets from Supabase tickets table and AsyncStorage cache
      const tickets = await getPassengerTickets(uid || userId);
      if (tickets && tickets.length > 0) {
        setSmartPassTicket(tickets[0]);
        return;
      }

      // 2. Fallback check local storage directly
      const raw = await AsyncStorage.getItem('transitlk_tickets');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          setSmartPassTicket(list[0]);
          return;
        }
      }

      // 3. Fallback default active pass and save it to storage
      setSmartPassTicket(DEFAULT_SMART_PASS);
      await AsyncStorage.setItem('transitlk_tickets', JSON.stringify([DEFAULT_SMART_PASS]));
    } catch (err) {
      console.warn('Error loading smart pass ticket:', err);
      setSmartPassTicket(DEFAULT_SMART_PASS);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);

    await Promise.all([
      loadSession(),
      loadNearbyBuses(),
      loadSmartPassTicket(),
    ]);

    setRefreshing(false);
  }

  function handleSearch() {
    if (searchQuery.trim()) {
      router.push('/timetable-schedules');
    }
  }

  // Active pass data and scannable QR code payload
  const activePass = smartPassTicket || DEFAULT_SMART_PASS;

  const qrCodeData = useMemo(() => {
    const t = activePass;
    const token = t.ticket_token || t.ticket_number || 'TRX-948210-LK';
    return JSON.stringify({
      app: 'TransitLK',
      ticket_token: token,
      ticket_number: t.ticket_number || token,
      route_number: t.route_number || '138',
      route_name: t.service_name || 'SLTB AC EXPRESS',
      service_name: t.service_name || 'SLTB AC EXPRESS',
      origin: t.origin_name || t.origin || 'Maharagama',
      origin_name: t.origin_name || t.origin || 'Maharagama',
      destination: t.destination_name || t.destination || 'Colombo Fort',
      destination_name: t.destination_name || t.destination || 'Colombo Fort',
      departure_time: t.departure_time || '08:45 AM',
      arrival_time: t.arrival_time || '09:30 AM',
      travel_date: t.travel_date || 'Today, 24 Oct 2026',
      fare: String(t.fare ?? '240.00'),
      amount: String(t.fare ?? '240.00'),
      passenger_count: String(t.passenger_count || '1'),
      passenger_type: t.passenger_type || '2 Adults',
      payment_method: t.payment_method || 'LankaPay / Visa •••• 4242',
      status: 'VALID',
      payment_status: 'PAID',
      issued_at: t.created_at || t.purchased_at || new Date().toISOString(),
    });
  }, [activePass]);

  // Navigate to full Digital Pass screen
  const handleOpenPassProfile = () => {
    router.push({
      pathname: '/transit-pass' as any,
      params: {
        bookingRef: activePass.ticket_token || activePass.ticket_number,
        routeNumber: activePass.route_number || '138',
        serviceName: activePass.service_name || 'SLTB AC EXPRESS',
        originName: activePass.origin_name || activePass.origin || 'Maharagama Central',
        destinationName: activePass.destination_name || activePass.destination || 'Colombo Fort',
        travelDate: activePass.travel_date || 'Today, 24 Oct 2026',
        departureTime: activePass.departure_time || '08:45 AM',
        arrivalTime: activePass.arrival_time || '09:30 AM',
        totalPayable: String(activePass.fare ?? '240.00'),
        passengerDetails: activePass.passenger_type || '2 Adults',
        totalTickets: String(activePass.passenger_count || 1),
        paymentMethod: activePass.payment_method || 'LankaPay / Visa •••• 4242',
      },
    });
  };

  // Navigate to Ticket Confirmation screen
  const handleOpenTicketConfirmation = () => {
    router.push({
      pathname: '/passenger/ticket-confirmation' as any,
      params: {
        bookingRef: activePass.ticket_token || activePass.ticket_number,
        routeNumber: activePass.route_number || '138',
        serviceName: activePass.service_name || 'SLTB AC EXPRESS',
        originName: activePass.origin_name || activePass.origin || 'Maharagama Central',
        destinationName: activePass.destination_name || activePass.destination || 'Colombo Fort',
        travelDate: activePass.travel_date || 'Today, 24 Oct 2026',
        departureTime: activePass.departure_time || '08:45 AM',
        arrivalTime: activePass.arrival_time || '09:30 AM',
        totalPayable: String(activePass.fare ?? '240.00'),
        passengerDetails: activePass.passenger_type || '2 Adults',
        totalTickets: String(activePass.passenger_count || 1),
        paymentMethod: activePass.payment_method || 'LankaPay / Visa •••• 4242',
      },
    });
  };

  // Navigate to Ticket Details page in the purchase flow
  const handleOpenTicketDetails = () => {
    router.push({
      pathname: '/passenger/ticket-details' as any,
      params: {
        routeNumber: activePass.route_number || '138',
        serviceName: activePass.service_name || 'SLTB AC EXPRESS',
        fare: String(activePass.fare ? (Number(activePass.fare) > 120 ? 120 : activePass.fare) : 120),
        originName: activePass.origin_name || activePass.origin || 'Maharagama Central',
        destinationName: activePass.destination_name || activePass.destination || 'Colombo Fort',
        departureTime: activePass.departure_time || '08:45 AM',
        arrivalTime: activePass.arrival_time || '09:30 AM',
        durationText: '45 min bus corridor (Non-stop)',
        travelDate: activePass.travel_date || 'Today, 24 Oct 2026',
      },
    });
  };

  // Navigate to Select Trip to begin new ticket purchase
  const handleSelectTrip = () => {
    router.push('/passenger/select-trip' as any);
  };

  // Test ticket token in Conductor Scanner
  const handleTestScanner = () => {
    router.push({
      pathname: '/conductor/scanner' as any,
      params: {
        testToken: activePass.ticket_token || activePass.ticket_number,
      },
    });
  };

  // ── Loading State ──
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#002060"
        />

        <Text style={styles.loadingText}>
          Loading TransitLK...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#002060']}
            tintColor="#002060"
          />
        }
      >
        {/* ═══ Header Bar ═══ */}

        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <Ionicons
                name="bus"
                size={18}
                color="#FFF"
              />
            </View>

            <View>
              <Text style={styles.brandTitle}>
                TransitLK
              </Text>

              <Text style={styles.brandSub}>
                Home
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <View style={styles.langPill}>
              <Text style={styles.langTextActive}>
                EN
              </Text>

              <Text style={styles.langText}>
                සි
              </Text>
            </View>

            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons
                name="notifications-outline"
                size={18}
                color="#002060"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileCircle}
              onPress={() => {
                if (isAuthenticated) {
                  router.push('/profile');
                } else {
                  router.push('/login');
                }
              }}
            >
              <Ionicons
                name="person"
                size={16}
                color="#FFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══ Greeting with Session Data ═══ */}

        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greetingText}>
              Ayubowan, {userName} 👋
            </Text>

            <View style={styles.weatherRow}>
              <Ionicons
                name="sunny-outline"
                size={14}
                color="#D97706"
              />

              <Text style={styles.weatherText}>
                30°C Colombo South • Normal Rail & Bus Op{' '}

                <Text
                  style={{
                    color: '#0D9488',
                    fontWeight: 'bold',
                  }}
                >
                  Smooth Flow
                </Text>
              </Text>
              <Ionicons name="radio-outline" size={14} color="#0D9488" />
              <Text style={styles.weatherText}>
                {nearbyLoading ? 'Loading live bus feed…' : `${nearbyBuses.length} bus ${nearbyBuses.length === 1 ? 'location' : 'locations'} available`}
              </Text>
            </View>
          </View>

          <View style={styles.gpsPill}>
            <Text style={styles.gpsPillText}>{nearbyLoading ? 'LOADING' : nearbyBuses.length ? 'BUS FEED LIVE' : 'NO LIVE FEED'}</Text>
          </View>
        </View>

        {/* ═══ Search Bar ═══ */}

        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color="#64748B"
          />

          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={0.7}
            onPress={() => router.push('/passenger/search' as any)}
          >
            <TextInput
              style={styles.searchInput}
              placeholder="Search bus, train or station (138, Fort, Kandy)..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              editable={false}
              pointerEvents="none"
            />
          </TouchableOpacity>

          <TouchableOpacity>
            <Ionicons
              name="mic-outline"
              size={18}
              color="#64748B"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() =>
              router.push('/timetable-schedules')
            }
          >
            <Ionicons
              name="options-outline"
              size={16}
              color="#002060"
            />
          </TouchableOpacity>
        </View>

        {/* ═══ Track Live Bus Hero Banner ═══ */}

        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroNetBadge}>
              <Text style={styles.heroNetText}>
                WP CORRIDOR NET
              </Text>
            </View>
            <Text style={styles.heroActiveText}>
              {nearbyLoading ? 'Loading live buses…' : `● ${nearbyBuses.length} Live ${nearbyBuses.length === 1 ? 'Bus' : 'Buses'}`}
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            Track Live Bus
          </Text>

          <Text style={styles.heroSub}>
            View bus locations currently shared by admins and conductors.
          </Text>

          <View style={styles.chipRow}>
            {nearbyBuses.slice(0, 3).map((bus) => (
              <View key={bus.bus_id} style={styles.routeChip}>
                <Text style={styles.routeChipText} numberOfLines={1}>● {bus.bus_number} {bus.route_name}</Text>
              </View>
            ))}
            {!nearbyLoading && nearbyBuses.length === 0 && (
              <Text style={styles.heroSub}>{nearbyError || 'No live bus locations available.'}</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => router.push('/')}
          >
            <Text style={styles.heroBtnText}>View Live Buses</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* ═══ Smart Pass Wallet Card ═══ */}

        <View style={styles.walletHeader}>
          <View style={styles.walletTitleRow}>
            <Ionicons
              name="card"
              size={18}
              color="#002060"
            />

            <Text style={styles.walletTitle}>
              LankaTransit SmartPass
            </Text>
          </View>

          <View style={styles.walletHeaderRight}>
            <View style={styles.livePassPill}>
              <View style={styles.livePassDot} />
              <Text style={styles.livePassPillText}>ACTIVE PASS</Text>
            </View>
            <TouchableOpacity
              style={styles.lankaPayPill}
              onPress={handleOpenPassProfile}
            >
              <Text style={styles.lankaPayText}>LANKAPAY</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.walletCard}>
          {/* Card Top: Route, Service & Status */}
          <View style={styles.walletCardHeader}>
            <View style={styles.walletRouteRow}>
              <View style={styles.routePill}>
                <Ionicons name="bus" size={11} color="#FFF" />
                <Text style={styles.routePillText}>Route {activePass.route_number || '138'}</Text>
              </View>
              <Text style={styles.serviceNameText}>{activePass.service_name || 'SLTB AC EXPRESS'}</Text>
            </View>

            <View style={styles.paidBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#059669" />
              <Text style={styles.paidBadgeText}>VALID • PAID</Text>
            </View>
          </View>

          {/* Destination & Stations summary banner */}
          <TouchableOpacity
            style={styles.journeyBox}
            onPress={handleOpenTicketConfirmation}
            activeOpacity={0.8}
          >
            <View style={styles.journeyTop}>
              <Text style={styles.journeyStations}>
                {activePass.origin_name || activePass.origin || 'Maharagama'} ➔ {activePass.destination_name || activePass.destination || 'Colombo Fort'}
              </Text>
            </View>
            <Text style={styles.journeyMeta}>
              {activePass.travel_date || 'Today'} • Departs {activePass.departure_time || '08:45 AM'} • ETA {activePass.arrival_time || '09:30 AM'}
            </Text>
          </TouchableOpacity>

          {/* Middle Row: Stored Fare & Real Live QR Code */}
          <View style={styles.walletMidRow}>
            <View style={styles.walletBalanceCol}>
              <Text style={styles.balanceLabel}>STORED TICKET FARE</Text>
              <Text style={styles.balanceValue}>
                LKR {Number(activePass.fare || 240).toFixed(2)}
              </Text>
              <Text style={styles.tokenText}>
                #{activePass.ticket_token || activePass.ticket_number || 'TRX-948210-LK'}
              </Text>
              <View style={styles.passengerMetaBadge}>
                <Ionicons name="people-outline" size={12} color="#475569" />
                <Text style={styles.passengerMetaText}>
                  {activePass.passenger_type || '2 Adults'} • Contactless Pass
                </Text>
              </View>
            </View>

            {/* Real QR Code Generator */}
            <TouchableOpacity
              style={styles.qrBox}
              onPress={() => setQrModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.qrFrame}>
                <QRCode
                  value={qrCodeData}
                  size={74}
                  color="#002060"
                  backgroundColor="#FFFFFF"
                  ecl="M"
                  quietZone={4}
                />
              </View>
              <View style={styles.qrLabelRow}>
                <Ionicons name="scan-outline" size={10} color="#002060" />
                <Text style={styles.qrSub}>Tap to enlarge</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Action buttons directly connected to purchase flow & confirmation */}
          <View style={styles.walletActionRow}>
            <TouchableOpacity
              style={styles.passBtnPrimary}
              onPress={handleOpenPassProfile}
              activeOpacity={0.85}
            >
              <Ionicons name="qr-code-outline" size={14} color="#FFF" />
              <Text style={styles.passBtnPrimaryText}>View Full Pass</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.passBtnSecondary}
              onPress={handleOpenTicketDetails}
              activeOpacity={0.85}
            >
              <Ionicons name="ticket-outline" size={14} color="#002060" />
              <Text style={styles.passBtnSecondaryText}>Ticket Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.passBtnSecondary}
              onPress={handleOpenTicketConfirmation}
              activeOpacity={0.85}
            >
              <Ionicons name="receipt-outline" size={14} color="#002060" />
              <Text style={styles.passBtnSecondaryText}>Confirmation</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Helper Links Row */}
          <View style={styles.walletSubLinksRow}>
            <TouchableOpacity
              style={styles.subLinkItem}
              onPress={handleSelectTrip}
            >
              <Ionicons name="add-circle-outline" size={13} color="#0D9488" />
              <Text style={styles.subLinkText}>Book New Ticket</Text>
            </TouchableOpacity>

            <View style={styles.subLinkDivider} />

            <TouchableOpacity
              style={styles.subLinkItem}
              onPress={handleTestScanner}
            >
              <Ionicons name="shield-checkmark-outline" size={13} color="#002060" />
              <Text style={styles.subLinkTextDark}>Test in Scanner</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══ Nearby Departures ═══ */}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons
              name="bus-outline"
              size={18}
              color="#002060"
            />

            <Text style={styles.sectionTitle}>
              Nearby Departures
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push('/timetable-schedules')
            }
          >
            <Text style={styles.seeAllText}>
              Bambalapitiya Junction ›
            </Text>
          </TouchableOpacity>
        </View>

        {nearbyLoading ? (
          <ActivityIndicator
            color="#002060"
            style={{ marginVertical: 18 }}
          />
        ) : nearbyError &&
          nearbyBuses.length === 0 ? (
          <View style={styles.nearbyEmpty}>
            <Text style={styles.nearbyEmptyText}>
              {nearbyError}
            </Text>

            <TouchableOpacity
              onPress={() =>
                void loadNearbyBuses()
              }
            >
              <Text style={styles.seeAllText}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : nearbyBuses.length === 0 ? (
          <View style={styles.nearbyEmpty}>
            <Ionicons
              name="bus-outline"
              size={22}
              color="#64748B"
            />

            <Text style={styles.nearbyEmptyText}>
              No buses are sharing a current location.
            </Text>
          </View>
        ) : (
          nearbyBuses
            .slice(0, 5)
            .map((bus) => {
              const etaLabel =
                bus.eta_minutes == null
                  ? bus.source === 'conductor'
                    ? 'GPS LIVE'
                    : 'ETA N/A'
                  : `${bus.eta_minutes} min`;

              const updatedTime = new Date(
                bus.updated_at
              ).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <TouchableOpacity
                  key={bus.bus_id}
                  style={styles.depCard}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname:
                        '/interactive-route-map',
                      params: {
                        busId: bus.bus_id,
                        busNumber: bus.bus_number,
                        routeName: bus.route_name,
                        vehicleRegistration:
                          bus.vehicle_registration ?? '',
                        source: bus.source,
                        etaMinutes:
                          bus.eta_minutes == null
                            ? ''
                            : String(bus.eta_minutes),
                        crowdingLevel:
                          bus.crowding_level ?? '',
                        latitude: String(
                          bus.latitude
                        ),
                        longitude: String(
                          bus.longitude
                        ),
                      },
                    })
                  }
                >
                  <View style={styles.depTopRow}>
                    <View
                      style={
                        bus.source === 'admin'
                          ? styles.busBadgeBox
                          : styles.busBadgeBoxBlue
                      }
                    >
                      <Text
                        style={styles.busBadgeTag}
                      >
                        BUS
                      </Text>

                      <Text
                        style={styles.busBadgeNum}
                      >
                        {bus.bus_number}
                      </Text>
                    </View>

                    <View
                      style={{
                        flex: 1,
                        marginLeft: 10,
                      }}
                    >
                      <Text
                        style={styles.depRouteTitle}
                        numberOfLines={1}
                      >
                        {bus.route_name}
                      </Text>

                      <Text
                        style={styles.depSubDetails}
                        numberOfLines={1}
                      >
                        {bus.vehicle_registration
                          ? `${bus.vehicle_registration} • `
                          : ''}
                        {bus.source === 'admin'
                          ? 'Admin location'
                          : 'Conductor GPS'}
                      </Text>
                    </View>

                    <View
                      style={
                        bus.source === 'admin'
                          ? styles.etaPillGreen
                          : styles.etaPillBlue
                      }
                    >
                      <Text
                        style={
                          bus.source === 'admin'
                            ? styles.etaGreenText
                            : styles.etaBlueText
                        }
                      >
                        {etaLabel}
                      </Text>

                      <Text style={styles.distText}>
                        Live location
                      </Text>
                    </View>
                  </View>

                  <View style={styles.depFooterRow}>
                    <Text
                      style={
                        bus.source === 'admin'
                          ? styles.crowdTextGreen
                          : styles.crowdTextBlue
                      }
                    >
                      {bus.crowding_level
                        ? `● ${bus.crowding_level} crowding`
                        : '● Live bus location'}
                    </Text>

                    <Text style={styles.acText}>
                      Updated {updatedTime}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
        )}

        {/* ═══ Saved Routes Section ═══ */}

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons
              name="bookmark-outline"
              size={18}
              color="#002060"
            />

            <Text style={styles.sectionTitle}>
              Saved Routes
            </Text>
          </View>
          <TouchableOpacity style={styles.addRouteBtn} onPress={() => router.push('/timetable-schedules')}>
            <Text style={styles.addRouteText}>+ Add Route</Text>
          </TouchableOpacity>
        </View>

        {savedRoutes.length === 0 ? (
          <View style={styles.nearbyEmpty}>
            <Text style={styles.nearbyEmptyText}>No saved routes yet. Add one from Timetables.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedScroll}>
            {savedRoutes.map((route) => (
              <TouchableOpacity
                key={route.id}
                style={styles.savedCard}
                activeOpacity={0.7}
                onPress={() => router.push('/timetable-schedules')}
              >
                <View style={styles.savedTop}>
                  <View style={styles.savedBadge}>
                    <Text style={styles.savedBadgeText}>{route.route_number}</Text>
                  </View>
                  <View style={styles.freqPill}>
                    <Text style={styles.freqText}>SAVED</Text>
                  </View>
                </View>
                <Text style={styles.savedRouteText}>
                  {route.origin || 'Origin'} ⇄ {route.destination || 'Destination'}
                </Text>
                <Text style={styles.savedSub}>Saved route</Text>
                <View style={styles.savedFooter}>
                  <Text style={styles.trackLink}>View timetable ›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ═══ Commuter Services Grid ═══ */}

        <Text style={styles.gridHeader}>
          Commuter Services
        </Text>

        <View style={styles.servicesGrid}>
          {([
            { icon: 'map-outline', label: 'Live Bus Map', bg: '#EEF2FF', color: '#002060', route: '/' },
            { icon: 'calendar-outline' as const, label: 'Timetables', bg: '#CCFBF1', color: '#0D9488', route: '/timetable-schedules' },
            { icon: 'search-outline' as const, label: 'Route Search', bg: '#EEF2FF', color: '#002060', route: '/timetable-schedules' },
            { icon: 'navigate-outline' as const, label: 'Conductor GPS', bg: '#CCFBF1', color: '#0D9488', route: '/conductor' },
          ] as const).map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.serviceItem}
              onPress={() => {
                if (item.route) {
                  router.push(item.route);
                }
              }}
            >
              <View style={[styles.serviceCircle, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.serviceLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ═══ Major Advisory Card ═══ */}

        <TouchableOpacity
          style={styles.advisoryCard}
          activeOpacity={0.8}
          onPress={() => router.push('/')}
        >
          <View style={styles.advisoryOverlay}>
            <View style={styles.advisoryTag}>
              <Text style={styles.advisoryTagText}>LIVE BUS LOCATIONS</Text>
            </View>
            <Text style={styles.advisoryTitle}>
              {nearbyBuses.length} bus {nearbyBuses.length === 1 ? 'location' : 'locations'} available
            </Text>
            <Text style={styles.advisorySub}>
              {nearbyError || (nearbyBuses.length ? 'Open the map to view current shared bus positions.' : 'No buses are currently sharing a location.')}
            </Text>
          </View>
        </TouchableOpacity>

        {/* ═══ Auth Status Banner (for non-logged-in users) ═══ */}

        {!isAuthenticated && (
          <TouchableOpacity
            style={styles.authBanner}
            onPress={() => router.push('/login')}
          >
            <View style={styles.authBannerContent}>
              <Ionicons
                name="shield-checkmark"
                size={20}
                color="#002060"
              />

              <View
                style={{
                  flex: 1,
                  marginLeft: 10,
                }}
              >
                <Text
                  style={styles.authBannerTitle}
                >
                  Sign in to unlock all features
                </Text>

                <Text style={styles.authBannerSub}>
                  Save routes and review your account profile
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#002060"
              />
            </View>
          </TouchableOpacity>
        )}

        {/* ═══ Admin Access (hidden for non-admins, accessible via long-press on version) ═══ */}

        <TouchableOpacity
          style={styles.versionFooterRow}
          onLongPress={() => router.push('/admin' as any)}
          delayLongPress={2000}
        >
          <Text style={styles.versionFooter}>
            TransitLK Mobility v2.4 • Ministry of Transport & Highways
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ═══ QR Code Modal for Boarding Inspection ═══ */}
      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setQrModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>LankaTransit Boarding Pass</Text>
                <Text style={styles.modalSub}>
                  Route {activePass.route_number || '138'} • #{activePass.ticket_token || activePass.ticket_number}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setQrModalVisible(false)}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalQrContainer}>
              <QRCode
                value={qrCodeData}
                size={200}
                color="#002060"
                backgroundColor="#FFFFFF"
                ecl="M"
                quietZone={8}
              />
            </View>

            <View style={styles.modalTripInfo}>
              <Text style={styles.modalTripStations}>
                {activePass.origin_name || activePass.origin || 'Maharagama'} ➔ {activePass.destination_name || activePass.destination || 'Colombo Fort'}
              </Text>
              <Text style={styles.modalTripMeta}>
                Fare: LKR {Number(activePass.fare || 240).toFixed(2)} • {activePass.passenger_type || '2 Adults'}
              </Text>
              <Text style={styles.modalInstruction}>
                Show this QR code to the bus conductor or hold against the contactless validator.
              </Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnPrimary}
                onPress={() => {
                  setQrModalVisible(false);
                  handleOpenPassProfile();
                }}
              >
                <Ionicons name="card-outline" size={16} color="#FFF" />
                <Text style={styles.modalBtnPrimaryText}>Open Pass Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBtnSecondary}
                onPress={() => {
                  setQrModalVisible(false);
                  handleTestScanner();
                }}
              >
                <Ionicons name="qr-code-outline" size={16} color="#002060" />
                <Text style={styles.modalBtnSecondaryText}>Test in Scanner</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    padding: 16,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#002060',
  },

  // ── Header ──

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

  // ── Greeting ──

  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  greetingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002060',
  },

  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },

  weatherText: {
    fontSize: 10,
    color: '#64748B',
  },

  gpsPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  gpsPillText: {
    color: '#166534',
    fontWeight: 'bold',
    fontSize: 10,
  },

  // ── Search ──

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 44,
    gap: 8,
    marginBottom: 15,
  },

  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
  },

  filterBtn: {
    backgroundColor: '#EEF2FF',
    padding: 6,
    borderRadius: 6,
  },

  // ── Hero Card ──

  heroCard: {
    backgroundColor: '#002060',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },

  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  heroNetBadge: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  heroNetText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 9,
  },

  heroActiveText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: 'bold',
  },

  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },

  heroSub: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 12,
  },

  chipRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },

  routeChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  routeChipText: {
    color: '#FFF',
    fontSize: 10,
  },

  heroBtn: {
    backgroundColor: '#0D9488',
    height: 42,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  heroBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },

  // ── Wallet Card ──

  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  walletTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  walletTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#002060',
  },

  walletHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  livePassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },

  livePassDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },

  livePassPillText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#15803D',
  },

  lankaPayPill: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  lankaPayText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0D9488',
  },

  walletCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    shadowColor: '#002060',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  walletCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  walletRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#002060',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  routePillText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 11,
  },

  serviceNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },

  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  paidBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },

  journeyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#002060',
  },

  journeyTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  journeyStations: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  journeyMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  walletMidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    marginBottom: 14,
    gap: 12,
  },

  walletBalanceCol: {
    flex: 1,
  },

  balanceLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },

  balanceValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#002060',
    marginVertical: 1,
  },

  tokenText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
    marginBottom: 4,
  },

  passengerMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },

  passengerMetaText: {
    fontSize: 10,
    color: '#64748B',
  },

  qrBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  qrFrame: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    overflow: 'hidden',
  },

  qrLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },

  qrSub: {
    fontSize: 9,
    fontWeight: '600',
    color: '#002060',
  },

  walletActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },

  passBtnPrimary: {
    flex: 1.2,
    backgroundColor: '#002060',
    height: 38,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },

  passBtnPrimaryText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 11,
  },

  passBtnSecondary: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    height: 38,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },

  passBtnSecondaryText: {
    color: '#002060',
    fontWeight: 'bold',
    fontSize: 11,
  },

  walletSubLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 16,
  },

  subLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },

  subLinkDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#CBD5E1',
  },

  subLinkText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D9488',
  },

  subLinkTextDark: {
    fontSize: 11,
    fontWeight: '600',
    color: '#002060',
  },

  // ── Modal Styles ──

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: '#FFF',
    width: '100%',
    maxWidth: 380,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },

  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002060',
  },

  modalSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  modalCloseBtn: {
    padding: 4,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },

  modalQrContainer: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 14,
  },

  modalTripInfo: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },

  modalTripStations: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 3,
  },

  modalTripMeta: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    marginBottom: 6,
  },

  modalInstruction: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
  },

  modalActions: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },

  modalBtnPrimary: {
    flex: 1,
    backgroundColor: '#002060',
    height: 42,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },

  modalBtnPrimaryText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  modalBtnSecondary: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    height: 42,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },

  modalBtnSecondaryText: {
    color: '#002060',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // ── Section Headers ──

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#002060',
  },

  seeAllText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#002060',
  },

  nearbyEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },

  nearbyEmptyText: {
    flex: 1,
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },

  // ── Departure Cards ──

  depCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  depTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  busBadgeBox: {
    backgroundColor: '#002060',
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
    width: 44,
  },

  busBadgeBoxBlue: {
    backgroundColor: '#1E3A8A',
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
    width: 44,
  },

  busBadgeTag: {
    color: '#93C5FD',
    fontSize: 8,
    fontWeight: 'bold',
  },

  busBadgeNum: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  depRouteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  depSubDetails: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },

  etaPillGreen: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'flex-end',
  },

  etaGreenText: {
    color: '#166534',
    fontWeight: 'bold',
    fontSize: 12,
  },

  etaPillBlue: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'flex-end',
  },

  etaBlueText: {
    color: '#1E40AF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  distText: {
    fontSize: 9,
    color: '#64748B',
  },

  depFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    marginTop: 8,
  },

  crowdTextGreen: {
    fontSize: 10,
    color: '#0D9488',
    fontWeight: '600',
  },

  crowdTextBlue: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: '600',
  },

  acText: {
    fontSize: 10,
    color: '#64748B',
  },

  // ── Saved Routes ──

  addRouteBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  addRouteText: {
    color: '#002060',
    fontWeight: 'bold',
    fontSize: 11,
  },

  savedScroll: {
    gap: 10,
    marginBottom: 20,
  },

  savedCard: {
    width: 180,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
  },

  savedTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  savedBadge: {
    backgroundColor: '#002060',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  savedBadgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 11,
  },

  freqPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  freqText: {
    color: '#166534',
    fontSize: 9,
    fontWeight: 'bold',
  },

  savedRouteText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  savedSub: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 8,
  },

  savedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },

  trafficText: {
    fontSize: 9,
    color: '#0D9488',
    fontWeight: 'bold',
  },

  jamText: {
    fontSize: 9,
    color: '#DC2626',
    fontWeight: 'bold',
  },

  trackLink: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#002060',
  },

  // ── Commuter Services ──

  gridHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#002060',
    marginBottom: 10,
  },

  servicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  serviceItem: {
    alignItems: 'center',
    width: '22%',
  },

  serviceCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },

  serviceLabel: {
    fontSize: 10,
    color: '#475569',
    textAlign: 'center',
  },

  // ── Advisory ──

  advisoryCard: {
    height: 110,
    backgroundColor: '#002060',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },

  advisoryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,32,96,0.85)',
    padding: 12,
    justifyContent: 'flex-end',
  },

  advisoryTag: {
    backgroundColor: '#D97706',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },

  advisoryTagText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
  },

  advisoryTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },

  advisorySub: {
    color: '#CBD5E1',
    fontSize: 10,
  },

  // ── Auth Banner ──

  authBanner: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },

  authBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  authBannerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#002060',
  },

  authBannerSub: {
    fontSize: 10,
    color: '#475569',
    marginTop: 2,
  },

  // ── Footer ──

  versionFooterRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },

  versionFooter: {
    textAlign: 'center',
    fontSize: 10,
    color: '#94A3B8',
  },
});