import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SignUpLoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Brief transition after account creation; pass details are collected next.
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const next = Math.min(prev + 50, 100);
        if (next === 100) {
          clearInterval(timer);
          setTimeout(() => router.replace('/pass-activation'), 500);
        }
        return next;
      });
    }, 450);

    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.modalCard}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={20} color="#64748B" />
        </TouchableOpacity>

        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="bus" size={18} color="#FFF" />
          </View>
          <View>
            <Text style={styles.brandTitle}>TransitLK <Text style={styles.countryTag}>SRI LANKA</Text></Text>
            <Text style={styles.brandSub}>Ministry of Transport & Highways</Text>
          </View>
        </View>

        <Text style={styles.sinhalaText}>ගිණුම සකසමින් පවතී. கணக்கு உருவாக்கப்படுகிறது</Text>

        {/* Circular Radar Sync Animated Indicator */}
        <View style={styles.radarCircle}>
          <View style={styles.radarInner}>
            <Ionicons name="qr-code-outline" size={28} color="#FFF" />
            <Text style={styles.syncingText}>SYNCING</Text>
          </View>
        </View>

        {/* Status Encrypted Tag */}
        <View style={styles.encryptedPill}>
          <View style={styles.greenDot} />
          <Text style={styles.encryptedText}>ACCOUNT CREATED</Text>
        </View>

        <Text style={styles.mainTitle}>Your Account Is Ready</Text>
        <Text style={styles.descriptionText}>
          Next, choose your Smart Pass type and provide any identity details needed for your selected fare category.
        </Text>

        {/* Provisioning Progress Card */}
        <View style={styles.progressBox}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Preparing pass setup</Text>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress}%` }]} />
          </View>

          <View style={styles.progressFooter}>
              <Text style={styles.secText}>Account created securely</Text>
            <Text style={styles.estText}>Next: pass activation</Text>
          </View>
        </View>

        {/* Checklist Steps */}
        <View style={styles.checklist}>
          <View style={styles.checkItem}>
            <Ionicons name="checkmark-circle" size={18} color="#0D9488" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.itemTitle}>TransitLK account created</Text>
              <Text style={styles.itemSub}>Your sign-up credentials were accepted</Text>
            </View>
            <View style={styles.successTag}><Text style={styles.successText}>Success</Text></View>
          </View>

          <View style={styles.checkItem}>
            <Ionicons name="checkmark-circle" size={18} color="#0D9488" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.itemTitle}>Profile details submitted</Text>
              <Text style={styles.itemSub}>Your name and contact details are associated with the account</Text>
            </View>
            <View style={styles.successTag}><Text style={styles.successText}>Success</Text></View>
          </View>

          <View style={styles.checkItem}>
            <Ionicons name="arrow-forward-circle-outline" size={18} color="#002060" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.itemTitle}>Smart Pass setup is next</Text>
              <Text style={styles.itemSub}>Choose a virtual or physical pass on the next screen</Text>
            </View>
            <View style={styles.activeTag}><Text style={styles.activeText}>Next</Text></View>
          </View>

          <View style={styles.checkItem}>
            <Ionicons name="ellipse-outline" size={18} color="#CBD5E1" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.itemTitle}>No pass or wallet is active yet</Text>
              <Text style={styles.itemSub}>Activation happens after you complete the next step</Text>
            </View>
            <View style={styles.pendingTag}><Text style={styles.pendingText}>Pending</Text></View>
          </View>
        </View>

        {/* Commuter Tip Banner */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={18} color="#0D9488" />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.tipTitle}>Commuter Tip</Text>
            <Text style={styles.tipText}>
              You can review your pass type and fare category before finishing setup. No balance is added during account creation.
            </Text>
          </View>
        </View>

        {/* Offline Fallback Action */}
        <TouchableOpacity style={styles.fallbackBtn} onPress={() => router.replace('/pass-activation')}>
          <Ionicons name="refresh-outline" size={16} color="#002060" />
          <Text style={styles.fallbackText}>Continue to Smart Pass setup</Text>
        </TouchableOpacity>

        <View style={styles.gatewayRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" />
          <Text style={styles.gatewayText}>Official Ministry of Transport & Highways Secure Gateway</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, elevation: 6 },
  closeBtn: { position: 'absolute', top: 15, right: 15, zIndex: 10, padding: 4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBadge: { backgroundColor: '#002060', padding: 6, borderRadius: 8 },
  brandTitle: { fontSize: 16, fontWeight: 'bold', color: '#002060' },
  countryTag: { fontSize: 9, backgroundColor: '#E2E8F0', paddingHorizontal: 4, borderRadius: 4, color: '#002060' },
  brandSub: { fontSize: 10, color: '#64748B' },
  sinhalaText: { fontSize: 11, color: '#64748B', textAlign: 'center', marginVertical: 10 },
  radarCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#38BDF8', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginVertical: 8 },
  radarInner: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#002060', justifyContent: 'center', alignItems: 'center' },
  syncingText: { color: '#FFF', fontSize: 8, fontWeight: 'bold', marginTop: 2 },
  encryptedPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#CCFBF1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'center', gap: 6, marginBottom: 8 },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0D9488' },
  encryptedText: { fontSize: 10, fontWeight: 'bold', color: '#0D9488' },
  mainTitle: { fontSize: 18, fontWeight: 'bold', color: '#002060', textAlign: 'center', marginBottom: 4 },
  descriptionText: { fontSize: 11, color: '#64748B', textAlign: 'center', lineHeight: 16, marginBottom: 14 },
  progressBox: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10, marginBottom: 14 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, fontWeight: 'bold', color: '#002060' },
  progressPercent: { fontSize: 12, fontWeight: 'bold', color: '#002060' },
  track: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#0D9488' },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  secText: { fontSize: 10, color: '#64748B' },
  estText: { fontSize: 10, color: '#64748B' },
  checklist: { gap: 10, marginBottom: 14 },
  checkItem: { flexDirection: 'row', alignItems: 'center' },
  itemTitle: { fontSize: 12, fontWeight: 'bold', color: '#0F172A' },
  itemSub: { fontSize: 10, color: '#64748B' },
  successTag: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  successText: { color: '#166534', fontSize: 10, fontWeight: 'bold' },
  activeTag: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  activeText: { color: '#1E40AF', fontSize: 10, fontWeight: 'bold' },
  pendingTag: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  pendingText: { color: '#64748B', fontSize: 10, fontWeight: 'bold' },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#EEF2FF', padding: 10, borderRadius: 8, marginBottom: 12 },
  tipTitle: { fontSize: 11, fontWeight: 'bold', color: '#002060' },
  tipText: { fontSize: 10, color: '#475569', lineHeight: 14 },
  fallbackBtn: { borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed', borderRadius: 8, padding: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 10 },
  fallbackText: { fontSize: 11, color: '#002060', fontWeight: '600' },
  gatewayRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  gatewayText: { fontSize: 10, color: '#64748B' },
});