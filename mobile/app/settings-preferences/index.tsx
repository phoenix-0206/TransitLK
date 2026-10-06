import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '../../services/supabase';

type Language = 'English' | 'සිංහල' | 'தமிழ்';

type UserPreferences = {
  id: string;
  created_at: string;
  language: Language;
  delay_alerts: boolean;
  cancellation_alerts: boolean;
  crowding_alerts: boolean;
  saved_route_alerts: boolean;
  data_saver: boolean;
};

export default function SettingsPreferencesScreen() {
  const router = useRouter();

  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  const [language, setLanguage] = useState<Language>('English');

  const [delayAlerts, setDelayAlerts] = useState(true);
  const [cancellationAlerts, setCancellationAlerts] = useState(true);
  const [crowdingAlerts, setCrowdingAlerts] = useState(true);
  const [savedRouteAlerts, setSavedRouteAlerts] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  // --------------------------------------------------
  // READ + CREATE
  // --------------------------------------------------

  const loadPreferences = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1);

      if (error) {
        throw error;
      }

      // If no preference record exists yet,
      // create the default record.
      if (!data || data.length === 0) {
        const { data: createdData, error: createError } =
          await supabase
            .from('user_preferences')
            .insert([
              {
                language: 'English',
                delay_alerts: true,
                cancellation_alerts: true,
                crowding_alerts: true,
                saved_route_alerts: true,
                data_saver: false,
              },
            ])
            .select()
            .single();

        if (createError) {
          throw createError;
        }

        applyPreferences(createdData as UserPreferences);

        return;
      }

      applyPreferences(data[0] as UserPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);

      Alert.alert(
        'Unable to Load Preferences',
        'Your preferences could not be loaded. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const applyPreferences = (preferences: UserPreferences) => {
    setPreferenceId(preferences.id);

    setLanguage(preferences.language ?? 'English');

    setDelayAlerts(preferences.delay_alerts ?? true);

    setCancellationAlerts(
      preferences.cancellation_alerts ?? true
    );

    setCrowdingAlerts(
      preferences.crowding_alerts ?? true
    );

    setSavedRouteAlerts(
      preferences.saved_route_alerts ?? true
    );

    setDataSaver(
      preferences.data_saver ?? false
    );
  };

  // --------------------------------------------------
  // UPDATE
  // --------------------------------------------------

  const savePreferences = async () => {
    if (!preferenceId) {
      Alert.alert(
        'Preferences Not Ready',
        'Please wait for your preferences to finish loading.'
      );

      return;
    }

    try {
      setSaving(true);
      setSavedMessage('');

      const { error } = await supabase
        .from('user_preferences')
        .update({
          language,
          delay_alerts: delayAlerts,
          cancellation_alerts: cancellationAlerts,
          crowding_alerts: crowdingAlerts,
          saved_route_alerts: savedRouteAlerts,
          data_saver: dataSaver,
        })
        .eq('id', preferenceId);

      if (error) {
        throw error;
      }

      setSavedMessage('Your preferences have been saved.');
    } catch (error) {
      console.error('Error saving preferences:', error);

      Alert.alert(
        'Save Failed',
        'Unable to save your preferences. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const selectLanguage = (selectedLanguage: Language) => {
    setLanguage(selectedLanguage);
    setSavedMessage('');
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
            Settings & Preferences
          </Text>

          <Text style={styles.headerSubtitle}>
            Customize your TransitLK experience
          </Text>
        </View>

        <View style={styles.settingsIcon}>
          <Ionicons
            name="settings-outline"
            size={22}
            color="#374151"
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />

          <Text style={styles.loadingText}>
            Loading preferences...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Language Section */}
          <Text style={styles.sectionTitle}>
            LANGUAGE
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              App Language
            </Text>

            <Text style={styles.cardDescription}>
              Choose your preferred language for TransitLK.
            </Text>

            <LanguageOption
              title="English"
              subtitle="English"
              selected={language === 'English'}
              onPress={() =>
                selectLanguage('English')
              }
            />

            <View style={styles.divider} />

            <LanguageOption
              title="සිංහල"
              subtitle="Sinhala"
              selected={language === 'සිංහල'}
              onPress={() =>
                selectLanguage('සිංහල')
              }
            />

            <View style={styles.divider} />

            <LanguageOption
              title="தமிழ்"
              subtitle="Tamil"
              selected={language === 'தமிழ்'}
              onPress={() =>
                selectLanguage('தமிழ்')
              }
            />
          </View>

          {/* Notification Preferences */}
          <Text style={styles.sectionTitle}>
            NOTIFICATION PREFERENCES
          </Text>

          <View style={styles.card}>
            <SettingToggle
              icon="time-outline"
              title="Delay Alerts"
              description="Receive updates when your bus or route is delayed."
              value={delayAlerts}
              onValueChange={(value) => {
                setDelayAlerts(value);
                setSavedMessage('');
              }}
            />

            <View style={styles.divider} />

            <SettingToggle
              icon="close-circle-outline"
              title="Cancellation Alerts"
              description="Receive alerts when a bus service is cancelled."
              value={cancellationAlerts}
              onValueChange={(value) => {
                setCancellationAlerts(value);
                setSavedMessage('');
              }}
            />

            <View style={styles.divider} />

            <SettingToggle
              icon="people-outline"
              title="Crowding Alerts"
              description="Get updates about passenger crowding levels."
              value={crowdingAlerts}
              onValueChange={(value) => {
                setCrowdingAlerts(value);
                setSavedMessage('');
              }}
            />

            <View style={styles.divider} />

            <SettingToggle
              icon="bookmark-outline"
              title="Saved Route Alerts"
              description="Receive updates for routes you have saved."
              value={savedRouteAlerts}
              onValueChange={(value) => {
                setSavedRouteAlerts(value);
                setSavedMessage('');
              }}
            />
          </View>

          {/* Data & Performance */}
          <Text style={styles.sectionTitle}>
            DATA & PERFORMANCE
          </Text>

          <View style={styles.card}>
            <SettingToggle
              icon="cellular-outline"
              title="Data Saver"
              description="Reduce mobile data usage while using TransitLK."
              value={dataSaver}
              onValueChange={(value) => {
                setDataSaver(value);
                setSavedMessage('');
              }}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              saving && styles.saveButtonDisabled,
            ]}
            onPress={savePreferences}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.saveButtonText}>
                  Saving...
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#FFFFFF"
                />

                <Text style={styles.saveButtonText}>
                  Save Preferences
                </Text>
              </>
            )}
          </TouchableOpacity>

          {savedMessage !== '' && (
            <View style={styles.successMessage}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#16A34A"
              />

              <Text style={styles.successMessageText}>
                {savedMessage}
              </Text>
            </View>
          )}

          {/* Information */}
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="information-circle-outline"
                size={23}
                color="#2563EB"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                About your preferences
              </Text>

              <Text style={styles.infoText}>
                You can change your language, notification and data
                preferences whenever you need.
              </Text>
            </View>
          </View>

          <Text style={styles.version}>
            TransitLK
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* ---------------- LANGUAGE OPTION ---------------- */

type LanguageOptionProps = {
  title: Language;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
};

function LanguageOption({
  title,
  subtitle,
  selected,
  onPress,
}: LanguageOptionProps) {
  return (
    <TouchableOpacity
      style={styles.languageRow}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View
        style={[
          styles.languageIcon,
          selected && styles.selectedLanguageIcon,
        ]}
      >
        <Ionicons
          name="language-outline"
          size={20}
          color={
            selected
              ? '#2563EB'
              : '#6B7280'
          }
        />
      </View>

      <View style={styles.languageInformation}>
        <Text
          style={[
            styles.languageTitle,
            selected &&
              styles.selectedLanguageTitle,
          ]}
        >
          {title}
        </Text>

        <Text style={styles.languageSubtitle}>
          {subtitle}
        </Text>
      </View>

      <View
        style={[
          styles.radioOuter,
          selected &&
            styles.selectedRadioOuter,
        ]}
      >
        {selected && (
          <View style={styles.radioInner} />
        )}
      </View>
    </TouchableOpacity>
  );
}

/* ---------------- SETTING TOGGLE ---------------- */

type SettingToggleProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function SettingToggle({
  icon,
  title,
  description,
  value,
  onValueChange,
}: SettingToggleProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Ionicons
          name={icon}
          size={20}
          color="#2563EB"
        />
      </View>

      <View style={styles.settingInformation}>
        <Text style={styles.settingTitle}>
          {title}
        </Text>

        <Text style={styles.settingDescription}>
          {description}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: '#D1D5DB',
          true: '#93C5FD',
        }}
        thumbColor={
          value
            ? '#2563EB'
            : '#F9FAFB'
        }
      />
    </View>
  );
}

/* ---------------- STYLES ---------------- */

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

  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 12,
  },

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 11,
    marginTop: 5,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  cardDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 17,
  },

  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
  },

  languageIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  selectedLanguageIcon: {
    backgroundColor: '#EFF6FF',
  },

  languageInformation: {
    flex: 1,
  },

  languageTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },

  selectedLanguageTitle: {
    color: '#2563EB',
  },

  languageSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },

  radioOuter: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedRadioOuter: {
    borderColor: '#2563EB',
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  settingInformation: {
    flex: 1,
    paddingRight: 10,
  },

  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  settingDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: '#6B7280',
    marginTop: 3,
  },

  saveButton: {
    minHeight: 50,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  saveButtonDisabled: {
    backgroundColor: '#93C5FD',
  },

  saveButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 13,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },

  successMessageText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },

  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E3A8A',
  },

  infoText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#475569',
    marginTop: 3,
  },

  version: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 20,
  },
});