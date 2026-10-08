import React from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const conductor = {
  name: 'Sunil Perera',
  badgeId: '#7842',
  position: 'Senior Conductor',
  depot: 'Pettah Central',
  shift: '06:00 - 14:30',
};

export default function ConductorProfileScreen() {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            router.replace('/');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#123B8B"
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Staff ID
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={30}
              color="#FFF"
            />
          </View>

          <Text style={styles.name}>
            {conductor.name}
          </Text>

          <Text style={styles.position}>
            {conductor.position}
          </Text>

          <View style={styles.activePill}>
            <View style={styles.activeDot} />

            <Text style={styles.activeText}>
              ON DUTY
            </Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>
            STAFF DETAILS
          </Text>

          <DetailRow
            icon="id-card-outline"
            label="Staff ID"
            value={conductor.badgeId}
          />

          <DetailRow
            icon="briefcase-outline"
            label="Position"
            value={conductor.position}
          />

          <DetailRow
            icon="business-outline"
            label="Depot"
            value={conductor.depot}
          />

          <DetailRow
            icon="time-outline"
            label="Current shift"
            value={conductor.shift}
          />
        </View>

        <Pressable
          style={styles.actionButton}
          onPress={() =>
            router.push('/conductor/scanner')
          }
        >
          <Ionicons
            name="scan-outline"
            size={18}
            color="#FFF"
          />

          <Text style={styles.actionText}>
            Open ticket scanner
          </Text>
        </Pressable>

        {/* Logout Button */}
        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons
            name="log-out-outline"
            size={18}
            color="#DC2626"
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<
    typeof Ionicons
  >['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons
        name={icon}
        size={18}
        color="#0D9488"
      />

      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  content: {
    padding: 16,
    paddingBottom: 28,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E8EEFA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '800',
    color: '#17233A',
  },

  headerSpacer: {
    width: 40,
  },

  profileCard: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 22,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#123B8B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  name: {
    color: '#17233A',
    fontSize: 20,
    fontWeight: '800',
  },

  position: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 4,
  },

  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D9F7EB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 12,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#078363',
  },

  activeText: {
    color: '#087458',
    fontSize: 9,
    fontWeight: '800',
  },

  detailsCard: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 14,
  },

  sectionTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 8,
  },

  detailRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  detailLabel: {
    flex: 1,
    color: '#64748B',
    fontSize: 12,
  },

  detailValue: {
    color: '#17233A',
    fontSize: 12,
    fontWeight: '700',
  },

  actionButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#123B8B',
    borderRadius: 10,
    marginTop: 14,
  },

  actionText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },

  logoutButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginTop: 12,
  },

  logoutText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800',
  },
});