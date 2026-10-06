import { Stack } from 'expo-router';

export default function PassengerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen name="select-trip" options={{ headerShown: false }} />
      <Stack.Screen name="ticket-details" options={{ headerShown: false }} />
      <Stack.Screen name="payment" options={{ headerShown: false }} />
      <Stack.Screen name="ticket-confirmation" options={{ headerShown: false }} />
      <Stack.Screen name="purchase-history" options={{ headerShown: false }} />
      <Stack.Screen name="payment-history" options={{ headerShown: false }} />
    </Stack>
  );
}
