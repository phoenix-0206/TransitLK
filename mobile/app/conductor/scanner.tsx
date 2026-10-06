import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

import { useRouter } from 'expo-router';

export default function ConductorScannerScreen() {
  const router = useRouter();

  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] =
    useState(false);

  const [scannedData, setScannedData] =
    useState('');

  const [manualTicketId, setManualTicketId] =
    useState('');

  const [torch, setTorch] =
    useState(false);

  // =====================================================
  // CAMERA PERMISSION LOADING
  // =====================================================

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator
          size="large"
          color="#087F80"
        />

        <Text style={styles.permissionLoading}>
          Checking camera permission...
        </Text>
      </View>
    );
  }

  // =====================================================
  // CAMERA PERMISSION NOT GRANTED
  // =====================================================

  if (!permission.granted) {
    return (
      <SafeAreaView
        style={styles.permissionContainer}
      >
        <View style={styles.permissionIcon}>
          <Text style={styles.permissionIconText}>
            📷
          </Text>
        </View>

        <Text style={styles.permissionTitle}>
          Camera Permission Required
        </Text>

        <Text style={styles.permissionText}>
          TransitLK needs access to your camera
          to scan passenger QR tickets.
        </Text>

        <Pressable
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text
            style={styles.permissionButtonText}
          >
            ALLOW CAMERA
          </Text>
        </Pressable>

        <Pressable
          style={styles.backPermissionButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backPermissionText}>
            Go Back
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // =====================================================
  // QR SCAN
  // =====================================================

  function handleBarcodeScanned({
    data,
    type,
  }: {
    data: string;
    type: string;
  }) {
    if (scanned) {
      return;
    }

    setScanned(true);
    setScannedData(data);

    console.log(
      'Scanned QR:',
      data,
      'Type:',
      type,
    );
  }

  // =====================================================
  // MANUAL TICKET
  // =====================================================

  function handleManualTicket() {
    const ticketId =
      manualTicketId.trim();

    if (!ticketId) {
      Alert.alert(
        'Ticket ID Required',
        'Please enter a ticket ID.',
      );

      return;
    }

    setScanned(true);
    setScannedData(ticketId);

    console.log(
      'Manual ticket:',
      ticketId,
    );
  }

  // =====================================================
  // RESET SCANNER
  // =====================================================

  function scanAgain() {
    setScanned(false);
    setScannedData('');
    setManualTicketId('');
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <View style={styles.header}>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>
            ‹
          </Text>
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            Scanner Viewfinder
          </Text>
        </View>

        <View style={styles.profileCircle}>
          <Text style={styles.profileIcon}>
            ♟
          </Text>
        </View>

      </View>

      {/* ================================================= */}
      {/* BUS INFORMATION */}
      {/* ================================================= */}

      <View style={styles.topInfo}>

        <View style={styles.busInfo}>

          <View style={styles.liveDot} />

          <Text style={styles.busText}>
            Bus 138
          </Text>

          <Text style={styles.separator}>
            •
          </Text>

          <Text style={styles.busText}>
            WP ND-8422
          </Text>

          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>
              LIVE
            </Text>
          </View>

        </View>

        <View style={styles.topActions}>

          <Pressable
            style={styles.iconButton}
            onPress={() =>
              setTorch(!torch)
            }
          >
            <Text style={styles.iconText}>
              {torch ? '☀' : '▣'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.iconButton}
            onPress={() =>
              Alert.alert(
                'Sound',
                'Scan sound is enabled.',
              )
            }
          >
            <Text style={styles.iconText}>
              🔊
            </Text>
          </Pressable>

        </View>

      </View>

      {/* ================================================= */}
      {/* TODAY VALIDATED */}
      {/* ================================================= */}

      <View style={styles.todayCard}>

        <View style={styles.todayLeft}>

          <Text style={styles.todayIcon}>
            ◉
          </Text>

          <Text style={styles.todayText}>
            Today:
          </Text>

          <Text style={styles.todayNumber}>
            142
          </Text>

          <Text style={styles.todayValidated}>
            Validated
          </Text>

        </View>

        <Text style={styles.scanSpeed}>
          ◷ 0.3s Auto-Scan
        </Text>

      </View>

      {/* ================================================= */}
      {/* CAMERA AREA */}
      {/* ================================================= */}

      <View style={styles.cameraContainer}>

        <CameraView
          style={styles.camera}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={
            scanned
              ? undefined
              : handleBarcodeScanned
          }
        >

          {/* Scan instruction */}

          {!scanned && (
            <View style={styles.instructionContainer}>

              <Text
                style={styles.instructionText}
              >
                Align QR code within the frame
              </Text>

            </View>
          )}

          {/* Scan frame */}

          <View style={styles.scanFrame}>

            <View
              style={[
                styles.corner,
                styles.topLeft,
              ]}
            />

            <View
              style={[
                styles.corner,
                styles.topRight,
              ]}
            />

            <View
              style={[
                styles.corner,
                styles.bottomLeft,
              ]}
            />

            <View
              style={[
                styles.corner,
                styles.bottomRight,
              ]}
            />

            <View style={styles.scanLine} />

          </View>

          {/* Camera bottom controls */}

          <View style={styles.cameraBottom}>

            <View style={styles.afLocked}>

              <Text style={styles.afIcon}>
                ◎
              </Text>

              <Text style={styles.afText}>
                AF LOCKED
              </Text>

            </View>

            <View style={styles.brightness}>

              <Text style={styles.sunIcon}>
                ☼
              </Text>

              <View
                style={styles.brightnessTrack}
              >
                <View
                  style={styles.brightnessThumb}
                />
              </View>

            </View>

          </View>

        </CameraView>

      </View>

      {/* ================================================= */}
      {/* SCAN RESULT */}
      {/* ================================================= */}

      {scanned && (
        <View style={styles.resultCard}>

          <View style={styles.resultHeader}>

            <View style={styles.successCircle}>
              <Text style={styles.successIcon}>
                ✓
              </Text>
            </View>

            <View style={styles.resultHeaderText}>
              <Text style={styles.resultTitle}>
                QR Code Detected
              </Text>

              <Text style={styles.resultSubtitle}>
                Ticket ready for validation
              </Text>
            </View>

          </View>

          <View style={styles.resultDataBox}>

            <Text style={styles.resultLabel}>
              SCANNED DATA
            </Text>

            <Text
              style={styles.resultData}
              numberOfLines={2}
            >
              {scannedData}
            </Text>

          </View>

          <View style={styles.resultButtons}>

            <Pressable
              style={styles.validateButton}
              onPress={() => {
                Alert.alert(
                  'Ticket Scanned',
                  `Ticket data:\n${scannedData}`,
                );
              }}
            >
              <Text
                style={styles.validateButtonText}
              >
                VALIDATE TICKET
              </Text>
            </Pressable>

            <Pressable
              style={styles.scanAgainButton}
              onPress={scanAgain}
            >
              <Text
                style={styles.scanAgainText}
              >
                SCAN AGAIN
              </Text>
            </Pressable>

          </View>

        </View>
      )}

      {/* ================================================= */}
      {/* MANUAL TICKET */}
      {/* ================================================= */}

      {!scanned && (
        <View style={styles.manualSection}>

          <View style={styles.manualHeader}>

            <View style={styles.manualTitleRow}>

              <Text style={styles.ticketIcon}>
                ▣
              </Text>

              <Text style={styles.manualTitle}>
                Manual Ticket ID
              </Text>

            </View>

            <Text style={styles.offlineText}>
              Offline Sync Ready
            </Text>

          </View>

          <View style={styles.manualInputRow}>

            <TextInput
              style={styles.manualInput}
              placeholder="Enter ticket ID"
              placeholderTextColor="#A4AFC0"
              value={manualTicketId}
              onChangeText={setManualTicketId}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <Pressable
              style={styles.manualSubmit}
              onPress={handleManualTicket}
            >
              <Text
                style={styles.manualSubmitText}
              >
                →
              </Text>
            </Pressable>

          </View>

          <View style={styles.recentRow}>

            <Text style={styles.recentLabel}>
              RECENT:
            </Text>

            <View style={styles.recentChip}>
              <Text style={styles.recentChipText}>
                #9481-B ✓
              </Text>
            </View>

            <View style={styles.recentChip}>
              <Text style={styles.recentChipText}>
                #9480-C ✓
              </Text>
            </View>

            <View
              style={[
                styles.recentChip,
                styles.failedChip,
              ]}
            >
              <Text
                style={styles.failedChipText}
              >
                #9479-A ×
              </Text>
            </View>

            <Text style={styles.logText}>
              Log ›
            </Text>

          </View>

        </View>
      )}

    </SafeAreaView>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#0D1428',
  },

  // ====================================================
  // PERMISSION
  // ====================================================

  permissionContainer: {
    flex: 1,
    backgroundColor: '#F4F8FA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  permissionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  permissionIconText: {
    fontSize: 35,
  },

  permissionLoading: {
    marginTop: 15,
    color: '#58717F',
    fontSize: 14,
  },

  permissionTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#103851',
    textAlign: 'center',
  },

  permissionText: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: '#58717F',
    textAlign: 'center',
    maxWidth: 420,
  },

  permissionButton: {
    marginTop: 25,
    width: '100%',
    maxWidth: 360,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#087F80',
    alignItems: 'center',
    justifyContent: 'center',
  },

  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  backPermissionButton: {
    marginTop: 15,
    padding: 10,
  },

  backPermissionText: {
    color: '#087F80',
    fontSize: 14,
    fontWeight: '700',
  },

  // ====================================================
  // HEADER
  // ====================================================

  header: {
    height: 70,
    backgroundColor: '#10172C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '300',
    lineHeight: 38,
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },

  profileCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#123B83',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIcon: {
    color: '#FFFFFF',
    fontSize: 20,
  },

  // ====================================================
  // BUS INFO
  // ====================================================

  topInfo: {
    backgroundColor: '#10172C',
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  busInfo: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1D2945',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#66E9E0',
    marginRight: 8,
  },

  busText: {
    color: '#E8EDF8',
    fontSize: 14,
    fontWeight: '700',
  },

  separator: {
    color: '#78859F',
    marginHorizontal: 7,
  },

  liveBadge: {
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: '#243FBA',
  },

  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  topActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },

  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#202A44',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 7,
  },

  iconText: {
    color: '#FFFFFF',
    fontSize: 18,
  },

  // ====================================================
  // TODAY
  // ====================================================

  todayCard: {
    marginHorizontal: 18,
    marginTop: 12,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#26344F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },

  todayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  todayIcon: {
    color: '#66E9E0',
    fontSize: 18,
    marginRight: 7,
  },

  todayText: {
    color: '#DCE3F0',
    fontSize: 13,
    fontWeight: '700',
  },

  todayNumber: {
    color: '#66E9E0',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 5,
  },

  todayValidated: {
    color: '#DCE3F0',
    fontSize: 13,
    marginLeft: 4,
  },

  scanSpeed: {
    color: '#DCE3F0',
    fontSize: 11,
  },

  // ====================================================
  // CAMERA
  // ====================================================

  cameraContainer: {
    flex: 1,
    marginTop: 12,
    marginHorizontal: 18,
    borderRadius: 18,
    overflow: 'hidden',
    minHeight: 320,
  },

  camera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  instructionContainer: {
    position: 'absolute',
    top: 24,
    left: 20,
    right: 20,
    alignItems: 'center',
  },

  instructionText: {
    color: '#E9EDF7',
    backgroundColor: 'rgba(18, 25, 44, 0.75)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 15,
    fontWeight: '700',
  },

  scanFrame: {
    width: 260,
    height: 260,
    position: 'relative',
  },

  corner: {
    position: 'absolute',
    width: 55,
    height: 55,
    borderColor: '#66E9E0',
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 7,
    borderLeftWidth: 7,
    borderTopLeftRadius: 7,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 7,
    borderRightWidth: 7,
    borderTopRightRadius: 7,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 7,
    borderLeftWidth: 7,
    borderBottomLeftRadius: 7,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 7,
    borderRightWidth: 7,
    borderBottomRightRadius: 7,
  },

  scanLine: {
    position: 'absolute',
    left: 15,
    right: 15,
    top: '50%',
    height: 3,
    backgroundColor: '#66E9E0',
    opacity: 0.9,
  },

  cameraBottom: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  afLocked: {
    height: 36,
    paddingHorizontal: 13,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 31, 55, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  afIcon: {
    color: '#66E9E0',
    fontSize: 17,
    marginRight: 5,
  },

  afText: {
    color: '#DCE3F0',
    fontSize: 11,
    fontWeight: '800',
  },

  brightness: {
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(20, 31, 55, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
  },

  sunIcon: {
    color: '#DCE3F0',
    fontSize: 17,
    marginRight: 6,
  },

  brightnessTrack: {
    width: 55,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#66718A',
  },

  brightnessThumb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DCE3F0',
    position: 'absolute',
    marginTop: -2.5,
    marginLeft: 32,
  },

  // ====================================================
  // MANUAL TICKET
  // ====================================================

  manualSection: {
    backgroundColor: '#F8F9FD',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },

  manualHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  manualTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ticketIcon: {
    color: '#153C85',
    fontSize: 18,
    marginRight: 7,
  },

  manualTitle: {
    color: '#17233D',
    fontSize: 15,
    fontWeight: '800',
  },

  offlineText: {
    color: '#087F80',
    fontSize: 11,
    fontWeight: '700',
  },

  manualInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  manualInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FB',
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#17233D',
    borderWidth: 1,
    borderColor: '#E1E6F1',
  },

  manualSubmit: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#123B83',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  manualSubmitText: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '300',
  },

  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  recentLabel: {
    color: '#B1B8C9',
    fontSize: 10,
    fontWeight: '800',
    marginRight: 7,
  },

  recentChip: {
    backgroundColor: '#E7EBF7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 5,
  },

  recentChipText: {
    color: '#47536B',
    fontSize: 10,
    fontWeight: '700',
  },

  failedChip: {
    backgroundColor: '#FCE4E4',
  },

  failedChipText: {
    color: '#C62828',
    fontSize: 10,
    fontWeight: '700',
  },

  logText: {
    color: '#087F80',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 'auto',
  },

  // ====================================================
  // RESULT
  // ====================================================

  resultCard: {
    backgroundColor: '#F8F9FD',
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 18,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  successCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DDF5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  successIcon: {
    color: '#16864C',
    fontSize: 23,
    fontWeight: '800',
  },

  resultHeaderText: {
    marginLeft: 10,
  },

  resultTitle: {
    color: '#17233D',
    fontSize: 16,
    fontWeight: '800',
  },

  resultSubtitle: {
    color: '#708099',
    fontSize: 12,
    marginTop: 2,
  },

  resultDataBox: {
    marginTop: 12,
    backgroundColor: '#EEF2FB',
    borderRadius: 12,
    padding: 12,
  },

  resultLabel: {
    color: '#8C97AB',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 5,
  },

  resultData: {
    color: '#17233D',
    fontSize: 14,
    fontWeight: '700',
  },

  resultButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },

  validateButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#087F80',
    alignItems: 'center',
    justifyContent: 'center',
  },

  validateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  scanAgainButton: {
    width: 120,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8EDF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  scanAgainText: {
    color: '#173B80',
    fontSize: 11,
    fontWeight: '800',
  },

});