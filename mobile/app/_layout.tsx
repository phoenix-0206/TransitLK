import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import BottomNavigation from '../components/BottomNavigation';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const launchSplashShown = useRef(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setIsReady(true);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect based on auth state once the layout is ready
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!launchSplashShown.current) {
      launchSplashShown.current = true;
      if (segments[0] !== 'index') {
        router.replace('/');
      }
      return;
    }

    if (segments[0] === 'index') return;

    if (!session && inAuthGroup) {
      router.replace('/role-selection');
    }

    // Already logged in and opens login/signup screens
    else if (session && onAuthScreen) {
      // Let a freshly created account finish its registration transition.
      if (
        segments[0] === 'signup' &&
        session.user.user_metadata?.pass_setup_pending
      ) {
        return;
      }

      // New accounts finish pass setup after successful sign-in.
      router.replace(
        session.user.user_metadata?.pass_setup_pending
          ? '/pass-activation'
          : '/(tabs)'
      );
    }
  }, [session, segments, isReady]);

  const isConductorDashboard = segments[0] === 'conductor' && segments[1] === 'dashboard';
  const hideBottomNavigation = (!segments[0] || ['index', 'login', 'signup', 'otp', 'sign-up-loading', 'conductor'].includes(segments[0] as string))
    || isConductorDashboard;

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#002060' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="otp" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up-loading" options={{ headerShown: false }} />
        <Stack.Screen name="pass-activation" options={{ title: 'Activate Smart Pass' }} />
        <Stack.Screen name="conductor" options={{ title: 'Conductor GPS' }} />
        <Stack.Screen name="loading-sync" options={{ headerShown: false }} />
        <Stack.Screen name="LiveMapScreen" options={{ title: 'Live Map Detail' }} />
        <Stack.Screen name="interactive-route-map" options={{ title: 'Route Map' }} />
        <Stack.Screen name="timetable-schedules" options={{ title: 'Timetable & Schedules' }} />
        <Stack.Screen name="vehicle-details" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: 'Smart Pass & Profile' }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Info' }} />
      </Stack>
      {!hideBottomNavigation && <BottomNavigation />}
    </View>
  );
}