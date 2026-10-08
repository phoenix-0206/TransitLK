import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [receiveAlerts, setReceiveAlerts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  async function chooseProfileImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo permission needed', 'You can skip this step, or allow photo access to choose a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setProfileImage(result.assets[0].uri);
  }

  async function uploadProfileImage(userId: string, uri: string) {
    const response = await fetch(uri);
    const blob = await response.blob();
    const extension = uri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
    const contentType = blob.type || `image/${extension === 'jpg' ? 'jpeg' : extension}`;
    const path = `${userId}/avatar.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, blob, { contentType, upsert: true });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('id', userId);
    if (profileError) throw profileError;
  }

  async function handleCreateAccount() {
    if (!fullName.trim() || !mobileNumber.trim() || !email.trim() || !password) {
      setErrorMessage('Complete your name, mobile number, email, and password to continue.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrorMessage('Enter a valid email address.');
      return;
    }
    if (password.length < 8 || !/\d/.test(password)) {
      setErrorMessage('Use a password with at least 8 characters and one number.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('The passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Agree to the Terms & Conditions to create an account.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone_number: mobileNumber.trim(),
            pass_setup_pending: true,
          },
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error('Account creation did not complete. Please try again.');

      // The database trigger creates the profile. Update its phone when sign-up
      // returns a session; never insert a duplicate row or unsupported columns.
      if (data.session) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ phone_number: mobileNumber.trim() })
          .eq('id', data.user.id);
        if (profileError) throw profileError;
        if (profileImage) await uploadProfileImage(data.user.id, profileImage);
      } else {
        router.replace({
          pathname: '/login',
          params: { notice: 'Account created. Confirm your email, then sign in to continue to Smart Pass setup.' },
        });
        return;
      }

      router.replace('/sign-up-loading');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#002060" />
          </TouchableOpacity>
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="bus-outline" size={18} color="#FFF" />
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
              <Ionicons name="person" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Portal Pill & Title */}
        <View style={styles.portalPill}>
          <Ionicons name="shield-checkmark" size={14} color="#002060" />
          <Text style={styles.portalText}>OFFICIAL TRANSPORT PORTAL</Text>
        </View>

        <Text style={styles.heroTitle}>Create Account</Text>
        <Text style={styles.heroSubtitle}>
          Sign up to travel seamlessly across SLTB buses, private coaches, and Sri Lanka Railways with your digital Smart Pass.
        </Text>

        {/* Progress Tracker */}
        <View style={styles.stepTracker}>
          <View style={styles.stepActive}>
            <Text style={styles.stepActiveNum}>1</Text>
            <Text style={styles.stepActiveText}>Profile Details</Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#A0AEC0" />
          <View style={styles.stepInactive}>
            <Text style={styles.stepInactiveNum}>2</Text>
            <Text style={styles.stepInactiveText}>Pass Activation</Text>
          </View>
        </View>

        {/* Feature Promo Banner */}
        <View style={styles.promoCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTag}>INSTANT SMART PASS LK</Text>
            <Text style={styles.promoTitle}>One QR Card for Islandwide Commutes</Text>
            <Text style={styles.promoSub}>Fort • Kandy • Matara Expressways & Coastal Line Trains</Text>
          </View>
          <Ionicons name="qr-code-outline" size={48} color="#FFF" style={{ opacity: 0.8 }} />
        </View>

        {/* Form Fields */}
        <Text style={styles.inputLabel}>🖼️ Profile Picture <Text style={styles.optionalTag}>Optional</Text></Text>
        <TouchableOpacity style={styles.photoPicker} onPress={() => void chooseProfileImage()}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera-outline" size={25} color="#0D9488" />
              <Text style={styles.photoText}>Upload a profile picture</Text>
              <Text style={styles.photoHint}>You can skip this</Text>
            </View>
          )}
          {profileImage && <Text style={styles.changePhotoText}>Tap to change photo</Text>}
        </TouchableOpacity>

        <Text style={styles.inputLabel}>👤 Full Name</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Kasun Chamara Jayasinghe"
            placeholderTextColor="#A0AEC0"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>📱 Mobile Number</Text>
          <View style={styles.smsPill}><Text style={styles.smsPillText}>SMS OTP</Text></View>
        </View>
        <View style={styles.inputWrapper}>
          <View style={styles.flagBox}><Text style={styles.flagText}>+94</Text></View>
          <TextInput
            style={styles.textInput}
            placeholder="07X XXX XXXX"
            placeholderTextColor="#A0AEC0"
            keyboardType="phone-pad"
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />
        </View>
        <Text style={styles.fieldNote}>ⓘ Required for paperless QR tickets & route disruption alerts</Text>

        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>✉️ Email Address</Text>
          <Text style={styles.optionalTag}>Required</Text>
        </View>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="name@example.com"
            placeholderTextColor="#A0AEC0"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <Text style={styles.fieldNote}>For monthly tax invoice statements & PDF e-receipts</Text>

        <Text style={styles.inputLabel}>🔒 Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="Create strong password"
            placeholderTextColor="#A0AEC0"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#A0AEC0" />
          </TouchableOpacity>
        </View>

        {/* Password Criteria Badges */}
        <View style={styles.criteriaRow}>
          <View style={styles.criteriaPill}>
            <Ionicons name="checkmark-circle" size={12} color="#0D9488" />
            <Text style={styles.criteriaText}>8+ characters</Text>
          </View>
          <View style={styles.criteriaPill}>
            <Ionicons name="checkmark-circle" size={12} color="#0D9488" />
            <Text style={styles.criteriaText}>1+ number</Text>
          </View>
          <View style={[styles.criteriaPill, { backgroundColor: '#CCFBF1' }]}>
            <Ionicons name="shield" size={12} color="#0D9488" />
            <Text style={[styles.criteriaText, { color: '#0D9488' }]}>256-bit Transit Vault</Text>
          </View>
        </View>

        <Text style={styles.inputLabel}>🛡️ Confirm Password</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.textInput, { flex: 1 }]}
            placeholder="Re-enter your password"
            placeholderTextColor="#A0AEC0"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          {confirmPassword.length > 0 && confirmPassword === password && (
            <Ionicons name="checkmark" size={20} color="#0D9488" />
          )}
        </View>

        {/* Checkboxes */}
        <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgreeTerms(!agreeTerms)}>
          <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
            {agreeTerms && <Ionicons name="checkmark" size={12} color="#FFF" />}
          </View>
          <Text style={styles.checkboxText}>
            I agree to the <Text style={styles.linkText}>Terms & Conditions</Text> and <Text style={styles.linkText}>Privacy Policy</Text> of TransitLK & National Transport Commission (NTC).
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.checkboxRow} onPress={() => setReceiveAlerts(!receiveAlerts)}>
          <View style={[styles.checkbox, receiveAlerts && styles.checkboxChecked]}>
            {receiveAlerts && <Ionicons name="checkmark" size={12} color="#FFF" />}
          </View>
          <Text style={styles.checkboxText}>
            Receive real-time SMS train delays and bus stop alerts for Colombo & Western Province routes <Text style={{ color: '#0D9488', fontWeight: 'bold' }}>(Free)</Text>.
          </Text>
        </TouchableOpacity>

        {/* Main Sign Up Action */}
        {!!errorMessage && <Text accessibilityRole="alert" style={styles.errorText}>{errorMessage}</Text>}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateAccount} disabled={submitting}>
          <Text style={styles.primaryBtnText}>{submitting ? 'Creating account...' : 'Create Account & Continue'}</Text>
          {!submitting && <Ionicons name="arrow-forward" size={18} color="#FFF" />}
        </TouchableOpacity>

        {/* Express SMS Option Card */}
        <TouchableOpacity style={styles.expressCard} onPress={() => router.push('/login')}>
          <View style={styles.expressIconBox}>
            <Ionicons name="flash-outline" size={20} color="#0D9488" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.expressTitle}>Already have an account?</Text>
            <Text style={styles.expressSub}>Sign in with your password or request a phone OTP.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#0D9488" />
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleBtn}>
          <FontAwesome name="google" size={18} color="#EA4335" />
          <Text style={styles.googleBtnText}>Sign Up with Google</Text>
        </TouchableOpacity>

        {/* Footer info */}
        <View style={styles.clearingBox}>
          <Ionicons name="business-outline" size={20} color="#002060" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.clearingTitle}>National Transport Clearing System</Text>
            <Text style={styles.clearingSub}>LankaPay & NTC Approved • Real-Time Commuter Protection</Text>
          </View>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionFooter}>TransitLK Mobility v2.4 • Ministry of Transport & Highways</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 18, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
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
  portalPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 8 },
  portalText: { color: '#002060', fontWeight: 'bold', fontSize: 11 },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: '#002060', marginBottom: 4 },
  heroSubtitle: { fontSize: 12, color: '#475569', lineHeight: 18, marginBottom: 15 },
  stepTracker: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', padding: 8, borderRadius: 10, gap: 8, marginBottom: 15 },
  stepActive: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#002060', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 6 },
  stepActiveNum: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  stepActiveText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  stepInactive: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 6 },
  stepInactiveNum: { color: '#64748B', fontWeight: 'bold', fontSize: 12 },
  stepInactiveText: { color: '#64748B', fontSize: 12 },
  promoCard: { backgroundColor: '#002060', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  promoTag: { color: '#FFC000', fontWeight: 'bold', fontSize: 10, letterSpacing: 0.5 },
  promoTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 15, marginVertical: 4 },
  promoSub: { color: '#94A3B8', fontSize: 11 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 6, marginTop: 10 },
  photoPicker: { minHeight: 105, borderWidth: 1, borderStyle: 'dashed', borderColor: '#99F6E4', borderRadius: 12, backgroundColor: '#F0FDFA', justifyContent: 'center', alignItems: 'center', marginBottom: 4, overflow: 'hidden' },
  photoPlaceholder: { alignItems: 'center', gap: 3, paddingVertical: 14 },
  photoPreview: { width: 86, height: 86, borderRadius: 43, marginVertical: 10 },
  photoText: { color: '#0F766E', fontWeight: 'bold', fontSize: 13 },
  photoHint: { color: '#64748B', fontSize: 11 },
  changePhotoText: { color: '#0F766E', fontSize: 11, marginBottom: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 6 },
  smsPill: { backgroundColor: '#CCFBF1', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  smsPillText: { fontSize: 10, fontWeight: 'bold', color: '#0D9488' },
  optionalTag: { fontSize: 11, color: '#94A3B8' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, paddingHorizontal: 12, height: 48 },
  flagBox: { paddingRight: 8, borderRightWidth: 1, borderRightColor: '#CBD5E1', marginRight: 8 },
  flagText: { fontWeight: 'bold', fontSize: 13, color: '#002060' },
  textInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  fieldNote: { fontSize: 11, color: '#64748B', marginTop: 4 },
  criteriaRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  criteriaPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4 },
  criteriaText: { fontSize: 11, color: '#475569' },
  checkboxRow: { flexDirection: 'row', gap: 10, marginTop: 14, alignItems: 'flex-start' },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#002060', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  checkboxChecked: { backgroundColor: '#002060' },
  checkboxText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 17 },
  linkText: { color: '#002060', fontWeight: 'bold' },
  primaryBtn: { backgroundColor: '#002060', height: 50, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  errorText: { color: '#B91C1C', fontSize: 12, marginTop: 8 },
  expressCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#CCFBF1', padding: 12, borderRadius: 10, marginTop: 12 },
  expressIconBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  expressTitle: { fontWeight: 'bold', fontSize: 13, color: '#0F766E' },
  expressSub: { fontSize: 11, color: '#115E59' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { marginHorizontal: 10, fontSize: 11, color: '#94A3B8', fontWeight: 'bold' },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', height: 46, borderRadius: 10, gap: 10, marginBottom: 15 },
  googleBtnText: { fontWeight: '600', fontSize: 14, color: '#334155' },
  clearingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', padding: 12, borderRadius: 10, marginBottom: 15 },
  clearingTitle: { fontWeight: 'bold', fontSize: 12, color: '#002060' },
  clearingSub: { fontSize: 10, color: '#475569' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  loginText: { color: '#64748B', fontSize: 14 },
  loginLink: { color: '#002060', fontWeight: 'bold', fontSize: 14 },
  versionFooter: { textAlign: 'center', fontSize: 10, color: '#94A3B8' },
});