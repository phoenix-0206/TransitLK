import React, { useState, useEffect } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import PassengerBottomNav from '@/components/passenger/PassengerBottomNav';

export default function TicketConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookingRef?: string;
    routeNumber?: string;
    serviceName?: string;
    originName?: string;
    destinationName?: string;
    travelDate?: string;
    departureTime?: string;
    arrivalTime?: string;
    totalTickets?: string;
    totalPayable?: string;
    paymentMethod?: string;
    passengerDetails?: string;
  }>();

  // Booking parameters with Figma defaults
  const bookingRef = params.bookingRef || 'TRX-948210-LK';
  const routeNumber = params.routeNumber || '138';
  const serviceName = params.serviceName || 'SLTB AC EXPRESS';
  const originName = params.originName || 'Maharagama';
  const destinationName = params.destinationName || 'Colombo Fort';
  const departureTime = params.departureTime || '08:45 AM';
  const arrivalTime = params.arrivalTime || '09:30 AM';
  const travelDate = params.travelDate || 'Today, 24 Oct 2026';
  const totalPayable = params.totalPayable || '240.00';
  const paymentMethod = params.paymentMethod || 'LankaPay / Visa •••• 4242';
  const passengerDetails = params.passengerDetails || '2 Adults';

  // Live countdown timer for dynamic ticket QR code security refresh
  const [countdown, setCountdown] = useState(41);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 45));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle Copy Booking Reference
  const handleCopyRef = () => {
    Alert.alert('Reference Copied', `Booking reference #${bookingRef} copied to clipboard!`);
  };

  // Handle Wallet addition
  const handleAddToWallet = () => {
    Alert.alert('Digital Pass Added', 'Ticket pass added to your mobile wallet for offline NFC boarding.');
  };

  // Handle Share
  const handleShare = () => {
    Alert.alert('Share Ticket', `Share booking #${bookingRef} (${originName} ➔ ${destinationName})`);
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

        <View style={styles.headerRight}>
          <Pressable
            style={styles.notificationBtn}
            onPress={() => Alert.alert('Notifications', 'Payment completed and ticket issued.')}
          >
            <Ionicons name="notifications-outline" size={22} color="#1E293B" />
          </Pressable>
          <View style={styles.avatarCircle} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Stepper (4 Steps: 1. Trip, 2. Details, 3. Pay, 4. Ticket) */}
        <View style={styles.stepperContainer}>
          {/* Step 1: Trip */}
          <View style={styles.stepperItem}>
            <View style={styles.stepCircleCompleted}>
              <Ionicons name="checkmark" size={13} color="#FFFFFF" />
            </View>
            <Text style={styles.stepLabelCompleted}>1. Trip</Text>
          </View>
          <View style={styles.stepConnectorActive} />

          {/* Step 2: Details */}
          <View style={styles.stepperItem}>
            <View style={styles.stepCircleCompleted}>
              <Ionicons name="checkmark" size={13} color="#FFFFFF" />
            </View>
            <Text style={styles.stepLabelCompleted}>2. Details</Text>
          </View>
          <View style={styles.stepConnectorActive} />

          {/* Step 3: Pay */}
          <View style={styles.stepperItem}>
            <View style={styles.stepCircleCompleted}>
              <Ionicons name="checkmark" size={13} color="#FFFFFF" />
            </View>
            <Text style={styles.stepLabelCompleted}>3. Pay</Text>
          </View>
          <View style={styles.stepConnectorActive} />

          {/* Step 4: Ticket (Current) */}
          <View style={styles.stepperItem}>
            <View style={styles.stepCircleTicket}>
              <MaterialCommunityIcons name="ticket-percent" size={13} color="#FFFFFF" />
            </View>
            <Text style={styles.stepLabelTicket}>4. Ticket</Text>
          </View>
        </View>

        {/* Payment Successful Hero Section */}
        <View style={styles.successHeroCard}>
          <View style={styles.successCheckCircle}>
            <Ionicons name="checkmark" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.successHeading}>Payment Successful!</Text>
          <Text style={styles.successSubtext}>
            Your digital bus pass is active and ready for conductor inspection or validator tap.
          </Text>

          {/* Reference pill banner with copy action */}
          <View style={styles.referenceBanner}>
            <View style={styles.referenceLeft}>
              <Ionicons name="shield-checkmark" size={15} color="#2563EB" />
              <Text style={styles.referenceText}>Ref #{bookingRef}</Text>
            </View>
            <Pressable
              style={styles.copyButton}
              onPress={handleCopyRef}
              hitSlop={8}
            >
              <Feather name="copy" size={12} color="#1E2B6D" />
              <Text style={styles.copyButtonText}>Copy</Text>
            </Pressable>
          </View>

          {/* Meta line with date and card */}
          <View style={styles.paymentMetaLine}>
            <Ionicons name="card-outline" size={14} color="#64748B" />
            <Text style={styles.paymentMetaText}>
              {travelDate} • 08:34 AM via {paymentMethod}
            </Text>
          </View>
        </View>

        {/* Digital Boarding Pass Ticket Card */}
        <View style={styles.boardingPassCard}>
          {/* Header strip */}
          <View style={styles.passHeaderStrip}>
            <View style={styles.passHeaderLeft}>
              <View style={styles.passRouteBadge}>
                <Text style={styles.passRouteBadgeText}>{routeNumber}</Text>
              </View>
              <Text style={styles.passServiceName}>{serviceName}</Text>
            </View>

            <View style={styles.reservedPassBadge}>
              <View style={styles.reservedDot} />
              <Text style={styles.reservedPassText}>Reserved Pass</Text>
            </View>
          </View>

          {/* Station Departure & Arrival Section */}
          <View style={styles.passStationsSection}>
            <View style={styles.stationCol}>
              <Text style={styles.stationTimeText}>{departureTime}</Text>
              <Text style={styles.stationNameText}>{originName}</Text>
              <Text style={styles.stationSubText}>Station Terminal (Bay 2)</Text>
            </View>

            {/* Middle Highway Corridor Badge */}
            <View style={styles.middleCorridorCol}>
              <Text style={styles.corridorMinsText}>~45 mins</Text>
              <View style={styles.corridorIconRow}>
                <View style={styles.corridorDot} />
                <View style={styles.corridorLine} />
                <Ionicons name="bus" size={16} color="#1E2B6D" style={{ marginHorizontal: 2 }} />
                <View style={styles.corridorLine} />
                <View style={styles.corridorDot} />
              </View>
              <Text style={styles.corridorSubText}>Express Highway</Text>
            </View>

            <View style={[styles.stationCol, { alignItems: 'flex-end' }]}>
              <Text style={styles.stationTimeText}>{arrivalTime}</Text>
              <Text style={styles.stationNameText}>{destinationName}</Text>
              <Text style={styles.stationSubText}>Pettah Central Stand</Text>
            </View>
          </View>

          {/* Pass Details strip */}
          <View style={styles.passDetailsStrip}>
            <View>
              <Text style={styles.passDetailsLabel}>Pass Type & Seats</Text>
              <Text style={styles.passDetailsValue}>{passengerDetails} • Bay 04, 05</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.passDetailsLabel}>Fare Total (Paid in Full)</Text>
              <Text style={styles.passFareTotal}>LKR {totalPayable}</Text>
            </View>
          </View>

          {/* Perforated Ticket Divider with Notches */}
          <View style={styles.perforatedRow}>
            <View style={styles.notchLeft} />
            <View style={styles.dashedLine} />
            <View style={styles.notchRight} />
          </View>

          {/* Live QR Code Section */}
          <View style={styles.qrSection}>
            <View style={styles.liveBadgeRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTicketText}>LIVE VALID TICKET</Text>
              <Text style={styles.liveDivider}>•</Text>
              <Text style={styles.refreshesText}>Refreshes in {countdown}s</Text>
            </View>

            {/* Stylized QR Code Graphic */}
            <View style={styles.qrContainer}>
              <View style={styles.qrFrame}>
                {/* QR Pattern visual simulation with position detection markers */}
                <View style={styles.qrCornerTopLeft}>
                  <View style={styles.qrCornerInner} />
                </View>
                <View style={styles.qrCornerTopRight}>
                  <View style={styles.qrCornerInner} />
                </View>
                <View style={styles.qrCornerBottomLeft}>
                  <View style={styles.qrCornerInner} />
                </View>

                {/* Simulated QR matrix dots */}
                <View style={styles.qrMatrixGrid}>
                  <View style={styles.matrixDotRow}>
                    <View style={styles.mDot} /><View style={styles.mDotEmpty} /><View style={styles.mDot} /><View style={styles.mDot} /><View style={styles.mDotEmpty} /><View style={styles.mDot} />
                  </View>
                  <View style={styles.matrixDotRow}>
                    <View style={styles.mDotEmpty} /><View style={styles.mDot} /><View style={styles.mDotEmpty} /><View style={styles.mDotEmpty} /><View style={styles.mDot} /><View style={styles.mDotEmpty} />
                  </View>
                  <View style={styles.matrixDotRow}>
                    <View style={styles.mDot} /><View style={styles.mDot} /><View style={styles.mDotEmpty} /><View style={styles.mDot} /><View style={styles.mDotEmpty} /><View style={styles.mDot} />
                  </View>
                </View>

                {/* Center Verified Checkmark Seal */}
                <View style={styles.qrCenterSeal}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              </View>
            </View>

            <Text style={styles.qrInstructionText}>
              Show this QR code to the bus conductor or tap device against the contactless gate validator.
            </Text>
          </View>
        </View>

        {/* Wallet & Share Action Row */}
        <View style={styles.actionButtonsRow}>
          <Pressable
            style={styles.walletButton}
            onPress={handleAddToWallet}
          >
            <Ionicons name="wallet-outline" size={16} color="#1E2B6D" />
            <Text style={styles.walletButtonText}>Add to Apple / Google Wallet</Text>
          </Pressable>

          <Pressable
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-social-outline" size={16} color="#334155" />
            <Text style={styles.shareButtonText}>Share</Text>
          </Pressable>
        </View>

        {/* Live Bus Dispatch Card */}
        <View style={styles.dispatchCard}>
          <View style={styles.dispatchHeaderRow}>
            <View style={styles.dispatchTitleWrap}>
              <Ionicons name="location-outline" size={16} color="#059669" />
              <Text style={styles.dispatchHeading}>Live Bus Dispatch</Text>
            </View>
            <View style={styles.busPlateBadge}>
              <Text style={styles.busPlateText}>WP-ND-8422</Text>
            </View>
          </View>

          {/* Approaching Status Box */}
          <View style={styles.approachingBox}>
            <View style={styles.approachingIconWrap}>
              <MaterialCommunityIcons name="bus-clock" size={20} color="#059669" />
            </View>
            <View style={styles.approachingTextCol}>
              <Text style={styles.approachingTitle}>Approaching Maharagama Bay 2</Text>
              <Text style={styles.approachingEta}>ETA: ~8 minutes away</Text>
            </View>
          </View>

          {/* Action: Track Bus on Live GPS Map */}
          <Pressable
            style={styles.trackBusButton}
            onPress={() => router.push('/passenger/search')}
          >
            <View style={styles.trackBusLeft}>
              <MaterialCommunityIcons name="radar" size={18} color="#2563EB" />
              <Text style={styles.trackBusText}>Track Bus on Live GPS Map</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#2563EB" />
          </Pressable>

          {/* Action: Download PDF E-Receipt */}
          <Pressable
            style={styles.receiptButton}
            onPress={() => Alert.alert('E-Receipt', 'Downloading official NTC tax invoice PDF...')}
          >
            <View style={styles.receiptLeft}>
              <Ionicons name="download-outline" size={16} color="#475569" />
              <Text style={styles.receiptText}>Download PDF E-Receipt</Text>
            </View>
            <Text style={styles.receiptSizeText}>124 KB</Text>
          </Pressable>

          {/* Hotline Strip */}
          <View style={styles.hotlineRow}>
            <View style={styles.hotlineLeft}>
              <Ionicons name="call-outline" size={14} color="#64748B" />
              <Text style={styles.hotlineLabel}>SLTB / NTC Hotline</Text>
            </View>
            <Text style={styles.hotlineDial}>Dial 1955 (24/7)</Text>
          </View>
        </View>

        {/* Primary CTA: View in My Tickets */}
        <Pressable
          style={({ pressed }) => [
            styles.viewTicketsButton,
            pressed && styles.viewTicketsButtonPressed,
          ]}
          onPress={() => router.push('/passenger/purchase-history' as any)}
        >
          <MaterialCommunityIcons name="ticket-outline" size={18} color="#FFFFFF" />
          <Text style={styles.viewTicketsButtonText}>View in My Tickets</Text>
        </Pressable>

        {/* Secondary: Back to Home */}
        <Pressable
          style={styles.backHomeButton}
          onPress={() => router.push('/passenger/search' as any)}
        >
          <Ionicons name="home-outline" size={15} color="#475569" style={{ marginRight: 6 }} />
          <Text style={styles.backHomeButtonText}>Back to Home</Text>
        </Pressable>
      </ScrollView>

      {/* Bottom Navigation Tabs */}
      <PassengerBottomNav activeTab="tickets" />
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
  },

  // Stepper
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepLabelCompleted: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  stepConnectorActive: {
    flex: 1,
    height: 2,
    backgroundColor: '#059669',
    marginHorizontal: 6,
    marginBottom: 14,
  },
  stepCircleTicket: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E2B6D',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepLabelTicket: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E2B6D',
  },

  // Success Hero Card
  successHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  successCheckCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  successHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  successSubtext: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  referenceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  referenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  referenceText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E2B6D',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  copyButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E2B6D',
  },
  paymentMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentMetaText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  // Boarding Pass Ticket Card
  boardingPassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  passHeaderStrip: {
    backgroundColor: '#1E2B6D',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  passHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passRouteBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  passRouteBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1E2B6D',
  },
  passServiceName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  reservedPassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 5,
  },
  reservedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  reservedPassText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A7F3D0',
  },
  passStationsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  stationCol: {
    flex: 1,
  },
  stationTimeText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  stationNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  stationSubText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  middleCorridorCol: {
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  corridorMinsText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 2,
  },
  corridorIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  corridorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  corridorLine: {
    width: 14,
    height: 1.5,
    backgroundColor: '#CBD5E1',
  },
  corridorSubText: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  passDetailsStrip: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  passDetailsLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  passDetailsValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  passFareTotal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1E2B6D',
    marginTop: 2,
  },

  // Perforated Divider
  perforatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    position: 'relative',
  },
  notchLeft: {
    width: 16,
    height: 24,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderColor: '#E2E8F0',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginHorizontal: 8,
  },
  notchRight: {
    width: 16,
    height: 24,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 1,
    borderColor: '#E2E8F0',
  },

  // QR Code Section
  qrSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
    marginBottom: 16,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveTicketText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  liveDivider: {
    fontSize: 10,
    color: '#A7F3D0',
  },
  refreshesText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },

  // QR Frame
  qrContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 14,
  },
  qrFrame: {
    width: 170,
    height: 170,
    position: 'relative',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCornerTopLeft: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 44,
    height: 44,
    borderWidth: 6,
    borderColor: '#1E2B6D',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCornerTopRight: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 44,
    height: 44,
    borderWidth: 6,
    borderColor: '#1E2B6D',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCornerBottomLeft: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 44,
    height: 44,
    borderWidth: 6,
    borderColor: '#1E2B6D',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCornerInner: {
    width: 16,
    height: 16,
    backgroundColor: '#1E2B6D',
    borderRadius: 4,
  },
  qrMatrixGrid: {
    position: 'absolute',
    width: 70,
    height: 60,
    justifyContent: 'space-around',
  },
  matrixDotRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mDot: {
    width: 8,
    height: 8,
    backgroundColor: '#1E2B6D',
    borderRadius: 2,
  },
  mDotEmpty: {
    width: 8,
    height: 8,
  },
  qrCenterSeal: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  qrInstructionText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },

  // Wallet & Share Action Row
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  walletButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    paddingVertical: 12,
    gap: 6,
  },
  walletButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E2B6D',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    gap: 6,
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },

  // Live Bus Dispatch Card
  dispatchCard: {
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
  dispatchHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dispatchTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dispatchHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  busPlateBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  busPlateText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  approachingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  approachingIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approachingTextCol: {
    flex: 1,
  },
  approachingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  approachingEta: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    marginTop: 2,
  },
  trackBusButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 8,
  },
  trackBusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackBusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  receiptButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 10,
  },
  receiptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  receiptText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  receiptSizeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  hotlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  hotlineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hotlineLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  hotlineDial: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },

  // Primary Action Button
  viewTicketsButton: {
    backgroundColor: '#1E2B6D',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#1E2B6D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  viewTicketsButtonPressed: {
    backgroundColor: '#152052',
    transform: [{ scale: 0.99 }],
  },
  viewTicketsButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Back to Home
  backHomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  backHomeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});
