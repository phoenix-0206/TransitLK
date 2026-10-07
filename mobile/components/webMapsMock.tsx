import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

export const Marker = ({
  coordinate,
  title,
  description,
  children,
}: any) => {
  return (
    <View style={styles.markerContainer}>
      <Text style={styles.markerPin}>📍</Text>
      {title && <Text style={styles.markerTitle}>{title}</Text>}
      {children}
    </View>
  );
};

export const Polyline = (_props: any) => null;

const MapView = forwardRef<any, any>((props, ref) => {
  useImperativeHandle(ref, () => ({
    animateToRegion: (_region: Region, _duration?: number) => {},
    fitToCoordinates: (_coordinates: any[], _options?: any) => {},
  }));

  React.useEffect(() => {
    if (props.onMapReady) props.onMapReady();
    if (props.onMapLoaded) props.onMapLoaded();
  }, [props.onMapReady, props.onMapLoaded]);

  return (
    <View style={[styles.mapContainer, props.style]}>
      <View style={styles.gridOverlay}>
        <Text style={styles.mapWatermark}>🗺️ Live Map Tracking (Web Mode)</Text>
      </View>
      {props.children}
    </View>
  );
});

MapView.displayName = 'MapView';

const styles = StyleSheet.create({
  mapContainer: {
    backgroundColor: '#E0F2FE',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#E2E8F0',
    opacity: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapWatermark: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: 0.5,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  markerPin: {
    fontSize: 22,
  },
  markerTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 4,
    borderRadius: 4,
    marginTop: 2,
  },
});

export default MapView;
