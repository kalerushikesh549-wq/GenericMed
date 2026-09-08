import { MedicineItem, PrescriptionOrder, PharmacyHub, BatchLot, WholesaleOrder, UserProfile } from '../types';

export const MEDICINES: MedicineItem[] = [
  {
    id: 'med-1',
    brandName: 'Lipitor 20mg',
    brandManufacturer: 'Pfizer Labs',
    brandPrice: 98.50,
    genericName: 'Atorvastatin Calcium 20mg',
    genericManufacturer: 'Cipla / Teva Multi-Source',
    genericPrice: 14.20,
    savingsPercentage: 85.6,
    form: '30 Tablets (Oral) • Film-coated',
    activeSalt: 'Atorvastatin Calcium Trihydrate (20mg equivalent)',
    bioEquivalenceScore: 99.4,
    fdaRating: 'AB Rated',
    ndc: '0071-0156-23',
    inStock: true,
    dosage: '1 tablet orally once daily at bedtime (qHS)'
  },
  {
    id: 'med-2',
    brandName: 'Augmentin 625mg',
    brandManufacturer: 'GSK Pharmaceuticals',
    brandPrice: 42.00,
    genericName: 'Amoxicillin + Pot. Clavulanate 625mg',
    genericManufacturer: 'Aurobindo / Sandoz',
    genericPrice: 8.50,
    savingsPercentage: 79.8,
    form: '10 Tablets • Oral',
    activeSalt: 'Amoxicillin Trihydrate + Potassium Clavulanate',
    bioEquivalenceScore: 99.1,
    fdaRating: 'A-Rated',
    ndc: '43598-445-14',
    inStock: true,
    dosage: '1 tablet twice daily with meals for 7 days'
  },
  {
    id: 'med-3',
    brandName: 'Glucophage XR 500mg',
    brandManufacturer: 'Bristol Myers Squibb',
    brandPrice: 48.00,
    genericName: 'Metformin HCl Extended-Release 500mg',
    genericManufacturer: 'Zydus / Teva',
    genericPrice: 6.00,
    savingsPercentage: 87.5,
    form: '100 Tablets ER • Oral',
    activeSalt: 'Metformin Hydrochloride (Extended Release)',
    bioEquivalenceScore: 99.6,
    fdaRating: 'AB Rated',
    ndc: '50268-301-10',
    inStock: true,
    dosage: '1 tablet once daily with dinner'
  },
  {
    id: 'med-4',
    brandName: 'Crestor 10mg',
    brandManufacturer: 'AstraZeneca',
    brandPrice: 110.00,
    genericName: 'Rosuvastatin Calcium 10mg',
    genericManufacturer: 'Glenmark / Watson',
    genericPrice: 16.00,
    savingsPercentage: 85.4,
    form: '30 Tablets • Oral',
    activeSalt: 'Rosuvastatin Calcium',
    bioEquivalenceScore: 99.2,
    fdaRating: 'AB Rated',
    ndc: '65862-594-30',
    inStock: true,
    dosage: '1 tablet once daily'
  },
  {
    id: 'med-5',
    brandName: 'Prilosec 20mg',
    brandManufacturer: 'Procter & Gamble',
    brandPrice: 34.50,
    genericName: 'Omeprazole Delayed-Release 20mg',
    genericManufacturer: 'Dr. Reddy\'s Laboratories',
    genericPrice: 7.20,
    savingsPercentage: 79.1,
    form: '30 Capsules • Oral',
    activeSalt: 'Omeprazole Magnesium',
    bioEquivalenceScore: 99.0,
    fdaRating: 'AB Rated',
    ndc: '55111-123-30',
    inStock: true,
    dosage: '1 capsule 30 minutes before breakfast'
  }
];

export const CURRENT_ORDER: PrescriptionOrder = {
  id: 'ord-88219',
  orderNumber: 'ORD-88219',
  patientName: 'Johnathan D. Doe',
  patientAge: 48,
  patientDob: '14-Aug-1976',
  prescriber: 'Dr. Elena Rostova, MD',
  prescriberLicense: 'LIC #MD-88319 / NPI: #18839201',
  clinic: 'ST. JUDE CARDIOVASCULAR CLINIC',
  date: 'Oct 24, 2024',
  brandPrescribed: 'Lipitor 20mg',
  genericSubstitute: 'Atorvastatin Calcium 20mg',
  instructions: 'Sig: 1 tablet orally once daily at bedtime (qHS) for hyperlipidemia. Dispense: #30 (Thirty). Refills: 3',
  refills: 3,
  confidence: 99.1,
  status: 'out_for_delivery',
  timeRemaining: '08:42',
  assignedHub: 'MetroCare Rx Downtown (Tenant ID: #HUB-104)',
  hubDistance: '1.8 miles',
  hubEta: '35 mins dispatch',
  priceBrand: 98.50,
  priceGeneric: 14.20,
  savings: 84.30,
  batchNumber: '#CP-9021',
  expiry: '11/2026',
  binLocation: 'Bin A-14',
  tamperSealId: 'GM-SEAL-88219-BK',
  deliveryPin: '8410',
  courierName: 'Miguel S.',
  courierVehicle: 'E-Cargo Bike #14 (Heated/Insulated)',
  deliveryAddress: '742 Evergreen Terr, Brooklyn, NY 11201'
};

export const PHARMACY_HUBS: PharmacyHub[] = [
  {
    id: 'hub-104',
    name: 'MetroCare Rx Downtown',
    code: '#HUB-104 • API v4.2',
    region: 'Metro Core East',
    activeOrders: 42,
    dispatchSlaMins: 24,
    genericMatchRate: 99.4,
    platformTakeRate: 8.5,
    monthlyGmv: 412800,
    status: 'ONLINE',
    rating: 4.9,
    reviewsCount: 1840,
    distance: '1.8 miles away'
  },
  {
    id: 'hub-108',
    name: 'HealthPlus Express Hub West',
    code: '#HUB-108 • API v4.2',
    region: 'Western Suburbs',
    activeOrders: 28,
    dispatchSlaMins: 29,
    genericMatchRate: 98.1,
    platformTakeRate: 9.0,
    monthlyGmv: 298450,
    status: 'ONLINE',
    rating: 4.8,
    reviewsCount: 1210,
    distance: '4.2 miles away'
  },
  {
    id: 'hub-214',
    name: 'Apollo Generic Dispatch Depot',
    code: '#HUB-214 • API v4.2',
    region: 'Industrial North',
    activeOrders: 64,
    dispatchSlaMins: 32,
    genericMatchRate: 99.8,
    platformTakeRate: 8.0,
    monthlyGmv: 534100,
    status: 'ONLINE',
    rating: 4.9,
    reviewsCount: 2430,
    distance: '6.1 miles away'
  },
  {
    id: 'hub-302',
    name: 'St. Jude Community Pharmacy',
    code: '#HUB-302 • API v4.2',
    region: 'South Bay Medical Center',
    activeOrders: 19,
    dispatchSlaMins: 21,
    genericMatchRate: 99.2,
    platformTakeRate: 8.5,
    monthlyGmv: 183600,
    status: 'ONLINE',
    rating: 4.9,
    reviewsCount: 940,
    distance: '3.5 miles away'
  }
];

export const BATCH_DOSSIER: BatchLot = {
  batchNumber: '#CP-9021',
  molecule: 'Atorvastatin Calcium 20mg',
  brandEquivalent: 'Lipitor (Pfizer) 20mg',
  yieldUnits: 45000,
  expiry: '11/2026',
  reactor: 'Reactor 04-B',
  purityGrade: 'USP-NF Grade',
  hplcAssay: 99.82,
  dissolution: 96.4,
  bioEquivAuc: 99.4,
  residualSolvents: '<0.001 ppm',
  status: 'PASSED QA',
  auditor: 'Dr. Alistair Vance, Lead Auditor',
  token: 'cGMP Token #904-QA'
};

export const WHOLESALE_ORDERS: WholesaleOrder[] = [
  {
    poNumber: '#PO-88219-M',
    hubName: 'MetroCare Rx Downtown Hub',
    storeCode: 'Store #4082 • Central Dispensary',
    contactPerson: 'Dr. Elena Rostova, PharmD',
    molecule: 'Atorvastatin Calcium 20mg',
    batchNumber: '#CP-9021',
    quantityUnits: 1500,
    packageSize: '50ct',
    tierRate: 'Tier 2 ($11.00/btl)',
    contractValue: 16500.00,
    fulfillmentStatus: 'Ready for Handover / Palletized',
    dispatchEta: 'Today, 14:00',
    dock: 'Dock 03 • Secure Cold'
  },
  {
    poNumber: '#PO-88240-H',
    hubName: 'HealthPlus Express Pharmacy',
    storeCode: 'Regional Hub #12 • West Suburbs',
    contactPerson: 'Marcus Webb, RPh',
    molecule: 'Metformin HCl ER 500mg',
    batchNumber: '#MET-1102',
    quantityUnits: 3000,
    packageSize: '100ct',
    tierRate: 'Tier 3 Rate',
    contractValue: 18000.00,
    fulfillmentStatus: 'In Transit via Cold-Express',
    dispatchEta: 'Tomorrow, 09:30',
    dock: 'Tracking Active'
  },
  {
    poNumber: '#PO-88255-A',
    hubName: 'Apollo Generic Central Depot',
    storeCode: 'Midwest Bulk Distribution Center',
    contactPerson: 'Dr. Priya Shah',
    molecule: 'Amoxicillin + Clavulanate 625mg',
    batchNumber: '#AMX-801',
    quantityUnits: 10000,
    packageSize: '50ct',
    tierRate: 'Bulk Tier 3',
    contractValue: 29000.00,
    fulfillmentStatus: 'Payment Cleared / Allocating',
    dispatchEta: 'Oct 29, 08:00',
    dock: 'Scheduled Loading'
  }
];

export const ASSET_IMAGES = {
  doctorHeadshot: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDE2-RzUArK2ukuqOnZ_nps3GoGt-uOJxXJ1rowgACnTyOMGQIxW5spxjQf19QenkRrHDuU_3myC1gfUp4l2xcYOOFU-_tF8q7i9m2rL-oHyd4iRLzQ7IZ8125VOC-bUWF6ym0-aMxAEeazHna7Ak72yKbY9ZIb_2hLa7DZ1n8Jr4gvQRELyD9suBLCi_ckx86GYsSDW96pNUvzLTd25lUby9OO2d4M3dnQJtyyIemkdbsrO-n2GoKePA',
  prescriptionPad: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVJ1AaMRYluo3vjTcsRkeFb_dHhw-a1DIlAeo6rjUg_k-BDKHpCcW-ljRMa4Zs60s9A-BkknlWLepZeH4z3c69Sgv-90HwZknvtrzxvMR7Jgvfl4oW4yO19ZDHqK2N-r4GM1wJyzznr4awa1qr-aA9J8WCuKhJukVB2xLR2A_zMD01rUJ6E-BUxOMjyVPcSFX_85_GQ7xO8aSj0_jniw45X7R8ePkTTj_UgsLhRiBZzzVXfJ0CfX8ygQ',
  brooklynMap: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD492FHwz5W_w0AD0VqMQYEvUc4JaeyNkp-2O8qjHII1bgBapj-thMAfSyFqD5cqgompeBsUdU0RbqLiJF5JaikEMJLk6b3bLHO8mRpmMoQkJ52-QLGy3S_Fv651cXVoV0VVvKEkW2mnRZXrz1KucfuKpT_IIsuXkK-Vev3p2svPCnhTY2tk4rgBieqMslwxDkbqiPtNAQScZJ73x205VcbMW76pBMzoV6eY8v7sTIBNndFSteOFe6nnw',
  manufacturerHeadshot: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoq2MnD_-r680oQeIIoA1z4avoYdImYFUpXjJWACSo9RTJVYHnaiCO0COqzEhsLPoumzYH65b06UV433fYpqJ4htaJsATNTQ7-uQLX7qWXphhKdPXO7_l0o7Gh7_GTmOQL1H0ACTDtkPV-wcIkJzG5cV-Tc6mSmGUMJcXCnPPHVPehUmItvAUsph2Rxjgx-337xdPHx8cCsL0FpwQXgJIyrTFn7-2JtpfFQOleDotxzzVJ97dduTL0zg'
};

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-patient-1',
    name: 'Johnathan Doe',
    email: 'johnathan.doe@gmail.com',
    phone: '+1 (718) 555-0142',
    role: 'patient',
    deliveryAddress: '742 Evergreen Terr, Brooklyn NY 11201',
    activePrescriptionsCount: 3,
    joinedDate: 'March 2024'
  },
  {
    id: 'user-pharm-1',
    name: 'Dr. Marcus Vance, PharmD',
    email: 'm.vance@metrocarerx.com',
    phone: '+1 (718) 555-4082',
    role: 'pharmacist',
    licenseNumber: 'GDL-99201-MH (NY State Board)',
    facilityName: 'MetroCare Central Dispensary #4082',
    deliveryAddress: '142 Court St, Brooklyn NY 11201',
    activePrescriptionsCount: 18,
    joinedDate: 'January 2023'
  },
  {
    id: 'user-mfg-1',
    name: 'Dr. Alistair Vance',
    email: 'a.vance@apexbio.com',
    phone: '+1 (212) 555-9004',
    role: 'manufacturer',
    licenseNumber: 'FDA FEI #300482910',
    companyName: 'Apex BioPharma Labs (Plant 4)',
    joinedDate: 'June 2022'
  },
  {
    id: 'user-admin-1',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@genericmed.health',
    phone: '+1 (212) 555-0199',
    role: 'enterprise_admin',
    licenseNumber: 'MD-884102-NY (Board Certified)',
    facilityName: 'GenericMed Enterprise Operations Mesh',
    joinedDate: 'September 2021'
  }
];

