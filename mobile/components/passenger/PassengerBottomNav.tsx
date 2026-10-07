import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

export type TabKey = 'home' | 'routes' | 'tickets' | 'liveMap' | 'history';

interface PassengerBottomNavProps {
  activeTab?: TabKey;
  onTabPress?: (tab: TabKey) => void;
}

export default function PassengerBottomNav({
  activeTab = 'routes',
  onTabPress,
}: PassengerBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handlePress = (tab: TabKey) => {
    if (onTabPress) {
      onTabPress(tab);
      return;
    }

    if (tab === 'home') {
      router.push('/home' as any);
    } else if (tab === 'routes') {
      router.push('/passenger/search' as any);
    } else if (tab === 'tickets' || tab === 'history') {
      router.push('/passenger/purchase-history' as any);
    }
  };

  return (
    <View style={styles.navContainer}>
      {/* Home Tab */}
      <Pressable
        style={styles.tabItem}
        onPress={() => handlePress('home')}
      >
        <Ionicons
          name={activeTab === 'home' ? 'home' : 'home-outline'}
          size={22}
          color={activeTab === 'home' ? '#1E2B6D' : '#94A3B8'}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'home' && styles.tabLabelActive,
          ]}
        >
          Home
        </Text>
        {activeTab === 'home' && <View style={styles.activeDot} />}
      </Pressable>

      {/* Routes Tab (Active in Figma) */}
      <Pressable
        style={styles.tabItem}
        onPress={() => handlePress('routes')}
      >
        <View style={styles.iconContainerWithBadge}>
          <MaterialCommunityIcons
            name="map-marker-path"
            size={24}
            color={activeTab === 'routes' ? '#1E2B6D' : '#94A3B8'}
          />
        </View>
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'routes' && styles.tabLabelActive,
          ]}
        >
          Routes
        </Text>
        {activeTab === 'routes' && <View style={styles.activeDot} />}
      </Pressable>

      {/* Tickets Tab */}
      <Pressable
        style={styles.tabItem}
        onPress={() => handlePress('tickets')}
      >
        <Ionicons
          name={activeTab === 'tickets' ? 'ticket' : 'ticket-outline'}
          size={22}
          color={activeTab === 'tickets' ? '#1E2B6D' : '#94A3B8'}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'tickets' && styles.tabLabelActive,
          ]}
        >
          Tickets
        </Text>
        {activeTab === 'tickets' && <View style={styles.activeDot} />}
      </Pressable>

      {/* Live Map Tab */}
      <Pressable
        style={styles.tabItem}
        onPress={() => handlePress('liveMap')}
      >
        <Ionicons
          name={activeTab === 'liveMap' ? 'radio' : 'radio-outline'}
          size={22}
          color={activeTab === 'liveMap' ? '#1E2B6D' : '#94A3B8'}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'liveMap' && styles.tabLabelActive,
          ]}
        >
          Live Map
        </Text>
        {activeTab === 'liveMap' && <View style={styles.activeDot} />}
      </Pressable>

      {/* History Tab */}
      <Pressable
        style={styles.tabItem}
        onPress={() => handlePress('history')}
      >
        <Ionicons
          name={activeTab === 'history' ? 'time' : 'time-outline'}
          size={22}
          color={activeTab === 'history' ? '#1E2B6D' : '#94A3B8'}
        />
        <Text
          style={[
            styles.tabLabel,
            activeTab === 'history' && styles.tabLabelActive,
          ]}
        >
          History
        </Text>
        {activeTab === 'history' && <View style={styles.activeDot} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    flex: 1,
  },
  iconContainerWithBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#1E2B6D',
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1E2B6D',
    marginTop: 3,
  },
});
