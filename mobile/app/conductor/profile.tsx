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

import { useRouter } from 'expo-router';

import { supabase } from '../../services/supabase';

export default function ConductorProfileScreen() {
  const router = useRouter();

  // Temporary data.
  // Later this can be loaded from conductor_profiles.
  const conductor = {
    name: 'Sunil Perera',
    initials: 'SP',
    role: 'Senior Conductor',
    badgeId: '#7842',
    position: 'Senior Conductor',
    depot: 'Pettah Central',
    shift: '06:00 - 14:30',
    status: 'Active',
  };

  // ================= LOGOUT =================

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
          onPress: async () => {
            const { error } = await supabase.auth.signOut();

            if (error) {
              Alert.alert(
                'Logout Failed',
                error.message
              );
              return;
            }

            // Return to role selection after logout
            router.replace('/role-selection');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ================= HEADER ================= */}

        <View style={styles.header}>

          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>
              ←
            </Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Profile
          </Text>

          <View style={styles.headerSpace} />

        </View>

        {/* ================= PROFILE CARD ================= */}

        <View style={styles.profileCard}>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {conductor.initials}
            </Text>
          </View>

          <Text style={styles.name}>
            {conductor.name}
          </Text>

          <Text style={styles.role}>
            {conductor.role}
          </Text>

          <View style={styles.activeBadge}>

            <View style={styles.activeDot} />

            <Text style={styles.activeText}>
              {conductor.status}
            </Text>

          </View>

        </View>

        {/* ================= DETAILS ================= */}

        <Text style={styles.sectionTitle}>
          Conductor Details
        </Text>

        <View style={styles.detailsCard}>

          {/* Badge ID */}

          <View style={styles.detailRow}>

            <View style={styles.detailIcon}>
              <Text style={styles.iconText}>
                ▣
              </Text>
            </View>

            <View style={styles.detailContent}>

              <Text style={styles.detailLabel}>
                Badge ID
              </Text>

              <Text style={styles.detailValue}>
                {conductor.badgeId}
              </Text>

            </View>

          </View>

          <View style={styles.line} />

          {/* Position */}

          <View style={styles.detailRow}>

            <View style={styles.detailIcon}>
              <Text style={styles.iconText}>
                ◆
              </Text>
            </View>

            <View style={styles.detailContent}>

              <Text style={styles.detailLabel}>
                Position
              </Text>

              <Text style={styles.detailValue}>
                {conductor.position}
              </Text>

            </View>

          </View>

          <View style={styles.line} />

          {/* Depot */}

          <View style={styles.detailRow}>

            <View style={styles.detailIcon}>
              <Text style={styles.iconText}>
                ⌂
              </Text>
            </View>

            <View style={styles.detailContent}>

              <Text style={styles.detailLabel}>
                Depot
              </Text>

              <Text style={styles.detailValue}>
                {conductor.depot}
              </Text>

            </View>

          </View>

          <View style={styles.line} />

          {/* Shift */}

          <View style={styles.detailRow}>

            <View style={styles.detailIcon}>
              <Text style={styles.iconText}>
                ◷
              </Text>
            </View>

            <View style={styles.detailContent}>

              <Text style={styles.detailLabel}>
                Current Shift
              </Text>

              <Text style={styles.detailValue}>
                {conductor.shift}
              </Text>

            </View>

          </View>

        </View>

        {/* ================= BACK TO DASHBOARD ================= */}

        <Pressable
          style={styles.dashboardButton}
          onPress={() =>
            router.push('/conductor/dashboard')
          }
        >
          <Text style={styles.dashboardIcon}>
            ←
          </Text>

          <Text style={styles.dashboardText}>
            Back to Dashboard
          </Text>
        </Pressable>

        {/* ================= LOGOUT ================= */}

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutIcon}>
            ⇥
          </Text>

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  // ================= HEADER =================

  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E7EEF2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    fontSize: 23,
    color: '#123B56',
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#123B56',
  },

  headerSpace: {
    width: 42,
  },

  // ================= PROFILE =================

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 28,
    alignItems: 'center',
    marginBottom: 28,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#123B56',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 31,
    fontWeight: '800',
  },

  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#123B56',
  },

  role: {
    fontSize: 14,
    color: '#71808A',
    marginTop: 5,
  },

  activeBadge: {
    marginTop: 13,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#E3F4F3',
    flexDirection: 'row',
    alignItems: 'center',
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#087F80',
    marginRight: 7,
  },

  activeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#087F80',
  },

  // ================= DETAILS =================

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#123B56',
    marginBottom: 12,
  },

  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 17,
  },

  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EAF0F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  iconText: {
    fontSize: 18,
    color: '#123B56',
    fontWeight: '700',
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 12,
    color: '#7B858C',
    marginBottom: 3,
  },

  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#123B56',
  },

  line: {
    height: 1,
    backgroundColor: '#E7ECEF',
  },

  // ================= DASHBOARD BUTTON =================

  dashboardButton: {
    marginTop: 20,
    backgroundColor: '#E8EDF1',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  dashboardIcon: {
    fontSize: 18,
    color: '#123B56',
    marginRight: 8,
  },

  dashboardText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#123B56',
  },

  // ================= LOGOUT BUTTON =================

  logoutButton: {
    marginTop: 12,
    backgroundColor: '#FFE8E8',
    borderWidth: 1,
    borderColor: '#D32F2F',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  logoutIcon: {
    fontSize: 19,
    color: '#D32F2F',
    marginRight: 8,
    fontWeight: '700',
  },

  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#D32F2F',
  },
});