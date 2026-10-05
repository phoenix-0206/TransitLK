import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import { loginConductor } from '../../services/conductorService';

export default function ConductorLoginScreen() {
  const router = useRouter();

  const [employeeId, setEmployeeId] =
    useState('');

  const [pin, setPin] = useState('');

  const [showPin, setShowPin] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  async function handleLogin() {
    const normalizedEmployeeId =
      employeeId.trim().toUpperCase();

    const normalizedPin =
      pin.trim();

    // -----------------------------
    // Validate Employee ID
    // -----------------------------

    if (!normalizedEmployeeId) {
      Alert.alert(
        'Login Error',
        'Please enter your Employee / Badge ID.',
      );
      return;
    }

    // -----------------------------
    // Validate PIN
    // -----------------------------

    if (!/^\d{4}$/.test(normalizedPin)) {
      Alert.alert(
        'Login Error',
        'Please enter your 4-digit Shift PIN.',
      );
      return;
    }

    try {
      setLoading(true);

      console.log(
        'Starting conductor login...',
      );

      console.log(
        'Employee ID:',
        normalizedEmployeeId,
      );

      // -----------------------------
      // Login conductor
      // -----------------------------

      const conductor =
        await loginConductor(
          normalizedEmployeeId,
          normalizedPin,
        );

      console.log(
        'Logged in conductor:',
        conductor,
      );

      // -----------------------------
      // Login successful
      // -----------------------------

      console.log(
        'CONDUCTOR LOGIN SUCCESSFUL',
      );

      console.log(
        'Navigating to dashboard...',
      );

      // Stop loading before navigation
      setLoading(false);

      // -----------------------------
      // Go directly to dashboard
      // -----------------------------

      router.replace(
        '/conductor/dashboard',
      );

    } catch (error) {
      console.error(
        'Conductor login error:',
        error,
      );

      setLoading(false);

      const message =
        error instanceof Error
          ? error.message
          : 'Login failed. Please try again.';

      Alert.alert(
        'Login Failed',
        message,
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View style={styles.content}>

        {/* Header */}

        <View style={styles.header}>

          <Text style={styles.logo}>
            TransitLK
          </Text>

          <Text style={styles.title}>
            Conductor Login
          </Text>

          <Text style={styles.subtitle}>
            Sign in using your conductor credentials
          </Text>

        </View>

        {/* Login Card */}

        <View style={styles.card}>

          {/* Employee ID */}

          <View style={styles.inputContainer}>

            <Text style={styles.label}>
              Employee / Badge ID
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Employee ID"
              placeholderTextColor="#8A9AA6"
              value={employeeId}
              onChangeText={(value) => {
                setEmployeeId(
                  value.trimStart(),
                );
              }}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

          </View>

          {/* PIN */}

          <View style={styles.inputContainer}>

            <Text style={styles.label}>
              4-Digit Shift PIN
            </Text>

            <View style={styles.pinWrapper}>

              <TextInput
                style={[
                  styles.input,
                  styles.pinInput,
                ]}
                placeholder="••••"
                placeholderTextColor="#8A9AA6"
                value={pin}
                onChangeText={(value) => {

                  const digits =
                    value
                      .replace(/\D/g, '')
                      .slice(0, 4);

                  setPin(digits);
                }}
                keyboardType="number-pad"
                secureTextEntry={!showPin}
                maxLength={4}
                editable={!loading}
              />

              <Pressable
                style={styles.showButton}
                onPress={() =>
                  setShowPin(!showPin)
                }
                disabled={loading}
              >
                <Text style={styles.showText}>
                  {showPin
                    ? 'Hide'
                    : 'Show'}
                </Text>
              </Pressable>

            </View>

          </View>

          {/* Login Button */}

          <Pressable
            style={[
              styles.loginButton,
              loading &&
                styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >

            {loading ? (

              <ActivityIndicator
                color="#FFFFFF"
              />

            ) : (

              <Text
                style={styles.loginButtonText}
              >
                LOGIN
              </Text>

            )}

          </Pressable>

          {/* Signup */}

          <View style={styles.signupRow}>

            <Text style={styles.signupText}>
              New conductor?
            </Text>

            <Pressable
              disabled={loading}
              onPress={() =>
                router.push(
                  '/conductor/signup',
                )
              }
            >

              <Text
                style={styles.signupLink}
              >
                Register
              </Text>

            </Pressable>

          </View>

        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F4F8FA',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  header: {
    width: '100%',
    maxWidth: 520,
    marginBottom: 24,
  },

  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#087F80',
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#103851',
  },

  subtitle: {
    marginTop: 7,
    fontSize: 15,
    color: '#58717F',
  },

  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.08,
    shadowRadius: 12,

    elevation: 3,
  },

  inputContainer: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#103851',
    marginBottom: 8,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: '#DEE8ED',
    borderRadius: 12,
    backgroundColor: '#F8FAFB',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#103851',
  },

  pinWrapper: {
    position: 'relative',
  },

  pinInput: {
    paddingRight: 70,
    letterSpacing: 5,
  },

  showButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    height: 54,
    justifyContent: 'center',
  },

  showText: {
    color: '#087F80',
    fontSize: 13,
    fontWeight: '700',
  },

  loginButton: {
    height: 54,
    borderRadius: 12,
    backgroundColor: '#087F80',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },

  signupText: {
    color: '#58717F',
    fontSize: 14,
  },

  signupLink: {
    marginLeft: 5,
    color: '#087F80',
    fontSize: 14,
    fontWeight: '800',
  },

});