import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

export default function TicketConfirmationScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ticket Confirmation</Text>
      <Text style={styles.subtitle}>Digital ticket QR and reference</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
  },
});
