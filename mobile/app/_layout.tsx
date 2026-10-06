import React, { useEffect, useState } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();

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

    // Screens that are only for unauthenticated users
    const authOnlyScreens = ['login', 'signup', 'otp'];

    const onAuthScreen = authOnlyScreens.includes(
      segments[0] as string
    );

    // Not logged in but trying to access passenger tabs
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

  if (!isReady) return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#002060',
        },
        headerTintColor: '#FFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >

      {/* =========================================
          APP START / ROLE SELECTION
          ========================================= */}

      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="role-selection"
        options={{
          headerShown: false,
        }}
      />

      {/* =========================================
          PASSENGER
          ========================================= */}

      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="signup"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="otp"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="sign-up-loading"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="pass-activation"
        options={{
          title: 'Activate Smart Pass',
        }}
      />

      {/* Routes Booking */}
      <Stack.Screen
        name="search"
        options={{
          headerShown: false,
        }}
      />

      {/* =========================================
          CONDUCTOR
          ========================================= */}

      <Stack.Screen
        name="conductor"
        options={{
          title: 'Conductor GPS',
        }}
      />

      <Stack.Screen
        name="conductor/signup"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="conductor/login"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="conductor/dashboard"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="conductor/scanner"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="conductor/validation-result"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="conductor/recent-scans"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="conductor/profile"
        options={{
          headerShown: false,
        }}
      />

      {/* =========================================
          OTHER EXISTING SCREENS
          ========================================= */}

      <Stack.Screen
        name="loading-sync"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="LiveMapScreen"
        options={{
          title: 'Live Map Detail',
        }}
      />

      <Stack.Screen
        name="interactive-route-map"
        options={{
          title: 'Route Map',
        }}
      />

      <Stack.Screen
        name="timetable-schedules"
        options={{
          title: 'Timetable & Schedules',
        }}
      />

      <Stack.Screen
        name="vehicle-details"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="profile"
        options={{
          title: 'Smart Pass & Profile',
        }}
      />

      <Stack.Screen
        name="admin"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          title: 'Info',
        }}
      />

    </Stack>
  );
}