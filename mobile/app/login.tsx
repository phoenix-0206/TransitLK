import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={20} color="#002060" />
          </TouchableOpacity>
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="bus-outline" size={20} color="#FFF" />
            </View>
            <View>
              <Text style={styles.brandName}>TransitLK <Text style={styles.countryTag}>SRI LANKA</Text></Text>
              <Text style={styles.subBrand}>Ministry of Transport & Highways</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.langPill}>
              <Text style={styles.langTextActive}>EN</Text>
              <Text style={styles.langText}>සි</Text>
            </View>
            <TouchableOpacity style={styles.profileCircle}>
              <Ionicons name="person" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Card */}
        <View style={styles.bannerCard}>
          <View style={styles.officialPill}>
            <Ionicons name="shield-checkmark" size={14} color="#0D9488" />
            <Text style={styles.officialText}>OFFICIAL TRANSPORT PORTAL</Text>
          </View>
          <Text style={styles.heroTitle}>Welcome Back!</Text>
          <Text style={styles.heroSubtitle}>
            Log in to track buses & trains, top up your Smart Pass, and view live timetables.
          </Text>
        </View>

        {/* Login Method Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, loginMethod === 'password' && styles.toggleActive]}
            onPress={() => setLoginMethod('password')}
          >
            <Ionicons name="key-outline" size={16} color={loginMethod === 'password' ? '#002060' : '#666'} />
            <Text style={[styles.toggleText, loginMethod === 'password' && styles.toggleTextActive]}>Password Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, loginMethod === 'otp' && styles.toggleActive]}
            onPress={() => setLoginMethod('otp')}
          >
            <Ionicons name="chatbox-ellipses-outline" size={16} color={loginMethod === 'otp' ? '#002060' : '#666'} />
            <Text style={[styles.toggleText, loginMethod === 'otp' && styles.toggleTextActive]}>One-Time PIN</Text>
          </TouchableOpacity>
        </View>

        {/* Input Form */}
        <Text style={styles.inputLabel}>Mobile Number or Email</Text>
        <View style={styles.inputWrapper}>
          <View style={styles.flagBox}>
            <Text style={styles.flagText}>[LK] +94</Text>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="07X XXX XXXX or commuter@email.com"
            placeholderTextColor="#A0AEC0"
            value={identifier}
            onChangeText={setIdentifier}
          />
          <MaterialIcons name="badge" size={20} color="#A0AEC0" />
        </View>

        {loginMethod === 'password' && (
          <>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Password</Text>
              <Text style={styles.protectedTag}>Protected</Text>
            </View>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#A0AEC0" />
              <TextInput
                style={[styles.textInput, { flex: 1, marginLeft: 8 }]}
                placeholder="••••••••••••"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#A0AEC0" />
              </TouchableOpacity>
            </View>

            <View style={styles.rememberRow}>
              <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(!rememberMe)}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Ionicons name="checkmark" size={12} color="#FFF" />}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Action Button */}
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/otp')}>
          <Text style={styles.primaryBtnText}>Log In</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
        </TouchableOpacity>

        {/* OTP Option Promo Box */}
        <View style={styles.otpPromoCard}>
          <View style={styles.otpIconCircle}>
            <Ionicons name="phone-portrait-outline" size={20} color="#0D9488" />
          </View>
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Text style={styles.otpPromoTitle}>📲 Log In with Phone OTP</Text>
            <Text style={styles.otpPromoSub}>Fast login via SMS code without password</Text>
          </View>
          <TouchableOpacity style={styles.tryOtpBtn} onPress={() => router.push('/otp')}>
            <Text style={styles.tryOtpText}>Try OTP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleBtn}>
          <FontAwesome name="google" size={18} color="#EA4335" />
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.guestBtn} onPress={() => router.replace('/(tabs)')}>
          <Ionicons name="compass-outline" size={18} color="#002060" />
          <Text style={styles.guestBtnText}>Explore as Guest</Text>
        </TouchableOpacity>

        {/* Footer Link */}
        <View style={styles.signUpRow}>
          <Text style={styles.signUpText}>Don’t have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securityFooter}>
          <Ionicons name="lock-closed" size={14} color="#0D9488" />
          <Text style={styles.securityText}>Official National Transport Clearing System • 256-bit Encrypted</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 18, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  iconBtn: { padding: 6, borderRadius: 20, backgroundColor: '#EDF2F7' },
  brandContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBadge: { backgroundColor: '#002060', padding: 6, borderRadius: 8 },
  brandName: { fontSize: 16, fontWeight: 'bold', color: '#002060' },
  countryTag: { fontSize: 9, backgroundColor: '#E2E8F0', paddingHorizontal: 4, borderRadius: 4, color: '#002060' },
  subBrand: { fontSize: 10, color: '#718096' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langPill: { flexDirection: 'row', backgroundColor: '#002060', padding: 4, borderRadius: 15, gap: 6 },
  langTextActive: { color: '#FFF', fontWeight: 'bold', fontSize: 11 },
  langText: { color: '#CBD5E1', fontSize: 11 },
  profileCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#002060', justifyContent: 'center', alignItems: 'center' },
  bannerCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#0D9488', marginBottom: 16, elevation: 1 },
  officialPill: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  officialText: { color: '#0D9488', fontWeight: 'bold', fontSize: 11 },
  heroTitle: { fontSize: 22, fontWeight: 'bold', color: '#002060', marginBottom: 4 },
  heroSubtitle: { fontSize: 12, color: '#475569', lineHeight: 18 },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 10, padding: 3, marginBottom: 16 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 6 },
  toggleActive: { backgroundColor: '#FFF', elevation: 2 },
  toggleText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  toggleTextActive: { color: '#002060' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, marginBottom: 6 },
  protectedTag: { fontSize: 11, color: '#0D9488', fontWeight: 'bold' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, height: 48, marginBottom: 12 },
  flagBox: { paddingRight: 8, borderRightWidth: 1, borderRightColor: '#CBD5E1', marginRight: 8 },
  flagText: { fontWeight: 'bold', fontSize: 13, color: '#002060' },
  textInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  rememberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#002060', justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#002060' },
  rememberText: { fontSize: 13, color: '#334155' },
  forgotText: { fontSize: 13, fontWeight: 'bold', color: '#002060' },
  primaryBtn: { backgroundColor: '#002060', height: 50, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  otpPromoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#CCFBF1', borderRadius: 10, padding: 12, marginTop: 14 },
  otpIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  otpPromoTitle: { fontWeight: 'bold', fontSize: 13, color: '#0F766E' },
  otpPromoSub: { fontSize: 11, color: '#115E59' },
  tryOtpBtn: { backgroundColor: '#0F766E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  tryOtpText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { marginHorizontal: 10, fontSize: 12, color: '#94A3B8' },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', height: 46, borderRadius: 10, gap: 10, marginBottom: 10 },
  googleBtnText: { fontWeight: '600', fontSize: 14, color: '#334155' },
  guestBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2FF', height: 46, borderRadius: 10, gap: 8, marginBottom: 20 },
  guestBtnText: { fontWeight: '600', fontSize: 14, color: '#002060' },
  signUpRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  signUpText: { color: '#64748B', fontSize: 14 },
  signUpLink: { color: '#002060', fontWeight: 'bold', fontSize: 14 },
  securityFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9', padding: 10, borderRadius: 8, gap: 6 },
  securityText: { fontSize: 10, color: '#475569' },
});