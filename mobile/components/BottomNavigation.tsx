import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Href, router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type BottomNavigationItem = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  route?: Href;
  onPress?: () => void;
  active?: boolean;
};

const commuterItems: BottomNavigationItem[] = [
  { key: 'home', label: 'Home', icon: 'home-outline', route: '/home' },
  { key: 'map', label: 'Map / Track', icon: 'map-outline', route: '/(tabs)' },
  { key: 'tickets', label: 'Tickets', icon: 'ticket-outline', route: '/two' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', route: '/profile' },
];

type BottomNavigationProps = {
  items?: BottomNavigationItem[];
};

export default function BottomNavigation({ items = commuterItems }: BottomNavigationProps) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  function isActive(item: BottomNavigationItem) {
    if (item.active !== undefined) return item.active;
    if (item.key === 'home') return pathname.endsWith('/home');
    if (item.key === 'map') {
      return pathname === '/(tabs)' || pathname.endsWith('/index') || ['/interactive-route-map', '/vehicle-details', '/LiveMapScreen'].some((route) => pathname.endsWith(route));
    }
    if (item.key === 'tickets') return pathname.endsWith('/two') || pathname.endsWith('/timetable-schedules');
    if (item.key === 'profile') return pathname.endsWith('/profile') && !pathname.includes('/conductor/');
    return false;
  }

  return (
    <View style={[styles.bar, { height: 60 + insets.bottom, paddingBottom: insets.bottom + 4 }]}>
      {items.map((item) => {
        const active = isActive(item);
        const color = active ? '#123B8B' : '#64748B';
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (item.onPress) item.onPress();
              else if (item.route) router.replace(item.route);
            }}
          >
            <Ionicons name={item.icon} size={20} color={color} />
            <Text numberOfLines={1} style={[styles.label, active && styles.activeLabel]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  item: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { color: '#64748B', fontSize: 9, fontWeight: '600' },
  activeLabel: { color: '#123B8B', fontWeight: '800' },
});