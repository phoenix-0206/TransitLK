import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../services/supabase';

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [activeIdx, setActiveIdx] = useState(0);
  const [timer, setTimer] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleKeyPress = (val: string) => {
    if (val === 'backspace') {
      const newPin = [...pin];
      if (pin[activeIdx]) {
        newPin[activeIdx] = '';
      } else if (activeIdx > 0) {
        newPin[activeIdx - 1] = '';
        setActiveIdx(activeIdx - 1);
      }
      setPin(newPin);
    } else if (activeIdx < 6) {
      const newPin = [...pin];
      newPin[activeIdx] = val;
      setPin(newPin);
      if (activeIdx < 5) setActiveIdx(activeIdx + 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={20} color="#002060" />
          </TouchableOpacity>
          <View style={styles.brandBox}>
            <Ionicons name="bus" size={18} color="#002060" />
            <Text style={styles.brandTitle}>TransitLK</Text>
          </View>
          <View style={styles.securityBadge}>
            <Ionicons name="lock-closed" size={12} color="#0D9488" />
            <Text style={styles.securityBadgeText}>256-bit</Text>
          </View>
        </View>

        <Text style={styles.pageTitle}>Enter One–Time PIN</Text>
        <Text style={styles.subtitle}>
          {phone ? <>Enter the 6-digit code sent by SMS to <Text style={{ fontWeight: 'bold' }}>{phone}</Text>.</> : 'Enter the 6-digit code sent to your mobile number.'}
        </Text>

        <TouchableOpacity style={styles.changeMobileRow}>
          <Ionicons name="create-outline" size={16} color="#0D9488" />
          <Text style={styles.changeMobileText}>Change mobile number</Text>
        </TouchableOpacity>

        {/* Pin Boxes */}
        <View style={styles.pinHeader}>
          <Text style={styles.pinLabel}>SMS AUTHENTICATION PIN</Text>
          <Text style={styles.autoReadText}>● SMS verification</Text>
        </View>

        <View style={styles.pinGrid}>
          {pin.map((digit, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.pinBox, activeIdx === i && styles.pinBoxActive]}
              onPress={() => setActiveIdx(i)}
            >
              <Text style={styles.pinDigit}>{digit || (activeIdx === i ? '|' : '•')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.pinFooter}>
          <Text style={styles.pinTip}>ⓘ Never share your TransitLK PIN</Text>
          <TouchableOpacity>
            <Text style={styles.pasteText}>Paste from clipboard</Text>
          </TouchableOpacity>
        </View>

        {/* Resend Card */}
        <View style={styles.resendCard}>
          <View>
            <Text style={styles.expiresLabel}>Expires in</Text>
            <Text style={styles.timerValue}>00:{timer < 10 ? `0${timer}` : timer}s</Text>
          </View>
          <TouchableOpacity
            style={[styles.resendBtn, (timer > 0 || !phone || submitting) && styles.resendBtnDisabled]}
            disabled={timer > 0 || !phone || submitting}
            onPress={async () => {
              if (!phone) return;
              const { error } = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: false } });
              if (error) setErrorMessage(error.message);
              else {
                setTimer(60);
                setErrorMessage('A new verification code was sent.');
              }
            }}
          >
            <Ionicons name="chatbox-outline" size={16} color={timer === 0 ? '#002060' : '#A0AEC0'} />
            <Text style={[styles.resendBtnText, timer > 0 && { color: '#A0AEC0' }]}>Resend Code</Text>
          </TouchableOpacity>
        </View>

        {/* Alternate Methods */}
        <Text style={styles.sectionHeader}>ALTERNATE METHODS</Text>
        <View style={styles.altRow}>
          <TouchableOpacity style={styles.altBtn}>
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            <Text style={styles.altBtnText}>Via WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.altBtn}>
            <Ionicons name="call-outline" size={18} color="#002060" />
            <Text style={styles.altBtnText}>Voice Call</Text>
          </TouchableOpacity>
        </View>

        {/* Submit */}
        {!!errorMessage && <Text accessibilityRole="alert" style={styles.errorText}>{errorMessage}</Text>}
        <TouchableOpacity
          style={styles.verifyBtn}
          disabled={submitting}
          onPress={async () => {
            const token = pin.join('');
            if (!phone) {
              setErrorMessage('Go back and enter the mobile number you used to request the code.');
              return;
            }
            if (token.length !== 6) {
              setErrorMessage('Enter all 6 digits of the verification code.');
              return;
            }
            setSubmitting(true);
            setErrorMessage('');
            const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
            setSubmitting(false);
            if (error) setErrorMessage(error.message);
            else router.replace(data.session?.user.user_metadata?.pass_setup_pending ? '/pass-activation' : '/home');
          }}
        >
          <Text style={styles.verifyBtnText}>{submitting ? 'Verifying...' : 'Verify & Continue'}</Text>
          {!submitting && <Ionicons name="arrow-forward" size={18} color="#FFF" />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchBtn} onPress={() => router.push('/login')}>
          <Ionicons name="key-outline" size={16} color="#002060" />
          <Text style={styles.switchBtnText}>Switch back to Password Login</Text>
        </TouchableOpacity>

        {/* Custom Numpad */}
        <View style={styles.numpad}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['fingerprint', '0', 'backspace'],
          ].map((row, rIdx) => (
            <View key={rIdx} style={styles.numpadRow}>
              {row.map((val, cIdx) => (
                <TouchableOpacity
                  key={cIdx}
                  style={styles.keyBtn}
                  onPress={() => (val === 'fingerprint' ? null : handleKeyPress(val))}
                >
                  {val === 'fingerprint' ? (
                    <Ionicons name="finger-print-outline" size={22} color="#CBD5E1" />
                  ) : val === 'backspace' ? (
                    <Ionicons name="backspace-outline" size={22} color="#002060" />
                  ) : (
                    <Text style={styles.keyText}>{val}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  iconBtn: { padding: 6, borderRadius: 20, backgroundColor: '#EDF2F7' },
  brandBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  brandTitle: { fontSize: 16, fontWeight: 'bold', color: '#002060' },
  securityBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#CCFBF1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  securityBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#0D9488' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#002060', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#475569', lineHeight: 20 },
  changeMobileRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 12 },
  changeMobileText: { color: '#0D9488', fontWeight: 'bold', fontSize: 13 },
  pinHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  pinLabel: { fontSize: 11, fontWeight: 'bold', color: '#64748B' },
  autoReadText: { fontSize: 11, color: '#0D9488', fontWeight: '600' },
  pinGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  pinBox: { width: 48, height: 56, borderRadius: 10, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  pinBoxActive: { borderColor: '#002060', borderWidth: 2, backgroundColor: '#EEF2FF' },
  pinDigit: { fontSize: 22, fontWeight: 'bold', color: '#002060' },
  pinFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  pinTip: { fontSize: 11, color: '#64748B' },
  pasteText: { fontSize: 11, fontWeight: 'bold', color: '#002060' },
  resendCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', padding: 14, borderRadius: 12, marginBottom: 16 },
  expiresLabel: { fontSize: 10, color: '#64748B' },
  timerValue: { fontSize: 16, fontWeight: 'bold', color: '#002060' },
  resendBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 6 },
  resendBtnDisabled: { backgroundColor: '#F1F5F9' },
  resendBtnText: { color: '#002060', fontWeight: 'bold', fontSize: 12 },
  sectionHeader: { fontSize: 11, fontWeight: 'bold', color: '#64748B', marginBottom: 8 },
  altRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  altBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2FF', paddingVertical: 10, borderRadius: 8, gap: 6 },
  altBtnText: { color: '#002060', fontWeight: '600', fontSize: 13 },
  verifyBtn: { backgroundColor: '#002060', height: 50, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 10 },
  verifyBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  errorText: { color: '#B91C1C', fontSize: 12, marginBottom: 8 },
  switchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44, gap: 6, marginBottom: 15 },
  switchBtnText: { color: '#002060', fontWeight: 'bold', fontSize: 13 },
  numpad: { marginTop: 10 },
  numpadRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  keyBtn: { width: '31%', height: 50, backgroundColor: '#FFF', borderRadius: 8, justifyContent: 'center', alignItems: 'center', elevation: 1 },
  keyText: { fontSize: 20, fontWeight: 'bold', color: '#002060' },
});