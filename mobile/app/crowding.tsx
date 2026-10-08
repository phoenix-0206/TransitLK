
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../services/supabase';

type Level = 'Low' | 'Medium' | 'High';
type Section = 'Front' | 'Middle' | 'Rear';

type CrowdingReport = {
  id: string;
  created_at: string;
  route_number: string;
  crowding_level: string;
  passenger_count: number | null;
  capacity: number | null;
  section: string | null;
};

const NAVY = '#002060';
const BLUE = '#2563EB';
const SECTIONS: Section[] = ['Front', 'Middle', 'Rear'];
const LEVELS: Level[] = ['Low', 'Medium', 'High'];

const levelColors: Record<Level, {
  color: string;
  background: string;
}> = {
  Low: { color: '#15803D', background: '#DCFCE7' },
  Medium: { color: '#B45309', background: '#FEF3C7' },
  High: { color: '#B91C1C', background: '#FEE2E2' },
};

function normalizeLevel(value?: string | null): Level | null {
  const level = value?.trim().toLowerCase();

  if (level === 'low') return 'Low';
  if (level === 'medium') return 'Medium';
  if (level === 'high') return 'High';

  return null;
}

function levelScore(level: Level): number {
  return level === 'Low' ? 1 : level === 'Medium' ? 2 : 3;
}

function scoreLevel(score: number): Level {
  if (score < 1.5) return 'Low';
  if (score < 2.5) return 'Medium';
  return 'High';
}

function timeAgo(date: string): string {
  const difference = Math.max(
    0,
    Date.now() - new Date(date).getTime()
  );

  if (!Number.isFinite(difference)) return 'Unknown time';

  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  return `${Math.floor(hours / 24)} days ago`;
}

function LevelBadge({ level }: { level: Level | null }) {
  const colors = level
    ? levelColors[level]
    : { color: '#64748B', background: '#E2E8F0' };

  return (
    <View style={[
      styles.levelBadge,
      { backgroundColor: colors.background },
    ]}>
      <View style={[
        styles.badgeDot,
        { backgroundColor: colors.color },
      ]} />
      <Text style={[styles.levelBadgeText, { color: colors.color }]}>
        {level ?? 'No data'}
      </Text>
    </View>
  );
}

export default function CrowdingScreen() {
  const router = useRouter();
  const { routeNumber: requestedRoute } =
  useLocalSearchParams<{ routeNumber?: string }>();

const initialRoute =
  typeof requestedRoute === 'string' && requestedRoute.trim()
    ? requestedRoute.trim()
    : '138';

const [routeNumber, setRouteNumber] = useState(initialRoute);
const [routeInput, setRouteInput] = useState(initialRoute);

useEffect(() => {
  if (
    typeof requestedRoute === 'string' &&
    requestedRoute.trim()
  ) {
    const nextRoute = requestedRoute.trim();
    setRouteNumber(nextRoute);
    setRouteInput(nextRoute);
  }
}, [requestedRoute]);

  const [reports, setReports] = useState<CrowdingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedSection, setSelectedSection] =
    useState<Section>('Front');
  const [selectedLevel, setSelectedLevel] =
    useState<Level | null>(null);

  const [passengerInput, setPassengerInput] = useState('');
  const [capacityInput, setCapacityInput] = useState('50');
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchReports = useCallback(async (
    route: string,
    showLoader = true
  ) => {
    try {
      if (showLoader) setLoading(true);
      setErrorMessage('');

      const { data, error } = await supabase
        .from('crowding_reports')
        .select(
          'id, created_at, route_number, crowding_level, passenger_count, capacity, section'
        )
        .eq('route_number', route)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setReports((data ?? []) as CrowdingReport[]);
    } catch (error) {
      console.error('Crowding fetch failed:', error);
      setErrorMessage('Unable to load crowding reports.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(routeNumber);
  }, [routeNumber, fetchReports]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports(routeNumber, false);
  };

  const changeRoute = () => {
    const nextRoute = routeInput.trim();

    if (!nextRoute || !/^[a-zA-Z0-9 -]{1,20}$/.test(nextRoute)) {
      Alert.alert(
        'Invalid route',
        'Enter a valid bus route number.'
      );
      return;
    }

    setReports([]);
    setSuccessMessage('');
    setRouteNumber(nextRoute);
  };

  const analytics = useMemo(() => {
    const latestBySection: Partial<
      Record<Section, CrowdingReport>
    > = {};

    const scores: number[] = [];

    for (const report of reports) {
      const level = normalizeLevel(report.crowding_level);
      if (level) scores.push(levelScore(level));

      const section = SECTIONS.find(
        item => item.toLowerCase() ===
          report.section?.trim().toLowerCase()
      );

      if (section && !latestBySection[section]) {
        latestBySection[section] = report;
      }
    }

    const averageScore = scores.length
      ? scores.reduce((sum, score) => sum + score, 0) /
        scores.length
      : null;

    const overallLevel = averageScore === null
      ? null
      : scoreLevel(averageScore);

    const countedReport = reports.find(
      report =>
        report.passenger_count !== null &&
        report.capacity !== null &&
        report.capacity > 0 &&
        report.passenger_count >= 0
    );

    const occupancy = countedReport
      ? Math.round(
          (countedReport.passenger_count! /
            countedReport.capacity!) * 100
        )
      : null;

    const levels = LEVELS.map(level => ({
      level,
      count: reports.filter(
        report => normalizeLevel(report.crowding_level) === level
      ).length,
    }));

    const availableSections = SECTIONS
      .map(section => ({
        section,
        report: latestBySection[section],
      }))
      .filter(
        item => normalizeLevel(item.report?.crowding_level)
      );

    const bestSection = availableSections.length
      ? [...availableSections].sort((a, b) => {
          const aLevel = normalizeLevel(a.report?.crowding_level)!;
          const bLevel = normalizeLevel(b.report?.crowding_level)!;
          return levelScore(aLevel) - levelScore(bLevel);
        })[0]
      : null;

    return {
      latestBySection,
      overallLevel,
      occupancy,
      countedReport,
      levels,
      bestSection,
      latestReport: reports[0],
    };
  }, [reports]);

  const submitReport = async () => {
    if (!selectedLevel) {
      Alert.alert(
        'Crowding level required',
        'Please select Low, Medium, or High.'
      );
      return;
    }

    const capacity = Number(capacityInput.trim());

    if (
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      capacity > 300
    ) {
      Alert.alert(
        'Invalid capacity',
        'Enter a capacity between 1 and 300.'
      );
      return;
    }

    const hasPassengerCount = passengerInput.trim() !== '';
    const passengerCount = hasPassengerCount
      ? Number(passengerInput.trim())
      : null;

    if (
      hasPassengerCount &&
      (
        !Number.isInteger(passengerCount) ||
        passengerCount! < 0 ||
        passengerCount! > capacity
      )
    ) {
      Alert.alert(
        'Invalid passenger count',
        'Enter a whole number between 0 and the bus capacity.'
      );
      return;
    }

    try {
      setSubmitting(true);
      setSuccessMessage('');

      const { error } = await supabase
        .from('crowding_reports')
        .insert([{
          route_number: routeNumber,
          crowding_level: selectedLevel,
          passenger_count: passengerCount,
          capacity,
          section: selectedSection,
        }]);

      if (error) throw error;

      setSuccessMessage(
        `${selectedLevel} crowding reported for the ${selectedSection.toLowerCase()} section.`
      );

      setSelectedLevel(null);
      setPassengerInput('');
      setShowForm(false);

      await fetchReports(routeNumber, false);
      Alert.alert('Report submitted', 'Thank you for helping passengers!');
    } catch (error) {
      console.error('Crowding submission failed:', error);
      Alert.alert(
        'Submission failed',
        'Unable to save the report. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderSection = (section: Section) => {
    const report = analytics.latestBySection[section];
    const level = normalizeLevel(report?.crowding_level);
    const colors = level
      ? levelColors[level]
      : { color: '#64748B', background: '#F1F5F9' };

    const active = selectedSection === section;

    return (
      <TouchableOpacity
        key={section}
        activeOpacity={0.8}
        onPress={() => {
          setSelectedSection(section);
          setShowForm(true);
          setSuccessMessage('');
        }}
        style={[
          styles.heatmapCard,
          { backgroundColor: colors.background },
          active && styles.activeHeatmapCard,
        ]}
      >
        <Ionicons
          name={
            section === 'Front'
              ? 'arrow-up-circle-outline'
              : section === 'Middle'
                ? 'remove-circle-outline'
                : 'arrow-down-circle-outline'
          }
          size={25}
          color={colors.color}
        />
        <Text style={styles.heatmapTitle}>{section}</Text>
        <Text style={[styles.heatmapLevel, { color: colors.color }]}>
          {level ?? 'Unknown'}
        </Text>
        <View style={styles.miniBars}>
          {Array.from({ length: 5 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.miniBar,
                {
                  backgroundColor:
                    level && index < levelScore(level) * 2 - 1
                      ? colors.color
                      : '#CBD5E1',
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.heatmapHint}>
          {report ? timeAgo(report.created_at) : 'No reports yet'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={NAVY} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Smart Crowding</Text>
          <Text style={styles.headerSubtitle}>
            Passenger capacity & crowd reports
          </Text>
        </View>

        <TouchableOpacity
          onPress={onRefresh}
          style={styles.refreshButton}
        >
          <Ionicons name="refresh-outline" size={23} color={NAVY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <View style={styles.routeCard}>
          <View style={styles.routeHeading}>
            <Ionicons name="bus" size={23} color={NAVY} />
            <View style={{ flex: 1 }}>
              <Text style={styles.routeTitle}>
                Select Bus Route
              </Text>
              <Text style={styles.muted}>
                Currently viewing Route {routeNumber}
              </Text>
            </View>
          </View>

          <View style={styles.routeInputRow}>
            <TextInput
              style={styles.routeInput}
              value={routeInput}
              onChangeText={setRouteInput}
              placeholder="e.g. 138"
              maxLength={20}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.routeButton}
              onPress={changeRoute}
            >
              <Text style={styles.routeButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>

        {errorMessage !== '' && (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={19}
              color="#B91C1C"
            />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={BLUE} />
            <Text style={styles.muted}>
              Loading crowding information...
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.overviewCard}>
              <View style={styles.overviewTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.overviewEyebrow}>
                    CROWDING OVERVIEW
                  </Text>
                  <Text style={styles.overviewTitle}>
                    Route {routeNumber}
                  </Text>
                  <Text style={styles.muted}>
                    Based on passenger-submitted reports
                  </Text>
                </View>
                <LevelBadge level={analytics.overallLevel} />
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Ionicons
                    name="people-outline"
                    size={22}
                    color={BLUE}
                  />
                  <Text style={styles.statValue}>
                    {reports.length}
                  </Text>
                  <Text style={styles.statLabel}>
                    Recent reports
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Ionicons
                    name="speedometer-outline"
                    size={22}
                    color="#B45309"
                  />
                  <Text style={styles.statValue}>
                    {analytics.occupancy === null
                      ? 'N/A'
                      : `${analytics.occupancy}%`}
                  </Text>
                  <Text style={styles.statLabel}>
                    Reported occupancy
                  </Text>
                </View>

                <View style={styles.statBox}>
                  <Ionicons
                    name="time-outline"
                    size={22}
                    color="#15803D"
                  />
                  <Text style={styles.statValueSmall}>
                    {analytics.latestReport
                      ? timeAgo(analytics.latestReport.created_at)
                      : 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>
                    Latest update
                  </Text>
                </View>
              </View>

              {analytics.countedReport && (
                <Text style={styles.occupancyNote}>
                  Latest available count: {
                    analytics.countedReport.passenger_count
                  } / {analytics.countedReport.capacity} passengers.
                  This is a reported estimate.
                </Text>
              )}
            </View>

            <View style={styles.sectionHeadingRow}>
              <View>
                <Text style={styles.sectionTitle}>
                  Bus Section Heatmap
                </Text>
                <Text style={styles.muted}>
                  Tap a section to submit an update
                </Text>
              </View>
              <Ionicons
                name="analytics-outline"
                size={24}
                color={BLUE}
              />
            </View>

            <View style={styles.heatmapRow}>
              {SECTIONS.map(renderSection)}
            </View>

            <View style={styles.legend}>
              {LEVELS.map(level => (
                <View key={level} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor: levelColors[level].color,
                      },
                    ]}
                  />
                  <Text style={styles.legendText}>{level}</Text>
                </View>
              ))}
            </View>

            <View style={styles.analyticsCard}>
              <View style={styles.cardTitleRow}>
                <Ionicons
                  name="bar-chart-outline"
                  size={22}
                  color={NAVY}
                />
                <Text style={styles.cardTitle}>
                  Crowding Report Analytics
                </Text>
              </View>

              <Text style={styles.muted}>
                Distribution of the latest {reports.length} reports
              </Text>

              {analytics.levels.map(({ level, count }) => {
                const percent = reports.length
                  ? Math.round(count / reports.length * 100)
                  : 0;

                return (
                  <View key={level} style={styles.analyticsRow}>
                    <View style={styles.analyticsLabels}>
                      <Text style={styles.analyticsName}>
                        {level}
                      </Text>
                      <Text style={styles.analyticsPercent}>
                        {count} ({percent}%)
                      </Text>
                    </View>

                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${percent}%`,
                            backgroundColor: levelColors[level].color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}

              {reports.length === 0 && (
                <Text style={styles.emptyText}>
                  No reports for this route yet. Be the first
                  passenger to submit one.
                </Text>
              )}
            </View>

            <View style={styles.tipCard}>
              <Ionicons
                name="bulb-outline"
                size={24}
                color="#1D4ED8"
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>
                  Smart Boarding Suggestion
                </Text>
                <Text style={styles.tipText}>
                  {analytics.bestSection
                    ? `The ${analytics.bestSection.section.toLowerCase()} section has the lowest latest reported crowding among sections with available data. Check conditions before boarding.`
                    : 'Not enough section reports are available to recommend a boarding area yet.'}
                </Text>
              </View>
            </View>

            <View style={styles.formHeading}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>
                  Passenger Crowding Report
                </Text>
                <Text style={styles.muted}>
                  Help others make informed travel decisions
                </Text>
              </View>

              <TouchableOpacity
                style={styles.formToggle}
                onPress={() => setShowForm(!showForm)}
              >
                <Ionicons
                  name={showForm ? 'chevron-up' : 'add'}
                  size={19}
                  color="#FFFFFF"
                />
                <Text style={styles.formToggleText}>
                  {showForm ? 'Close' : 'Report'}
                </Text>
              </TouchableOpacity>
            </View>

            {successMessage !== '' && (
              <View style={styles.successBox}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#15803D"
                />
                <Text style={styles.successText}>
                  {successMessage}
                </Text>
              </View>
            )}

            {showForm && (
              <View style={styles.formCard}>
                <View style={styles.cardTitleRow}>
                  <Ionicons
                    name="clipboard-outline"
                    size={22}
                    color={BLUE}
                  />
                  <Text style={styles.cardTitle}>
                    Submit a Crowding Report
                  </Text>
                </View>

                <Text style={styles.formDescription}>
                  Reporting for Route {routeNumber}
                </Text>

                <Text style={styles.fieldLabel}>
                  1. Which section are you in?
                </Text>

                <View style={styles.choiceRow}>
                  {SECTIONS.map(section => (
                    <TouchableOpacity
                      key={section}
                      style={[
                        styles.choiceButton,
                        selectedSection === section &&
                          styles.choiceSelected,
                      ]}
                      onPress={() => setSelectedSection(section)}
                    >
                      <Text
                        style={[
                          styles.choiceText,
                          selectedSection === section &&
                            styles.choiceSelectedText,
                        ]}
                      >
                        {section}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.fieldLabel}>
                  2. How crowded is the bus?
                </Text>

                <View style={styles.choiceRow}>
                  {LEVELS.map(level => {
                    const active = selectedLevel === level;
                    return (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.choiceButton,
                          active && {
                            borderColor: levelColors[level].color,
                            backgroundColor:
                              levelColors[level].background,
                          },
                        ]}
                        onPress={() => setSelectedLevel(level)}
                      >
                        <Text
                          style={[
                            styles.choiceText,
                            active && {
                              color: levelColors[level].color,
                            },
                          ]}
                        >
                          {level}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.fieldLabel}>
                  3. Estimated passenger count (optional)
                </Text>

                <TextInput
                  style={styles.textInput}
                  value={passengerInput}
                  onChangeText={setPassengerInput}
                  placeholder="e.g. 35"
                  keyboardType="number-pad"
                  maxLength={3}
                />

                <Text style={styles.fieldLabel}>
                  4. Estimated bus capacity
                </Text>

                <TextInput
                  style={styles.textInput}
                  value={capacityInput}
                  onChangeText={setCapacityInput}
                  placeholder="e.g. 50"
                  keyboardType="number-pad"
                  maxLength={3}
                />

                <View style={styles.formNotice}>
                  <Ionicons
                    name="information-circle-outline"
                    size={19}
                    color="#1D4ED8"
                  />
                  <Text style={styles.formNoticeText}>
                    Report what you observe. Passenger counts and
                    capacity are estimates, not verified live data.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!selectedLevel || submitting) &&
                      styles.disabledButton,
                  ]}
                  onPress={submitReport}
                  disabled={!selectedLevel || submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons
                        name="send-outline"
                        size={19}
                        color="#FFFFFF"
                      />
                      <Text style={styles.submitText}>
                        Submit Crowding Report
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.disclaimer}>
              Crowding information is crowdsourced and may be
              outdated or inaccurate. Check actual bus conditions
              before boarding.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: NAVY,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  content: {
    padding: 16,
    paddingBottom: 50,
    gap: 18,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  routeHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  routeTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  muted: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 17,
  },
  routeInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  routeInput: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 13,
    fontSize: 15,
    color: '#0F172A',
  },
  routeButton: {
    backgroundColor: NAVY,
    paddingHorizontal: 22,
    borderRadius: 12,
    justifyContent: 'center',
  },
  routeButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 12,
    flex: 1,
  },
  loadingBox: {
    padding: 35,
    alignItems: 'center',
    gap: 14,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  overviewTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 20,
  },
  overviewEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: BLUE,
  },
  overviewTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: NAVY,
    marginTop: 5,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 5,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 108,
  },
  statValue: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 9,
  },
  statValueSmall: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 15,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 5,
  },
  occupancyNote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 14,
    lineHeight: 17,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  heatmapRow: {
    flexDirection: 'row',
    gap: 8,
  },
  heatmapCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 7,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 152,
  },
  activeHeatmapCard: {
    borderColor: BLUE,
  },
  heatmapTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  heatmapLevel: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 5,
  },
  miniBars: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 12,
    width: '90%',
  },
  miniBar: {
    flex: 1,
    height: 7,
    borderRadius: 5,
  },
  heatmapHint: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 10,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 22,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#475569',
  },
  analyticsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  analyticsRow: {
    marginTop: 18,
  },
  analyticsLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  analyticsName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  analyticsPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  progressTrack: {
    height: 10,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 18,
  },
  tipCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  tipText: {
    fontSize: 12,
    lineHeight: 19,
    color: '#475569',
    marginTop: 5,
  },
  formHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formToggle: {
    backgroundColor: BLUE,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  formToggleText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  successBox: {
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  successText: {
    color: '#166534',
    fontSize: 12,
    flex: 1,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formDescription: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    marginTop: 16,
    marginBottom: 10,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceSelected: {
    borderColor: BLUE,
    backgroundColor: '#EFF6FF',
  },
  choiceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  choiceSelectedText: {
    color: BLUE,
  },
  textInput: {
    height: 47,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 13,
    color: '#0F172A',
    fontSize: 14,
  },
  formNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
  },
  formNoticeText: {
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 17,
    flex: 1,
  },
  submitButton: {
    backgroundColor: BLUE,
    borderRadius: 13,
    minHeight: 50,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  disclaimer: {
    color: '#94A3B8',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
});
