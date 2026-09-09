"use strict";
/**
 * GenericMed Order, Fulfillment & Express Dispatch Microservice
 * Port: 8003
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8003;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Canonical In-Memory Order Repository (mirrors mockData.ts)
const ordersDb = new Map();
// Seed initial active order
const canonicalOrder = {
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
app.get('/health', (_req, res) => {
    res.json({
        status: 'UP',
        service: 'genericmed-order-service',
        version: '1.2.0',
        activeOrders: ordersDb.size / 2,
        timestamp: new Date().toISOString()
    });
});
// Get Order by Order Number or ID
app.get('/api/v1/orders/:identifier', (req, res) => {
    const identifier = req.params.identifier.toUpperCase();
    const order = ordersDb.get(identifier) || ordersDb.get(req.params.identifier.toLowerCase());
    if (!order) {
        return res.status(404).json({ error: `Order '${req.params.identifier}' not found` });
    }
    return res.json(order);
});
// Create New Order
app.post('/api/v1/orders/create', (req, res) => {
    const { patientName, deliveryAddress, brandPrescribed, genericSubstitute, priceBrand, priceGeneric } = req.body;
    const orderNum = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const randomPin = String(Math.floor(1000 + Math.random() * 9000));
    const sealSuffix = Math.random().toString(36).substring(2, 4).toUpperCase();
    const sealId = `GM-SEAL-${Math.floor(10000 + Math.random() * 90000)}-${sealSuffix}`;
    const savings = Math.max(0, (priceBrand || 98.50) - (priceGeneric || 14.20));
    const newOrder = {
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
app.post('/api/v1/orders/:id/pack', (req, res) => {
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
app.post('/api/v1/orders/:id/dispatch', (req, res) => {
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
app.post('/api/v1/orders/:id/verify-pin', (req, res) => {
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
app.listen(PORT, () => {
    console.log(`[Order Service] Node.js / Express listening on port ${PORT}...`);
});
