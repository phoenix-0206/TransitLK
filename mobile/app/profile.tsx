import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../services/supabase';

type ProfileData = {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  role: string | null;
  pass_category: string | null;
};

type MenuItemProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  onPress: () => void;
  danger?: boolean;
};

function MenuItem({ icon, title, subtitle, onPress, danger = false }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.menuIcon, danger && styles.dangerIcon]}>
        <Ionicons name={icon} size={19} color={danger ? '#DC2626' : '#123B8B'} />
      </View>
      <View style={styles.menuCopy}>
        <Text style={[styles.menuText, danger && styles.dangerText]}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [savedRouteCount, setSavedRouteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [phoneDraft, setPhoneDraft] = useState('');

  useEffect(() => {
    void fetchUserProfile();
  }, []);

  async function fetchUserProfile(showRefresh = false) {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.replace('/login');
        return;
      }

      const [{ data, error }, { count }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, phone_number, avatar_url, role, pass_category')
          .eq('id', user.id)
          .single(),
        supabase
          .from('saved_routes')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      if (error) throw error;
      const nextProfile = data as ProfileData;
      setProfile(nextProfile);
      setSavedRouteCount(count ?? 0);
      setNameDraft(nextProfile.full_name ?? '');
      setPhoneDraft(nextProfile.phone_number ?? '');
    } catch (err) {
      console.error('Error fetching profile:', err);
      Alert.alert('Profile unavailable', 'We could not load your profile. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function saveProfile() {
    const fullName = nameDraft.trim();
    const phoneNumber = phoneDraft.trim();
    if (!fullName) {
      Alert.alert('Name required', 'Enter your name before saving.');
      return;
    }

    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      router.replace('/login');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone_number: phoneNumber || null })
      .eq('id', user.id)
      .select('id, full_name, phone_number, avatar_url, role, pass_category')
      .single();

    setSaving(false);
    if (error) {
      Alert.alert('Could not save profile', error.message);
      return;
    }
    setProfile(data as ProfileData);
    setEditVisible(false);
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Could not log out', error.message);
      return;
    }
    router.replace('/login');
  }

  function openEditProfile() {
    setNameDraft(profile?.full_name ?? '');
    setPhoneDraft(profile?.phone_number ?? '');
    setEditVisible(true);
  }

  function showComingSoon(title: string, message: string) {
    Alert.alert(title, message);
  }

  const initials = useMemo(() => {
    const name = profile?.full_name?.trim();
    if (!name) return 'TL';
    return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }, [profile?.full_name]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#123B8B" />
        <Text style={styles.loadingText}>Loading your profile…</Text>
      </View>
    );
  }

  const passCategory = profile?.pass_category?.replace(/_/g, ' ') || 'Regular commuter';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void fetchUserProfile(true)}
            tintColor="#123B8B"
          />
        )}
      >
        <View style={styles.topBar}>
          <View>
            <Text style={styles.eyebrow}>TRANSITLK ACCOUNT</Text>
            <Text style={styles.pageTitle}>My Profile</Text>
          </View>
          <TouchableOpacity style={styles.headerIcon} onPress={openEditProfile} accessibilityLabel="Edit profile">
            <Ionicons name="create-outline" size={20} color="#123B8B" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileCardGlow} />
          <View style={styles.avatarCircle}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.identityBlock}>
            <Text style={styles.userName}>{profile?.full_name || 'TransitLK Commuter'}</Text>
            <Text style={styles.userPhone}>{profile?.phone_number || 'No phone linked'}</Text>
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#7CF4DF" />
              <Text style={styles.roleText}>{(profile?.role || 'commuter').toUpperCase()}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={openEditProfile}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{savedRouteCount}</Text>
            <Text style={styles.statLabel}>Saved routes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>Live</Text>
            <Text style={styles.statLabel}>GPS access</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>LK</Text>
            <Text style={styles.statLabel}>Travel region</Text>
          </View>
        </View>

        <View style={styles.passCard}>
          <View style={styles.passIcon}><Ionicons name="card" size={22} color="#75F3D8" /></View>
          <View style={styles.passCopy}>
            <Text style={styles.passLabel}>SMART PASS</Text>
            <Text style={styles.passTitle}>{passCategory}</Text>
            <Text style={styles.passSubtitle}>Ready for connected travel</Text>
          </View>
          <TouchableOpacity onPress={() => showComingSoon('Smart Pass', 'Pass top-up and card management will be available here soon.')}>
            <Ionicons name="arrow-forward-circle" size={27} color="#75F3D8" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>TRAVEL SHORTCUTS</Text>
        <View style={styles.shortcutGrid}>
          <TouchableOpacity style={styles.shortcutCard} onPress={() => router.push('/two')}>
            <View style={[styles.shortcutIcon, { backgroundColor: '#E0F2FE' }]}><Ionicons name="bookmark" size={20} color="#0369A1" /></View>
            <Text style={styles.shortcutTitle}>Saved routes</Text>
            <Text style={styles.shortcutSubtitle}>{savedRouteCount} bookmarked</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortcutCard} onPress={() => router.push('/interactive-route-map')}>
            <View style={[styles.shortcutIcon, { backgroundColor: '#DDFBF4' }]}><Ionicons name="map" size={20} color="#0D9488" /></View>
            <Text style={styles.shortcutTitle}>Live map</Text>
            <Text style={styles.shortcutSubtitle}>Track nearby buses</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortcutCard} onPress={() => router.push('/timetable-schedules')}>
            <View style={[styles.shortcutIcon, { backgroundColor: '#EDE9FE' }]}><Ionicons name="time" size={20} color="#6D28D9" /></View>
            <Text style={styles.shortcutTitle}>Timetables</Text>
            <Text style={styles.shortcutSubtitle}>Plan your journey</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortcutCard} onPress={() => router.push('/conductor')}>
            <View style={[styles.shortcutIcon, { backgroundColor: '#FEF3C7' }]}><Ionicons name="navigate" size={20} color="#B45309" /></View>
            <Text style={styles.shortcutTitle}>Share GPS</Text>
            <Text style={styles.shortcutSubtitle}>Conductor mode</Text>
          </TouchableOpacity>
        </View>

        {profile?.role === 'admin' && (
          <View style={styles.adminSection}>
            <Text style={styles.sectionHeader}>ADMINISTRATOR PRIVILEGES</Text>
            <TouchableOpacity 
              style={styles.adminBtn} 
              onPress={() => router.push('/admin' as any)}
            >
              <View style={styles.adminBtnLeft}>
                <View style={styles.adminIcon}><Ionicons name="shield-checkmark" size={19} color="#FFF" /></View>
                <View>
                  <Text style={styles.adminBtnText}>Admin control panel</Text>
                  <Text style={styles.adminBtnSubtext}>Manage buses, schedules, and users</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionHeader}>ACCOUNT &amp; PRIVACY</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="receipt-outline"
            title="Transaction History"
            subtitle="View ticket payments and top-up records"
            onPress={() => router.push('/passenger/purchase-history' as any)}
          />
          <MenuItem icon="notifications-outline" title="Notifications" subtitle="Live bus alerts and service updates" onPress={() => showComingSoon('Notifications', 'Notification preferences will be available here soon.')} />
          <MenuItem icon="language-outline" title="Language" subtitle="English • සිංහල available soon" onPress={() => showComingSoon('Language', 'Language selection will be available here soon.')} />
          <MenuItem icon="shield-checkmark-outline" title="Privacy & permissions" subtitle="Location and account access" onPress={() => showComingSoon('Privacy & permissions', 'Review location and account permissions in your device settings.')} />
          <MenuItem icon="help-circle-outline" title="Help & feedback" subtitle="Get support for your journey" onPress={() => showComingSoon('Help & feedback', 'TransitLK support tools will be available here soon.')} />
          <MenuItem icon="log-out-outline" title="Log out" subtitle="Sign out of this device" onPress={() => void handleLogout()} danger />
        </View>
      </ScrollView>

      <Modal visible={editVisible} transparent animationType="slide" onRequestClose={() => setEditVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>ACCOUNT DETAILS</Text>
                <Text style={styles.modalTitle}>Edit profile</Text>
              </View>
              <TouchableOpacity onPress={() => setEditVisible(false)} accessibilityLabel="Close edit profile">
                <Ionicons name="close-circle-outline" size={25} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Full name</Text>
            <TextInput style={styles.input} value={nameDraft} onChangeText={setNameDraft} placeholder="Your full name" placeholderTextColor="#94A3B8" />
            <Text style={styles.inputLabel}>Phone number</Text>
            <TextInput style={styles.input} value={phoneDraft} onChangeText={setPhoneDraft} placeholder="+94 77 123 4567" placeholderTextColor="#94A3B8" keyboardType="phone-pad" />
            <TouchableOpacity style={styles.saveButton} onPress={() => void saveProfile()} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Save changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F7FB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7FB' },
  loadingText: { color: '#64748B', fontSize: 12, marginTop: 10 },
  container: { padding: 16, paddingBottom: 30 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  eyebrow: { color: '#0D9488', fontSize: 10, fontWeight: '800', letterSpacing: 1.1 },
  pageTitle: { color: '#102653', fontSize: 27, fontWeight: '900', marginTop: 2 },
  headerIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  profileCard: { minHeight: 136, borderRadius: 20, backgroundColor: '#0B2F78', padding: 18, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', shadowColor: '#0B2F78', shadowOpacity: 0.22, shadowRadius: 14, shadowOffset: { width: 0, height: 7 }, elevation: 4 },
  profileCardGlow: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: '#16499C', right: -70, top: -95, opacity: 0.7 },
  avatarCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#1763A5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#75F3D8', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: '#FFF', fontSize: 23, fontWeight: '900' },
  onlineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#5BFFBD', position: 'absolute', right: 1, bottom: 5, borderWidth: 2, borderColor: '#0B2F78' },
  identityBlock: { flex: 1, marginLeft: 13 },
  userName: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  userPhone: { color: '#B7C8E9', fontSize: 11, marginTop: 4 },
  roleBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#12498B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 9 },
  roleText: { color: '#B9FFF0', fontWeight: '800', fontSize: 9, letterSpacing: 0.5 },
  editButton: { borderWidth: 1, borderColor: '#5684C7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' },
  editButtonText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  statsCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 15, marginTop: 12, paddingVertical: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: '#123B8B', fontSize: 18, fontWeight: '900' },
  statLabel: { color: '#64748B', fontSize: 10, marginTop: 3 },
  statDivider: { width: 1, backgroundColor: '#E2E8F0' },
  passCard: { backgroundColor: '#102D67', borderRadius: 16, padding: 15, marginTop: 12, flexDirection: 'row', alignItems: 'center' },
  passIcon: { width: 43, height: 43, borderRadius: 13, backgroundColor: '#1C477E', alignItems: 'center', justifyContent: 'center' },
  passCopy: { flex: 1, marginLeft: 11 },
  passLabel: { color: '#77F4DA', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  passTitle: { color: '#FFF', fontSize: 15, fontWeight: '800', marginTop: 3, textTransform: 'capitalize' },
  passSubtitle: { color: '#B7C8E9', fontSize: 10, marginTop: 3 },
  sectionHeader: { color: '#64748B', fontSize: 10, fontWeight: '900', letterSpacing: 0.8, marginTop: 22, marginBottom: 9 },
  shortcutGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  shortcutCard: { width: '48%', minHeight: 105, backgroundColor: '#FFF', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  shortcutIcon: { width: 37, height: 37, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  shortcutTitle: { color: '#102653', fontSize: 13, fontWeight: '800', marginTop: 9 },
  shortcutSubtitle: { color: '#64748B', fontSize: 10, marginTop: 3 },
  adminSection: { marginTop: 2 },
  adminBtn: { backgroundColor: '#0D9488', borderRadius: 14, padding: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  adminBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  adminIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  adminBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
  adminBtnSubtext: { color: '#C8FFF5', fontSize: 10, marginTop: 3 },
  menuCard: { backgroundColor: '#FFF', borderRadius: 15, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  menuItem: { minHeight: 68, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#EEF3FF', alignItems: 'center', justifyContent: 'center' },
  dangerIcon: { backgroundColor: '#FEE2E2' },
  menuCopy: { flex: 1, marginLeft: 11 },
  menuText: { color: '#102653', fontSize: 13, fontWeight: '800' },
  dangerText: { color: '#DC2626' },
  menuSubtitle: { color: '#64748B', fontSize: 10, marginTop: 3 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(2, 10, 27, 0.55)' },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalEyebrow: { color: '#0D9488', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  modalTitle: { color: '#102653', fontSize: 23, fontWeight: '900', marginTop: 3 },
  inputLabel: { color: '#334155', fontSize: 11, fontWeight: '800', marginBottom: 6, marginTop: 10 },
  input: { height: 46, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 11, paddingHorizontal: 12, color: '#102653', fontSize: 14 },
  saveButton: { height: 48, borderRadius: 11, backgroundColor: '#123B8B', alignItems: 'center', justifyContent: 'center', marginTop: 21 },
  saveButtonText: { color: '#FFF', fontSize: 14, fontWeight: '900' },
});
