import React, { useState, useMemo } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import BottomNavigation from '@/components/BottomNavigation';
import PassengerHomeHeader from '@/components/passenger/PassengerHomeHeader';

interface TransactionItem {
  id: string;
  type: 'train' | 'bus' | 'topup' | 'alert' | 'dispute';
  title: string;
  status: 'Settled' | 'Failed' | 'Top-Up' | 'Disputed';
  subText: string;
  dateStr: string;
  amountLKR: number;
  isCredit?: boolean;
  statusText: string;
  routeNumber?: string;
  plateNumber?: string;
  authorityCheck?: string;
  paymentRail?: string;
}

export default function PurchaseHistoryScreen() {
  const router = useRouter();

  // Smart Pass live balance state
  const [balance, setBalance] = useState(1450.0);
  const [topUpModalVisible, setTopUpModalVisible] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('500');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBarVisible, setSearchBarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'success' | 'failed'>('all');
  const [inspectorType, setInspectorType] = useState<'success' | 'alert'>('success');

  // Transaction list data matching Figma
  const transactions: TransactionItem[] = [
    {
      id: 'TXN-LK-983142',
      type: 'bus',
      title: 'Kollupitiya Supermarket ➔ Kaduwela Clocktower',
      status: 'Settled',
      subText: 'Route 177 AC Express • WP NB-6520',
      dateStr: 'Today, 24 Oct • 14:15',
      amountLKR: 160.0,
      isCredit: false,
      statusText: 'Paid',
      routeNumber: 'Route 177 AC Express',
      plateNumber: 'WP NB-6520',
      authorityCheck: 'WP-PTB Verified',
      paymentRail: 'Transit Wallet (Auto)',
    },
    {
      id: 'TXN-982991',
      type: 'train',
      title: 'Fort ➔ Bambalapitiya',
      status: 'Settled',
      subText: 'Coastal Commuter Train • #TXN-982991',
      dateStr: 'Today, 24 Oct • 11:20 AM',
      amountLKR: 40.0,
      isCredit: false,
      statusText: 'Paid',
      routeNumber: 'Coastal Railway',
      plateNumber: 'Loco M4-752',
      authorityCheck: 'SLR Verified',
      paymentRail: 'Transit Wallet (Auto)',
    },
    {
      id: 'TXN-981044',
      type: 'alert',
      title: 'Bus 138 Tap-Out Missed',
      status: 'Failed',
      subText: 'Maharagama Station Sensor • Timeout',
      dateStr: 'Yesterday, 23 Oct • 18:30 PM',
      amountLKR: 70.0,
      isCredit: false,
      statusText: 'Unsettled',
      routeNumber: 'Route 138',
      plateNumber: 'WP ND-8422',
      authorityCheck: 'NTC Sensor Flag',
      paymentRail: 'Transit Wallet',
    },
    {
      id: 'CB-77312',
      type: 'topup',
      title: 'Commercial Bank LankaQR',
      status: 'Top-Up',
      subText: 'Instant Wallet Credit • Ref #CB-77312',
      dateStr: '22 Oct 2026 • 09:12 AM',
      amountLKR: 1000.0,
      isCredit: true,
      statusText: 'Credited',
      authorityCheck: 'CBSL Approved',
      paymentRail: 'LankaQR Direct',
    },
    {
      id: 'TXN-979102',
      type: 'dispute',
      title: 'Route 100 CTB Double Tap',
      status: 'Disputed',
      subText: 'Refund Claim in Progress (NTC)',
      dateStr: '21 Oct 2026 • 17:45 PM',
      amountLKR: 80.0,
      isCredit: false,
      statusText: 'In Review',
      routeNumber: 'Route 100 CTB',
      authorityCheck: 'NTC Dispute #4402',
      paymentRail: 'Transit Wallet',
    },
    {
      id: 'TXN-976541',
      type: 'bus',
      title: 'Dehiwala ➔ Wellawatte',
      status: 'Settled',
      subText: 'Route 101 Private Bus • WP ND-1188',
      dateStr: '20 Oct 2026 • 08:35 AM',
      amountLKR: 50.0,
      isCredit: false,
      statusText: 'Paid',
      routeNumber: 'Route 101 Private',
      plateNumber: 'WP ND-1188',
      authorityCheck: 'WP-PTB Verified',
      paymentRail: 'Transit Wallet',
    },
  ];

  // Selected item displayed in Transaction Inspector
  const [selectedTxn, setSelectedTxn] = useState<TransactionItem>(transactions[0]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (activeTab === 'all') return true;
      if (activeTab === 'success') return t.status === 'Settled' || t.status === 'Top-Up';
      if (activeTab === 'failed') return t.status === 'Failed' || t.status === 'Disputed';
      return true;
    });
  }, [transactions, searchQuery, activeTab]);

  // Handle top-up action
  const handleApplyTopUp = () => {
    const amt = parseFloat(topUpAmount) || 0;
    if (amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid top-up amount.');
      return;
    }
    setBalance((prev) => prev + amt);
    setTopUpModalVisible(false);
    Alert.alert('Top-Up Successful', `LKR ${amt.toFixed(2)} credited to your TransitLK Smart Pass.`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <PassengerHomeHeader subtitle="Purchase History" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Action Bar (Payment History + Search & Export) */}
        <View style={styles.subHeaderBar}>
          <View style={styles.titleWithBack}>
            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
              onPress={() => router.back()}
              hitSlop={6}
            >
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </Pressable>
            <Text style={styles.pageTitle}>Payment History</Text>
          </View>

          <View style={styles.headerActionBtns}>
            <Pressable
              style={styles.headerIconBtn}
              onPress={() => setSearchBarVisible(!searchBarVisible)}
            >
              <Ionicons name="search-outline" size={18} color="#0F172A" />
            </Pressable>
            <Pressable
              style={styles.headerIconBtn}
              onPress={() => Alert.alert('Download Statement', 'Exporting October 2026 PDF statement...')}
            >
              <Ionicons name="download-outline" size={18} color="#0F172A" />
            </Pressable>
          </View>
        </View>

        {/* Collapsible Search Input */}
        {searchBarVisible && (
          <View style={styles.searchBarRow}>
            <Ionicons name="search" size={16} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by route, station, or Txn ID..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#94A3B8" />
              </Pressable>
            )}
          </View>
        )}

        {/* TransitLK Smart Pass Balance Card */}
        <View style={styles.smartPassCard}>
          <View style={styles.smartPassTopRow}>
            <View style={styles.smartPassTag}>
              <MaterialCommunityIcons name="credit-card-chip" size={14} color="#93C5FD" />
              <Text style={styles.smartPassTagText}>TRANSITLK SMART PASS</Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.topUpButton,
                pressed && styles.topUpButtonPressed,
              ]}
              onPress={() => setTopUpModalVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={15} color="#065F46" />
              <Text style={styles.topUpButtonText}>Top-up</Text>
            </Pressable>
          </View>

          <View style={styles.balanceSection}>
            <View style={styles.balanceLabelRow}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <View style={styles.balanceCyanDot} />
            </View>
            <Text style={styles.balanceAmount}>
              <Text style={styles.currencyPrefix}>LKR </Text>
              {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.smartPassFooter}>
            <View style={styles.autoReloadRow}>
              <View style={styles.autoReloadDot} />
              <Text style={styles.autoReloadText}>Auto-reload: Active</Text>
            </View>

            <View style={styles.gatewayRow}>
              <MaterialCommunityIcons name="shield-check-outline" size={14} color="#93C5FD" />
              <Text style={styles.gatewayText}>LankaPay Gateway</Text>
            </View>
          </View>
        </View>

        {/* TRANSACTION INSPECTOR Section */}
        <View style={styles.inspectorSection}>
          <View style={styles.inspectorHeaderRow}>
            <Text style={styles.inspectorHeading}>TRANSACTION INSPECTOR</Text>
            <Text style={styles.inspectorSub}>Live Tap Status Details</Text>
          </View>

          {/* Inspector Segment Tabs */}
          <View style={styles.inspectorTabsRow}>
            <Pressable
              style={[
                styles.inspectorTab,
                inspectorType === 'success' && styles.inspectorTabActive,
              ]}
              onPress={() => {
                setInspectorType('success');
                setSelectedTxn(transactions[0]);
              }}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={inspectorType === 'success' ? '#059669' : '#64748B'}
              />
              <Text
                style={[
                  styles.inspectorTabText,
                  inspectorType === 'success' && styles.inspectorTabTextActive,
                ]}
              >
                Success
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.inspectorTab,
                inspectorType === 'alert' && styles.inspectorTabAlertActive,
              ]}
              onPress={() => {
                setInspectorType('alert');
                setSelectedTxn(transactions[2]); // missed tap-out
              }}
            >
              <Ionicons
                name="warning-outline"
                size={16}
                color={inspectorType === 'alert' ? '#DC2626' : '#64748B'}
              />
              <Text
                style={[
                  styles.inspectorTabText,
                  inspectorType === 'alert' && styles.inspectorTabAlertTextActive,
                ]}
              >
                Invalid / Alert
              </Text>
            </Pressable>
          </View>

          {/* Inspected Transaction Card */}
          <View style={styles.inspectedCard}>
            <View style={styles.inspectedTopRow}>
              <View style={styles.inspectedStatusBadgeWrap}>
                <View style={styles.inspectedCheckIcon}>
                  <Ionicons
                    name={selectedTxn.status === 'Failed' ? 'alert' : 'checkmark'}
                    size={13}
                    color="#FFFFFF"
                  />
                </View>
                <View
                  style={[
                    styles.inspectedStatusPill,
                    selectedTxn.status === 'Failed' && styles.inspectedStatusPillFailed,
                  ]}
                >
                  <View
                    style={[
                      styles.statusPillDot,
                      selectedTxn.status === 'Failed' && styles.statusPillDotFailed,
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusPillText,
                      selectedTxn.status === 'Failed' && styles.statusPillTextFailed,
                    ]}
                  >
                    {selectedTxn.status === 'Failed' ? 'Tap-Out Missed' : 'Payment Successful'}
                  </Text>
                </View>
              </View>

              <View style={styles.inspectedFareCol}>
                <Text style={styles.inspectedFareAmount}>
                  LKR {selectedTxn.amountLKR.toFixed(2)}
                </Text>
                <Text style={styles.inspectedFareType}>Standard AC Fare</Text>
              </View>
            </View>

            {/* Route strip */}
            <View style={styles.inspectedRouteStrip}>
              <View style={styles.inspectedRouteHeaderRow}>
                <View style={styles.routePill}>
                  <Ionicons name="bus" size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.routePillText}>
                    {selectedTxn.routeNumber || 'Route 177 AC Express'}
                  </Text>
                </View>
                <Text style={styles.plateNumberText}>
                  {selectedTxn.plateNumber || 'WP NB-6520'}
                </Text>
              </View>

              <View style={styles.routeStopsRow}>
                <Text style={styles.inspectedStopsText}>{selectedTxn.title}</Text>
              </View>
            </View>

            {/* Transaction metadata grid */}
            <View style={styles.metaGrid}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>Transaction ID</Text>
                <Text style={styles.metaValue}>#{selectedTxn.id}</Text>

                <Text style={[styles.metaLabel, { marginTop: 10 }]}>Payment Rail</Text>
                <Text style={styles.metaValue}>{selectedTxn.paymentRail || 'Transit Wallet (Auto)'}</Text>
              </View>

              <View style={[styles.metaCol, { alignItems: 'flex-end' }]}>
                <Text style={styles.metaLabel}>Date & Time</Text>
                <Text style={styles.metaValue}>{selectedTxn.dateStr}</Text>

                <Text style={[styles.metaLabel, { marginTop: 10 }]}>Authority Check</Text>
                <Text style={[styles.metaValue, { color: '#059669', fontWeight: '800' }]}>
                  {selectedTxn.authorityCheck || 'WP-PTB Verified'}
                </Text>
              </View>
            </View>

            {/* Settled & Verified Banner */}
            <View style={styles.clearingBanner}>
              <MaterialCommunityIcons name="shield-check" size={15} color="#059669" />
              <Text style={styles.clearingBannerText}>
                Settled & Verified by NTC LankaPay Clearing Gateway
              </Text>
            </View>

            {/* Actions: e-Receipt & View Route */}
            <View style={styles.inspectedActionsRow}>
              <Pressable
                style={styles.eReceiptButton}
                onPress={() =>
                  Alert.alert(
                    'Digital e-Receipt',
                    `Official ticket receipt #${selectedTxn.id}\nAmount: LKR ${selectedTxn.amountLKR.toFixed(2)}\nStatus: Settled & Validated`
                  )
                }
              >
                <MaterialCommunityIcons name="receipt" size={16} color="#002060" />
                <Text style={styles.eReceiptButtonText}>e-Receipt</Text>
              </Pressable>

              <Pressable
                style={styles.viewRouteButton}
                onPress={() => router.push('/passenger/search')}
              >
                <MaterialCommunityIcons name="routes" size={16} color="#FFFFFF" />
                <Text style={styles.viewRouteButtonText}>View Route</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Detailed Statement Section */}
        <View style={styles.statementSection}>
          <View style={styles.statementHeaderRow}>
            <Text style={styles.statementHeading}>Detailed Statement</Text>
            <Text style={styles.statementMonthText}>October 2026</Text>
          </View>

          {/* Statement Filter Chips */}
          <View style={styles.chipsRow}>
            <Pressable
              style={[
                styles.statementChip,
                activeTab === 'all' && styles.statementChipActive,
              ]}
              onPress={() => setActiveTab('all')}
            >
              <Text
                style={[
                  styles.statementChipText,
                  activeTab === 'all' && styles.statementChipTextActive,
                ]}
              >
                All Transactions
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.statementChip,
                activeTab === 'success' && styles.statementChipActive,
              ]}
              onPress={() => setActiveTab('success')}
            >
              <Text
                style={[
                  styles.statementChipText,
                  activeTab === 'success' && styles.statementChipTextActive,
                ]}
              >
                Successful (18)
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.statementChip,
                activeTab === 'failed' && styles.statementChipActive,
              ]}
              onPress={() => setActiveTab('failed')}
            >
              <Text
                style={[
                  styles.statementChipText,
                  activeTab === 'failed' && styles.statementChipTextActive,
                ]}
              >
                Failed / Invalid (2)
              </Text>
            </Pressable>
          </View>

          {/* Transaction List Cards */}
          <View style={styles.txnListContainer}>
            {filteredTransactions.map((item) => {
              const isSelected = selectedTxn.id === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.txnItemCard,
                    isSelected && styles.txnItemCardSelected,
                    pressed && styles.txnItemPressed,
                  ]}
                  onPress={() => setSelectedTxn(item)}
                >
                  {/* Left Icon Wrap */}
                  <View
                    style={[
                      styles.txnIconWrap,
                      item.type === 'train' && styles.trainIconBg,
                      item.type === 'bus' && styles.busIconBg,
                      item.type === 'topup' && styles.topupIconBg,
                      item.type === 'alert' && styles.alertIconBg,
                      item.type === 'dispute' && styles.disputeIconBg,
                    ]}
                  >
                    {item.type === 'train' && (
                      <Ionicons name="train-outline" size={18} color="#059669" />
                    )}
                    {item.type === 'bus' && (
                      <Ionicons name="bus-outline" size={18} color="#059669" />
                    )}
                    {item.type === 'topup' && (
                      <MaterialCommunityIcons name="bank-outline" size={18} color="#059669" />
                    )}
                    {item.type === 'alert' && (
                      <Ionicons name="warning-outline" size={18} color="#DC2626" />
                    )}
                    {item.type === 'dispute' && (
                      <Ionicons name="receipt-outline" size={18} color="#6D28D9" />
                    )}
                  </View>

                  {/* Middle Content */}
                  <View style={styles.txnMidCol}>
                    <View style={styles.txnTitleRow}>
                      <Text style={styles.txnTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          item.status === 'Settled' && styles.settledBadge,
                          item.status === 'Failed' && styles.failedBadge,
                          item.status === 'Top-Up' && styles.topupBadge,
                          item.status === 'Disputed' && styles.disputeBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            item.status === 'Settled' && styles.settledBadgeText,
                            item.status === 'Failed' && styles.failedBadgeText,
                            item.status === 'Top-Up' && styles.topupBadgeText,
                            item.status === 'Disputed' && styles.disputeBadgeText,
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.txnSubText,
                        item.status === 'Failed' && styles.failedSubText,
                      ]}
                      numberOfLines={1}
                    >
                      {item.subText}
                    </Text>

                    <Text style={styles.txnDateText}>{item.dateStr}</Text>
                  </View>

                  {/* Right Amount Col */}
                  <View style={styles.txnRightCol}>
                    <Text
                      style={[
                        styles.txnAmountText,
                        item.isCredit && styles.creditAmountText,
                        item.status === 'Failed' && styles.failedAmountText,
                      ]}
                    >
                      {item.isCredit ? '+' : ''}LKR {item.amountLKR.toFixed(2)}
                    </Text>

                    <Text
                      style={[
                        styles.txnStatusSub,
                        item.status === 'Settled' && styles.paidStatus,
                        item.status === 'Failed' && styles.unsettledStatus,
                        item.status === 'Top-Up' && styles.creditedStatus,
                      ]}
                    >
                      {item.isCredit ? '✓ Credited' : item.status === 'Failed' ? '✕ Unsettled' : item.status === 'Disputed' ? '🕒 In Review' : '✓ Paid'}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* TransitLK Commuter Hotline Card */}
        <View style={styles.hotlineCard}>
          <View style={styles.hotlineIconBadge}>
            <MaterialCommunityIcons name="phone-in-talk" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.hotlineTextCol}>
            <Text style={styles.hotlineTitle}>TransitLK Commuter Hotline</Text>
            <Text style={styles.hotlineSub}>Dial 1955 (NTC Toll-Free) for fare disputes</Text>
          </View>
          <Pressable
            style={styles.callNowBtn}
            onPress={() => Alert.alert('Dial 1955', 'Calling NTC commuter helpline 1955...')}
          >
            <Text style={styles.callNowText}>Call Now</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Top-up Modal */}
      <Modal
        visible={topUpModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTopUpModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setTopUpModalVisible(false)}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalHeading}>Top-Up TransitLK Smart Pass</Text>
            <Text style={styles.modalSub}>Select or enter amount to top-up via LankaQR or Card</Text>

            <View style={styles.quickAmtsRow}>
              {['200', '500', '1000', '2000'].map((amt) => (
                <Pressable
                  key={amt}
                  style={[
                    styles.quickAmtBtn,
                    topUpAmount === amt && styles.quickAmtBtnActive,
                  ]}
                  onPress={() => setTopUpAmount(amt)}
                >
                  <Text
                    style={[
                      styles.quickAmtText,
                      topUpAmount === amt && styles.quickAmtTextActive,
                    ]}
                  >
                    LKR {amt}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.topUpInput}
              keyboardType="number-pad"
              value={topUpAmount}
              onChangeText={setTopUpAmount}
              placeholder="Enter custom amount"
            />

            <Pressable style={styles.confirmTopUpBtn} onPress={handleApplyTopUp}>
              <Text style={styles.confirmTopUpText}>Confirm Top-Up</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Bottom Navigation */}
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

  // Top Brand Header
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
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#002060',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitleCol: {
    marginLeft: 8,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#8E9CAE',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveGpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  liveGpsDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  liveGpsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  langText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sub-Header Title Bar
  subHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 14,
  },
  titleWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnPressed: {
    backgroundColor: '#F1F5F9',
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    padding: 0,
  },

  // Smart Pass Balance Card
  smartPassCard: {
    backgroundColor: '#002060',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#002060',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  smartPassTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  smartPassTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  smartPassTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#BFDBFE',
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
  },
  topUpButtonPressed: {
    backgroundColor: '#6EE7B7',
  },
  topUpButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#065F46',
  },
  balanceSection: {
    marginBottom: 14,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 11,
    color: '#BFDBFE',
    fontWeight: 'normal',
  },
  balanceCyanDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currencyPrefix: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#93C5FD',
  },
  smartPassFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: 12,
  },
  autoReloadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  autoReloadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  autoReloadText: {
    fontSize: 10,
    color: '#E2E8F0',
    fontWeight: 'bold',
  },
  gatewayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  gatewayText: {
    fontSize: 10,
    color: '#BFDBFE',
    fontWeight: 'bold',
  },

  // TRANSACTION INSPECTOR Section
  inspectorSection: {
    marginBottom: 18,
  },
  inspectorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inspectorHeading: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  inspectorSub: {
    fontSize: 10,
    color: '#64748B',
  },
  inspectorTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    padding: 3,
    marginBottom: 12,
  },
  inspectorTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 13,
    gap: 6,
  },
  inspectorTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  inspectorTabAlertActive: {
    backgroundColor: '#FEE2E2',
  },
  inspectorTabText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
  },
  inspectorTabTextActive: {
    color: '#059669',
  },
  inspectorTabAlertTextActive: {
    color: '#DC2626',
  },

  // Inspected Card
  inspectedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inspectedTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inspectedStatusBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inspectedCheckIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inspectedStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 5,
  },
  inspectedStatusPillFailed: {
    backgroundColor: '#FEE2E2',
  },
  statusPillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#059669',
  },
  statusPillDotFailed: {
    backgroundColor: '#DC2626',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
  },
  statusPillTextFailed: {
    color: '#DC2626',
  },
  inspectedFareCol: {
    alignItems: 'flex-end',
  },
  inspectedFareAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  inspectedFareType: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: 'normal',
  },

  // Inspected Route Strip
  inspectedRouteStrip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  inspectedRouteHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  routePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002060',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  routePillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  plateNumberText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
  },
  routeStopsRow: {
    marginTop: 2,
  },
  inspectedStopsText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  // Meta Grid
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: 'normal',
  },
  metaValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 2,
  },
  clearingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
    marginBottom: 12,
  },
  clearingBannerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#002060',
  },

  // Inspected Action Buttons
  inspectedActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  eReceiptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  eReceiptButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#002060',
  },
  viewRouteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#002060',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  viewRouteButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Detailed Statement Section
  statementSection: {
    marginBottom: 18,
  },
  statementHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statementHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statementMonthText: {
    fontSize: 11,
    color: '#64748B',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statementChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statementChipActive: {
    backgroundColor: '#002060',
  },
  statementChipText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
  },
  statementChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Txn List
  txnListContainer: {
    gap: 8,
  },
  txnItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  txnItemCardSelected: {
    borderColor: '#002060',
    borderWidth: 1.5,
  },
  txnItemPressed: {
    backgroundColor: '#F8FAFC',
  },
  txnIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  trainIconBg: {
    backgroundColor: '#ECFDF5',
  },
  busIconBg: {
    backgroundColor: '#ECFDF5',
  },
  topupIconBg: {
    backgroundColor: '#EFF6FF',
  },
  alertIconBg: {
    backgroundColor: '#FEE2E2',
  },
  disputeIconBg: {
    backgroundColor: '#F3E8FF',
  },
  txnMidCol: {
    flex: 1,
    marginRight: 6,
  },
  txnTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txnTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  settledBadge: {
    backgroundColor: '#ECFDF5',
  },
  settledBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#059669',
  },
  failedBadge: {
    backgroundColor: '#FEE2E2',
  },
  failedBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  topupBadge: {
    backgroundColor: '#EFF6FF',
  },
  topupBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  disputeBadge: {
    backgroundColor: '#F3E8FF',
  },
  disputeBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  txnSubText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  failedSubText: {
    color: '#DC2626',
  },
  txnDateText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  txnRightCol: {
    alignItems: 'flex-end',
  },
  txnAmountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  creditAmountText: {
    color: '#059669',
  },
  failedAmountText: {
    color: '#DC2626',
  },
  txnStatusSub: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  paidStatus: {
    color: '#059669',
  },
  unsettledStatus: {
    color: '#DC2626',
  },
  creditedStatus: {
    color: '#059669',
  },

  // Hotline Card
  hotlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    marginBottom: 10,
    gap: 10,
  },
  hotlineIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#002060',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotlineTextCol: {
    flex: 1,
  },
  hotlineTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  hotlineSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  callNowBtn: {
    borderWidth: 1,
    borderColor: '#002060',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  callNowText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#002060',
  },

  // Top-Up Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  modalHeading: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 16,
  },
  quickAmtsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  quickAmtBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  quickAmtBtnActive: {
    backgroundColor: '#002060',
  },
  quickAmtText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#334155',
  },
  quickAmtTextActive: {
    color: '#FFFFFF',
  },
  topUpInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 14,
  },
  confirmTopUpBtn: {
    backgroundColor: '#002060',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmTopUpText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
