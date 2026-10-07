import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export interface PassengerHomeHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onLanguageChange?: (lang: string) => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export function PassengerHomeHeader({
  title = 'TransitLK',
  subtitle,
  showBack = false,
  onBack,
  onLanguageChange,
  onNotificationPress,
  onProfilePress,
}: PassengerHomeHeaderProps) {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState<'EN' | 'SI' | 'TA'>('EN');
  const [langModalVisible, setLangModalVisible] = useState(false);

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'SI', name: 'සිංහල (Sinhala)' },
    { code: 'TA', name: 'தமிழ் (Tamil)' },
  ];

  const handleSelectLanguage = (code: 'EN' | 'SI' | 'TA') => {
    setSelectedLang(code);
    setLangModalVisible(false);
    if (onLanguageChange) {
      onLanguageChange(code);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={styles.topHeader}>
      {/* Left: Optional Back + Brand Logo & Title */}
      <View style={styles.headerLeft}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={20} color="#002060" />
          </TouchableOpacity>
        )}

        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="bus" size={18} color="#FFFFFF" />
          </View>

          <View style={styles.brandTitleCol}>
            <View style={styles.brandNameRow}>
              <Text style={styles.brandTitle}>{title}</Text>
              <View style={styles.liveGpsBadge}>
                <View style={styles.liveGpsDot} />
                <Text style={styles.liveGpsText}>LIVE</Text>
              </View>
            </View>
            {subtitle ? (
              <Text style={styles.brandSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Right: Language Pill, Notifications, Profile */}
      <View style={styles.headerRight}>
        <Pressable
          style={({ pressed }) => [styles.langPill, pressed && styles.langPillPressed]}
          onPress={() => setLangModalVisible(true)}
          accessibilityLabel="Change language"
          accessibilityRole="button"
        >
          <Text style={styles.langTextActive}>{selectedLang}</Text>
          <Ionicons name="globe-outline" size={13} color="#002060" />
        </Pressable>

        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={onNotificationPress || (() => router.push('/modal'))}
          activeOpacity={0.7}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
        >
          <Ionicons name="notifications-outline" size={18} color="#002060" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarCircle}
          onPress={onProfilePress || (() => router.push('/profile'))}
          activeOpacity={0.7}
          accessibilityLabel="User profile"
          accessibilityRole="button"
        >
          <FontAwesome5 name="user-alt" size={13} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Language Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={langModalVisible}
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setLangModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Select Language</Text>
            {languages.map((item) => (
              <Pressable
                key={item.code}
                style={[
                  styles.modalItem,
                  selectedLang === item.code && styles.modalItemSelected,
                ]}
                onPress={() => handleSelectLanguage(item.code as 'EN' | 'SI' | 'TA')}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    selectedLang === item.code && styles.modalItemTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
                {selectedLang === item.code && (
                  <Ionicons name="checkmark-circle" size={18} color="#002060" />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#002060',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#002060',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  brandTitleCol: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#002060',
    letterSpacing: -0.2,
  },
  liveGpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  liveGpsDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  liveGpsText: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#059669',
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
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
    gap: 4,
  },
  langPillPressed: {
    backgroundColor: '#F1F5F9',
  },
  langTextActive: {
    color: '#002060',
    fontWeight: 'bold',
    fontSize: 11,
  },
  notificationBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#002060',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  modalItemSelected: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  modalItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  modalItemTextSelected: {
    color: '#002060',
    fontWeight: '700',
  },
});

export default PassengerHomeHeader;
