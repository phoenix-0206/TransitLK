import React, { useState, useMemo } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import BottomNavigation from '@/components/BottomNavigation';
import PassengerHomeHeader from '@/components/passenger/PassengerHomeHeader';

export default function TicketDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    tripId?: string;
    routeNumber?: string;
    serviceName?: string;
    fare?: string;
    originName?: string;
    destinationName?: string;
    departureTime?: string;
    arrivalTime?: string;
    durationText?: string;
    travelDate?: string;
  }>();

  // Route and trip parameters with Figma defaults
  const routeNumber = params.routeNumber || '138';
  const serviceName = params.serviceName || 'SLTB Semi-Luxury AC';
  const baseFare = parseFloat(params.fare || '120') || 120;
  const originName = params.originName || 'Maharagama Central';
  const destinationName = params.destinationName || 'Colombo Fort';
  const departureTime = params.departureTime || '08:45 AM';
  const arrivalTime = params.arrivalTime || '09:30 AM';
  const travelDate = params.travelDate || 'Today, 24 Oct 2026';
  const durationText = params.durationText || '45 min bus corridor (Non-stop)';

  // Passenger ticket count states matching Figma defaults (2 Adult, 1 Student, 0 Child)
  const [adultCount, setAdultCount] = useState(2);
  const [studentCount, setStudentCount] = useState(1);
  const [childCount, setChildCount] = useState(0);

  // Add-on states
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);

  // Fares
  const adultFare = baseFare;
  const studentFare = Math.round(baseFare * 0.5); // 50% discount
  const childFare = Math.round(baseFare * 0.5);   // 50% discount
  const smsFee = smsAlertsEnabled ? 10.0 : 0.0;

  // Totals calculation
  const totalTickets = adultCount + studentCount + childCount;
  const adultSubtotal = adultCount * adultFare;
  const studentSubtotal = studentCount * studentFare;
  const childSubtotal = childCount * childFare;
  const totalPayable = adultSubtotal + studentSubtotal + childSubtotal + smsFee;

  // Passenger counter handlers (Max 6 tickets per booking rule)
  const handleIncrement = (type: 'adult' | 'student' | 'child') => {
    if (totalTickets >= 6) {
      Alert.alert('Booking Limit', 'A maximum of 6 tickets can be booked per transaction.');
      return;
    }
    if (type === 'adult') setAdultCount((prev) => prev + 1);
    else if (type === 'student') setStudentCount((prev) => prev + 1);
    else if (type === 'child') setChildCount((prev) => prev + 1);
  };

  const handleDecrement = (type: 'adult' | 'student' | 'child') => {
    if (type === 'adult' && adultCount > 0) setAdultCount((prev) => prev - 1);
    else if (type === 'student' && studentCount > 0) setStudentCount((prev) => prev - 1);
    else if (type === 'child' && childCount > 0) setChildCount((prev) => prev - 1);
  };

  // Proceed to Payment screen
  const handleProceedToPay = () => {
    if (totalTickets === 0) {
      Alert.alert('No Tickets Selected', 'Please select at least 1 passenger ticket to continue.');
      return;
    }

    router.push({
      pathname: '/passenger/payment' as any,
      params: {
        tripId: params.tripId,
        routeNumber,
        serviceName,
        originName,
        destinationName,
        travelDate,
        departureTime,
        arrivalTime,
        adultCount: String(adultCount),
        studentCount: String(studentCount),
        childCount: String(childCount),
        totalTickets: String(totalTickets),
        adultSubtotal: String(adultSubtotal),
        studentSubtotal: String(studentSubtotal),
        childSubtotal: String(childSubtotal),
        smsFee: String(smsFee),
        totalPayable: String(totalPayable),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <PassengerHomeHeader subtitle="Ticket Details" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Progress Bar (Step 2: Passengers) */}
        <View style={styles.stepperContainer}>
          {/* Step 1: Trip Picked (Completed) */}
          <View style={styles.stepperItem}>
            <View style={styles.stepCircleCompleted}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.stepLabelCompleted}>Trip Picked</Text>
          </View>

          <View style={styles.stepConnectorCompleted} />

          {/* Step 2: Passengers (Active) */}
          <View style={styles.stepperItem}>
            <View style={styles.stepCircleActive}>
              <Text style={styles.stepNumberActive}>2</Text>
            </View>
            <Text style={styles.stepLabelActive}>Passengers</Text>
          </View>

          <View style={styles.stepConnectorUpcoming} />

          {/* Step 3: Payment (Upcoming) */}
          <View style={styles.stepperItem}>
            <View style={styles.stepCircleUpcoming}>
              <Text style={styles.stepNumberUpcoming}>3</Text>
            </View>
            <Text style={styles.stepLabelUpcoming}>Payment</Text>
          </View>
        </View>

        {/* Selected Bus / Route Summary Card */}
        <View style={styles.routeCard}>
          {/* Badges and Change Link Row */}
          <View style={styles.routeCardTopRow}>
            <View style={styles.routeCardBadges}>
              <View style={styles.busNumberBadge}>
                <Text style={styles.busNumberText}>BUS {routeNumber}</Text>
              </View>
              <View style={styles.serviceClassBadge}>
                <Ionicons name="snow" size={12} color="#059669" style={styles.serviceClassIcon} />
                <Text style={styles.serviceClassText}>{serviceName}</Text>
              </View>
            </View>

            <Pressable
              style={styles.changeTripButton}
              onPress={() => router.back()}
              hitSlop={6}
            >
              <Text style={styles.changeTripText}>Change</Text>
              <Feather name="edit-2" size={12} color="#2563EB" style={styles.changeTripIcon} />
            </Pressable>
          </View>

          {/* Route Stop 1: Origin */}
          <View style={styles.routeStopRow}>
            <View style={styles.originIndicatorDot} />
            <View style={styles.routeStopInfo}>
              <Text style={styles.routeStopName}>{originName}</Text>
              <Text style={styles.routeStopTime}>{travelDate}, {departureTime} • Stand 04</Text>
            </View>
          </View>

          {/* Corridor Connection Pill */}
          <View style={styles.corridorConnectorRow}>
            <View style={styles.connectorDottedLine} />
            <View style={styles.corridorPill}>
              <Ionicons name="bus" size={12} color="#2563EB" style={styles.corridorIcon} />
              <Text style={styles.corridorText}>{durationText}</Text>
            </View>
          </View>

          {/* Route Stop 2: Destination */}
          <View style={styles.routeStopRow}>
            <View style={styles.destIndicatorDot} />
            <View style={styles.routeStopInfo}>
              <Text style={styles.routeStopName}>{destinationName}</Text>
              <Text style={styles.routeStopTime}>{arrivalTime} Est. Arrival • Bastian Mawatha</Text>
            </View>
          </View>

          {/* Bus Registration & Base Fare Banner */}
          <View style={styles.busInfoBanner}>
            <View style={styles.busRegRow}>
              <Ionicons name="bus-outline" size={14} color="#64748B" />
              <Text style={styles.busRegText}>WP-ND--8422 • Maharagama Depot</Text>
            </View>
            <Text style={styles.baseFareText}>LKR {baseFare.toFixed(2)} / adult</Text>
          </View>
        </View>

        {/* Live Bus En Route Status Card with Image Thumbnail */}
        <View style={styles.enRouteCard}>
          <View style={styles.enRouteContent}>
            <View style={styles.enRoutePill}>
              <View style={styles.enRouteDot} />
              <Text style={styles.enRoutePillText}>BUS EN ROUTE</Text>
            </View>
            <Text style={styles.enRouteTitle}>Depot cleared, boarding in 8 min</Text>
            <Text style={styles.enRouteSubtitle}>
              Instant QR sync enabled for fast terminal gate tap.
            </Text>
          </View>

          <Image
            source={require('../../assets/images/sltb_bus.jpg')}
            style={styles.busThumbnailImage}
            resizeMode="cover"
          />
        </View>

        {/* "Select Passengers" Section Header */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionTitle}>Select Passengers</Text>
            <Text style={styles.sectionSubtitle}>Fares regulated by National Transport Commission</Text>
          </View>
          <View style={styles.maxLimitBadge}>
            <Text style={styles.maxLimitText}>Max 6 per booking</Text>
          </View>
        </View>

        {/* Passenger 1: Adult */}
        <View style={styles.passengerCard}>
          <View style={styles.passengerCardMain}>
            <View style={styles.passengerLeftCol}>
              <View style={styles.passengerNameRow}>
                <Text style={styles.passengerName}>Adult</Text>
                <View style={styles.regularBadge}>
                  <Text style={styles.regularBadgeText}>Regular</Text>
                </View>
              </View>
              <Text style={styles.passengerDesc}>Standard commuter fare (Age 12+)</Text>
              <Text style={styles.passengerUnitPrice}>LKR {adultFare.toFixed(2)}</Text>
            </View>

            {/* Stepper Counter */}
            <View style={styles.stepperControl}>
              <Pressable
                style={[styles.stepperBtn, adultCount === 0 && styles.stepperBtnDisabled]}
                onPress={() => handleDecrement('adult')}
                disabled={adultCount === 0}
                hitSlop={6}
              >
                <Ionicons name="remove" size={16} color={adultCount === 0 ? '#CBD5E1' : '#002060'} />
              </Pressable>

              <Text style={styles.stepperValue}>{adultCount}</Text>

              <Pressable
                style={[styles.stepperBtn, styles.stepperBtnPlus]}
                onPress={() => handleIncrement('adult')}
                disabled={totalTickets >= 6}
                hitSlop={6}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          <View style={styles.passengerSubtotalRow}>
            <Text style={styles.subtotalLabel}>Line item subtotal</Text>
            <Text style={styles.subtotalValue}>LKR {adultSubtotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Passenger 2: Student / Concession */}
        <View style={styles.passengerCard}>
          <View style={styles.passengerCardMain}>
            <View style={styles.passengerLeftCol}>
              <View style={styles.passengerNameRow}>
                <Text style={styles.passengerName}>Student / Concession</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>50% off</Text>
                </View>
              </View>
              <Text style={styles.passengerDesc}>Valid institutional or season card verified on bus</Text>
              <Text style={styles.passengerUnitPrice}>LKR {studentFare.toFixed(2)}</Text>
            </View>

            {/* Stepper Counter */}
            <View style={styles.stepperControl}>
              <Pressable
                style={[styles.stepperBtn, studentCount === 0 && styles.stepperBtnDisabled]}
                onPress={() => handleDecrement('student')}
                disabled={studentCount === 0}
                hitSlop={6}
              >
                <Ionicons name="remove" size={16} color={studentCount === 0 ? '#CBD5E1' : '#002060'} />
              </Pressable>

              <Text style={styles.stepperValue}>{studentCount}</Text>

              <Pressable
                style={[styles.stepperBtn, styles.stepperBtnPlus]}
                onPress={() => handleIncrement('student')}
                disabled={totalTickets >= 6}
                hitSlop={6}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          <View style={styles.passengerSubtotalRow}>
            <Text style={styles.subtotalLabel}>Line item subtotal</Text>
            <Text style={styles.subtotalValue}>LKR {studentSubtotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Passenger 3: Child / Senior */}
        <View style={styles.passengerCard}>
          <View style={styles.passengerCardMain}>
            <View style={styles.passengerLeftCol}>
              <View style={styles.passengerNameRow}>
                <Text style={styles.passengerName}>Child / Senior</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>50% off</Text>
                </View>
              </View>
              <Text style={styles.passengerDesc}>Age under 12 or 60+ (NIC / Birth Certificate required)</Text>
              <Text style={styles.passengerUnitPrice}>LKR {childFare.toFixed(2)}</Text>
            </View>

            {/* Stepper Counter */}
            <View style={styles.stepperControl}>
              <Pressable
                style={[styles.stepperBtn, childCount === 0 && styles.stepperBtnDisabled]}
                onPress={() => handleDecrement('child')}
                disabled={childCount === 0}
                hitSlop={6}
              >
                <Ionicons name="remove" size={16} color={childCount === 0 ? '#CBD5E1' : '#002060'} />
              </Pressable>

              <Text style={styles.stepperValue}>{childCount}</Text>

              <Pressable
                style={[styles.stepperBtn, styles.stepperBtnPlus]}
                onPress={() => handleIncrement('child')}
                disabled={totalTickets >= 6}
                hitSlop={6}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          <View style={styles.passengerSubtotalRow}>
            <Text style={styles.subtotalLabel}>Line item subtotal</Text>
            <Text style={styles.subtotalValue}>LKR {childSubtotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Add-on: SMS Transit Alerts & Delay Guard */}
        <Pressable
          style={styles.addonCard}
          onPress={() => setSmsAlertsEnabled(!smsAlertsEnabled)}
        >
          <View style={styles.addonTopRow}>
            <View style={[styles.addonCheckbox, smsAlertsEnabled && styles.addonCheckboxChecked]}>
              {smsAlertsEnabled && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>

            <View style={styles.addonTitleWrap}>
              <View style={styles.addonHeaderLine}>
                <Text style={styles.addonTitle}>SMS Transit Alerts & Delay Guard</Text>
                <Text style={styles.addonPrice}>+LKR 10.00</Text>
              </View>
              <Text style={styles.addonDesc}>
                Receive instant SMS with real-time GPS link when the bus is 2 stops away and automatic refund warranty on cancellations.
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Commuter Protection Active Banner */}
        <View style={styles.protectionBanner}>
          <View style={styles.protectionIconCircle}>
            <MaterialCommunityIcons name="shield-check" size={20} color="#059669" />
          </View>
          <View style={styles.protectionTextWrap}>
            <Text style={styles.protectionTitle}>COMMUTER PROTECTION ACTIVE</Text>
            <Text style={styles.protectionSubtitle}>Covered by Sri Lanka National Transport Insurance Fund</Text>
          </View>
        </View>

        {/* Fare Breakdown Card */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownHeading}>Fare Breakdown</Text>

          {adultCount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{adultCount}× Adult Ticket</Text>
              <Text style={styles.breakdownAmount}>LKR {adultSubtotal.toFixed(2)}</Text>
            </View>
          )}

          {studentCount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{studentCount}× Student Concession</Text>
              <Text style={styles.breakdownAmount}>LKR {studentSubtotal.toFixed(2)}</Text>
            </View>
          )}

          {childCount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{childCount}× Child / Senior Concession</Text>
              <Text style={styles.breakdownAmount}>LKR {childSubtotal.toFixed(2)}</Text>
            </View>
          )}

          {smsAlertsEnabled && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>SMS & Live Arrival Alerts</Text>
              <Text style={styles.breakdownAmount}>LKR 10.00</Text>
            </View>
          )}

          <View style={styles.breakdownRow}>
            <View style={styles.feeInfoRow}>
              <Text style={styles.breakdownLabel}>Taxes & NTC Service Fee</Text>
              <Ionicons name="information-circle-outline" size={13} color="#94A3B8" style={{ marginLeft: 4 }} />
            </View>
            <Text style={styles.freeFeeText}>FREE (Waived)</Text>
          </View>

          <View style={styles.breakdownDivider} />

          {/* Total Payable Row */}
          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>TOTAL PAYABLE</Text>
              <Text style={styles.totalSubtitle}>Includes all digital handling</Text>
            </View>
            <Text style={styles.totalAmount}>LKR {totalPayable.toFixed(2)}</Text>
          </View>
        </View>

        {/* Offline QR Scanner Notice Banner */}
        <View style={styles.offlineNoticeCard}>
          <Image
            source={require('../../assets/images/conductor_scan.jpg')}
            style={styles.offlineNoticeImg}
            resizeMode="cover"
          />
          <Text style={styles.offlineNoticeText}>
            Bus conductor will scan your digital QR code upon boarding. Offline cached bus ticket valid if mobile network drops along High Level Road bus corridor.
          </Text>
        </View>
      </ScrollView>

      {/* Floating Bottom Bar: Selected summary & Proceed to Pay CTA */}
      <View style={styles.bottomBarContainer}>
        <View style={styles.bottomSummaryCol}>
          <Text style={styles.bottomTicketsCount}>
            {totalTickets} {totalTickets === 1 ? 'Ticket' : 'Tickets'} Selected
          </Text>
          <Text style={styles.bottomTotalAmount}>LKR {totalPayable.toFixed(2)}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.proceedButton,
            pressed && styles.proceedButtonPressed,
          ]}
          onPress={handleProceedToPay}
        >
          <Text style={styles.proceedButtonText}>Proceed to Pay</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Bottom Navigation matching design */}
      <BottomNavigation />
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
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
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
    backgroundColor: '#002060',
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
    fontSize: 14,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    color: '#059669',
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: 'bold',
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
    paddingHorizontal: 16,
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
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepLabelCompleted: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
  },
  stepConnectorCompleted: {
    flex: 1,
    height: 2,
    backgroundColor: '#10B981',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  stepCircleActive: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#002060',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepNumberActive: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  stepLabelActive: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#002060',
  },
  stepConnectorUpcoming: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  stepCircleUpcoming: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepNumberUpcoming: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  stepLabelUpcoming: {
    fontSize: 10,
    fontWeight: 'normal',
    color: '#94A3B8',
  },

  // Selected Route Summary Card
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  routeCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  routeCardBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  busNumberBadge: {
    backgroundColor: '#002060',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  busNumberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  serviceClassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  serviceClassIcon: {
    marginRight: 4,
  },
  serviceClassText: {
    color: '#059669',
    fontSize: 10,
    fontWeight: 'bold',
  },
  changeTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  changeTripText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  changeTripIcon: {
    marginLeft: 4,
  },
  routeStopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  originIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginTop: 5,
    marginRight: 10,
  },
  destIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#002060',
    marginTop: 5,
    marginRight: 10,
  },
  routeStopInfo: {
    flex: 1,
  },
  routeStopName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  routeStopTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  corridorConnectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingLeft: 4,
  },
  connectorDottedLine: {
    width: 2,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginRight: 14,
  },
  corridorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  corridorIcon: {
    marginRight: 4,
  },
  corridorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  busInfoBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  busRegRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  busRegText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  baseFareText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#002060',
  },

  // Live En Route Card
  enRouteCard: {
    backgroundColor: '#002060',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowColor: '#002060',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  enRouteContent: {
    flex: 1,
    marginRight: 12,
  },
  enRoutePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 5,
    marginBottom: 6,
  },
  enRouteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60A5FA',
  },
  enRoutePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  enRouteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  enRouteSubtitle: {
    fontSize: 10,
    color: '#CBD5E1',
    lineHeight: 15,
  },
  busThumbnailImage: {
    width: 68,
    height: 52,
    borderRadius: 10,
  },

  // "Select Passengers" Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  maxLimitBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  maxLimitText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4338CA',
  },

  // Passenger Card
  passengerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  passengerCardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passengerLeftCol: {
    flex: 1,
    marginRight: 10,
  },
  passengerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passengerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  regularBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  regularBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  discountBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
  },
  passengerDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  passengerUnitPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#002060',
    marginTop: 4,
  },
  stepperControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.5,
  },
  stepperBtnPlus: {
    backgroundColor: '#002060',
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    minWidth: 16,
    textAlign: 'center',
  },
  passengerSubtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  subtotalLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  subtotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  // Add-on Card (SMS Alert)
  addonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginTop: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  addonTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addonCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  addonCheckboxChecked: {
    backgroundColor: '#002060',
    borderColor: '#002060',
  },
  addonTitleWrap: {
    flex: 1,
  },
  addonHeaderLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  addonTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  addonPrice: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
  },
  addonDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 15,
  },

  // Protection Banner
  protectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 10,
  },
  protectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  protectionTextWrap: {
    flex: 1,
  },
  protectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#065F46',
  },
  protectionSubtitle: {
    fontSize: 10,
    color: '#047857',
    marginTop: 1,
  },

  // Fare Breakdown Card
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  breakdownHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#475569',
  },
  feeInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  freeFeeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  totalSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#002060',
  },

  // Offline Notice Card
  offlineNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 10,
    gap: 12,
  },
  offlineNoticeImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  offlineNoticeText: {
    flex: 1,
    fontSize: 10,
    color: '#64748B',
    lineHeight: 16,
  },

  // Floating Bottom Bar
  bottomBarContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 6,
  },
  bottomSummaryCol: {
    flex: 1,
  },
  bottomTicketsCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: 'normal',
  },
  bottomTotalAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#002060',
  },
  proceedButton: {
    backgroundColor: '#002060',
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#002060',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  proceedButtonPressed: {
    backgroundColor: '#152052',
    transform: [{ scale: 0.99 }],
  },
  proceedButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
