import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabOneScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TransitLK Navigation</Text>
      <Text style={styles.subtitle}>Select a module to test</Text>

      <View style={styles.buttonContainer}>
        {/* Passenger Ticketing Module */}
        <Pressable
          style={({ pressed }) => [styles.cardButton, styles.passengerBtn, pressed && styles.btnPressed]}
          onPress={() => router.push('/passenger/search')}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.btnTextCol}>
            <Text style={styles.btnTitle}>Passenger Route Search</Text>
            <Text style={styles.btnDescription}>Digital Ticket Purchase Module (Member 2)</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </Pressable>

        {/* Conductor Module */}
        <Pressable
          style={({ pressed }) => [styles.cardButton, styles.conductorBtn, pressed && styles.btnPressed]}
          onPress={() => router.push('/conductor/login')}
        >
          <View style={[styles.iconCircle, styles.conductorIconCircle]}>
            <Ionicons name="qr-code" size={24} color="#1E293B" />
          </View>
          <View style={styles.btnTextCol}>
            <Text style={[styles.btnTitle, styles.conductorBtnTitle]}>Conductor Portal</Text>
            <Text style={[styles.btnDescription, styles.conductorBtnDesc]}>Login, Scanner & Validation</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 28,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  passengerBtn: {
    backgroundColor: '#1E2B6D',
  },
  conductorBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  btnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  conductorIconCircle: {
    backgroundColor: '#F1F5F9',
  },
  btnTextCol: {
    flex: 1,
  },
  btnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  conductorBtnTitle: {
    color: '#0F172A',
  },
  btnDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  conductorBtnDesc: {
    color: '#64748B',
  },
});
