import React, { useState, useEffect, useCallback } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import { router, useFocusEffect } from 'expo-router';

import { supabase } from '../../services/supabase';

import {
  fetchLiveBusLocations,
  type LiveBusLocation,
} from '../../services/liveBusLocations';

import type { Profile, SavedRoute } from '../../types/database';

export default function HomeDashboardScreen() {
  // ── Auth & Profile State ──
  const [userName, setUserName] = useState<string>('Commuter');
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Data State ──
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
  const [nearbyBuses, setNearbyBuses] = useState<LiveBusLocation[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(true);
  const [nearbyError, setNearbyError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Load session & profile on mount and when tab gains focus ──
  useFocusEffect(
    useCallback(() => {
      void loadSession();
      void loadNearbyBuses();
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

  async function handleRefresh() {
    setRefreshing(true);

    await Promise.all([
      loadSession(),
      loadNearbyBuses(),
    ]);

    setRefreshing(false);
  }

  function handleSearch() {
    if (searchQuery.trim()) {
      router.push('/timetable-schedules');
    }
  }

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
              onPress={() => router.push('/modal')}
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
            </View>
          </View>

          <View style={styles.gpsPill}>
            <Text style={styles.gpsPillText}>
              ● GPS Live
            </Text>
          </View>
        </View>

        {/* ═══ Search Bar ═══ */}

        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color="#64748B"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search bus, train or station (138, Fort, Kandy)..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />

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
              ● 120+ Active Lines
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            Track Live Bus
          </Text>

          <Text style={styles.heroSub}>
            Real-time telemetry across Western Province rail & SLTB commuter routes.
          </Text>

          <View style={styles.chipRow}>
            <View style={styles.routeChip}>
              <Text style={styles.routeChipText}>
                ● 138 Pettah
              </Text>
            </View>

            <View style={styles.routeChip}>
              <Text style={styles.routeChipText}>
                ● 177 Kollupitiya
              </Text>
            </View>

            <View style={styles.routeChip}>
              <Text style={styles.routeChipText}>
                ● Coastal Line
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => router.push('/')}
          >
            <Text style={styles.heroBtnText}>
              View Live Conductor GPS
            </Text>

            <Ionicons
              name="arrow-forward"
              size={16}
              color="#FFF"
            />
          </TouchableOpacity>
        </View>

        {/* ═══ Smart Pass Wallet Card ═══ */}

        <View style={styles.walletHeader}>
          <View style={styles.walletTitleRow}>
            <Ionicons
              name="card-outline"
              size={18}
              color="#002060"
            />

            <Text style={styles.walletTitle}>
              LankaTransit SmartPass
            </Text>
          </View>

          <View style={styles.lankaPayPill}>
            <Text style={styles.lankaPayText}>
              LankaPay Auto
            </Text>
          </View>
        </View>

        <View style={styles.walletCard}>
          <View style={styles.walletCardHeader}>
            <Text style={styles.tripStatusText}>
              ● ACTIVE TRIP: IN TRANSIT
            </Text>

            <Text style={styles.fareText}>
              Fare: LKR 70.00
            </Text>
          </View>

          <Text style={styles.stationText}>
            Bambalapitiya ➔ Colombo Fort
          </Text>

          <View style={styles.walletMidRow}>
            <View>
              <Text style={styles.balanceLabel}>
                Balance:
              </Text>

              <Text style={styles.balanceValue}>
                LKR 1,450.00
              </Text>

              <Text style={styles.tokenText}>
                TOKEN: SEC-8824-LK{' '}

                <Text
                  style={{
                    color: '#0D9488',
                    fontWeight: 'bold',
                  }}
                >
                  Tap & Ride
                </Text>
              </Text>
            </View>

            {/* Simulated QR Code */}

            <TouchableOpacity
              style={styles.qrBox}
              onPress={() => {
                if (isAuthenticated) {
                  router.push('/transit-pass');
                } else {
                  router.push('/login');
                }
              }}
            >
              <Ionicons
                name="qr-code"
                size={42}
                color="#002060"
              />

              <Text style={styles.qrSub}>
                Tap to Zoom
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.walletActionRow}>
            <TouchableOpacity
              style={styles.passBtnPrimary}
              onPress={() => {
                if (isAuthenticated) {
                  router.push('/transit-pass');
                } else {
                  router.push('/login');
                }
              }}
            >
              <Ionicons
                name="qr-code-outline"
                size={16}
                color="#FFF"
              />

              <Text style={styles.passBtnPrimaryText}>
                Show QR Pass
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.passBtnSecondary}
            >
              <Ionicons
                name="add-circle-outline"
                size={16}
                color="#002060"
              />

              <Text style={styles.passBtnSecondaryText}>
                Top-Up (LankaQR)
              </Text>
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

          <TouchableOpacity
            style={styles.addRouteBtn}
          >
            <Text style={styles.addRouteText}>
              + Add Route
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.savedScroll}
        >
          {/* Show saved routes from Supabase, or fallback to static data */}

          {(savedRoutes.length > 0
            ? savedRoutes
            : [
                {
                  id: '1',
                  route_number: '138',
                  origin: 'Fort',
                  destination: 'Maharagama',
                  user_id: '',
                  created_at: '',
                },
                {
                  id: '2',
                  route_number: '177',
                  origin: 'Kollupitiya',
                  destination: '...',
                  user_id: '',
                  created_at: '',
                },
              ]
          ).map((route, idx) => (
            <TouchableOpacity
              key={route.id || idx}
              style={styles.savedCard}
              activeOpacity={0.7}
              onPress={() =>
                router.push(
                  '/timetable-schedules'
                )
              }
            >
              <View style={styles.savedTop}>
                <View style={styles.savedBadge}>
                  <Text
                    style={styles.savedBadgeText}
                  >
                    {route.route_number}
                  </Text>
                </View>

                {idx === 0 && (
                  <View style={styles.freqPill}>
                    <Text style={styles.freqText}>
                      Every 4m
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.savedRouteText}>
                {route.origin} ⇄ {route.destination}
              </Text>

              <Text style={styles.savedSub}>
                {idx === 0
                  ? 'Morning Office Commute'
                  : 'Evening Return Route'}
              </Text>

              <View style={styles.savedFooter}>
                {idx === 0 ? (
                  <>
                    <Text style={styles.trafficText}>
                      ✓ Normal Traffic
                    </Text>

                    <Text style={styles.trackLink}>
                      Track ›
                    </Text>
                  </>
                ) : (
                  <Text style={styles.jamText}>
                    ⚠️ Rajagiriya Jam
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ═══ Commuter Services Grid ═══ */}

        <Text style={styles.gridHeader}>
          Commuter Services
        </Text>

        <View style={styles.servicesGrid}>
          {([
            {
              icon: 'map-outline',
              label: 'Live Bus Map',
              bg: '#EEF2FF',
              color: '#002060',
              route: '/',
            },
            {
              icon: 'calendar-outline' as const,
              label: 'Timetables',
              bg: '#CCFBF1',
              color: '#0D9488',
              route: '/timetable-schedules',
            },
            {
              icon: 'calculator-outline' as const,
              label: 'Fare Finder',
              bg: '#EEF2FF',
              color: '#002060',
              route: '/timetable-schedules',
            },
            {
              icon: 'navigate-outline' as const,
              label: 'Conductor GPS',
              bg: '#CCFBF1',
              color: '#0D9488',
              route: '/conductor',
            },
          ] as const).map(
            (item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.serviceItem}
                onPress={() => {
                  if (item.route) {
                    router.push(item.route);
                  }
                }}
              >
                <View
                  style={[
                    styles.serviceCircle,
                    {
                      backgroundColor: item.bg,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.color}
                  />
                </View>

                <Text style={styles.serviceLabel}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        {/* ═══ Major Advisory Card ═══ */}

        <TouchableOpacity
          style={styles.advisoryCard}
          activeOpacity={0.8}
          onPress={() => router.push('/')}
        >
          <View style={styles.advisoryOverlay}>
            <View style={styles.advisoryTag}>
              <Text style={styles.advisoryTagText}>
                MAJOR HUB ADVISORY
              </Text>
            </View>

            <Text style={styles.advisoryTitle}>
              Fort Central Multi–Modal Terminal
            </Text>

            <Text style={styles.advisorySub}>
              Normal interchange between Railway Platforms 1–8 & Central Bus Stand
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
                  Save routes, use Smart Pass QR, receive real-time alerts
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

  lankaPayPill: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
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
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },

  walletCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  tripStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0D9488',
  },

  fareText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#002060',
  },

  stationText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },

  walletMidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginBottom: 12,
  },

  balanceLabel: {
    fontSize: 10,
    color: '#64748B',
  },

  balanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#002060',
  },

  tokenText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },

  qrBox: {
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 6,
    borderRadius: 8,
  },

  qrSub: {
    fontSize: 8,
    color: '#002060',
    marginTop: 2,
  },

  walletActionRow: {
    flexDirection: 'row',
    gap: 8,
  },

  passBtnPrimary: {
    flex: 1,
    backgroundColor: '#002060',
    height: 40,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },

  passBtnPrimaryText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },

  passBtnSecondary: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    height: 40,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },

  passBtnSecondaryText: {
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