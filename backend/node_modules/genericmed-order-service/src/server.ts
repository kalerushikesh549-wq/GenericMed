/**
 * GenericMed Order, Fulfillment & Express Dispatch Microservice
 * Port: 8003
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 8003;

app.use(cors());
app.use(express.json());

// Order Data Contract
interface OrderRecord {
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
  courierCoords: { lat: number; lng: number };
}

// Canonical In-Memory Order Repository (mirrors mockData.ts)
const ordersDb: Map<string, OrderRecord> = new Map();

type PaymentMethodType = 'card' | 'apple_pay' | 'google_pay' | 'hsa_fsa';
interface PaymentSplit { grossCents: number; platformFeeCents: number; hubPayoutCents: number; courierPayoutCents: number; }
interface InsuranceQuote { status: 'estimated' | 'adjudicated'; payerName: string; brandCopayCents: number; genericCopayCents: number; cashPriceCents: number; patientNetSavingsCents: number; expiresAt: string; }
type WholesaleTier = 'tier_1' | 'tier_2' | 'tier_3';
type ColdChainStatus = 'in_transit' | 'quarantined' | 'accepted';
interface ColdChainShipment { shipmentReference: string; batchNumber: string; deviceId: string; status: ColdChainStatus; readings: Array<{ temperatureC: number; humidityPercent?: number; recordedAt: string }>; }

const PLATFORM_TAKE_RATE = 0.085;
const PAYMENT_METHODS: ReadonlySet<PaymentMethodType> = new Set(['card', 'apple_pay', 'google_pay', 'hsa_fsa']);
const paymentTransactions = new Map<string, { status: string; amountCents: number; method: PaymentMethodType; split: PaymentSplit }>();
const wholesaleInventory = new Map<string, number>([['#CP-9021', 45000]]);
const coldChainShipments = new Map<string, ColdChainShipment>();

function calculateSplit(amountCents: number, courierPayoutCents = 0): PaymentSplit {
  if (!Number.isInteger(amountCents) || amountCents < 0 || !Number.isInteger(courierPayoutCents) || courierPayoutCents < 0 || courierPayoutCents > amountCents) {
    throw new Error('Invalid payment amount or courier payout');
  }
  const platformFeeCents = Math.round(amountCents * PLATFORM_TAKE_RATE);
  return { grossCents: amountCents, platformFeeCents, courierPayoutCents, hubPayoutCents: amountCents - platformFeeCents - courierPayoutCents };
}

function isPaymentMethod(value: unknown): value is PaymentMethodType {
  return typeof value === 'string' && PAYMENT_METHODS.has(value as PaymentMethodType);
}

function priceTierFor(quantityUnits: number): WholesaleTier {
  if (quantityUnits >= 20000) return 'tier_3';
  if (quantityUnits >= 5000) return 'tier_2';
  return 'tier_1';
}

// Seed initial active order
const canonicalOrder: OrderRecord = {
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
  deliveryAddress: '742 Evergreen Terr, Brooklyn, NY 11201',
  courierCoords: { lat: 40.6928, lng: -73.9903 }
};

ordersDb.set(canonicalOrder.orderNumber, canonicalOrder);
ordersDb.set(canonicalOrder.id, canonicalOrder);

// Health Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'UP',
    service: 'genericmed-order-service',
    version: '1.2.0',
    activeOrders: ordersDb.size / 2,
    timestamp: new Date().toISOString()
  });
});

// Get Order by Order Number or ID
app.get('/api/v1/orders/:identifier', (req: Request, res: Response) => {
  const identifier = req.params.identifier.toUpperCase();
  const order = ordersDb.get(identifier) || ordersDb.get(req.params.identifier.toLowerCase());

  if (!order) {
    return res.status(404).json({ error: `Order '${req.params.identifier}' not found` });
  }

  return res.json(order);
});

// Create New Order
app.post('/api/v1/orders/create', (req: Request, res: Response) => {
  const {
    patientName,
    deliveryAddress,
    brandPrescribed,
    genericSubstitute,
    priceBrand,
    priceGeneric
  } = req.body;

  const orderNum = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
  const randomPin = String(Math.floor(1000 + Math.random() * 9000));
  const sealSuffix = Math.random().toString(36).substring(2, 4).toUpperCase();
  const sealId = `GM-SEAL-${Math.floor(10000 + Math.random() * 90000)}-${sealSuffix}`;

  const savings = Math.max(0, (priceBrand || 98.50) - (priceGeneric || 14.20));

  const newOrder: OrderRecord = {
    id: orderNum.toLowerCase(),
    orderNumber: orderNum,
    patientName: patientName || 'Verified Patient',
    patientAge: 45,
    patientDob: '01-Jan-1980',
    prescriber: 'Dr. Elena Rostova, MD',
    prescriberLicense: 'LIC #MD-88319 / NPI: #18839201',
    clinic: 'ST. JUDE CARDIOVASCULAR CLINIC',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    brandPrescribed: brandPrescribed || 'Lipitor 20mg',
    genericSubstitute: genericSubstitute || 'Atorvastatin Calcium 20mg',
    instructions: 'Sig: 1 tablet orally once daily at bedtime. Dispense: #30.',
    refills: 2,
    confidence: 99.4,
    status: 'pending_review',
    timeRemaining: '35:00',
    assignedHub: 'MetroCare Rx Downtown (#HUB-104)',
    hubDistance: '1.8 miles',
    hubEta: '35 mins dispatch',
    priceBrand: priceBrand || 98.50,
    priceGeneric: priceGeneric || 14.20,
    savings: Math.round(savings * 100) / 100,
    batchNumber: '#CP-9021',
    expiry: '11/2026',
    binLocation: 'Bin B-03',
    tamperSealId: sealId,
    deliveryPin: randomPin,
    courierName: 'Miguel S.',
    courierVehicle: 'E-Cargo Bike #14 (Heated/Insulated)',
    deliveryAddress: deliveryAddress || '742 Evergreen Terr, Brooklyn, NY 11201',
    courierCoords: { lat: 40.6928, lng: -73.9903 }
  };

  ordersDb.set(newOrder.orderNumber, newOrder);
  ordersDb.set(newOrder.id, newOrder);

  res.status(201).json(newOrder);
});

// Update Order Status (Pack confirmation)
app.post('/api/v1/orders/:id/pack', (req: Request, res: Response) => {
  const order = ordersDb.get(req.params.id) || ordersDb.get(req.params.id.toUpperCase());
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = 'packed';
  order.binLocation = req.body.binLocation || order.binLocation;

  res.json({
    message: 'Order packed and armed with tamper-evident seal',
    orderNumber: order.orderNumber,
    status: order.status,
    tamperSealId: order.tamperSealId
  });
});

// Dispatch Order to Courier
app.post('/api/v1/orders/:id/dispatch', (req: Request, res: Response) => {
  const order = ordersDb.get(req.params.id) || ordersDb.get(req.params.id.toUpperCase());
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = 'out_for_delivery';
  order.courierName = req.body.courierName || order.courierName;

  res.json({
    message: 'Order dispatched to express local courier',
    orderNumber: order.orderNumber,
    status: order.status,
    courier: order.courierName
  });
});

// Doorstep PIN Verification
app.post('/api/v1/orders/:id/verify-pin', (req: Request, res: Response) => {
  const { pin } = req.body;
  const order = ordersDb.get(req.params.id) || ordersDb.get(req.params.id.toUpperCase());

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.deliveryPin !== String(pin).trim()) {
    return res.status(400).json({
      success: false,
      error: 'Invalid delivery PIN. Please re-check the 4-digit code on the patient mobile app.'
    });
  }

  order.status = 'delivered';
  order.timeRemaining = '00:00';

  res.json({
    success: true,
    message: 'Delivery PIN verified. Prescription package handed over securely.',
    orderNumber: order.orderNumber,
    status: 'delivered',
    deliveredAt: new Date().toISOString()
  });
});

// Phase 5: payment records only accept gateway tokens; raw card data is never accepted.
app.post('/api/v1/payments/intents', (req: Request, res: Response) => {
  const { amountCents, paymentMethodType, paymentMethodId, courierPayoutCents = 0 } = req.body as Record<string, unknown>;
  if (typeof amountCents !== 'number' || !Number.isInteger(amountCents) || amountCents <= 0 || !isPaymentMethod(paymentMethodType) || typeof paymentMethodId !== 'string' || !paymentMethodId.startsWith('pm_') || typeof courierPayoutCents !== 'number') {
    return res.status(400).json({ error: 'A positive integer amount, supported payment method, and tokenized payment method ID are required.' });
  }
  try {
    const split = calculateSplit(amountCents, courierPayoutCents);
    const id = `pi_demo_${crypto.randomUUID().replace(/-/g, '')}`;
    paymentTransactions.set(id, { status: 'authorized', amountCents, method: paymentMethodType, split });
    return res.status(201).json({ id, provider: process.env.PAYMENTS_MODE === 'stripe' ? 'stripe_pending' : 'demo', status: 'authorized', amountCents, currency: 'usd', paymentMethodType, split });
  } catch (error) {
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid payment request' });
  }
});

app.get('/api/v1/payments/:paymentIntentId', (req: Request, res: Response) => {
  const transaction = paymentTransactions.get(req.params.paymentIntentId);
  if (!transaction) return res.status(404).json({ error: 'Payment intent not found' });
  return res.json({ id: req.params.paymentIntentId, ...transaction });
});

// Credential-gated boundary: demo results are estimates, never an insurance benefit determination.
app.post('/api/v1/insurance/adjudications/quote', (req: Request, res: Response) => {
  const { cashPriceCents, payerName = 'Coverage estimate', brandCopayCents } = req.body as Record<string, unknown>;
  if (typeof cashPriceCents !== 'number' || !Number.isInteger(cashPriceCents) || cashPriceCents < 0 || (brandCopayCents !== undefined && (typeof brandCopayCents !== 'number' || !Number.isInteger(brandCopayCents) || brandCopayCents < 0))) {
    return res.status(400).json({ error: 'cashPriceCents and optional brandCopayCents must be non-negative integers.' });
  }
  const brandCopay = typeof brandCopayCents === 'number' ? brandCopayCents : Math.max(cashPriceCents + 3080, 4500);
  const genericCopay = Math.min(Math.round(brandCopay * 0.35), cashPriceCents);
  const quote: InsuranceQuote = { status: process.env.CLEARINGHOUSE_MODE === 'live' ? 'adjudicated' : 'estimated', payerName: String(payerName), brandCopayCents: brandCopay, genericCopayCents: genericCopay, cashPriceCents, patientNetSavingsCents: Math.max(0, brandCopay - cashPriceCents), expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() };
  return res.json(quote);
});

app.post('/api/v1/refill-subscriptions', (req: Request, res: Response) => {
  const { prescriptionId, cadenceDays, paymentIntentId } = req.body as Record<string, unknown>;
  if (typeof prescriptionId !== 'string' || (cadenceDays !== 30 && cadenceDays !== 90) || typeof paymentIntentId !== 'string' || !paymentTransactions.has(paymentIntentId)) {
    return res.status(400).json({ error: 'A prescription reference, 30/90-day cadence, and authorized payment intent are required.' });
  }
  const nextChargeAt = new Date(Date.now() + Number(cadenceDays) * 24 * 60 * 60 * 1000).toISOString();
  return res.status(201).json({ id: `sub_demo_${crypto.randomUUID().replace(/-/g, '')}`, status: 'active', cadenceDays, nextChargeAt });
});

// Phase 6: PO allocation is guarded by cGMP token presence and available batch inventory.
app.post('/api/v1/wholesale/purchase-orders', (req: Request, res: Response) => {
  const { batchNumber, quantityUnits, hubName, signerLicenseNumber, cgmpToken } = req.body as Record<string, unknown>;
  if (typeof batchNumber !== 'string' || typeof quantityUnits !== 'number' || !Number.isInteger(quantityUnits) || quantityUnits < 1000 || typeof hubName !== 'string' || typeof signerLicenseNumber !== 'string' || typeof cgmpToken !== 'string') {
    return res.status(400).json({ error: 'Batch, 1,000+ unit quantity, pharmacy hub, signer license, and cGMP token are required.' });
  }
  const availableUnits = wholesaleInventory.get(batchNumber) ?? 0;
  if (quantityUnits > availableUnits) return res.status(409).json({ error: 'Requested allocation exceeds available released batch inventory.', availableUnits });
  const tier = priceTierFor(quantityUnits);
  const unitPriceCents = tier === 'tier_3' ? 920 : tier === 'tier_2' ? 1100 : 1250;
  wholesaleInventory.set(batchNumber, availableUnits - quantityUnits);
  const poNumber = `PO-GM-${Date.now().toString().slice(-8)}`;
  const signatureHash = crypto.createHash('sha256').update(`${poNumber}|${batchNumber}|${quantityUnits}|${signerLicenseNumber}|${cgmpToken}`).digest('hex');
  return res.status(201).json({ poNumber, status: 'allocated_pending_quality_release', batchNumber, quantityUnits, tier, unitPriceCents, contractValueCents: quantityUnits * unitPriceCents, availableUnitsAfterAllocation: availableUnits - quantityUnits, signatureHash: `GM-PO-${signatureHash.slice(0, 20).toUpperCase()}` });
});

app.post('/api/v1/cold-chain/telemetry', (req: Request, res: Response) => {
  const { shipmentReference, batchNumber, deviceId, temperatureC, humidityPercent, recordedAt } = req.body as Record<string, unknown>;
  if (typeof shipmentReference !== 'string' || typeof batchNumber !== 'string' || typeof deviceId !== 'string' || typeof temperatureC !== 'number' || !Number.isFinite(temperatureC) || (humidityPercent !== undefined && (typeof humidityPercent !== 'number' || humidityPercent < 0 || humidityPercent > 100))) {
    return res.status(400).json({ error: 'Shipment, batch, device, finite temperature, and optional 0–100 humidity are required.' });
  }
  const timestamp = typeof recordedAt === 'string' && !Number.isNaN(Date.parse(recordedAt)) ? new Date(recordedAt).toISOString() : new Date().toISOString();
  const shipment = coldChainShipments.get(shipmentReference) ?? { shipmentReference, batchNumber, deviceId, status: 'in_transit' as ColdChainStatus, readings: [] };
  if (shipment.batchNumber !== batchNumber || shipment.deviceId !== deviceId) return res.status(409).json({ error: 'Shipment identity does not match its registered batch or sensor.' });
  shipment.readings.push({ temperatureC, humidityPercent: typeof humidityPercent === 'number' ? humidityPercent : undefined, recordedAt: timestamp });
  const excursion = temperatureC < 2 || temperatureC > 8;
  if (excursion) shipment.status = 'quarantined';
  coldChainShipments.set(shipmentReference, shipment);
  return res.status(201).json({ shipmentReference, status: shipment.status, temperatureC, withinRange: !excursion, alert: excursion ? `QUARANTINE REQUIRED: ${temperatureC.toFixed(1)}°C is outside the 2–8°C range.` : null });
});

app.get('/api/v1/cold-chain/shipments/:shipmentReference', (req: Request, res: Response) => {
  const shipment = coldChainShipments.get(req.params.shipmentReference);
  if (!shipment) return res.status(404).json({ error: 'Cold-chain shipment not found' });
  return res.json(shipment);
});

app.listen(PORT, () => {
  console.log(`[Order Service] Node.js / Express listening on port ${PORT}...`);
});
