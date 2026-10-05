import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ProvisioningScreen() {
  const [progress, setProgress] = useState(28);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => router.replace('/pass-activation'), 800);
          return 100;
        }
        return prev + 26;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color="#64748B" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="bus" size={22} color="#002060" />
          <View>
            <Text style={styles.title}>TransitLK <Text style={styles.countryTag}>SRI LANKA</Text></Text>
            <Text style={styles.subtitle}>Ministry of Transport & Highways</Text>
          </View>
        </View>

        <Text style={styles.sinhalaText}>ගිණුම සකසමින් පවතී. கணக்கு உருவாக்கப்படுகிறது</Text>

        {/* Circular Animated Radar Sync */}
        <View style={styles.syncCircle}>
          <View style={styles.syncInner}>
            <Ionicons name="qr-code-outline" size={32} color="#FFF" />
            <Text style={styles.syncingText}>SYNCING</Text>
          </View>
        </View>

        <View style={styles.badgeRow}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>ENCRYPTED PROVISIONING</Text>
        </View>

        <Text style={styles.mainHeading}>Setting Up Your TransitLK Account...</Text>
        <Text style={styles.description}>
          Verifying National Identity (NIC) with Department of Registration of Persons & synchronizing digital transit pass credentials.
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>⚡ Provisioning Smart Pass</Text>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.progressFooter}>
            <Text style={styles.sslText}>🔒 256-Bit SSL Secured</Text>
            <Text style={styles.estText}>Est. time remaining: 3s</Text>
          </View>
        </View>

        {/* Status Check Items */}
        <View style={styles.stepBox}>
          <View style={styles.stepRow}>
            <Ionicons name="checkmark-circle" size={18} color="#0D9488" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.stepTitle}>Mobile Number & OTP Verified</Text>
              <Text style={styles.stepSub}>+94 77 123 4567</Text>
            </View>
            <View style={styles.successPill}><Text style={styles.successText}>Success</Text></View>
          </View>

          <View style={styles.stepRow}>
            <Ionicons name="checkmark-circle" size={18} color="#0D9488" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.stepTitle}>NIC & Identity Match Confirmed</Text>
              <Text style={styles.stepSub}>NIC: 199824501234</Text>
            </View>
            <View style={styles.successPill}><Text style={styles.successText}>Success</Text></View>
          </View>

          <View style={styles.stepRow}>
            <ActivityIndicator size="small" color="#002060" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.stepTitle}>Issuing Digital Transit Pass</Text>
              <Text style={styles.stepSub}>Generating QR code & NFC token...</Text>
            </View>
            <View style={styles.activePill}><Text style={styles.activeText}>Active</Text></View>
          </View>

          <View style={styles.stepRow}>
            <Ionicons name="ellipse-outline" size={18} color="#94A3B8" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.stepTitle}>Connecting Commuter Wallet</Text>
              <Text style={styles.stepSub}>Western Province & SLTB LankaPay network</Text>
            </View>
            <View style={styles.pendingPill}><Text style={styles.pendingText}>Pending</Text></View>
          </View>
        </View>

        <TouchableOpacity style={styles.offlineBtn}>
          <Ionicons name="refresh" size={16} color="#002060" />
          <Text style={styles.offlineBtnText}>Taking too long? Tap to retry or continue in offline mode</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9', justifyContent: 'center', padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, elevation: 5 },
  closeBtn: { position: 'absolute', top: 15, right: 15, zIndex: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#002060' },
  countryTag: { fontSize: 9, backgroundColor: '#E2E8F0', paddingHorizontal: 4, borderRadius: 4 },
  subtitle: { fontSize: 10, color: '#64748B' },
  sinhalaText: { fontSize: 11, color: '#64748B', textAlign: 'center', marginVertical: 10 },
  syncCircle: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: '#38BDF8', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginVertical: 10 },
  syncInner: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#002060', justifyContent: 'center', alignItems: 'center' },
  syncingText: { color: '#FFF', fontSize: 9, fontWeight: 'bold', marginTop: 2 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#CCFBF1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'center', gap: 6, marginBottom: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0D9488' },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#0D9488' },
  mainHeading: { fontSize: 18, fontWeight: 'bold', color: '#002060', textAlign: 'center', marginBottom: 6 },
  description: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18, marginBottom: 15 },
  progressContainer: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10, marginBottom: 15 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressTitle: { fontSize: 12, fontWeight: 'bold', color: '#002060' },
  progressPercent: { fontSize: 12, fontWeight: 'bold', color: '#002060' },
  progressBarTrack: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#0D9488' },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  sslText: { fontSize: 10, color: '#64748B' },
  estText: { fontSize: 10, color: '#64748B' },
  stepBox: { gap: 10, marginBottom: 15 },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepTitle: { fontSize: 12, fontWeight: 'bold', color: '#0F172A' },
  stepSub: { fontSize: 10, color: '#64748B' },
  successPill: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  successText: { color: '#166534', fontSize: 10, fontWeight: 'bold' },
  activePill: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  activeText: { color: '#1E40AF', fontSize: 10, fontWeight: 'bold' },
  pendingPill: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  pendingText: { color: '#64748B', fontSize: 10, fontWeight: 'bold' },
  offlineBtn: { borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed', borderRadius: 8, padding: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  offlineBtnText: { fontSize: 11, color: '#002060', fontWeight: '600' },
});