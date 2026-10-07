export type TransportMode = 'bus' | 'expressway' | 'train' | 'all';

export interface RouteSearchParams {
  origin: string;
  originProvince?: string;
  destination: string;
  destinationTag?: string;
  routeNumber?: string;
  travelDate: string;
  departureTime: string;
  transportMode: TransportMode;
}

export interface RecentSearchItem {
  id: string;
  origin: string;
  destination: string;
  routeTag?: string;
  subText: string;
  dateStr: string;
  timeStr: string;
  mode: TransportMode;
}

export interface TransitTripOption {
  id: string;
  routeNumber: string;
  serviceType: 'Normal' | 'Semi-Luxury' | 'Luxury AC' | 'Super Luxury' | 'Expressway';
  transportType: 'bus' | 'train';
  operator: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  fareLKR: number;
  availableSeats: number;
  crowdLevel: 'Low' | 'Medium' | 'High';
  rating: number;
}
