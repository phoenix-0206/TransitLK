import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const ROUTE_COUNT = 450;
const SYNC_DURATION = 2400;

export default function SplashScreen() {
  const progress = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(18)).current;
  const [syncComplete, setSyncComplete] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progress, {
        toValue: 1,
        duration: SYNC_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        damping: 12,
        stiffness: 120,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSyncComplete(true);
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(contentTranslate, { toValue: 0, damping: 16, stiffness: 130, useNativeDriver: true }),
      ]).start();
    });
  }, [contentOpacity, contentTranslate, logoOpacity, logoScale, progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const progressLabel = progress.interpolate({
    inputRange: [0, 0.2, 0.4, 0.71, 1],
    outputRange: ['0%', '20%', '40%', '71%', '100%'],
  });

  function openPassengerLogin() {
    router.replace('/login');
  }

  function openConductorLogin() {
    router.replace('/conductor/login');
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.networkPanel}>
          <View style={styles.gridOverlay} />
          <View style={[styles.nodePill, styles.colomboPill]}>
            <View style={styles.nodeDot} />
            <Text style={styles.nodeText}>COLOMBO FORT</Text>
            <Text style={styles.nodeSubtext}>Interchange Terminal</Text>
          </View>
          <View style={[styles.nodePill, styles.kandyPill]}>
            <View style={styles.nodeDot} />
            <Text style={styles.nodeText}>KANDY HUB</Text>
            <Text style={styles.nodeSubtext}>Hill Country Sector</Text>
          </View>
          <View style={[styles.nodePill, styles.makumburaPill]}>
            <View style={styles.nodeDot} />
            <Text style={styles.nodeText}>MAKUMBURA MMC</Text>
            <Text style={styles.nodeSubtext}>Expressway Hub</Text>
          </View>
          <View style={styles.routeLineOne} />
          <View style={styles.routeLineTwo} />
        </View>

        <Animated.View style={[styles.brandArea, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoGlow}>
            <View style={styles.logoBadge}>
              <Ionicons name="bus" size={40} color="#76F5E2" />
              <View style={styles.signalDot}><Ionicons name="radio" size={11} color="#76F5E2" /></View>
            </View>
          </View>
          <View style={styles.wordmarkRow}>
            <Text style={styles.wordmark}>Transit<Text style={styles.wordmarkAccent}>LK</Text></Text>
            <View style={styles.wordmarkBar} />
          </View>
          <Text style={styles.tagline}>SMART ISLANDWIDE BUS &amp; TRAIN MOBILITY NETWORK</Text>
          <View style={styles.badgeRow}>
            <View style={styles.featureBadge}><Ionicons name="navigate" size={12} color="#75F3D9" /><Text style={styles.featureText}>Live GPS Fleet</Text></View>
            <View style={styles.featureBadge}><Ionicons name="train" size={12} color="#75F3D9" /><Text style={styles.featureText}>SLTB &amp; Railways</Text></View>
          </View>
          <View style={styles.featureBadge}><Ionicons name="qr-code" size={12} color="#75F3D9" /><Text style={styles.featureText}>Contactless QR</Text></View>
        </Animated.View>

        <View style={styles.syncArea}>
          <View style={styles.verifiedRow}>
            <Ionicons name="checkmark-circle" size={15} color="#5BFFBD" />
            <Text style={styles.verifiedText}>National Transport Commission (NTC) &amp; SLTB Verified</Text>
          </View>
          <View style={styles.syncCard}>
            <View style={styles.syncHeader}>
              <View style={styles.syncTitleRow}>
                <Ionicons name={syncComplete ? 'checkmark-circle' : 'sync'} size={17} color="#72F4D9" />
                <Text style={styles.syncTitle}>{syncComplete ? 'NETWORK SYNC COMPLETE' : `SYNCING ${ROUTE_COUNT}+ ROUTES`}</Text>
              </View>
              <Animated.Text style={styles.syncPercent}>{progressLabel}</Animated.Text>
            </View>
            <View style={styles.progressTrack}><Animated.View style={[styles.progressFill, { width: progressWidth }]} /></View>
            <View style={styles.syncFooter}>
              <Text style={styles.syncDetail}>{syncComplete ? 'Live GPS fleet ready' : 'Updating RT-GPS: Route 138 & Coastal Line'}</Text>
              <Text style={styles.syncDetail}>{syncComplete ? '18ms' : '142ms'}</Text>
            </View>
          </View>
        </View>

        <Animated.View style={[styles.actions, { opacity: contentOpacity, transform: [{ translateY: contentTranslate }] }]}>
          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed, !syncComplete && styles.actionButtonDisabled]}
            onPress={openPassengerLogin}
            disabled={!syncComplete}
            accessibilityRole="button"
            accessibilityLabel="Continue as passenger"
          >
            <Text style={styles.actionText}>Continue as Passenger</Text>
            <Ionicons name="arrow-forward" size={19} color="#FFF" />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed, !syncComplete && styles.actionButtonDisabled]}
            onPress={openConductorLogin}
            disabled={!syncComplete}
            accessibilityRole="button"
            accessibilityLabel="Continue as conductor"
          >
            <Text style={styles.actionText}>Continue as Conductor</Text>
            <Ionicons name="arrow-forward" size={19} color="#FFF" />
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#030A1B' },
  safeArea: { flex: 1, paddingHorizontal: 20, justifyContent: 'space-between' },
  networkPanel: { height: 145, marginHorizontal: -20, backgroundColor: '#061B43', overflow: 'hidden', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  gridOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.18, borderBottomWidth: 1, borderBottomColor: '#2B5682' },
  nodePill: { position: 'absolute', backgroundColor: '#0A2A62', borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5, minWidth: 118 },
  colomboPill: { top: 28, left: 52 },
  kandyPill: { top: 8, right: 34 },
  makumburaPill: { top: 92, left: 115 },
  nodeDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: '#70F4DD', left: -18, top: 12, shadowColor: '#70F4DD', shadowOpacity: 0.9, shadowRadius: 9, shadowOffset: { width: 0, height: 0 } },
  nodeText: { color: '#7CF4DF', fontWeight: '800', fontSize: 10, letterSpacing: 0.4 },
  nodeSubtext: { color: '#9DB3D8', fontSize: 7, marginTop: 2 },
  routeLineOne: { position: 'absolute', width: 245, height: 2, backgroundColor: '#4CD8C6', opacity: 0.8, left: 79, top: 49, transform: [{ rotate: '-12deg' }] },
  routeLineTwo: { position: 'absolute', width: 175, height: 2, backgroundColor: '#4CD8C6', opacity: 0.65, left: 106, top: 82, transform: [{ rotate: '16deg' }] },
  brandArea: { alignItems: 'center', marginTop: 8 },
  logoGlow: { width: 92, height: 92, borderRadius: 25, backgroundColor: '#09377A', alignItems: 'center', justifyContent: 'center', shadowColor: '#5DFFDF', shadowOpacity: 0.85, shadowRadius: 23, shadowOffset: { width: 0, height: 0 }, elevation: 10 },
  logoBadge: { width: 76, height: 76, borderRadius: 21, backgroundColor: '#12468B', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#1F67A3' },
  signalDot: { position: 'absolute', right: 14, bottom: 16 },
  wordmarkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 9 },
  wordmark: { color: '#FFF', fontSize: 27, fontWeight: '900', letterSpacing: -1.2 },
  wordmarkAccent: { color: '#73F3D8' },
  wordmarkBar: { width: 30, height: 13, borderRadius: 8, backgroundColor: '#73F3D8', marginLeft: 5 },
  tagline: { color: '#D2DBEE', fontSize: 9, fontWeight: '700', letterSpacing: 0.2, marginTop: 4 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  featureBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213D', borderRadius: 14, paddingHorizontal: 9, paddingVertical: 5, gap: 4 },
  featureText: { color: '#F1F5FF', fontSize: 10, fontWeight: '600' },
  syncArea: { marginTop: 4 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 7 },
  verifiedText: { color: '#EDF4FF', fontSize: 10, fontWeight: '600' },
  syncCard: { backgroundColor: '#061C4A', borderRadius: 15, borderWidth: 1, borderColor: '#123A73', padding: 13, shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  syncHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  syncTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  syncTitle: { color: '#F4F7FF', fontSize: 12, fontWeight: '800', letterSpacing: 0.2 },
  syncPercent: { color: '#74F4D9', fontSize: 13, fontWeight: '800' },
  progressTrack: { height: 8, backgroundColor: '#263E6B', borderRadius: 5, overflow: 'hidden', marginTop: 10 },
  progressFill: { height: '100%', backgroundColor: '#54E7D1', borderRadius: 5 },
  syncFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
  syncDetail: { color: '#83A5D6', fontSize: 9 },
  actions: { gap: 10, marginBottom: 12 },
  actionButton: { height: 49, borderRadius: 8, backgroundColor: '#007D70', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  actionButtonPressed: { backgroundColor: '#00A393', transform: [{ scale: 0.985 }] },
  actionButtonDisabled: { opacity: 0.55 },
  actionText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
});
