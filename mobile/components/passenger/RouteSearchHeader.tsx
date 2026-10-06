import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface RouteSearchHeaderProps {
  onLanguageChange?: (lang: string) => void;
}

export default function RouteSearchHeader({ onLanguageChange }: RouteSearchHeaderProps) {
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

  return (
    <View style={styles.headerContainer}>
      {/* Left: App Logo & Branding */}
      <View style={styles.brandContainer}>
        <View style={styles.logoBadge}>
          <MaterialCommunityIcons name="ticket-confirmation-outline" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.brandTextContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.brandTitle}>TransitLK</Text>
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.brandSubtitle}>DIGITAL TICKETS • FR3</Text>
        </View>
      </View>

      {/* Right: Language Pill */}
      <Pressable
        style={({ pressed }) => [styles.langPill, pressed && styles.langPillPressed]}
        onPress={() => setLangModalVisible(true)}
      >
        <Text style={styles.langText}>{selectedLang}</Text>
        <Text style={styles.langDivider}>|</Text>
        <Ionicons name="globe-outline" size={14} color="#475569" />
      </Pressable>

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
                  <Ionicons name="checkmark-circle" size={18} color="#2563EB" />
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1E2B6D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E2B6D',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  brandTextContainer: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E9CAE',
    letterSpacing: 0.6,
    marginTop: 1,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  langPillPressed: {
    backgroundColor: '#F1F5F9',
  },
  langText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  langDivider: {
    fontSize: 13,
    color: '#94A3B8',
    marginHorizontal: 6,
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
    color: '#1D4ED8',
    fontWeight: '700',
  },
});
