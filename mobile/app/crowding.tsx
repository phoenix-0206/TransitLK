import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../services/supabase';

type CrowdingReport = {
  id: string;
  created_at: string;
  route_number: string;
  crowding_level: string;
  passenger_count: number | null;
  capacity: number | null;
  section: string | null;
};

type CrowdingLevel = 'Low' | 'Medium' | 'High';

export default function CrowdingScreen() {
  const router = useRouter();

  const [crowdingReports, setCrowdingReports] = useState<CrowdingReport[]>([]);
  const [loading, setLoading] = useState(true);

  // CREATE operation states
  const [selectedLevel, setSelectedLevel] =
    useState<CrowdingLevel | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCrowdingReports();
  }, []);

  // READ operation
  const fetchCrowdingReports = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('crowding_reports')
        .select(
          'id, created_at, route_number, crowding_level, passenger_count, capacity, section'
        )
        .eq('route_number', '138')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setCrowdingReports((data ?? []) as CrowdingReport[]);
    } catch (error) {
      console.error('Error loading crowding reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // CREATE operation
  const submitCrowdingReport = async () => {
    if (!selectedLevel) {
      Alert.alert(
        'Select Crowding Level',
        'Please select Low, Medium, or High before submitting.'
      );
      return;
    }

    try {
      setSubmitting(true);
      setSuccessMessage('');

      const { error } = await supabase
        .from('crowding_reports')
        .insert([
          {
            route_number: '138',
            crowding_level: selectedLevel,
            passenger_count: null,
            capacity: 50,
            section: 'Passenger Report',
          },
        ]);

      if (error) {
        throw error;
      }

      setSuccessMessage(
        `Thank you! Your ${selectedLevel} crowding report was submitted.`
      );

      setSelectedLevel(null);

      // Refresh data after creating the report
      await fetchCrowdingReports();
    } catch (error) {
      console.error('Error submitting crowding report:', error);

      Alert.alert(
        'Submission Failed',
        'Unable to submit your crowding report. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const overallReport = crowdingReports.find(
    (report) => report.section?.toLowerCase() === 'overall'
  );

  const frontReport = crowdingReports.find(
    (report) => report.section?.toLowerCase() === 'front'
  );

  const middleReport = crowdingReports.find(
    (report) => report.section?.toLowerCase() === 'middle'
  );

  const rearReport = crowdingReports.find(
    (report) => report.section?.toLowerCase() === 'rear'
  );

  const passengerCount = overallReport?.passenger_count ?? 0;
  const capacity = overallReport?.capacity ?? 0;

  const occupancy =
    capacity > 0
      ? Math.round((passengerCount / capacity) * 100)
      : 0;

  const overallLevel =
    overallReport?.crowding_level ?? 'Unknown';

  const getCrowdingDescription = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'Plenty of space';

      case 'medium':
        return 'Seats filling up';

      case 'high':
        return 'Very crowded';

      default:
        return 'Crowding status unavailable';
    }
  };

  const getUpdatedTime = () => {
    if (!overallReport?.created_at) {
      return 'Waiting for update';
    }

    const createdTime = new Date(
      overallReport.created_at
    ).getTime();

    const currentTime = new Date().getTime();

    const minutes = Math.max(
      0,
      Math.floor((currentTime - createdTime) / 60000)
    );

    if (minutes < 1) {
      return 'Updated just now';
    }

    if (minutes < 60) {
      return `Updated ${minutes} min ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `Updated ${hours} hr${hours > 1 ? 's' : ''} ago`;
    }

    const days = Math.floor(hours / 24);

    return `Updated ${days} day${days > 1 ? 's' : ''} ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#111827"
          />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>
            Passenger Capacity
          </Text>

          <Text style={styles.headerSubtitle}>
            Bus 138 • Pettah → Homagama
          </Text>
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
        {/* Live status */}
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />

          <Text style={styles.liveText}>
            LIVE CROWDING STATUS
          </Text>

          <View style={styles.updatedContainer}>
            <Ionicons
              name="time-outline"
              size={14}
              color="#6B7280"
            />

            <Text style={styles.updatedText}>
              {getUpdatedTime()}
            </Text>
          </View>
        </View>

        {/* Main crowding card */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardTop}>
            <View>
              <Text style={styles.smallLabel}>
                CURRENT CROWDING
              </Text>

              <Text style={styles.crowdingTitle}>
                {loading ? 'Loading...' : overallLevel}
              </Text>

              <View style={styles.mediumBadge}>
                <View style={styles.mediumDot} />

                <Text style={styles.mediumBadgeText}>
                  {loading
                    ? 'Loading crowding status'
                    : getCrowdingDescription(overallLevel)}
                </Text>
              </View>
            </View>

            <View style={styles.peopleIcon}>
              <Ionicons
                name="people"
                size={32}
                color="#D97706"
              />
            </View>
          </View>

          <View style={styles.occupancyHeader}>
            <Text style={styles.occupancyLabel}>
              Estimated Occupancy
            </Text>

            <Text style={styles.occupancyValue}>
              {occupancy}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(occupancy, 100)}%`,
                },
              ]}
            />
          </View>

          <View style={styles.capacityRow}>
            <Text style={styles.capacityText}>
              Approx. {passengerCount} passengers
            </Text>

            <Text style={styles.capacityText}>
              {capacity} capacity
            </Text>
          </View>
        </View>

        {/* Crowding levels */}
        <Text style={styles.sectionTitle}>
          CROWDING LEVELS
        </Text>

        <View style={styles.levelGuide}>
          <View style={styles.levelItem}>
            <View
              style={[
                styles.levelDot,
                styles.lowColor,
              ]}
            />

            <View>
              <Text style={styles.levelName}>
                Low
              </Text>

              <Text style={styles.levelDescription}>
                Plenty of space
              </Text>
            </View>
          </View>

          <View style={styles.levelItem}>
            <View
              style={[
                styles.levelDot,
                styles.mediumColor,
              ]}
            />

            <View>
              <Text style={styles.levelName}>
                Medium
              </Text>

              <Text style={styles.levelDescription}>
                Seats filling up
              </Text>
            </View>
          </View>

          <View style={styles.levelItem}>
            <View
              style={[
                styles.levelDot,
                styles.highColor,
              ]}
            />

            <View>
              <Text style={styles.levelName}>
                High
              </Text>

              <Text style={styles.levelDescription}>
                Very crowded
              </Text>
            </View>
          </View>
        </View>

        {/* Bus sections */}
        <Text style={styles.sectionTitle}>
          BUS SECTIONS
        </Text>

        <View style={styles.busCard}>
          <View style={styles.busVisual}>
            <Ionicons
              name="bus-outline"
              size={34}
              color="#2563EB"
            />

            <View style={styles.busLine} />

            <Text style={styles.busNumber}>
              138
            </Text>
          </View>

          <View style={styles.sectionDivider} />

          <BusSection
            icon="arrow-up-outline"
            title="Front Section"
            description="Driver & front seats"
            level={
              frontReport?.crowding_level ??
              'Unknown'
            }
            levelStyle={styles.highBadge}
            levelTextStyle={styles.highBadgeText}
          />

          <View style={styles.sectionDivider} />

          <BusSection
            icon="remove-outline"
            title="Middle Section"
            description="Main seating area"
            level={
              middleReport?.crowding_level ??
              'Unknown'
            }
            levelStyle={styles.mediumSectionBadge}
            levelTextStyle={styles.mediumSectionText}
          />

          <View style={styles.sectionDivider} />

          <BusSection
            icon="arrow-down-outline"
            title="Rear Section"
            description="Back seats"
            level={
              rearReport?.crowding_level ??
              'Unknown'
            }
            levelStyle={styles.lowBadge}
            levelTextStyle={styles.lowBadgeText}
          />
        </View>

        {/* Recommendation */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons
              name="bulb-outline"
              size={22}
              color="#2563EB"
            />
          </View>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              Travel Tip
            </Text>

            <Text style={styles.tipText}>
              The rear section currently has more available space.
            </Text>
          </View>
        </View>

        {/* Passenger crowding report */}
        <Text style={styles.reportSectionTitle}>
          REPORT CURRENT CROWDING
        </Text>

        <View style={styles.reportCard}>
          <View style={styles.reportHeadingRow}>
            <View style={styles.reportIcon}>
              <Ionicons
                name="people-outline"
                size={22}
                color="#2563EB"
              />
            </View>

            <View style={styles.reportHeadingText}>
              <Text style={styles.reportTitle}>
                How crowded is the bus?
              </Text>

              <Text style={styles.reportSubtitle}>
                Help other passengers by reporting what you see.
              </Text>
            </View>
          </View>

          <View style={styles.reportOptions}>
            <TouchableOpacity
              style={[
                styles.reportOption,
                selectedLevel === 'Low' &&
                  styles.selectedLowOption,
              ]}
              onPress={() => {
                setSelectedLevel('Low');
                setSuccessMessage('');
              }}
            >
              <View
                style={[
                  styles.reportDot,
                  styles.lowColor,
                ]}
              />

              <Text style={styles.reportOptionText}>
                Low
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.reportOption,
                selectedLevel === 'Medium' &&
                  styles.selectedMediumOption,
              ]}
              onPress={() => {
                setSelectedLevel('Medium');
                setSuccessMessage('');
              }}
            >
              <View
                style={[
                  styles.reportDot,
                  styles.mediumColor,
                ]}
              />

              <Text style={styles.reportOptionText}>
                Medium
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.reportOption,
                selectedLevel === 'High' &&
                  styles.selectedHighOption,
              ]}
              onPress={() => {
                setSelectedLevel('High');
                setSuccessMessage('');
              }}
            >
              <View
                style={[
                  styles.reportDot,
                  styles.highColor,
                ]}
              />

              <Text style={styles.reportOptionText}>
                High
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedLevel || submitting) &&
                styles.submitButtonDisabled,
            ]}
            onPress={submitCrowdingReport}
            disabled={!selectedLevel || submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <Text style={styles.submitButtonText}>
                Submitting...
              </Text>
            ) : (
              <>
                <Ionicons
                  name="send-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.submitButtonText}>
                  Submit Report
                </Text>
              </>
            )}
          </TouchableOpacity>

          {successMessage !== '' && (
            <View style={styles.successMessage}>
              <Ionicons
                name="checkmark-circle"
                size={19}
                color="#16A34A"
              />

              <Text style={styles.successMessageText}>
                {successMessage}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.disclaimer}>
          Crowding levels are estimates and may change during the journey.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

type BusSectionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  level: string;
  levelStyle: object;
  levelTextStyle: object;
};

function BusSection({
  icon,
  title,
  description,
  level,
  levelStyle,
  levelTextStyle,
}: BusSectionProps) {
  return (
    <View style={styles.busSection}>
      <View style={styles.sectionIcon}>
        <Ionicons
          name={icon}
          size={19}
          color="#374151"
        />
      </View>

      <View style={styles.sectionInformation}>
        <Text style={styles.busSectionTitle}>
          {title}
        </Text>

        <Text style={styles.busSectionDescription}>
          {description}
        </Text>
      </View>

      <View
        style={[
          styles.sectionBadge,
          levelStyle,
        ]}
      >
        <Text
          style={[
            styles.sectionBadgeText,
            levelTextStyle,
          ]}
        >
          {level}
        </Text>
      </View>
    </View>
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

  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 7,
  },

  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.6,
  },

  updatedContainer: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },

  updatedText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },

  mainCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 25,
  },

  mainCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },

  smallLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.6,
  },

  crowdingTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },

  mediumBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },

  mediumDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D97706',
    marginRight: 6,
  },

  mediumBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },

  peopleIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  occupancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  occupancyLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  occupancyValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
  },

  progressBackground: {
    height: 10,
    borderRadius: 10,
    backgroundColor: '#FDE68A',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#D97706',
    borderRadius: 10,
  },

  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  capacityText: {
    fontSize: 11,
    color: '#6B7280',
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  levelGuide: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 25,
  },

  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },

  levelDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    marginRight: 12,
  },

  lowColor: {
    backgroundColor: '#16A34A',
  },

  mediumColor: {
    backgroundColor: '#D97706',
  },

  highColor: {
    backgroundColor: '#DC2626',
  },

  levelName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  levelDescription: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },

  busCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },

  busVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  busLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#DBEAFE',
    marginHorizontal: 12,
  },

  busNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },

  busSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  sectionInformation: {
    flex: 1,
  },

  busSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  busSectionDescription: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },

  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  highBadge: {
    backgroundColor: '#FEE2E2',
  },

  highBadgeText: {
    color: '#DC2626',
  },

  mediumSectionBadge: {
    backgroundColor: '#FEF3C7',
  },

  mediumSectionText: {
    color: '#D97706',
  },

  lowBadge: {
    backgroundColor: '#DCFCE7',
  },

  lowBadgeText: {
    color: '#16A34A',
  },

  tipCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E3A8A',
    marginBottom: 3,
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
  },

  reportSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginTop: 25,
    marginBottom: 12,
  },

  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  reportHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  reportIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  reportHeadingText: {
    flex: 1,
  },

  reportTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  reportSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 17,
    marginTop: 3,
  },

  reportOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    marginBottom: 15,
  },

  reportOption: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  selectedLowOption: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
  },

  selectedMediumOption: {
    backgroundColor: '#FFFBEB',
    borderColor: '#D97706',
  },

  selectedHighOption: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },

  reportDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 6,
  },

  reportOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },

  submitButton: {
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },

  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 11,
    marginTop: 12,
  },

  successMessageText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 11,
    lineHeight: 16,
    color: '#166534',
    fontWeight: '600',
  },

  disclaimer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
    marginTop: 18,
  },
});