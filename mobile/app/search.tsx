import React, { useMemo, useState } from 'react';

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { router } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';


// ======================================================
// ROUTE / JOURNEY DATA
// ======================================================

const journey = {
  busNumber: '138',
  service: 'SLTB Semi-Luxury AC',
  from: 'Maharagama Central',
  to: 'Colombo Fort',
  departure: '08:45 AM',
  arrival: '09:30 AM',
  date: 'Today',
  stand: '04',
  duration: '45 min bus corridor (Non-stop)',
  vehicle: 'WP-ND-8422',
  depot: 'Maharagama Depot',
  adultFare: 120,
  studentFare: 60,
  childFare: 60,
};


// ======================================================
// SCREEN
// ======================================================

export default function PassengerSearchScreen() {
  const insets = useSafeAreaInsets();

  const [adultCount, setAdultCount] = useState(2);
  const [studentCount, setStudentCount] = useState(1);
  const [childCount, setChildCount] = useState(0);

  const [smsAlerts, setSmsAlerts] = useState(false);

  const totalTickets =
    adultCount +
    studentCount +
    childCount;

  const adultTotal =
    adultCount * journey.adultFare;

  const studentTotal =
    studentCount * journey.studentFare;

  const childTotal =
    childCount * journey.childFare;

  const smsFee = smsAlerts ? 10 : 0;

  const totalAmount =
    adultTotal +
    studentTotal +
    childTotal +
    smsFee;


  const canAddPassenger = totalTickets < 6;


  function increasePassenger(
    type: 'adult' | 'student' | 'child'
  ) {
    if (!canAddPassenger) {
      Alert.alert(
        'Maximum passengers',
        'You can select a maximum of 6 passengers per booking.'
      );

      return;
    }

    if (type === 'adult') {
      setAdultCount((value) => value + 1);
    }

    if (type === 'student') {
      setStudentCount((value) => value + 1);
    }

    if (type === 'child') {
      setChildCount((value) => value + 1);
    }
  }


  function decreasePassenger(
    type: 'adult' | 'student' | 'child'
  ) {
    if (type === 'adult') {
      setAdultCount((value) => Math.max(0, value - 1));
    }

    if (type === 'student') {
      setStudentCount((value) => Math.max(0, value - 1));
    }

    if (type === 'child') {
      setChildCount((value) => Math.max(0, value - 1));
    }
  }


  function handleChangeTrip() {
    Alert.alert(
      'Change Trip',
      'Trip selection can be connected to the journey search screen next.'
    );
  }


  function handleProceedToPay() {
    if (totalTickets === 0) {
      Alert.alert(
        'Select passengers',
        'Please select at least one passenger.'
      );

      return;
    }

    Alert.alert(
      'Proceed to Payment',
      `${totalTickets} ticket${
        totalTickets > 1 ? 's' : ''
      } selected.\n\nTotal: LKR ${totalAmount.toFixed(2)}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => {
            Alert.alert(
              'Payment',
              'Payment screen will be connected here next.'
            );
          },
        },
      ]
    );
  }


  const formattedTotal = useMemo(
    () => `LKR ${totalAmount.toFixed(2)}`,
    [totalAmount]
  );


  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top']}
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#132238"
          />
        </TouchableOpacity>


        <View style={styles.headerTitleContainer}>

          <View style={styles.headerBrandRow}>

            <View style={styles.headerLogo}>
              <Ionicons
                name="bus"
                size={15}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.headerBrand}>
              TransitLK
            </Text>

          </View>

          <Text style={styles.headerPageTitle}>
            Routes Booking
          </Text>

        </View>


        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => {
            Alert.alert(
              'Notifications',
              'No new notifications.'
            );
          }}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color="#263238"
          />
        </TouchableOpacity>

      </View>


      {/* ==================================================
          CONTENT
      ================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              115 + insets.bottom,
          },
        ]}
      >

        {/* ==================================================
            BOOKING STEPPER
        ================================================== */}

        <View style={styles.stepperCard}>

          <View style={styles.stepperLine} />

          {/* STEP 1 */}

          <View style={styles.stepItem}>

            <View
              style={[
                styles.stepCircle,
                styles.stepCompleted,
              ]}
            >
              <Ionicons
                name="checkmark"
                size={18}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.stepActiveLabel}>
              Trip Picked
            </Text>

          </View>


          {/* STEP 2 */}

          <View style={styles.stepItem}>

            <View
              style={[
                styles.stepCircle,
                styles.stepCurrent,
              ]}
            >
              <Text style={styles.stepCurrentNumber}>
                2
              </Text>
            </View>

            <Text style={styles.stepCurrentLabel}>
              Passengers
            </Text>

          </View>


          {/* STEP 3 */}

          <View style={styles.stepItem}>

            <View
              style={[
                styles.stepCircle,
                styles.stepPending,
              ]}
            >
              <Text style={styles.stepPendingNumber}>
                3
              </Text>
            </View>

            <Text style={styles.stepPendingLabel}>
              Payment
            </Text>

          </View>

        </View>


        {/* ==================================================
            JOURNEY CARD
        ================================================== */}

        <View style={styles.journeyCard}>

          {/* Bus / Service Row */}

          <View style={styles.serviceRow}>

            <View style={styles.busNumberBadge}>
              <Text style={styles.busNumberText}>
                BUS {journey.busNumber}
              </Text>
            </View>


            <View style={styles.serviceBadge}>
              <Ionicons
                name="snow-outline"
                size={14}
                color="#087F80"
              />

              <Text style={styles.serviceBadgeText}>
                {journey.service}
              </Text>
            </View>


            <TouchableOpacity
              style={styles.changeButton}
              onPress={handleChangeTrip}
            >
              <Text style={styles.changeButtonText}>
                Change
              </Text>

              <Ionicons
                name="chevron-down"
                size={13}
                color="#183D91"
              />
            </TouchableOpacity>

          </View>


          {/* From */}

          <View style={styles.locationRow}>

            <View style={styles.locationIndicatorGreen} />

            <View style={styles.locationContent}>

              <Text style={styles.locationName}>
                {journey.from}
              </Text>

              <Text style={styles.locationDetails}>
                {journey.date}, {journey.departure} • Stand {journey.stand}
              </Text>

            </View>

          </View>


          {/* Vertical route line */}

          <View style={styles.verticalRouteLine} />


          {/* Duration */}

          <View style={styles.durationRow}>

            <Ionicons
              name="bus-outline"
              size={14}
              color="#52718D"
            />

            <Text style={styles.durationText}>
              {journey.duration}
            </Text>

          </View>


          {/* To */}

          <View style={styles.locationRow}>

            <View style={styles.locationIndicatorBlue} />

            <View style={styles.locationContent}>

              <Text style={styles.locationName}>
                {journey.to}
              </Text>

              <Text style={styles.locationDetails}>
                {journey.arrival} Est. Arrival • Bastian Mawatha
              </Text>

            </View>

          </View>


          {/* Vehicle / fare */}

          <View style={styles.vehicleInfo}>

            <View style={styles.vehicleLeft}>

              <Ionicons
                name="bus-outline"
                size={15}
                color="#47728A"
              />

              <Text style={styles.vehicleText}>
                {journey.vehicle} • {journey.depot}
              </Text>

            </View>


            <Text style={styles.vehicleFare}>
              LKR {journey.adultFare.toFixed(2)} / adult
            </Text>

          </View>

        </View>


        {/* ==================================================
            BUS STATUS
        ================================================== */}

        <View style={styles.statusCard}>

          <View style={styles.statusLeft}>

            <View style={styles.statusDot} />

            <View>

              <Text style={styles.statusTitle}>
                BUS EN ROUTE
              </Text>

              <Text style={styles.statusMain}>
                Depot cleared, boarding in 8 min
              </Text>

              <Text style={styles.statusSub}>
                Instant QR sync enabled for fast terminal gate tap.
              </Text>

            </View>

          </View>


          <View style={styles.busImagePlaceholder}>
            <Ionicons
              name="bus"
              size={30}
              color="#FFFFFF"
            />
          </View>

        </View>


        {/* ==================================================
            SELECT PASSENGERS TITLE
        ================================================== */}

        <View style={styles.passengerTitleRow}>

          <View>

            <Text style={styles.passengerTitle}>
              Select Passengers
            </Text>

            <Text style={styles.passengerSubtitle}>
              Fares regulated by National Transport Commission
            </Text>

          </View>


          <View style={styles.maxBadge}>
            <Text style={styles.maxBadgeText}>
              Max 6 per
            </Text>

            <Text style={styles.maxBadgeText}>
              booking
            </Text>
          </View>

        </View>


        {/* ==================================================
            ADULT
        ================================================== */}

        <PassengerCard
          title="Adult"
          badge="Regular"
          description="Standard commuter fare (Age 12+)"
          price={journey.adultFare}
          count={adultCount}
          subtotal={adultTotal}
          onMinus={() =>
            decreasePassenger('adult')
          }
          onPlus={() =>
            increasePassenger('adult')
          }
        />


        {/* ==================================================
            STUDENT
        ================================================== */}

        <PassengerCard
          title="Student / Concession"
          badge="50% off"
          badgeGreen
          description="Valid institutional or season card verified on bus"
          price={journey.studentFare}
          count={studentCount}
          subtotal={studentTotal}
          onMinus={() =>
            decreasePassenger('student')
          }
          onPlus={() =>
            increasePassenger('student')
          }
        />


        {/* ==================================================
            CHILD
        ================================================== */}

        <PassengerCard
          title="Child / Senior"
          badge="50% off"
          description="Age under 12 or 60+ (NIC / Birth Certificate required)"
          price={journey.childFare}
          count={childCount}
          subtotal={childTotal}
          onMinus={() =>
            decreasePassenger('child')
          }
          onPlus={() =>
            increasePassenger('child')
          }
        />


        {/* ==================================================
            SMS ALERT
        ================================================== */}

        <TouchableOpacity
          style={styles.smsCard}
          activeOpacity={0.85}
          onPress={() =>
            setSmsAlerts((value) => !value)
          }
        >

          <View
            style={[
              styles.checkbox,
              smsAlerts && styles.checkboxSelected,
            ]}
          >

            {smsAlerts && (
              <Ionicons
                name="checkmark"
                size={15}
                color="#FFFFFF"
              />
            )}

          </View>


          <View style={styles.smsContent}>

            <View style={styles.smsTitleRow}>

              <Text style={styles.smsTitle}>
                SMS Transit Alerts & Delay Guard
              </Text>

              <Text style={styles.smsPrice}>
                +LKR 10.00
              </Text>

            </View>

            <Text style={styles.smsDescription}>
              Receive instant SMS with real-time GPS when the
              bus is 2 stops away and automatic refund warranty
              on delays.
            </Text>

          </View>

        </TouchableOpacity>


        {/* ==================================================
            INSURANCE / PROTECTION
        ================================================== */}

        <View style={styles.protectionCard}>

          <View style={styles.protectionIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color="#008F6F"
            />
          </View>

          <View style={styles.protectionContent}>

            <Text style={styles.protectionTitle}>
              COMMUTER PROTECTION ACTIVE
            </Text>

            <Text style={styles.protectionText}>
              Covered by Sri Lanka National Transport Insurance Fund
            </Text>

          </View>

        </View>


        {/* ==================================================
            FARE BREAKDOWN
        ================================================== */}

        <View style={styles.fareCard}>

          <Text style={styles.fareTitle}>
            Fare Breakdown
          </Text>


          {adultCount > 0 && (
            <FareRow
              label={`${adultCount}x Adult Ticket`}
              amount={adultTotal}
            />
          )}


          {studentCount > 0 && (
            <FareRow
              label={`${studentCount}x Student Concession`}
              amount={studentTotal}
            />
          )}


          {childCount > 0 && (
            <FareRow
              label={`${childCount}x Child / Senior`}
              amount={childTotal}
            />
          )}


          {smsAlerts && (
            <FareRow
              label="SMS & Live Arrival Alerts"
              amount={smsFee}
            />
          )}


          <View style={styles.taxRow}>

            <Text style={styles.taxLabel}>
              Taxes & NTC Service Fee
            </Text>

            <Text style={styles.taxFree}>
              FREE (Waived)
            </Text>

          </View>


          <View style={styles.totalDivider} />


          <View style={styles.totalRow}>

            <View>

              <Text style={styles.totalLabel}>
                TOTAL PAYABLE
              </Text>

              <Text style={styles.totalSub}>
                Includes all digital handling
              </Text>

            </View>


            <Text style={styles.totalAmount}>
              {formattedTotal}
            </Text>

          </View>

        </View>


        {/* ==================================================
            INFORMATION BOX
        ================================================== */}

        <View style={styles.infoCard}>

          <View style={styles.infoImage}>

            <Ionicons
              name="phone-portrait-outline"
              size={24}
              color="#274B84"
            />

          </View>


          <Text style={styles.infoText}>
            Bus conductor will scan your digital QR code upon
            boarding. Offline cached bus ticket remains valid
            if mobile network drops along High Level Road bus
            corridor.
          </Text>

        </View>

      </ScrollView>


      {/* ==================================================
          BOTTOM PAYMENT BAR
      ================================================== */}

      <View
        style={[
          styles.bottomPaymentBar,
          {
            paddingBottom:
              Math.max(insets.bottom, 10),
          },
        ]}
      >

        <View style={styles.bottomTotal}>

          <Text style={styles.selectedLabel}>
            {totalTickets} Ticket
            {totalTickets !== 1 ? 's' : ''} Selected
          </Text>

          <Text style={styles.bottomTotalAmount}>
            {formattedTotal}
          </Text>

        </View>


        <TouchableOpacity
          style={styles.proceedButton}
          activeOpacity={0.85}
          onPress={handleProceedToPay}
        >

          <Text style={styles.proceedText}>
            Proceed to Pay
          </Text>

          <Ionicons
            name="arrow-forward"
            size={20}
            color="#FFFFFF"
          />

        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}


// ======================================================
// PASSENGER CARD COMPONENT
// ======================================================

type PassengerCardProps = {
  title: string;
  badge: string;
  badgeGreen?: boolean;
  description: string;
  price: number;
  count: number;
  subtotal: number;
  onMinus: () => void;
  onPlus: () => void;
};


function PassengerCard({
  title,
  badge,
  badgeGreen,
  description,
  price,
  count,
  subtotal,
  onMinus,
  onPlus,
}: PassengerCardProps) {
  return (
    <View style={styles.passengerCard}>

      <View style={styles.passengerTopRow}>

        <View style={styles.passengerInfo}>

          <View style={styles.passengerNameRow}>

            <Text style={styles.passengerName}>
              {title}
            </Text>

            <View
              style={[
                styles.passengerBadge,
                badgeGreen &&
                  styles.passengerBadgeGreen,
              ]}
            >

              <Text
                style={[
                  styles.passengerBadgeText,
                  badgeGreen &&
                    styles.passengerBadgeGreenText,
                ]}
              >
                {badge}
              </Text>

            </View>

          </View>


          <Text style={styles.passengerDescription}>
            {description}
          </Text>


          <Text style={styles.passengerPrice}>
            LKR {price.toFixed(2)}
          </Text>

        </View>


        {/* Quantity */}

        <View style={styles.quantityContainer}>

          <TouchableOpacity
            style={styles.quantityMinus}
            onPress={onMinus}
          >
            <Text style={styles.quantityMinusText}>
              −
            </Text>
          </TouchableOpacity>


          <Text style={styles.quantityText}>
            {count}
          </Text>


          <TouchableOpacity
            style={styles.quantityPlus}
            onPress={onPlus}
          >
            <Text style={styles.quantityPlusText}>
              +
            </Text>
          </TouchableOpacity>

        </View>

      </View>


      <View style={styles.subtotalDivider} />


      <View style={styles.subtotalRow}>

        <Text style={styles.subtotalLabel}>
          Line item subtotal
        </Text>

        <Text style={styles.subtotalValue}>
          LKR {subtotal.toFixed(2)}
        </Text>

      </View>

    </View>
  );
}


// ======================================================
// FARE ROW
// ======================================================

function FareRow({
  label,
  amount,
}: {
  label: string;
  amount: number;
}) {
  return (
    <View style={styles.fareRow}>

      <Text style={styles.fareRowLabel}>
        {label}
      </Text>

      <Text style={styles.fareRowAmount}>
        LKR {amount.toFixed(2)}
      </Text>

    </View>
  );
}


// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#F7F5FD',
  },


  // ====================================================
  // HEADER
  // ====================================================

  header: {
    height: 72,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5EE',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EFF7',
  },

  headerTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerLogo: {
    width: 27,
    height: 27,
    borderRadius: 8,
    backgroundColor: '#007F78',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },

  headerBrand: {
    fontSize: 15,
    fontWeight: '800',
    color: '#173B59',
  },

  headerPageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#14243A',
    marginTop: 1,
  },

  notificationButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },


  // ====================================================
  // CONTENT
  // ====================================================

  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },


  // ====================================================
  // STEPPER
  // ====================================================

  stepperCard: {
    height: 74,
    backgroundColor: '#F0F1FC',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 11,
    marginBottom: 14,
    position: 'relative',
  },

  stepperLine: {
    position: 'absolute',
    top: 22,
    left: 66,
    right: 66,
    height: 2,
    backgroundColor: '#D7DCEF',
  },

  stepItem: {
    width: 80,
    alignItems: 'center',
    zIndex: 2,
  },

  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepCompleted: {
    backgroundColor: '#087F80',
  },

  stepCurrent: {
    backgroundColor: '#234495',
  },

  stepPending: {
    backgroundColor: '#E3E7F4',
  },

  stepCurrentNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  stepPendingNumber: {
    color: '#69738A',
    fontSize: 14,
    fontWeight: '700',
  },

  stepActiveLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3E4858',
    marginTop: 5,
  },

  stepCurrentLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#183D91',
    marginTop: 5,
  },

  stepPendingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#737C8D',
    marginTop: 5,
  },


  // ====================================================
  // JOURNEY
  // ====================================================

  journeyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    marginBottom: 13,

    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  busNumberBadge: {
    backgroundColor: '#173D91',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  busNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  serviceBadge: {
    marginLeft: 7,
    backgroundColor: '#DFF7F3',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },

  serviceBadgeText: {
    color: '#087F80',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },

  changeButton: {
    marginLeft: 'auto',
    backgroundColor: '#F0F2FE',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  changeButtonText: {
    color: '#183D91',
    fontSize: 11,
    fontWeight: '800',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  locationIndicatorGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#087F80',
    marginTop: 5,
    marginRight: 10,
  },

  locationIndicatorBlue: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#254696',
    marginTop: 5,
    marginRight: 10,
  },

  locationContent: {
    flex: 1,
  },

  locationName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18263B',
  },

  locationDetails: {
    fontSize: 11,
    color: '#647083',
    marginTop: 3,
    lineHeight: 16,
  },

  verticalRouteLine: {
    height: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#D8DFF3',
    marginLeft: 4,
    marginVertical: 2,
  },

  durationRow: {
    alignSelf: 'center',
    backgroundColor: '#F0F2FA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },

  durationText: {
    color: '#596D80',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 5,
  },

  vehicleInfo: {
    backgroundColor: '#F1F3FD',
    borderRadius: 9,
    marginTop: 11,
    paddingHorizontal: 9,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  vehicleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  vehicleText: {
    color: '#526477',
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 5,
  },

  vehicleFare: {
    color: '#183D91',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 8,
  },


  // ====================================================
  // STATUS
  // ====================================================

  statusCard: {
    backgroundColor: '#21459A',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  statusLeft: {
    flex: 1,
    flexDirection: 'row',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#52E0D2',
    marginTop: 4,
    marginRight: 7,
  },

  statusTitle: {
    color: '#59E2D2',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  statusMain: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },

  statusSub: {
    color: '#C9D5F3',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3,
  },

  busImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 11,
    backgroundColor: '#4D6FB7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },


  // ====================================================
  // PASSENGERS TITLE
  // ====================================================

  passengerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  passengerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#18243A',
  },

  passengerSubtitle: {
    fontSize: 11,
    color: '#687284',
    marginTop: 3,
  },

  maxBadge: {
    backgroundColor: '#E8EAF7',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },

  maxBadgeText: {
    fontSize: 9,
    color: '#5E687A',
    fontWeight: '700',
  },


  // ====================================================
  // PASSENGER CARD
  // ====================================================

  passengerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,

    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 1,
  },

  passengerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  passengerInfo: {
    flex: 1,
    paddingRight: 10,
  },

  passengerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  passengerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1B273B',
  },

  passengerBadge: {
    backgroundColor: '#E8EAF6',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 7,
  },

  passengerBadgeGreen: {
    backgroundColor: '#D5F5EF',
  },

  passengerBadgeText: {
    fontSize: 8,
    color: '#667084',
    fontWeight: '800',
  },

  passengerBadgeGreenText: {
    color: '#087F80',
  },

  passengerDescription: {
    fontSize: 10,
    lineHeight: 14,
    color: '#697385',
    marginTop: 6,
  },

  passengerPrice: {
    fontSize: 12,
    color: '#173D91',
    fontWeight: '800',
    marginTop: 4,
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2FC',
    borderRadius: 11,
    padding: 3,
  },

  quantityMinus: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityMinusText: {
    fontSize: 21,
    color: '#4A5260',
    lineHeight: 22,
  },

  quantityText: {
    width: 28,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: '#1C273A',
  },

  quantityPlus: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#173D91',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quantityPlusText: {
    fontSize: 21,
    color: '#FFFFFF',
    lineHeight: 22,
  },

  subtotalDivider: {
    height: 1,
    backgroundColor: '#E7EAF0',
    marginTop: 12,
  },

  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  subtotalLabel: {
    color: '#697385',
    fontSize: 10,
    fontWeight: '600',
  },

  subtotalValue: {
    color: '#293449',
    fontSize: 12,
    fontWeight: '800',
  },


  // ====================================================
  // SMS
  // ====================================================

  smsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#173D91',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  checkboxSelected: {
    backgroundColor: '#173D91',
  },

  smsContent: {
    flex: 1,
  },

  smsTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  smsTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#202B3E',
  },

  smsPrice: {
    color: '#008878',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 5,
  },

  smsDescription: {
    fontSize: 9,
    lineHeight: 13,
    color: '#697385',
    marginTop: 5,
  },


  // ====================================================
  // PROTECTION
  // ====================================================

  protectionCard: {
    backgroundColor: '#F0F7F3',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },

  protectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#D7F0E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  protectionContent: {
    flex: 1,
  },

  protectionTitle: {
    fontSize: 9,
    color: '#008878',
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  protectionText: {
    fontSize: 10,
    color: '#596A65',
    marginTop: 3,
  },


  // ====================================================
  // FARE
  // ====================================================

  fareCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 11,
  },

  fareTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#202B3E',
    marginBottom: 10,
  },

  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },

  fareRowLabel: {
    fontSize: 11,
    color: '#687284',
  },

  fareRowAmount: {
    fontSize: 11,
    color: '#263144',
    fontWeight: '700',
  },

  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },

  taxLabel: {
    fontSize: 11,
    color: '#687284',
  },

  taxFree: {
    fontSize: 11,
    color: '#008878',
    fontWeight: '800',
  },

  totalDivider: {
    height: 1,
    backgroundColor: '#E5E7ED',
    marginVertical: 11,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1D293C',
  },

  totalSub: {
    fontSize: 9,
    color: '#7B8492',
    marginTop: 2,
  },

  totalAmount: {
    fontSize: 27,
    fontWeight: '900',
    color: '#173D91',
  },


  // ====================================================
  // INFO
  // ====================================================

  infoCard: {
    backgroundColor: '#EFF1FC',
    borderRadius: 13,
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  infoImage: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#D9E1F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  infoText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 14,
    color: '#596477',
  },


  // ====================================================
  // BOTTOM PAYMENT BAR
  // ====================================================

  bottomPaymentBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E4EB',
    paddingHorizontal: 16,
    paddingTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  bottomTotal: {
    flex: 1,
  },

  selectedLabel: {
    fontSize: 10,
    color: '#697385',
    fontWeight: '600',
  },

  bottomTotalAmount: {
    fontSize: 19,
    color: '#173D91',
    fontWeight: '900',
    marginTop: 2,
  },

  proceedButton: {
    minWidth: 155,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#062B82',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 14,
  },

  proceedText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginRight: 7,
  },

});