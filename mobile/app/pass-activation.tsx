import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../services/supabase';

export default function PassActivationScreen() {
  const [passMedium, setPassMedium] = useState<'virtual' | 'physical'>('virtual');
  const [category, setCategory] = useState<'regular' | 'student' | 'senior'>('regular');
  const [balance, setBalance] = useState('1000');
  const [cardName, setCardName] = useState('TransitLK Commuter');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      const name = user?.user_metadata?.full_name;
      if (typeof name === 'string' && name.trim()) setCardName(name.trim());
    });
  }, []);

  async function finishPassSetup() {
    setSaving(true);
    setErrorMessage('');
    const { error } = await supabase.auth.updateUser({
      data: {
        pass_setup_pending: false,
        pass_medium: passMedium,
        pass_category: category,
        starting_balance_requested: balance,
      },
    });
    setSaving(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Step Bar */}
        <View style={styles.stepBar}>
          <View style={styles.stepDone}>
            <Ionicons name="checkmark" size={14} color="#FFF" />
          </View>
          <Text style={styles.stepDoneText}>STEP 1 Profile Created</Text>
          <View style={styles.stepLine} />
          <View style={styles.stepActive}>
            <Text style={styles.stepActiveNum}>2</Text>
          </View>
          <Text style={styles.stepActiveText}>STEP 2 Pass Activation</Text>
        </View>

        <Text style={styles.title}>Activate Your Smart Pass</Text>
        <Text style={styles.subtitle}>
          Pair your National Identity Card (NIC) or link an instant Virtual QR Smart Card for tap-and-go travel across SLTB buses and Sri Lanka Railways.
        </Text>

        {/* Digital Card Preview */}
        <View style={styles.cardPreview}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardBrand}>TRANSITLK SMART PASS LK</Text>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>● PENDING ACTIVATION</Text>
            </View>
          </View>
          <Text style={styles.cardName}>{cardName}</Text>
          <Text style={styles.cardNumber}>Pass not activated</Text>
          <Text style={styles.cardNetwork}>NETWORK: SLTB • Rail • Bus</Text>
        </View>

        {/* Pass Medium Choice */}
        <Text style={styles.sectionTitle}>Select Pass Medium</Text>
        <TouchableOpacity
          style={[styles.mediumBox, passMedium === 'virtual' && styles.mediumBoxActive]}
          onPress={() => setPassMedium('virtual')}
        >
          <Ionicons
            name={passMedium === 'virtual' ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color="#002060"
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.mediumTitle}>Virtual QR & NFC Mobile Pass</Text>
            <Text style={styles.mediumSub}>Tap-to-ride using your smartphone screen and NFC wallet.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mediumBox, passMedium === 'physical' && styles.mediumBoxActive]}
          onPress={() => setPassMedium('physical')}
        >
          <Ionicons
            name={passMedium === 'physical' ? 'checkmark-circle' : 'ellipse-outline'}
            size={20}
            color="#002060"
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.mediumTitle}>Link Physical LankaPay / NFC Card</Text>
            <Text style={styles.mediumSub}>Connect an existing contactless LankaPay smart card.</Text>
          </View>
        </TouchableOpacity>

        {/* Identity & Category */}
        <Text style={styles.sectionTitle}>Fare Eligibility</Text>
        <Text style={styles.identityNote}>
          Choose a fare category below. This app does not verify or store NIC/passport details on this screen.
        </Text>

        <View style={styles.categoryRow}>
          {[
            { key: 'regular', label: 'Regular', sub: 'Standard Fare' },
            { key: 'student', label: 'Student', sub: '50% Off' },
            { key: 'senior', label: 'Senior (60+)', sub: '25% Off' },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.catCard, category === cat.key && styles.catCardActive]}
              onPress={() => setCategory(cat.key as any)}
            >
              <Text style={[styles.catTitle, category === cat.key && styles.catTextActive]}>{cat.label}</Text>
              <Text style={styles.catSub}>{cat.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Balance Top up */}
        <Text style={styles.sectionTitle}>Starting Balance</Text>
        <Text style={styles.identityNote}>Select an intended amount; payment is not processed here.</Text>
        <View style={styles.balanceRow}>
          {['500', '1000', '2500'].map((amt) => (
            <TouchableOpacity
              key={amt}
              style={[styles.balanceChip, balance === amt && styles.balanceChipActive]}
              onPress={() => setBalance(amt)}
            >
              <Text style={[styles.balanceText, balance === amt && styles.balanceTextActive]}>LKR {amt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!!errorMessage && <Text accessibilityRole="alert" style={styles.errorText}>{errorMessage}</Text>}
        <TouchableOpacity style={styles.activateBtn} onPress={finishPassSetup} disabled={saving}>
          <Text style={styles.activateBtnText}>{saving ? 'Saving...' : 'Save Pass Setup & Enter App'}</Text>
          {!saving && <Ionicons name="arrow-forward" size={18} color="#FFF" />}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 18 },
  stepBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  stepDone: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#0D9488', justifyContent: 'center', alignItems: 'center' },
  stepDoneText: { fontSize: 11, fontWeight: 'bold', color: '#0D9488', marginLeft: 6 },
  stepLine: { flex: 1, height: 2, backgroundColor: '#CBD5E1', marginHorizontal: 8 },
  stepActive: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#002060', justifyContent: 'center', alignItems: 'center' },
  stepActiveNum: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  stepActiveText: { fontSize: 11, fontWeight: 'bold', color: '#002060', marginLeft: 6 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#002060', marginBottom: 6 },
  subtitle: { fontSize: 12, color: '#64748B', lineHeight: 18, marginBottom: 15 },
  cardPreview: { backgroundColor: '#002060', borderRadius: 14, padding: 16, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBrand: { color: '#FFC000', fontWeight: 'bold', fontSize: 11 },
  pendingBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  pendingText: { color: '#D97706', fontSize: 9, fontWeight: 'bold' },
  cardName: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginTop: 15 },
  cardNumber: { color: '#CBD5E1', fontSize: 12, marginTop: 4 },
  cardNetwork: { color: '#94A3B8', fontSize: 10, marginTop: 10 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#0F172A', marginBottom: 8, marginTop: 10 },
  mediumBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, marginBottom: 8 },
  mediumBoxActive: { borderColor: '#002060', backgroundColor: '#EEF2FF' },
  mediumTitle: { fontSize: 13, fontWeight: 'bold', color: '#0F172A' },
  mediumSub: { fontSize: 11, color: '#64748B' },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, height: 46, marginBottom: 12 },
  textInput: { flex: 1, fontSize: 13, color: '#0F172A' },
  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  catCard: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, padding: 10, alignItems: 'center' },
  catCardActive: { backgroundColor: '#002060', borderColor: '#002060' },
  catTitle: { fontSize: 12, fontWeight: 'bold', color: '#0F172A' },
  catTextActive: { color: '#FFF' },
  catSub: { fontSize: 9, color: '#64748B' },
  balanceRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  balanceChip: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  balanceChipActive: { backgroundColor: '#002060', borderColor: '#002060' },
  balanceText: { fontWeight: 'bold', fontSize: 12, color: '#002060' },
  balanceTextActive: { color: '#FFF' },
  activateBtn: { backgroundColor: '#002060', height: 50, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 20 },
  activateBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  identityNote: { fontSize: 11, color: '#64748B', lineHeight: 16, marginBottom: 8 },
  errorText: { color: '#B91C1C', fontSize: 12, marginBottom: 8 },
});