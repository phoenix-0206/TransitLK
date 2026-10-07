import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

// The QR contains the ticket ID so a conductor scanner can read it directly.
const TICKET_QR_DATA = 'TLK-2026-8849-B';

function TransitTicketQRCode() {
  return (
    <View style={styles.qrWrapper}>
      <View style={styles.qrCodeContainer}>
        <QRCode
          value={TICKET_QR_DATA}
          size={205}
          color="#002060"
          backgroundColor="#FFFFFF"
          ecl="M"
          quietZone={10}
        />
      </View>

      <Text style={styles.qrCodeText}>
        TLK-2026-8849-B • Scan to validate ticket
      </Text>
    </View>
  );
}

// Keeps the passenger route navigation from producing
// Expo Router typed-route warnings in this file.
function goToPassengerRoute(path: string) {
  router.push(path as any);
}

export default function TransitPassScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >

        {/* Header */}

        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.logoBox}>
              <Ionicons name="bus" size={22} color="#FFF" />
            </View>

            <View>
              <Text style={styles.brandName}>
                TransitLK
              </Text>

              <Text style={styles.brandSubtitle}>
                TRANSIT PASS
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />

              <Text style={styles.liveText}>
                Live GPS
              </Text>
            </View>

            <View style={styles.languageButton}>
              <Text style={styles.languageText}>
                EN
              </Text>
            </View>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/profile')}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color="#FFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Page title */}

        <View style={styles.titleRow}>
          <View style={styles.titleLeft}>
            <Text style={styles.pageTitle}>
              TransitLK Pay & Pass
            </Text>

            <View style={styles.lkBadge}>
              <Text style={styles.lkText}>
                LK
              </Text>
            </View>
          </View>

          <View style={styles.nfcReady}>
            <View style={styles.nfcDot} />

            <Text style={styles.nfcText}>
              NFC Ready
            </Text>
          </View>
        </View>

        {/* Main Transit Pass Card */}

        <View style={styles.passCard}>
          <View style={styles.passTopRow}>
            <View style={styles.passBrandRow}>
              <View style={styles.contactlessIcon}>
                <Ionicons
                  name="wifi"
                  size={20}
                  color="#FFF"
                />
              </View>

              <View>
                <Text style={styles.passBrand}>
                  TRANSPASS LK
                </Text>

                <Text style={styles.passDescription}>
                  Interoperable Transit Card
                </Text>
              </View>
            </View>

            <View style={styles.lankaPayBadge}>
              <Text style={styles.lankaPayText}>
                ◉ LANKAPAY
              </Text>
            </View>
          </View>

          <Text style={styles.balanceLabel}>
            STORED TRANSIT BALANCE
          </Text>

          <Text style={styles.balanceValue}>
            <Text style={styles.balanceCurrency}>
              LKR
            </Text>{' '}
            1,450.00
          </Text>

          <View style={styles.autoReloadPill}>
            <View style={styles.autoReloadDot} />

            <Text style={styles.autoReloadText}>
              Auto-Reload ON
            </Text>
          </View>

          <Text style={styles.autoReloadAmount}>
            &lt; LKR 300
          </Text>

          <View style={styles.passBottomRow}>
            <View>
              <Text style={styles.cardLabel}>
                CARDHOLDER
              </Text>

              <Text style={styles.cardValue}>
                Kasun Jayasundara
              </Text>
            </View>

            <View style={styles.commuterIdContainer}>
              <Text style={styles.cardLabel}>
                COMMUTER ID
              </Text>

              <Text style={styles.commuterId}>
                TLK-8824-COL
              </Text>
            </View>
          </View>
        </View>

        {/* Pass Actions */}

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons
              name="card-outline"
              size={22}
              color="#007F78"
            />

            <Text style={styles.actionTitle}>
              Top Up
            </Text>

            <Text style={styles.actionSub}>
              LankaQR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Ionicons
              name="sync-outline"
              size={22}
              color="#002060"
            />

            <Text style={styles.actionTitle}>
              Auto-Debit
            </Text>

            <Text style={styles.actionSub}>
              Active
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Ionicons
              name="receipt-outline"
              size={22}
              color="#002060"
            />

            <Text style={styles.actionTitle}>
              Receipts
            </Text>

            <Text style={styles.actionSub}>
              Tax / NTC
            </Text>
          </TouchableOpacity>
        </View>

        {/* QR / NFC Selector */}

        <View style={styles.modeSelector}>
          <TouchableOpacity style={styles.qrModeActive}>
            <Ionicons
              name="qr-code-outline"
              size={18}
              color="#007F78"
            />

            <Text style={styles.qrModeText}>
              Dynamic QR Code
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nfcMode}>
            <Ionicons
              name="wifi-outline"
              size={18}
              color="#64748B"
            />

            <Text style={styles.nfcModeText}>
              NFC Contactless
            </Text>
          </TouchableOpacity>
        </View>

        {/* Live Security Token */}

        <View style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <View style={styles.securityTitleRow}>
              <View style={styles.securityDot} />

              <Text style={styles.securityTitle}>
                Live Security Token
              </Text>
            </View>

            <View style={styles.refreshPill}>
              <Ionicons
                name="timer-outline"
                size={14}
                color="#64748B"
              />

              <Text style={styles.refreshText}>
                Refresh in 40s
              </Text>
            </View>
          </View>

          {/* REAL SCANNABLE QR */}

          <TransitTicketQRCode />

          <View style={styles.offlineBox}>
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="#00897B"
            />

            <View style={styles.offlineTextContainer}>
              <Text style={styles.offlineTitle}>
                Zero-Data Offline Verified
              </Text>

              <Text style={styles.offlineDescription}>
                Valid on bus conductor POS and rail barrier gates
                without internet.
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.brightnessButton}>
            <Ionicons
              name="sunny-outline"
              size={20}
              color="#002060"
            />

            <Text style={styles.brightnessText}>
              Maximize Brightness for Scanner
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Journey Ticket */}

        <TouchableOpacity
          style={styles.currentTicketCard}
          activeOpacity={0.85}
          onPress={() =>
            goToPassengerRoute('/search')
          }
        >
          <View style={styles.ticketHeader}>
            <View style={styles.ticketHeaderLeft}>
              <Ionicons
                name="bus-outline"
                size={16}
                color="#FFF"
              />

              <Text style={styles.ticketHeaderText}>
                CURRENT JOURNEY TICKET
              </Text>
            </View>

            <View style={styles.inTransitBadge}>
              <Text style={styles.inTransitText}>
                In Transit
              </Text>
            </View>
          </View>

          <View style={styles.ticketBody}>
            <View style={styles.routeNumber}>
              <Text style={styles.routeNumberText}>
                138
              </Text>
            </View>

            <View style={styles.routeInfo}>
              <Text style={styles.routeName}>
                Maharagama ⇄ Fort
              </Text>

              <Text style={styles.routeType}>
                Semi-Luxury AC Service
              </Text>
            </View>

            <View style={styles.fareContainer}>
              <Text style={styles.fare}>
                LKR 70.00
              </Text>

              <Text style={styles.fareType}>
                Standard Fare
              </Text>
            </View>
          </View>

          <View style={styles.journeyProgress}>
            <View style={styles.progressRow}>
              <View style={styles.progressIcon}>
                <Ionicons
                  name="enter-outline"
                  size={15}
                  color="#007F78"
                />
              </View>

              <Text style={styles.progressText}>
                TAP-IN: Bambalapitiya Junc (Bay 2)
              </Text>

              <Text style={styles.progressTime}>
                14:18 PM
              </Text>
            </View>

            <View style={styles.progressLineContainer}>
              <View style={styles.progressLine} />
            </View>

            <View style={styles.progressRow}>
              <View style={styles.progressIconEnd}>
                <Ionicons
                  name="exit-outline"
                  size={15}
                  color="#64748B"
                />
              </View>

              <Text style={styles.progressTextEnd}>
                TAP-OUT REQUIRED: Colombo Fort
              </Text>

              <Text style={styles.etaText}>
                ETA ~18 Min
              </Text>
            </View>
          </View>

          <View style={styles.passcodeBox}>
            <Ionicons
              name="qr-code-outline"
              size={16}
              color="#002060"
            />

            <Text style={styles.passcodeText}>
              Conductor Inspection Passcode:
            </Text>

            <Text style={styles.passcode}>
              #4829
            </Text>
          </View>
        </TouchableOpacity>

        {/* Quick Balance Top-Up */}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Quick Balance Top-Up
          </Text>

          <Text style={styles.instantCredit}>
            Instant Credit
          </Text>
        </View>

        <View style={styles.topUpRow}>
          {['200', '500', '1,000', '2,500'].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={styles.topUpCard}
            >
              <Text style={styles.topUpCurrency}>
                LKR
              </Text>

              <Text style={styles.topUpAmount}>
                {amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.paymentMethods}>
          Supported:  LankaQR • FriMi • eZ Cash • Visa / Mastercard
        </Text>

        {/* Recent Rides */}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            Recent Rides & Loads
          </Text>

          <TouchableOpacity>
            <Text style={styles.viewAll}>
              View All (34)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rideCard}>
          <View style={styles.rideIcon}>
            <Ionicons
              name="bus-outline"
              size={21}
              color="#002060"
            />
          </View>

          <View style={styles.rideInfo}>
            <Text style={styles.rideTitle}>
              Route 177 AC Bus
            </Text>

            <Text style={styles.rideDescription}>
              Kollupitiya → Kaduwela • 08:15 AM
            </Text>
          </View>

          <View style={styles.rideAmountContainer}>
            <Text style={styles.rideAmountNegative}>
              − LKR 160.00
            </Text>

            <Text style={styles.settled}>
              Settled
            </Text>
          </View>
        </View>

        <View style={styles.rideCard}>
          <View style={styles.trainIcon}>
            <Ionicons
              name="train-outline"
              size={21}
              color="#007F78"
            />
          </View>

          <View style={styles.rideInfo}>
            <Text style={styles.rideTitle}>
              Coastal Commuter Train
            </Text>

            <Text style={styles.rideDescription}>
              Fort → Bambalapitiya (2nd Class) • Yesterday
            </Text>
          </View>

          <View style={styles.rideAmountContainer}>
            <Text style={styles.rideAmountNegative}>
              − LKR 40.00
            </Text>

            <Text style={styles.settled}>
              Settled
            </Text>
          </View>
        </View>

        <View style={styles.rideCard}>
          <View style={styles.topupIcon}>
            <Ionicons
              name="business-outline"
              size={21}
              color="#00897B"
            />
          </View>

          <View style={styles.rideInfo}>
            <Text style={styles.rideTitle}>
              LankaPay Instant Top-Up
            </Text>

            <Text style={styles.rideDescription}>
              Commercial Bank of Ceylon • 22 Oct
            </Text>
          </View>

          <View style={styles.rideAmountContainer}>
            <Text style={styles.rideAmountPositive}>
              + LKR 1,000.00
            </Text>

            <Text style={styles.completed}>
              Completed
            </Text>
          </View>
        </View>

        {/* Approval note */}

        <View style={styles.approvalBox}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color="#002060"
          />

          <Text style={styles.approvalText}>
            Approved by National Transport Commission (NTC) &
            Sri Lanka Railways for interoperable contactless
            ticketing across Western Province bus networks and
            national rail lines.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Navigation */}

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.replace('/(tabs)')}
        >
          <Ionicons
            name="home-outline"
            size={21}
            color="#002060"
          />

          <Text style={styles.navActiveText}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            router.push('/interactive-route-map')
          }
        >
          <Ionicons
            name="map-outline"
            size={21}
            color="#64748B"
          />

          <Text style={styles.navText}>
            Map / Track
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            goToPassengerRoute('/search')
          }
        >
          <Ionicons
            name="ticket-outline"
            size={21}
            color="#64748B"
          />

          <Text style={styles.navText}>
            Tickets
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons
            name="notifications-outline"
            size={21}
            color="#64748B"
          />

          <Text style={styles.navText}>
            Alerts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/profile')}
        >
          <Ionicons
            name="person-outline"
            size={21}
            color="#64748B"
          />

          <Text style={styles.navText}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },

  container: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },

  /* Header */

  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: '#087F8C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#002060',
  },

  brandSubtitle: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D7FAF4',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#00897B',
    marginRight: 5,
  },

  liveText: {
    color: '#00796B',
    fontSize: 10,
    fontWeight: '700',
  },

  languageButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#173C91',
    justifyContent: 'center',
    alignItems: 'center',
  },

  languageText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 10,
  },

  profileButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#002060',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Title */

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pageTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#002060',
  },

  lkBadge: {
    marginLeft: 5,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: '#B7F3E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  lkText: {
    color: '#007F78',
    fontSize: 9,
    fontWeight: '800',
  },

  nfcReady: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D7FAF4',
    borderRadius: 15,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  nfcDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#009688',
    marginRight: 5,
  },

  nfcText: {
    color: '#00796B',
    fontSize: 9,
    fontWeight: '800',
  },

  /* Pass Card */

  passCard: {
    backgroundColor: '#16458F',
    borderRadius: 20,
    padding: 17,
    marginBottom: 12,
    overflow: 'hidden',
  },

  passTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  passBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  contactlessIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  passBrand: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 11,
  },

  passDescription: {
    color: '#BFD0EC',
    fontSize: 9,
    marginTop: 2,
  },

  lankaPayBadge: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  lankaPayText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },

  balanceLabel: {
    color: '#BFD0EC',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 16,
  },

  balanceValue: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 2,
  },

  balanceCurrency: {
    fontSize: 14,
    fontWeight: '700',
  },

  autoReloadPill: {
    position: 'absolute',
    right: 15,
    top: 82,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#087F63',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  autoReloadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#57F4C9',
    marginRight: 5,
  },

  autoReloadText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },

  autoReloadAmount: {
    position: 'absolute',
    right: 17,
    top: 110,
    color: '#BFD0EC',
    fontSize: 9,
  },

  passBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  cardLabel: {
    color: '#AFC4E5',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  cardValue: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },

  commuterIdContainer: {
    alignItems: 'flex-end',
  },

  commuterId: {
    color: '#70E7D8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },

  /* Actions */

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },

  actionCard: {
    flex: 1,
    backgroundColor: '#EEF0FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
  },

  actionTitle: {
    color: '#17223B',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },

  actionSub: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 1,
  },

  /* QR/NFC */

  modeSelector: {
    height: 43,
    backgroundColor: '#E9ECFB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    marginBottom: 10,
  },

  qrModeActive: {
    flex: 1,
    height: 35,
    backgroundColor: '#FFF',
    borderRadius: 9,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  qrModeText: {
    color: '#002060',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
  },

  nfcMode: {
    flex: 1,
    height: 35,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  nfcModeText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },

  /* Security */

  securityCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E5F0',
  },

  securityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  securityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  securityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00897B',
    marginRight: 6,
  },

  securityTitle: {
    color: '#007F78',
    fontSize: 12,
    fontWeight: '800',
  },

  refreshPill: {
    backgroundColor: '#EEF0F9',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  refreshText: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '700',
    marginLeft: 3,
  },

  qrWrapper: {
    alignItems: 'center',
    backgroundColor: '#F1F3FF',
    borderRadius: 12,
    paddingVertical: 10,
  },

  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
  },

  qrCodeText: {
    color: '#475569',
    fontSize: 8,
    fontWeight: '600',
    marginTop: 6,
  },

  offlineBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF0FF',
    borderRadius: 11,
    padding: 10,
    marginTop: 9,
  },

  offlineTextContainer: {
    flex: 1,
    marginLeft: 7,
  },

  offlineTitle: {
    color: '#17223B',
    fontSize: 11,
    fontWeight: '800',
  },

  offlineDescription: {
    color: '#64748B',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },

  brightnessButton: {
    backgroundColor: '#E9ECFF',
    borderRadius: 10,
    height: 42,
    marginTop: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  brightnessText: {
    color: '#002060',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 7,
  },

  /* Current Ticket */

  currentTicketCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E5F0',
    marginBottom: 14,
  },

  ticketHeader: {
    height: 32,
    backgroundColor: '#1E4092',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },

  ticketHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ticketHeaderText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },

  inTransitBadge: {
    backgroundColor: '#168E79',
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  inTransitText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '800',
  },

  ticketBody: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  routeNumber: {
    backgroundColor: '#173F91',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  routeNumberText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },

  routeInfo: {
    flex: 1,
    marginLeft: 7,
  },

  routeName: {
    color: '#17223B',
    fontSize: 13,
    fontWeight: '800',
  },

  routeType: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 2,
  },

  fareContainer: {
    alignItems: 'flex-end',
  },

  fare: {
    color: '#173F91',
    fontSize: 16,
    fontWeight: '900',
  },

  fareType: {
    color: '#64748B',
    fontSize: 8,
    marginTop: 2,
  },

  journeyProgress: {
    paddingHorizontal: 10,
    paddingBottom: 8,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progressIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DDF8F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressIconEnd: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F0F1F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressText: {
    flex: 1,
    color: '#00897B',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 5,
  },

  progressTextEnd: {
    flex: 1,
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 5,
  },

  progressTime: {
    color: '#475569',
    fontSize: 8,
    fontWeight: '700',
  },

  etaText: {
    color: '#00897B',
    fontSize: 8,
    fontWeight: '800',
  },

  progressLineContainer: {
    height: 10,
    marginLeft: 9,
    justifyContent: 'center',
  },

  progressLine: {
    width: '60%',
    height: 4,
    borderRadius: 3,
    backgroundColor: '#00897B',
  },

  passcodeBox: {
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 9,
    backgroundColor: '#E9ECFF',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  passcodeText: {
    color: '#334155',
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 5,
  },

  passcode: {
    color: '#173F91',
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 4,
  },

  /* Sections */

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },

  sectionTitle: {
    color: '#17223B',
    fontSize: 14,
    fontWeight: '800',
  },

  instantCredit: {
    color: '#007F78',
    fontSize: 9,
    fontWeight: '800',
  },

  topUpRow: {
    flexDirection: 'row',
    gap: 7,
  },

  topUpCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E5F0',
  },

  topUpCurrency: {
    color: '#64748B',
    fontSize: 7,
    fontWeight: '700',
  },

  topUpAmount: {
    color: '#002060',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 1,
  },

  paymentMethods: {
    color: '#475569',
    textAlign: 'center',
    fontSize: 8,
    marginVertical: 9,
  },

  viewAll: {
    color: '#007F78',
    fontSize: 9,
    fontWeight: '800',
  },

  /* Ride Cards */

  rideCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
    borderWidth: 1,
    borderColor: '#E6E8F0',
  },

  rideIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#E9EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  trainIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#D9FAF3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topupIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#DDF8F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rideInfo: {
    flex: 1,
    marginLeft: 8,
  },

  rideTitle: {
    color: '#17223B',
    fontSize: 10,
    fontWeight: '800',
  },

  rideDescription: {
    color: '#64748B',
    fontSize: 8,
    marginTop: 3,
  },

  rideAmountContainer: {
    alignItems: 'flex-end',
  },

  rideAmountNegative: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '900',
  },

  rideAmountPositive: {
    color: '#00897B',
    fontSize: 10,
    fontWeight: '900',
  },

  settled: {
    color: '#64748B',
    fontSize: 8,
    marginTop: 2,
  },

  completed: {
    color: '#00897B',
    fontSize: 8,
    marginTop: 2,
  },

  /* Approval */

  approvalBox: {
    backgroundColor: '#E9ECFF',
    borderRadius: 11,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  approvalText: {
    flex: 1,
    color: '#475569',
    fontSize: 8,
    lineHeight: 12,
    marginLeft: 7,
  },

  /* Bottom Navigation */

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E5F0',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 55,
  },

  navActiveText: {
    color: '#002060',
    fontSize: 8,
    fontWeight: '800',
    marginTop: 3,
  },

  navText: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '600',
    marginTop: 3,
  },
});