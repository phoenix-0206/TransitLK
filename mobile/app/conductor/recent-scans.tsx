import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ConductorRecentScansScreen() {
	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.content}>
				<View style={styles.header}>
					<Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
						<Ionicons name="arrow-back" size={20} color="#123B8B" />
					</Pressable>
					<Text style={styles.headerTitle}>Recent Scans</Text>
				</View>

				<View style={styles.emptyState}>
					<View style={styles.iconCircle}><Ionicons name="time-outline" size={28} color="#123B8B" /></View>
					<Text style={styles.emptyTitle}>No scan history saved</Text>
					<Text style={styles.emptyMessage}>
						Scans update the Duty Hub count, but individual scan records are not stored yet.
					</Text>
					<Pressable style={styles.actionButton} onPress={() => router.push('/conductor/scanner')}>
						<Ionicons name="scan-outline" size={18} color="#FFF" />
						<Text style={styles.actionText}>Open ticket scanner</Text>
					</Pressable>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: '#F4F7FB' },
	content: { flex: 1, padding: 16 },
	header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
	backButton: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#E8EEFA', alignItems: 'center', justifyContent: 'center' },
	headerTitle: { color: '#17233A', fontSize: 18, fontWeight: '800' },
	emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 60 },
	iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E8EEFA', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
	emptyTitle: { color: '#17233A', fontSize: 17, fontWeight: '800', textAlign: 'center' },
	emptyMessage: { color: '#64748B', fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 8, maxWidth: 300 },
	actionButton: { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#123B8B', borderRadius: 10, paddingHorizontal: 18, marginTop: 18 },
	actionText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
});
