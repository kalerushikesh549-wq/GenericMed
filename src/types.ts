/**
 * GenericMed Enterprise & Multi-Tenant Platform Types
 */

export type ScreenId =
  | 'enterprise-ops'
  | 'customer-app'
  | 'rx-scanner'
  | 'order-tracking'
  | 'pharmacy-portal'
  | 'manufacturer-portal'
  | 'system-architecture'
  | 'auth';

export type UserRole = 'patient' | 'pharmacist' | 'manufacturer' | 'enterprise_admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  licenseNumber?: string;
  facilityName?: string;
  companyName?: string;
  deliveryAddress?: string;
  activePrescriptionsCount?: number;
  joinedDate: string;
}

export type CustomerTab = 'home' | 'compare' | 'rx' | 'orders' | 'account';

export interface MedicineItem {
  id: string;
  brandName: string;
  brandManufacturer: string;
  brandPrice: number;
  genericName: string;
  genericManufacturer: string;
  genericPrice: number;
  savingsPercentage: number;
  form: string;
  activeSalt: string;
  bioEquivalenceScore: number;
  fdaRating: string;
  ndc: string;
  inStock: boolean;
  dosage: string;
}

export interface PrescriptionOrder {
  id: string;
  orderNumber: string;
  patientName: string;
  patientAge: number;
  patientDob: string;
  prescriber: string;
  prescriberLicense: string;
  clinic: string;
  date: string;
  brandPrescribed: string;
  genericSubstitute: string;
  instructions: string;
  refills: number;
  confidence: number;
  status: 'pending_review' | 'verified' | 'packed' | 'out_for_delivery' | 'delivered';
  timeRemaining: string;
  assignedHub: string;
  hubDistance: string;
  hubEta: string;
  priceBrand: number;
  priceGeneric: number;
  savings: number;
  batchNumber: string;
  expiry: string;
  binLocation: string;
  tamperSealId: string;
  deliveryPin: string;
  courierName: string;
  courierVehicle: string;
  deliveryAddress: string;
}

export interface PharmacyHub {
  id: string;
  name: string;
  code: string;
  region: string;
  activeOrders: number;
  dispatchSlaMins: number;
  genericMatchRate: number;
  platformTakeRate: number;
  monthlyGmv: number;
  status: 'ONLINE' | 'STANDBY' | 'MAINTENANCE';
  rating: number;
  reviewsCount: number;
  distance: string;
}

export interface BatchLot {
  batchNumber: string;
  molecule: string;
  brandEquivalent: string;
  yieldUnits: number;
  expiry: string;
  reactor: string;
  purityGrade: string;
  hplcAssay: number;
  dissolution: number;
  bioEquivAuc: number;
  residualSolvents: string;
  status: 'PASSED QA' | 'UNDER TEST' | 'QUARANTINE';
  auditor: string;
  token: string;
}

export interface WholesaleOrder {
  poNumber: string;
  hubName: string;
  storeCode: string;
  contactPerson: string;
  molecule: string;
  batchNumber: string;
  quantityUnits: number;
  packageSize: string;
  tierRate: string;
  contractValue: number;
  fulfillmentStatus: 'Ready for Handover / Palletized' | 'In Transit via Cold-Express' | 'Payment Cleared / Allocating';
  dispatchEta: string;
  dock: string;
}
