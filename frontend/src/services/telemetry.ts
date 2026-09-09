/**
 * GenericMed Real-Time Courier Telemetry & GPS Service
 * Provides live telemetry streaming for express local fulfillment tracking.
 */

export interface CourierTelemetry {
  courierId: string;
  courierName: string;
  vehicleType: string;
  latitude: number;
  longitude: number;
  heading: number; // degrees 0-360
  speedKmh: number;
  batteryPct: number;
  distanceRemainingMiles: number;
  timeRemainingSeconds: number;
  signalStrength: 'EXCELLENT' | 'GOOD' | 'FAIR';
  lastPingTime: string;
  progressPct: number;
}

// Simulated GPS Waypoint Route from MetroCare Downtown Hub to Brooklyn Residence
const ROUTE_WAYPOINTS = [
  { lat: 40.6928, lng: -73.9903 }, // MetroCare Hub (Start)
  { lat: 40.6942, lng: -73.9895 },
  { lat: 40.6958, lng: -73.9882 },
  { lat: 40.6975, lng: -73.9870 },
  { lat: 40.6990, lng: -73.9862 },
  { lat: 40.7005, lng: -73.9856 },
  { lat: 40.7020, lng: -73.9850 }  // Customer Residence (Destination)
];

class TelemetryService {
  private currentStep = 0;
  private totalSteps = 60; // 60 ticks per complete route cycle
  private subscribers: Set<(data: CourierTelemetry) => void> = new Set();
  private intervalId: any = null;
  private isRunning = false;

  constructor() {
    this.start();
  }

  private start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.intervalId = setInterval(() => {
      this.currentStep = (this.currentStep + 1) % this.totalSteps;
      const data = this.getCurrentTelemetry();
      this.subscribers.forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error('Telemetry subscriber error', e);
        }
      });
    }, 1500); // Emits every 1.5 seconds
  }

  public getCurrentTelemetry(): CourierTelemetry {
    // Interpolate between waypoints
    const waypointIndex = Math.floor((this.currentStep / this.totalSteps) * (ROUTE_WAYPOINTS.length - 1));
    const nextIndex = Math.min(waypointIndex + 1, ROUTE_WAYPOINTS.length - 1);
    const subProgress = ((this.currentStep / this.totalSteps) * (ROUTE_WAYPOINTS.length - 1)) - waypointIndex;

    const p1 = ROUTE_WAYPOINTS[waypointIndex];
    const p2 = ROUTE_WAYPOINTS[nextIndex];

    const lat = p1.lat + (p2.lat - p1.lat) * subProgress;
    const lng = p1.lng + (p2.lng - p1.lng) * subProgress;

    // Calculate heading angle
    const dLng = p2.lng - p1.lng;
    const dLat = p2.lat - p1.lat;
    const heading = Math.round((Math.atan2(dLng, dLat) * (180 / Math.PI) + 360) % 360);

    const progressPct = Math.round((this.currentStep / this.totalSteps) * 100);
    const remainingFraction = 1 - (progressPct / 100);
    const distanceRemaining = Math.round((1.8 * remainingFraction) * 10) / 10;
    const timeRemainingSecs = Math.max(12, Math.round(522 * remainingFraction));

    return {
      courierId: 'courier-miguel-14',
      courierName: 'Miguel S.',
      vehicleType: 'E-Cargo Bike #14 (Heated / Insulated)',
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      heading: heading || 42,
      speedKmh: Math.round(18 + Math.sin(this.currentStep) * 4),
      batteryPct: Math.max(75, 94 - Math.floor(this.currentStep / 10)),
      distanceRemainingMiles: distanceRemaining,
      timeRemainingSeconds: timeRemainingSecs,
      signalStrength: 'EXCELLENT',
      lastPingTime: new Date().toLocaleTimeString(),
      progressPct
    };
  }

  public subscribe(callback: (data: CourierTelemetry) => void): () => void {
    this.subscribers.add(callback);
    // Initial emit
    callback(this.getCurrentTelemetry());

    return () => {
      this.subscribers.delete(callback);
    };
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }
}

export const telemetryService = new TelemetryService();
