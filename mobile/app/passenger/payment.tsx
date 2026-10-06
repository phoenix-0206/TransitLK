import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import PassengerBottomNav from '@/components/passenger/PassengerBottomNav';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    tripId?: string;
    routeNumber?: string;
    serviceName?: string;
    originName?: string;
    destinationName?: string;
    travelDate?: string;
    departureTime?: string;
    arrivalTime?: string;
    adultCount?: string;
    studentCount?: string;
    childCount?: string;
    totalTickets?: string;
    adultSubtotal?: string;
    studentSubtotal?: string;
    childSubtotal?: string;
    smsFee?: string;
    totalPayable?: string;
  }>();

  // Booking parameters with Figma defaults
  const routeNumber = params.routeNumber || '138';
  const originName = params.originName || 'Maharagama';
  const destinationName = params.destinationName || 'Colombo Fort';
  const departureTime = params.departureTime || '08:45 AM';
  const travelDate = params.travelDate || 'Today';
  const totalTickets = parseInt(params.totalTickets || '3', 10);
  const totalPayable = parseFloat(params.totalPayable || '310.00') || 310.0;

  // Passenger summary text
  const adultCount = parseInt(params.adultCount || '2', 10);
  const studentCount = parseInt(params.studentCount || '1', 10);
  const childCount = parseInt(params.childCount || '0', 10);

  const passengerDetails = [
    adultCount > 0 ? `${adultCount} Adult` : '',
    studentCount > 0 ? `${studentCount} Student Concession` : '',
    childCount > 0 ? `${childCount} Child/Senior` : '',
  ]
    .filter(Boolean)
    .join(', ') || '2 Adult, 1 Student Concession';

  // Payment method selection ('card' | 'wallets' | 'lankaqr' | 'buspass')
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'wallets' | 'lankaqr' | 'buspass'>('card');

  // Card form fields
  const [cardholderName, setCardholderName] = useState('Kavinda Perera');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4892');
  const [expiryDate, setExpiryDate] = useState('08/27');
  const [cvv, setCvv] = useState('888');
  const [saveCardChecked, setSaveCardChecked] = useState(true);

  // Loading state
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle Complete Booking
  const handleCompleteBooking = () => {
    setIsProcessing(true);

    // Simulate instant payment gateway handshake
    setTimeout(() => {
      setIsProcessing(false);
      const bookingRef = `TRX-${Math.floor(100000 + Math.random() * 900000)}-LK`;

      router.push({
        pathname: '/passenger/ticket-confirmation' as any,
        params: {
          bookingRef,
          routeNumber,
          serviceName: params.serviceName || 'SLTB AC EXPRESS',
          originName,
          destinationName,
          travelDate,
          departureTime,
          arrivalTime: params.arrivalTime || '09:30 AM',
          totalTickets: String(totalTickets),
          totalPayable: totalPayable.toFixed(2),
          paymentMethod: selectedMethod === 'card' ? 'LankaPay / Visa •••• 4242' : 'TransitLK Pass',
          passengerDetails,
        },
      });
    }, 900);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header matching Figma */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressedState]}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </Pressable>

          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <MaterialCommunityIcons name="ticket-confirmation-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.brandTitleCol}>
              <View style={styles.brandNameRow}>
                <Text style={styles.brandTitle}>TransitLK</Text>
                <View style={styles.liveGpsBadge}>
                  <View style={styles.liveGpsDot} />
                  <Text style={styles.liveGpsText}>LIVE GPS</Text>
                </View>
              </View>
              <Text style={styles.brandSubtitle}>Bus Booking Payment</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.notificationBtn}
          onPress={() => Alert.alert('Secure Payment', 'SSL 256-Bit encrypted gateway.')}
        >
          <Ionicons name="notifications-outline" size={22} color="#1E293B" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Stepper (Step 3: Payment active) */}
        <View style={styles.stepperContainer}>
          {/* Step 1: Trip (Completed) */}
          <View style={styles.stepperItem}>
            <View style={styles.stepCircleCompleted}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.stepLabelCompleted}>Trip</Text>
          </View>

          <View style={styles.stepConnectorCompleted} />

          {/* Step 2: Details (Completed) */}
          <View style={styles.stepperItem}>
            <View style={styles.stepCircleCompleted}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.stepLabelCompleted}>Details</Text>
          </View>

          <View style={styles.stepConnectorCompleted} />

          {/* Step 3: Payment (Active) */}
          <View style={styles.stepperItem}>
            <View style={styles.stepCircleActive}>
              <Text style={styles.stepNumberActive}>3</Text>
            </View>
            <Text style={styles.stepLabelActive}>Payment</Text>
          </View>
        </View>

        {/* BUS TRIP & TICKET SUMMARY Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeaderRow}>
            <View style={styles.summaryTitleWrap}>
              <MaterialCommunityIcons name="ticket-percent-outline" size={18} color="#1E2B6D" />
              <Text style={styles.summaryHeaderText}>BUS TRIP & TICKET SUMMARY</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="shield-check" size={12} color="#059669" />
              <Text style={styles.verifiedText}>Verified Route</Text>
            </View>
          </View>

          {/* Inner Trip Card */}
          <View style={styles.innerSummaryBox}>
            <View style={styles.innerSummaryTopRow}>
              <View style={styles.busBadgeSquare}>
                <Text style={styles.busBadgeSmallText}>Bus</Text>
                <Text style={styles.busBadgeNumberText}>{routeNumber}</Text>
              </View>

              <View style={styles.routeTextWrap}>
                <View style={styles.routeDestinationRow}>
                  <Text style={styles.routePlaceName}>{originName}</Text>
                  <Ionicons name="arrow-forward" size={13} color="#475569" style={{ marginHorizontal: 4 }} />
                  <Text style={styles.routePlaceName}>{destinationName}</Text>
                </View>
                <Text style={styles.authorityText}>Western Province Transit Authority</Text>
              </View>
            </View>

            <View style={styles.summaryDetailLine}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={14} color="#64748B" />
                <Text style={styles.detailText}>Today at {departureTime}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="bus-outline" size={14} color="#64748B" />
                <Text style={styles.detailText}>Bus WP-ND--8422</Text>
              </View>
            </View>

            <View style={styles.passengersLine}>
              <Ionicons name="people-outline" size={14} color="#64748B" />
              <Text style={styles.passengersLineText}>
                {totalTickets} Passengers ({passengerDetails})
              </Text>
            </View>
          </View>

          {/* Total Amount Due Sub-Box */}
          <View style={styles.totalDueSubBox}>
            <View>
              <Text style={styles.totalDueLabel}>TOTAL AMOUNT DUE</Text>
              <Text style={styles.totalDueAmount}>LKR {totalPayable.toFixed(2)}</Text>
            </View>

            <View style={styles.secureFareBadge}>
              <Ionicons name="lock-closed" size={12} color="#059669" />
              <Text style={styles.secureFareText}>Secure Fare</Text>
            </View>
          </View>
        </View>

        {/* "Select Payment Method" Header */}
        <View style={styles.methodHeaderRow}>
          <Text style={styles.methodSectionTitle}>Select Payment Method</Text>
          <View style={styles.instantPassRow}>
            <Ionicons name="flash" size={13} color="#059669" />
            <Text style={styles.instantPassText}>Instant Pass</Text>
          </View>
        </View>

        {/* Method 1: Credit / Debit Card (Selected & Expanded) */}
        <Pressable
          style={[
            styles.paymentCard,
            selectedMethod === 'card' && styles.paymentCardSelected,
          ]}
          onPress={() => setSelectedMethod('card')}
        >
          <View style={styles.methodTopRow}>
            <View style={styles.radioIndicator}>
              {selectedMethod === 'card' ? (
                <View style={styles.radioSelectedDot} />
              ) : null}
            </View>

            <View style={styles.methodTitleCol}>
              <View style={styles.methodTitleRow}>
                <Text style={styles.methodName}>Credit / Debit Card</Text>
                <View style={styles.visaBadge}>
                  <Text style={styles.visaBadgeText}>VISA</Text>
                </View>
                <View style={styles.lankaPayBadge}>
                  <Text style={styles.lankaPayBadgeText}>LankaPay</Text>
                </View>
              </View>
              <Text style={styles.methodSubtitle}>Visa, Mastercard, LankaPay Card</Text>
            </View>
          </View>

          {/* Expanded Card Form Fields */}
          {selectedMethod === 'card' && (
            <View style={styles.cardFormContainer}>
              {/* Cardholder Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CARDHOLDER NAME</Text>
                <View style={styles.inputFieldBox}>
                  <Ionicons name="person-outline" size={16} color="#64748B" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.textInputField}
                    value={cardholderName}
                    onChangeText={setCardholderName}
                    placeholder="Full Name on Card"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              {/* Card Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CARD NUMBER</Text>
                <View style={styles.inputFieldBox}>
                  <Ionicons name="card-outline" size={16} color="#64748B" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.textInputField}
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    placeholder="•••• •••• •••• ••••"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                  />
                  <View style={styles.cardInputRightBadges}>
                    <View style={styles.smallVisaBadge}>
                      <Text style={styles.smallVisaText}>VISA</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={16} color="#059669" />
                  </View>
                </View>
              </View>

              {/* Expiry Date & CVV */}
              <View style={styles.twoFieldsRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>EXPIRY DATE</Text>
                  <View style={styles.inputFieldBox}>
                    <Ionicons name="calendar-outline" size={16} color="#64748B" style={styles.fieldIcon} />
                    <TextInput
                      style={styles.textInputField}
                      value={expiryDate}
                      onChangeText={setExpiryDate}
                      placeholder="MM/YY"
                      placeholderTextColor="#94A3B8"
                      maxLength={5}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <View style={styles.cvvLabelRow}>
                    <Text style={styles.inputLabel}>CVV / CVC</Text>
                    <Ionicons name="information-circle-outline" size={12} color="#94A3B8" />
                  </View>
                  <View style={styles.inputFieldBox}>
                    <Ionicons name="keypad-outline" size={16} color="#64748B" style={styles.fieldIcon} />
                    <TextInput
                      style={styles.textInputField}
                      value={cvv}
                      onChangeText={setCvv}
                      placeholder="•••"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={true}
                      maxLength={4}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </View>

              {/* Save Card Checkbox */}
              <Pressable
                style={styles.saveCardRow}
                onPress={() => setSaveCardChecked(!saveCardChecked)}
              >
                <View style={[styles.customCheckbox, saveCardChecked && styles.customCheckboxChecked]}>
                  {saveCardChecked && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
                </View>
                <Text style={styles.saveCardText}>
                  Save card securely for 1-tap fast bus boarding check-in
                </Text>
              </Pressable>
            </View>
          )}
        </Pressable>

        {/* Method 2: Digital Wallets */}
        <Pressable
          style={[
            styles.paymentCard,
            selectedMethod === 'wallets' && styles.paymentCardSelected,
          ]}
          onPress={() => setSelectedMethod('wallets')}
        >
          <View style={styles.methodTopRow}>
            <View style={styles.radioIndicator}>
              {selectedMethod === 'wallets' ? <View style={styles.radioSelectedDot} /> : null}
            </View>

            <View style={styles.methodTitleCol}>
              <Text style={styles.methodName}>Digital Wallets</Text>
              <Text style={styles.methodSubtitle}>FriMi, Genie, eZ Cash, mCash</Text>
            </View>

            <View style={styles.walletBadgesWrap}>
              <View style={styles.ezBadge}>
                <Text style={styles.ezBadgeText}>eZ</Text>
              </View>
              <View style={styles.frimiBadge}>
                <Text style={styles.frimiBadgeText}>FriMi</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </View>
          </View>
        </Pressable>

        {/* Method 3: Direct Bank / LankaQR */}
        <Pressable
          style={[
            styles.paymentCard,
            selectedMethod === 'lankaqr' && styles.paymentCardSelected,
          ]}
          onPress={() => setSelectedMethod('lankaqr')}
        >
          <View style={styles.methodTopRow}>
            <View style={styles.radioIndicator}>
              {selectedMethod === 'lankaqr' ? <View style={styles.radioSelectedDot} /> : null}
            </View>

            <View style={styles.methodTitleCol}>
              <Text style={styles.methodName}>Direct Bank / LankaQR</Text>
              <Text style={styles.methodSubtitle}>Scan & pay via any CBSL-certified bank app</Text>
            </View>

            <View style={styles.walletBadgesWrap}>
              <View style={styles.lankaQrBadge}>
                <Text style={styles.lankaQrBadgeText}>LankaQR</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
            </View>
          </View>
        </Pressable>

        {/* Method 4: TransitLK Bus Pass */}
        <Pressable
          style={[
            styles.paymentCard,
            selectedMethod === 'buspass' && styles.paymentCardSelected,
          ]}
          onPress={() => setSelectedMethod('buspass')}
        >
          <View style={styles.methodTopRow}>
            <View style={styles.radioIndicator}>
              {selectedMethod === 'buspass' ? <View style={styles.radioSelectedDot} /> : null}
            </View>

            <View style={styles.methodTitleCol}>
              <View style={styles.methodTitleRow}>
                <Text style={styles.methodName}>TransitLK Bus Pass</Text>
                <View style={styles.fastestOptionBadge}>
                  <Text style={styles.fastestOptionText}>Fastest</Text>
                </View>
              </View>
              <Text style={styles.methodSubtitle}>
                Balance: LKR 1,450.00 • Instant Deduction
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
          </View>
        </Pressable>

        {/* Security & Compliance Badges Banner */}
        <View style={styles.securityBanner}>
          <View style={styles.securityTopRow}>
            <View style={styles.securityLeft}>
              <Ionicons name="shield-checkmark" size={14} color="#059669" />
              <Text style={styles.securityLeftText}>CBSL Approved Payment Gateway</Text>
            </View>
            <Text style={styles.securityRightText}>256-bit SSL</Text>
          </View>

          <View style={styles.compliancePillsRow}>
            <View style={styles.compliancePill}>
              <Text style={styles.compliancePillText}>LankaPay National</Text>
            </View>
            <View style={styles.compliancePill}>
              <Text style={styles.compliancePillText}>PCI-DSS V4.0</Text>
            </View>
            <View style={styles.compliancePill}>
              <Text style={styles.compliancePillText}>Gov-Certified</Text>
            </View>
          </View>
        </View>

        {/* Primary CTA Button: Pay to Complete Booking */}
        <Pressable
          style={({ pressed }) => [
            styles.payButton,
            pressed && styles.payButtonPressed,
            isProcessing && styles.payButtonDisabled,
          ]}
          onPress={handleCompleteBooking}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
              <Text style={styles.payButtonText}>
                Pay LKR {totalPayable.toFixed(2)} to Complete Booking
              </Text>
            </>
          )}
        </Pressable>

        {/* Instant Digital Ticket Notice */}
        <View style={styles.disclaimerNoticeRow}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color="#64748B" style={styles.disclaimerIcon} />
          <Text style={styles.disclaimerText}>
            Instant digital bus QR ticket and SMS travel pass will be issued immediately upon payment confirmation.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <PassengerBottomNav activeTab="routes" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // Top Header
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressedState: {
    backgroundColor: '#F1F5F9',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#1E2B6D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitleCol: {
    marginLeft: 8,
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  liveGpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  liveGpsDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  liveGpsText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stepper
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  stepperItem: {
    alignItems: 'center',
  },
  stepCircleCompleted: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepLabelCompleted: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  stepConnectorCompleted: {
    flex: 1,
    height: 2,
    backgroundColor: '#059669',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  stepCircleActive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1E2B6D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepNumberActive: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  stepLabelActive: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E2B6D',
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E2B6D',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  innerSummaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  innerSummaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  busBadgeSquare: {
    backgroundColor: '#1E2B6D',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  busBadgeSmallText: {
    fontSize: 9,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  busBadgeNumberText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  routeTextWrap: {
    flex: 1,
  },
  routeDestinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  routePlaceName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  authorityText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  summaryDetailLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
    paddingTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  passengersLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
    paddingTop: 8,
  },
  passengersLineText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  totalDueSubBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  totalDueLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  totalDueAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E2B6D',
    marginTop: 2,
  },
  secureFareBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  secureFareText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },

  // Select Payment Method Header
  methodHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  instantPassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  instantPassText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },

  // Payment Option Cards
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#EDF2F7',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  paymentCardSelected: {
    borderColor: '#1E2B6D',
    shadowColor: '#1E2B6D',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  methodTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1E2B6D',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioSelectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1E2B6D',
  },
  methodTitleCol: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  methodName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  visaBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  visaBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  lankaPayBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lankaPayBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  methodSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  walletBadgesWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ezBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ezBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  frimiBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  frimiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D28D9',
  },
  lankaQrBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lankaQrBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  fastestOptionBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  fastestOptionText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },

  // Card Form Fields
  cardFormContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  inputGroup: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputFieldBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInputField: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    padding: 0,
  },
  cardInputRightBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  smallVisaBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  smallVisaText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  twoFieldsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cvvLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  saveCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  customCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  customCheckboxChecked: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  saveCardText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
    lineHeight: 15,
  },

  // Security Banner
  securityBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginTop: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  securityTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  securityLeftText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  securityRightText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  compliancePillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  compliancePill: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  compliancePillText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
  },

  // Primary Pay Button
  payButton: {
    backgroundColor: '#1E2B6D',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#1E2B6D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  payButtonPressed: {
    backgroundColor: '#152052',
    transform: [{ scale: 0.99 }],
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // Disclaimer Row
  disclaimerNoticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 8,
  },
  disclaimerIcon: {
    marginTop: 1,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
});
