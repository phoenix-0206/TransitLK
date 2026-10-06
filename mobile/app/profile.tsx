import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../services/supabase';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  async function fetchUserProfile() {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace('/login');
        return;
      }

      // Fetch user profile details including the 'role' column
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#002060" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={32} color="#FFF" />
          </View>
          <Text style={styles.userName}>{profile?.full_name || 'TransitLK Commuter'}</Text>
          <Text style={styles.userPhone}>{profile?.phone_number || 'No phone linked'}</Text>
          
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {(profile?.role || 'commuter').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* CONDITIONAL ADMIN BUTTON: Rendered only if role is admin */}
        {profile?.role === 'admin' && (
          <View style={styles.adminSection}>
            <Text style={styles.sectionHeader}>ADMINISTRATOR PRIVILEGES</Text>
            <TouchableOpacity 
              style={styles.adminBtn} 
              onPress={() => router.push('/admin' as any)}
            >
              <View style={styles.adminBtnLeft}>
                <Ionicons name="shield-checkmark" size={20} color="#FFF" />
                <Text style={styles.adminBtnText}>Open Admin Control Panel</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* General Settings */}
        <Text style={styles.sectionHeader}>ACCOUNT SETTINGS</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="card-outline" size={20} color="#002060" />
          <Text style={styles.menuText}>Smart Pass Details</Text>
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={20} color="#002060" />
          <Text style={styles.menuText}>Notification Preferences</Text>
          <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16 },
  profileCard: { backgroundColor: '#002060', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20 },
  avatarCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#1E3A8A', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  userPhone: { fontSize: 12, color: '#93C5FD', marginTop: 2 },
  roleBadge: { backgroundColor: '#0D9488', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 10 },
  roleText: { color: '#FFF', fontWeight: 'bold', fontSize: 10 },
  adminSection: { marginBottom: 20 },
  sectionHeader: { fontSize: 11, fontWeight: 'bold', color: '#64748B', marginBottom: 8, letterSpacing: 0.5 },
  adminBtn: { backgroundColor: '#0D9488', padding: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
  adminBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  adminBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  menuItem: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  menuText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#0F172A' },
  logoutBtn: { backgroundColor: '#FEE2E2', borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 },
  logoutText: { color: '#DC2626', fontWeight: 'bold', fontSize: 14 },
});