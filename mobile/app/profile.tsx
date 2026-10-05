import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { supabase } from '../services/supabase';
import { router } from 'expo-router';
import type { Profile } from '../types/database';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setUserId(user.id);
      setEmail(user.email ?? '');

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<Profile>();

      if (data) {
        setFullName(data.full_name ?? '');
        setPhone(data.phone_number ?? '');
      }
    }
    setLoading(false);
  }

  async function updateProfile() {
    if (!userId) return;
    setSaving(true);

    const update: Partial<Profile> & { id: string } = {
      id: userId,
      full_name: fullName.trim() || null,
      phone_number: phone.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('profiles').upsert(update);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Saved!', 'Profile details updated successfully.');
    }
    setSaving(false);
  }

  async function handleSignOut() {
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Smart Pass & Profile</Text>

      {/* Smart Pass Card */}
      <View style={styles.passCard}>
        <Text style={styles.passCardTitle}>TRANSITLK SMART PASS</Text>
        <Text style={styles.passNumber}>
          ID: {userId ? userId.substring(0, 12).toUpperCase() : '—'}
        </Text>
        <View style={styles.passFooter}>
          <Text style={styles.passStatus}>● ACTIVE</Text>
          <Text style={styles.passBalance}>Balance: LKR 1,250.00</Text>
        </View>
      </View>

      {/* Profile Form */}
      <View style={styles.formSection}>
        <Text style={styles.sectionHeader}>Personal Details</Text>

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={email}
          editable={false}
          selectTextOnFocus={false}
        />

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter your full name"
          placeholderTextColor="#AAA"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+94 7X XXX XXXX"
          placeholderTextColor="#AAA"
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={[styles.updateBtn, saving && styles.btnDisabled]}
          onPress={updateProfile}
          disabled={saving}
        >
          <Text style={styles.updateBtnText}>{saving ? 'Saving...' : 'Update Details'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#002060', marginTop: 10, marginBottom: 20 },
  passCard: {
    backgroundColor: '#002060', borderRadius: 16, padding: 22,
    marginBottom: 24, elevation: 5,
  },
  passCardTitle: { color: '#FFC000', fontWeight: 'bold', fontSize: 13, letterSpacing: 1.5 },
  passNumber: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginVertical: 16, letterSpacing: 1 },
  passFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 12,
  },
  passStatus: { color: '#4CD964', fontWeight: 'bold', fontSize: 13 },
  passBalance: { color: '#FFF', fontWeight: '600', fontSize: 13 },
  formSection: {
    backgroundColor: '#FFF', padding: 18, borderRadius: 14,
    borderWidth: 1, borderColor: '#E5E5EA', elevation: 1,
  },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#002060', marginBottom: 18 },
  label: { fontSize: 12, color: '#666', marginBottom: 5, fontWeight: '500' },
  input: {
    backgroundColor: '#F9F9F9', padding: 13, borderRadius: 10,
    borderWidth: 1, borderColor: '#DDD', marginBottom: 16, fontSize: 15, color: '#333',
  },
  inputDisabled: { backgroundColor: '#EFEFEF', color: '#888' },
  updateBtn: {
    backgroundColor: '#002060', padding: 15, borderRadius: 10,
    alignItems: 'center', marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  updateBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  logoutBtn: {
    backgroundColor: '#FF3B30', padding: 15, borderRadius: 10,
    alignItems: 'center', marginTop: 12,
  },
  logoutBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});