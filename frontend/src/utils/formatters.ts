/**
 * Indian Localization and Formatting Utilities
 * Standardizes Indian Rupee (₹), +91 Mobile, 6-Digit PIN, and Date formats.
 */

/**
 * Format a number into Indian Rupee currency format (e.g. ₹34.00, ₹1,45,000.00)
 */
export function formatINR(amount: number, options?: { showPaisa?: boolean }): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0.00';
  }

  const showPaisa = options?.showPaisa !== false;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const fixed = absAmount.toFixed(2);
  const parts = fixed.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian number formatting: last 3 digits, then groups of 2 digits
  let result = '';
  if (integerPart.length > 3) {
    const last3 = integerPart.substring(integerPart.length - 3);
    const remaining = integerPart.substring(0, integerPart.length - 3);
    const groups: string[] = [];
    
    let temp = remaining;
    while (temp.length > 2) {
      groups.unshift(temp.substring(temp.length - 2));
      temp = temp.substring(0, temp.length - 2);
    }
    if (temp.length > 0) {
      groups.unshift(temp);
    }
    result = groups.join(',') + ',' + last3;
  } else {
    result = integerPart;
  }

  const prefix = isNegative ? '-₹' : '₹';
  return showPaisa ? `${prefix}${result}.${decimalPart}` : `${prefix}${result}`;
}

/**
 * Format Indian 10-digit mobile number as +91 XXXXX XXXXX
 */
export function formatIndianMobile(phone: string): string {
  if (!phone) return '+91 98XXX XXXXX';
  const clean = phone.replace(/\D/g, '');
  
  if (clean.length === 10) {
    return `+91 ${clean.substring(0, 5)} ${clean.substring(5)}`;
  }
  if (clean.length === 12 && clean.startsWith('91')) {
    const num = clean.substring(2);
    return `+91 ${num.substring(0, 5)} ${num.substring(5)}`;
  }
  return phone;
}

/**
 * Validate 10-digit Indian mobile number
 */
export function isValidIndianMobile(phone: string): boolean {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10 && /^[6-9]\d{9}$/.test(clean)) {
    return true;
  }
  if (clean.length === 12 && clean.startsWith('91') && /^[6-9]\d{9}$/.test(clean.substring(2))) {
    return true;
  }
  return false;
}

/**
 * Format 6-digit Indian PIN Code
 */
export function formatPincode(pin: string | number): string {
  const s = String(pin).trim();
  return /^\d{6}$/.test(s) ? s : '411016';
}

/**
 * Format date in Indian standard notation DD/MM/YYYY
 */
export function formatIndianDate(dateInput: string | Date | number): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}
