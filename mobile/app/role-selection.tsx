import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RoleSelectionScreen() {
  const router = useRouter();

  const handlePassenger = () => {
    // Passenger side
    router.replace('/login');
  };

  const handleConductor = () => {
    // Conductor signup
    router.push('/conductor/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* Logo / App Name */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons
              name="bus"
              size={36}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.appName}>
            TransitLK
          </Text>

          <Text style={styles.subtitle}>
            Public Transport Made Simple
          </Text>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.title}>
            Welcome to TransitLK
          </Text>

          <Text style={styles.description}>
            How would you like to use the app?
          </Text>
        </View>

        {/* Passenger */}
        <Pressable
          style={({ pressed }) => [
            styles.roleCard,
            pressed && styles.pressed,
          ]}
          onPress={handlePassenger}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name="person"
              size={30}
              color="#002060"
            />
          </View>

          <View style={styles.roleText}>
            <Text style={styles.roleTitle}>
              Passenger
            </Text>

            <Text style={styles.roleDescription}>
              Book tickets, view routes and manage your trips
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={24}
            color="#002060"
          />
        </Pressable>

        {/* Conductor */}
        <Pressable
          style={({ pressed }) => [
            styles.roleCard,
            pressed && styles.pressed,
          ]}
          onPress={handleConductor}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name="bus"
              size={30}
              color="#00796B"
            />
          </View>

          <View style={styles.roleText}>
            <Text style={styles.roleTitle}>
              Conductor
            </Text>

            <Text style={styles.roleDescription}>
              Validate passenger tickets and manage scans
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={24}
            color="#002060"
          />
        </Pressable>

        {/* Footer */}
        <Text style={styles.footer}>
          Select your role to continue
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },

  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#002060',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  appName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#002060',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B7280',
  },

  questionContainer: {
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#14213D',
    textAlign: 'center',
  },

  description: {
    marginTop: 8,
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },

  roleCard: {
    minHeight: 105,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 3,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  roleText: {
    flex: 1,
  },

  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#14213D',
    marginBottom: 5,
  },

  roleDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },

  footer: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 13,
    color: '#9CA3AF',
  },
});