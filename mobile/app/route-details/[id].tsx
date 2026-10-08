
import { Ionicons } from '@expo/vector-icons';
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../../services/supabase';

type CrowdingLevel =
  | 'Low'
  | 'Medium'
  | 'High'
  | 'No data'
  | 'Unavailable';

type TabType = 'stops' | 'info';

const BLUE = '#2563EB';
const NAVY = '#0D1930';
const MUTED = '#8B9AB2';

const stops = [
  {
    name: 'Pettah',
    detail: 'Origin terminal',
    time: 'Departed',
    status: 'completed',
  },
  {
    name: 'Town Hall',
    detail: 'City centre',
    time: 'Departed',
    status: 'completed',
  },
  {
    name: 'Nugegoda',
    detail: 'Current stop (sample)',
    time: 'Current',
    status: 'current',
  },
  {
    name: 'Maharagama',
    detail: 'Upcoming stop',
    time: '10 min',
    status: 'upcoming',
  },
  {
    name: 'Homagama',
    detail: 'Destination terminal',
    time: '25 min',
    status: 'end',
  },
];

const getCrowdingColor = (level: CrowdingLevel) => {
  if (level === 'Low') return '#059669';
  if (level === 'Medium') return '#D97706';
  if (level === 'High') return '#DC2626';
  return '#64748B';
};

export default function RouteDetailsScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{
    id?: string | string[];
  }>();

  const routeNumber = Array.isArray(id)
    ? id[0] || '138'
    : id || '138';

  const [activeTab, setActiveTab] =
    useState<TabType>('stops');

  const [crowdingLevel, setCrowdingLevel] =
    useState<CrowdingLevel>('No data');

  const [crowdingLoading, setCrowdingLoading] =
    useState(true);

  const [userId, setUserId] =
    useState<string | null>(null);

  const [savedRouteId, setSavedRouteId] =
    useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  // Preserve the existing Supabase crowding calculation.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadCrowding = async () => {
        setCrowdingLoading(true);
        setCrowdingLevel('No data');

        try {
          const { data, error } = await supabase
            .from('crowding_reports')
            .select('crowding_level')
            .eq('route_number', routeNumber)
            .order('created_at', {
              ascending: false,
            })
            .limit(100);

          if (!active) return;

          if (error) {
            console.log('CROWDING READ ERROR:', error);
            setCrowdingLevel('Unavailable');
            return;
          }

          const scores: number[] = [];

          for (const report of data ?? []) {
            const level = report.crowding_level
              ?.trim()
              .toLowerCase();

            if (level === 'low') {
              scores.push(1);
            } else if (level === 'medium') {
              scores.push(2);
            } else if (level === 'high') {
              scores.push(3);
            }
          }

          if (scores.length === 0) {
            setCrowdingLevel('No data');
            return;
          }

          const average =
            scores.reduce(
              (sum, score) => sum + score,
              0
            ) / scores.length;

          const calculatedLevel: CrowdingLevel =
            average < 1.5
              ? 'Low'
              : average < 2.5
                ? 'Medium'
                : 'High';

          setCrowdingLevel(calculatedLevel);
        } catch (error) {
          console.log('CROWDING FETCH ERROR:', error);

          if (active) {
            setCrowdingLevel('Unavailable');
          }
        } finally {
          if (active) {
            setCrowdingLoading(false);
          }
        }
      };

      loadCrowding();

      return () => {
        active = false;
      };
    }, [routeNumber])
  );

  // Preserve existing saved_routes integration.
  useEffect(() => {
    let active = true;

    const loadSavedRoute = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (userError || !user) {
        setUserId(null);
        setSavedRouteId(null);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from('saved_routes')
        .select('id')
        .eq('user_id', user.id)
        .eq('route_number', routeNumber)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.log('SAVED ROUTE READ ERROR:', error);
        return;
      }

      setSavedRouteId(data?.id ?? null);
    };

    loadSavedRoute();

    return () => {
      active = false;
    };
  }, [routeNumber]);

  const handleSaveRoute = async () => {
    if (saving) return;

    if (!userId) {
      Alert.alert(
        'Sign in required',
        'Please sign in to save this route.'
      );
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
          Alert.alert(
            'Error',
            'Unable to remove this saved route.'
          );
          return;
        }

        setSavedRouteId(null);
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
          Alert.alert(
            'Error',
            'Unable to save this route.'
          );
          return;
        }

        setSavedRouteId(data.id);
      }
    } catch (error) {
      console.log('SAVE ROUTE ERROR:', error);
      Alert.alert(
        'Error',
        'Something went wrong. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const openCrowding = () => {
    router.push({
      pathname: '/crowding',
      params: {
        routeNumber: String(routeNumber),
      },
    });
  };

  const crowdingText = crowdingLoading
    ? 'Loading...'
    : crowdingLevel;

  const crowdingColor =
    getCrowdingColor(crowdingLevel);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={NAVY}
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Route & Stop Details
          </Text>
          <Text style={styles.headerSubtitle}>
            TransitLK • Bus {routeNumber}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSaveRoute}
          disabled={saving}
          style={styles.headerAction}
        >
          <Ionicons
            name={
              savedRouteId
                ? 'star'
                : 'star-outline'
            }
            size={23}
            color="#F5A400"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dark route card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroBusIcon}>
              <Ionicons
                name="bus"
                size={25}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.heroInformation}>
              <View style={styles.heroNameRow}>
                <Text style={styles.heroBusName}>
                  Bus {routeNumber}
                </Text>

                <View style={styles.demoBadge}>
                  <View style={styles.greenDot} />
                  <Text style={styles.demoBadgeText}>
                    Route Overview
                  </Text>
                </View>
              </View>

              <Text style={styles.heroDescription}>
                TransitLK Bus Service
              </Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroBottom}>
            <View style={styles.heroRouteRow}>
              <Text style={styles.heroPlace}>
                Pettah
              </Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color="#CBD5E1"
              />
              <Text style={styles.heroPlace}>
                Homagama
              </Text>
            </View>

            <Text style={styles.heroNote}>
              Sample route
            </Text>
          </View>
        </View>

        {/* Two tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'stops' &&
                styles.activeTab,
            ]}
            onPress={() => setActiveTab('stops')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'stops' &&
                  styles.activeTabText,
              ]}
            >
              Stops & Timeline
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'info' &&
                styles.activeTab,
            ]}
            onPress={() => setActiveTab('info')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'info' &&
                  styles.activeTabText,
              ]}
            >
              Route Info
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'stops' ? (
          <>
            {/* Current stop card */}
            <View style={styles.currentStopCard}>
              <View style={styles.currentStopTop}>
                <View style={styles.pinIcon}>
                  <Ionicons
                    name="location-outline"
                    size={23}
                    color={BLUE}
                  />
                </View>

                <View style={styles.currentStopInfo}>
                  <View style={styles.inlineRow}>
                    <Text style={styles.currentStopName}>
                      Nugegoda
                    </Text>

                    <View style={styles.nextStopBadge}>
                      <Text style={styles.nextStopText}>
                        Sample stop
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.currentStopDescription}>
                    Current location shown for demo
                  </Text>
                </View>

                <View style={styles.etaBadge}>
                  <Text style={styles.etaLabel}>
                    ETA
                  </Text>
                  <Text style={styles.etaValue}>
                    10 min
                  </Text>
                </View>
              </View>

              <View style={styles.currentStopDivider} />

              <View style={styles.currentStopFooter}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={MUTED}
                />
                <Text style={styles.sampleNotice}>
                  Estimated timing • Demo data
                </Text>
              </View>
            </View>

            {/* Timeline */}
            <View style={styles.whiteCard}>
              <View style={styles.cardHeadingRow}>
                <Text style={styles.cardHeading}>
                  Route Timeline
                </Text>

                <View style={styles.stopCountBadge}>
                  <Text style={styles.stopCountText}>
                    {stops.length} Stops
                  </Text>
                </View>
              </View>

              {stops.map((stop, index) => {
                const completed =
                  stop.status === 'completed';

                const current =
                  stop.status === 'current';

                const isLast =
                  index === stops.length - 1;

                return (
                  <View
                    key={stop.name}
                    style={styles.timelineRow}
                  >
                    <View style={styles.timelineTrack}>
                      <View
                        style={[
                          styles.timelineCircle,
                          completed &&
                            styles.completedCircle,
                          current &&
                            styles.activeCircle,
                          isLast &&
                            styles.lastCircle,
                        ]}
                      >
                        {completed && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color="#8BA0BA"
                          />
                        )}

                        {current && (
                          <View
                            style={styles.activeInner}
                          />
                        )}

                        {isLast && (
                          <View
                            style={styles.lastInner}
                          />
                        )}
                      </View>

                      {!isLast && (
                        <View
                          style={[
                            styles.timelineLine,
                            completed &&
                              styles.completedLine,
                          ]}
                        />
                      )}
                    </View>

                    <View
                      style={[
                        styles.timelineContent,
                        current &&
                          styles.activeStopContent,
                      ]}
                    >
                      <View style={styles.stopHeadingRow}>
                        <View style={styles.stopNameRow}>
                          <Text
                            style={[
                              styles.stopName,
                              current &&
                                styles.activeStopName,
                            ]}
                          >
                            {stop.name}
                          </Text>

                          {current && (
                            <View
                              style={styles.activeTag}
                            >
                              <Text
                                style={styles.activeTagText}
                              >
                                CURRENT
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text
                          style={[
                            styles.stopTime,
                            current &&
                              styles.activeStopTime,
                          ]}
                        >
                          {stop.time}
                        </Text>
                      </View>

                      <Text style={styles.stopDetail}>
                        {stop.detail}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <>
            {/* Route info tab */}
            <View style={styles.whiteCard}>
              <Text style={styles.cardHeading}>
                Route Information
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Route Number
                </Text>
                <Text style={styles.infoValue}>
                  {routeNumber}
                </Text>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Origin
                </Text>
                <Text style={styles.infoValue}>
                  Pettah
                </Text>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Destination
                </Text>
                <Text style={styles.infoValue}>
                  Homagama
                </Text>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Total Stops
                </Text>
                <Text style={styles.infoValue}>
                  {stops.length}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Smart crowding: real Supabase data */}
        <TouchableOpacity
          style={styles.crowdingCard}
          onPress={openCrowding}
          activeOpacity={0.85}
        >
          <View style={styles.crowdingIcon}>
            <Ionicons
              name="people"
              size={23}
              color={crowdingColor}
            />
          </View>

          <View style={styles.crowdingContent}>
            <Text style={styles.crowdingHeading}>
              Smart Crowding
            </Text>

            {crowdingLoading ? (
              <ActivityIndicator
                size="small"
                color={BLUE}
                style={{ alignSelf: 'flex-start' }}
              />
            ) : (
              <Text
                style={[
                  styles.crowdingStatus,
                  { color: crowdingColor },
                ]}
              >
                {crowdingText}
              </Text>
            )}

            <Text style={styles.crowdingSubtitle}>
              Passenger-reported crowding
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color={BLUE}
          />
        </TouchableOpacity>

        {/* GPS section - no fake live GPS */}
        <View style={styles.whiteCard}>
          <View style={styles.cardHeadingRow}>
            <View style={styles.inlineRow}>
              <View style={styles.greenDot} />
              <Text style={styles.cardHeading}>
                Route Map
              </Text>
            </View>

            <Text style={styles.mapCaption}>
              Explore route
            </Text>
          </View>

          <View style={styles.mapPlaceholder}>
            <Ionicons
              name="map-outline"
              size={48}
              color="#8BA7D8"
            />
            <Text style={styles.mapPlaceholderTitle}>
              Interactive Route Map
            </Text>
            <Text style={styles.mapPlaceholderText}>
              View available bus location and route
              information on the map screen.
            </Text>

            <TouchableOpacity
              style={styles.mapButton}
              onPress={() =>
                router.push('/interactive-route-map')
              }
            >
              <Ionicons
                name="map-outline"
                size={17}
                color="#FFFFFF"
              />
              <Text style={styles.mapButtonText}>
                View Map
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trip information */}
        <View style={styles.whiteCard}>
          <Text style={styles.smallSectionTitle}>
            TRIP INFORMATION
          </Text>

          <View style={styles.tripInfoRow}>
            <View style={styles.tripInfoBox}>
              <Text style={styles.tripInfoLabel}>
                Estimated Arrival
              </Text>
              <Text style={styles.tripInfoValue}>
                25 min
              </Text>
              <Text style={styles.tripInfoHint}>
                Sample estimate
              </Text>
            </View>

            <View style={styles.tripInfoBox}>
              <Text style={styles.tripInfoLabel}>
                Crowding Level
              </Text>
              <Text
                style={[
                  styles.tripInfoValue,
                  { color: crowdingColor },
                ]}
              >
                {crowdingText}
              </Text>
              <Text style={styles.tripInfoHint}>
                From Supabase reports
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          Route stops and arrival times are sample
          information. Crowding levels are calculated
          from passenger-submitted reports.
        </Text>
      </ScrollView>

      {/* Bottom action: SAVE ROUTE, not Pay Ticket */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            savedRouteId && styles.savedButton,
            saving && styles.disabledButton,
          ]}
          onPress={handleSaveRoute}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons
                name={
                  savedRouteId
                    ? 'bookmark'
                    : 'bookmark-outline'
                }
                size={21}
                color="#FFFFFF"
              />

              <Text style={styles.saveButtonText}>
                {savedRouteId
                  ? 'Remove Saved Route'
                  : 'Save Route'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },

  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9EDF4',
  },

  backButton: {
    width: 34,
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
    marginLeft: 8,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: NAVY,
  },

  headerSubtitle: {
    fontSize: 11,
    color: MUTED,
    marginTop: 3,
  },

  headerAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 17,
    paddingTop: 16,
    paddingBottom: 25,
  },

  heroCard: {
    backgroundColor: NAVY,
    borderRadius: 20,
    padding: 17,
    marginBottom: 17,
    elevation: 4,
    shadowColor: '#0D1930',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroBusIcon: {
    width: 49,
    height: 49,
    borderRadius: 14,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroInformation: {
    flex: 1,
    marginLeft: 12,
  },

  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },

  heroBusName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#123B3A',
  },

  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 5,
  },

  demoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5EEAD4',
  },

  heroDescription: {
    fontSize: 11,
    color: '#B8C5D8',
    marginTop: 4,
  },

  heroDivider: {
    height: 1,
    backgroundColor: '#28374E',
    marginVertical: 17,
  },

  heroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  heroRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },

  heroPlace: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  heroNote: {
    fontSize: 10,
    color: '#B8C5D8',
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E7ECF3',
    borderRadius: 13,
    padding: 4,
    marginBottom: 16,
  },

  tab: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },

  tabText: {
    fontSize: 12,
    color: '#53627A',
    fontWeight: '600',
  },

  activeTabText: {
    color: NAVY,
    fontWeight: '800',
  },

  currentStopCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    borderLeftWidth: 5,
    borderLeftColor: BLUE,
    marginBottom: 17,
    borderWidth: 1,
    borderColor: '#E2EBFA',
  },

  currentStopTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pinIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  currentStopInfo: {
    flex: 1,
  },

  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  currentStopName: {
    fontSize: 15,
    fontWeight: '800',
    color: NAVY,
  },

  nextStopBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 5,
    marginLeft: 6,
  },

  nextStopText: {
    fontSize: 9,
    color: BLUE,
    fontWeight: '700',
  },

  currentStopDescription: {
    fontSize: 11,
    color: MUTED,
    marginTop: 5,
  },

  etaBadge: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: 13,
    paddingHorizontal: 11,
    paddingVertical: 8,
    alignItems: 'center',
  },

  etaLabel: {
    fontSize: 10,
    color: '#0F766E',
  },

  etaValue: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '800',
  },

  currentStopDivider: {
    height: 1,
    backgroundColor: '#E9EDF4',
    marginVertical: 14,
  },

  currentStopFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sampleNotice: {
    fontSize: 11,
    color: MUTED,
    marginLeft: 6,
  },

  whiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 17,
    borderWidth: 1,
    borderColor: '#EDF0F5',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOpacity: 0.035,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
  },

  cardHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: NAVY,
  },

  stopCountBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  stopCountText: {
    fontSize: 11,
    color: '#64748B',
  },

  timelineRow: {
    flexDirection: 'row',
    minHeight: 75,
  },

  timelineTrack: {
    width: 29,
    alignItems: 'center',
  },

  timelineCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  completedCircle: {
    backgroundColor: '#F1F5F9',
  },

  activeCircle: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },

  activeInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },

  lastCircle: {
    borderColor: '#94A3B8',
  },

  lastInner: {
    width: 9,
    height: 9,
    borderRadius: 2,
    backgroundColor: NAVY,
  },

  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 3,
  },

  completedLine: {
    backgroundColor: '#B8C8E3',
  },

  timelineContent: {
    flex: 1,
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingTop: 3,
    paddingBottom: 15,
    marginBottom: 8,
    borderRadius: 11,
  },

  activeStopContent: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#CFE0FF',
    paddingTop: 11,
  },

  stopHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  stopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    flexWrap: 'wrap',
    gap: 5,
  },

  stopName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#52637C',
  },

  activeStopName: {
    color: '#173A87',
    fontWeight: '800',
  },

  activeTag: {
    backgroundColor: BLUE,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },

  activeTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  stopTime: {
    fontSize: 10,
    color: MUTED,
    marginLeft: 5,
  },

  activeStopTime: {
    color: BLUE,
    fontWeight: '800',
  },

  stopDetail: {
    fontSize: 10,
    color: MUTED,
    marginTop: 6,
  },

  crowdingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 16,
    marginBottom: 17,
    borderWidth: 1,
    borderColor: '#E5EAF3',
    flexDirection: 'row',
    alignItems: 'center',
  },

  crowdingIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  crowdingContent: {
    flex: 1,
  },

  crowdingHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: NAVY,
  },

  crowdingStatus: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },

  crowdingSubtitle: {
    fontSize: 10,
    color: MUTED,
    marginTop: 3,
  },

  mapCaption: {
    fontSize: 10,
    color: MUTED,
  },

  mapPlaceholder: {
    backgroundColor: '#EDF4FF',
    borderRadius: 13,
    minHeight: 185,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },

  mapPlaceholderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#173A87',
    marginTop: 8,
  },

  mapPlaceholderText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 17,
  },

  mapButton: {
    backgroundColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
    gap: 7,
  },

  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  smallSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.7,
    marginBottom: 12,
  },

  tripInfoRow: {
    flexDirection: 'row',
    gap: 10,
  },

  tripInfoBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF1F5',
    borderRadius: 13,
    padding: 12,
  },

  tripInfoLabel: {
    fontSize: 10,
    color: MUTED,
  },

  tripInfoValue: {
    fontSize: 16,
    fontWeight: '800',
    color: NAVY,
    marginTop: 6,
  },

  tripInfoHint: {
    fontSize: 10,
    color: '#0D9488',
    marginTop: 5,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },

  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },

  infoValue: {
    fontSize: 13,
    fontWeight: '800',
    color: NAVY,
  },

  infoDivider: {
    height: 1,
    backgroundColor: '#EDF1F5',
  },

  disclaimer: {
    fontSize: 10,
    lineHeight: 16,
    color: MUTED,
    textAlign: 'center',
    marginBottom: 10,
    marginHorizontal: 12,
  },

  bottomActionBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 11,
    paddingBottom: 13,
    borderTopWidth: 1,
    borderTopColor: '#E5EAF1',
  },

  saveButton: {
    backgroundColor: BLUE,
    borderRadius: 13,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  savedButton: {
    backgroundColor: NAVY,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
