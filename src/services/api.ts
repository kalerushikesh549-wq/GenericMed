/**
 * GenericMed Resilient API Client Layer
 * Connects frontend screens to backend microservices with automatic mock data fallback.
 * Follows Cardinal Rule in rules.md (Non-Destructive Continuity).
 */

import { MedicineItem, PrescriptionOrder, PharmacyHub } from '../types';
import { MEDICINES, CURRENT_ORDER, PHARMACY_HUBS } from '../data/mockData';

const API_BASE_URL = (import.meta as any).env?.VITE_API_GATEWAY_URL || 'http://localhost:8000';
const TIMEOUT_MS = 2500;

/**
 * Fetch wrapper with timeout and automatic error catching
 */
async function safeFetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      }
    });
    clearTimeout(id);

    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch (_err) {
    clearTimeout(id);
    return null;
  }
}

/**
 * Medicine & Catalog Service Client
 */
export const catalogApi = {
  async getMedicines(query?: string): Promise<MedicineItem[]> {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    const data = await safeFetch<MedicineItem[]>(`/api/v1/catalog/medicines${q}`);
    
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }

    // Fallback to local mock data
    if (!query) return MEDICINES;
    const lowerQ = query.toLowerCase();
    return MEDICINES.filter(m => 
      m.brandName.toLowerCase().includes(lowerQ) ||
      m.genericName.toLowerCase().includes(lowerQ) ||
      m.activeSalt.toLowerCase().includes(lowerQ) ||
      m.ndc.toLowerCase().includes(lowerQ)
    );
  },

  async getSubstitutes(medicineId: string) {
    const data = await safeFetch<any>(`/api/v1/catalog/substitutes/${encodeURIComponent(medicineId)}`);
    if (data) return data;

    // Fallback: Find matching mock medicine
    const med = MEDICINES.find(m => m.id === medicineId || m.ndc === medicineId) || MEDICINES[0];
    const savingsAmount = Math.round((med.brandPrice - med.genericPrice) * 100) / 100;
    return {
      originalMedicine: med,
      genericMatch: med,
      savingsAmount,
      savingsPercent: med.savingsPercentage,
      isBioEquivalent: med.bioEquivalenceScore >= 98.0,
      equivalenceCode: med.fdaRating,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Prescription OCR & Verification Client
 */
export const prescriptionsApi = {
  async getQueue(): Promise<PrescriptionOrder[]> {
    const data = await safeFetch<{ queue: PrescriptionOrder[] }>('/api/v1/prescriptions/queue');
    if (data?.queue && data.queue.length > 0) {
      return data.queue;
    }
    return [CURRENT_ORDER];
  },

  async uploadScan(file?: File, brandOverride?: string) {
    // Try live OCR service endpoint
    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      if (brandOverride) formData.append('brand_override', brandOverride);

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${API_BASE_URL}/api/v1/prescriptions/ocr-scan`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(id);

      if (res.ok) {
        return await res.json();
      }
    } catch (_e) {
      // Fall through to fallback
    }

    // Fallback simulation
    return {
      order_number: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      brand_prescribed: brandOverride || 'Lipitor 20mg',
      generic_substitute: 'Atorvastatin Calcium 20mg',
      instructions: 'Sig: 1 tablet orally once daily at bedtime (qHS). Dispense: #30.',
      refills: 3,
      confidence: 99.1,
      prescriber_name: 'Dr. Elena Rostova, MD',
      prescriber_license: 'LIC #MD-88319 / NPI: #18839201',
      clinic_name: 'ST. JUDE CARDIOVASCULAR CLINIC',
      status: 'pending_review'
    };
  },

  async verifyPrescription(prescriptionId: string, pharmacistName: string, licenseNumber: string) {
    const data = await safeFetch<any>('/api/v1/prescriptions/verify', {
      method: 'POST',
      body: JSON.stringify({
        prescription_id: prescriptionId,
        pharmacist_id: 'user-pharm-1',
        pharmacist_name: pharmacistName,
        license_number: licenseNumber,
        generic_confirmed: 'Atorvastatin Calcium 20mg',
        approved: true
      })
    });

    if (data) return data;

    // Fallback signature generator
    const hash = Math.random().toString(36).substring(2, 10).toUpperCase();
    return {
      prescription_id: prescriptionId,
      status: 'verified',
      verified_by: pharmacistName,
      license_number: licenseNumber,
      audit_signature: `GM-SIG-2026-${hash}`,
      verified_at: new Date().toISOString()
    };
  }
};

/**
 * Orders & Dispatch Client
 */
export const ordersApi = {
  async getOrder(orderNumber: string): Promise<PrescriptionOrder> {
    const data = await safeFetch<PrescriptionOrder>(`/api/v1/orders/${encodeURIComponent(orderNumber)}`);
    if (data) return data;
    return CURRENT_ORDER;
  },

  async verifyDeliveryPin(orderId: string, pin: string) {
    const data = await safeFetch<{ success: boolean; message: string }>(`/api/v1/orders/${encodeURIComponent(orderId)}/verify-pin`, {
      method: 'POST',
      body: JSON.stringify({ pin })
    });

    if (data) return data;

    // Fallback: Verify against canonical pin 8410
    if (pin.trim() === CURRENT_ORDER.deliveryPin) {
      return {
        success: true,
        message: 'Delivery PIN verified. Prescription parcel handed over securely.'
      };
    }
    return {
      success: false,
      message: 'Invalid delivery PIN. Please re-check the 4-digit code.'
    };
  }
};

/**
 * Check Backend Microservices Connectivity Status
 */
export async function checkBackendHealth(): Promise<{ online: boolean; gateway?: string; latencyMs?: number }> {
  const start = performance.now();
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(id);

    const latencyMs = Math.round(performance.now() - start);
    if (res.ok) {
      const data = await res.json();
      return { online: true, gateway: data.gateway || 'Online', latencyMs };
    }
  } catch (_e) {
    // Backend offline
  }
  return { online: false };
}
