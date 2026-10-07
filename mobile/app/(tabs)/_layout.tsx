import React from 'react';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map / Track',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="ticket" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
         name="alerts"
         options={{
          title: 'Alerts',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
         ),
       }}
      />

      <Tabs.Screen
        name="more"
        options={{
         title: 'More',
         headerShown: false,
         tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" size={size} color={color} />
      ),
      }}
      />

      <Tabs.Screen name="home" />
      <Tabs.Screen name="index" />
      <Tabs.Screen name="two" />
      {/* Hidden screens that exist in (tabs) but shouldn't show a tab */}
    </Tabs>
    
  );
}