/**
 * Format Utilities
 * Currency, percentage, and number formatting
 */

/**
 * Format amount as currency
 */
export function formatCurrency(amount, currencySymbol = '₱') {
  if (amount === null || amount === undefined || isNaN(amount)) return `${currencySymbol}0.00`;
  
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return amount < 0 ? `(${currencySymbol}${formatted})` : `${currencySymbol}${formatted}`;
}

/**
 * Format amount as compact currency (e.g., ₱1.2K, ₱3.5M)
 */
export function formatCompactCurrency(amount, currencySymbol = '₱') {
  if (amount === null || amount === undefined || isNaN(amount)) return `${currencySymbol}0`;
  
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (abs >= 1_000_000) {
    return `${sign}${currencySymbol}${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${currencySymbol}${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}${currencySymbol}${abs.toFixed(2)}`;
}

/**
 * Format a number with commas
 */
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return num.toLocaleString('en-PH');
}

/**
 * Format as percentage
 */
export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate percentage change safely (handles zero division)
 */
export function safePercentageChange(oldVal, newVal) {
  if (oldVal === 0 && newVal === 0) return 0;
  if (oldVal === 0) return newVal > 0 ? 100 : -100;
  return ((newVal - oldVal) / Math.abs(oldVal)) * 100;
}

/**
 * Format percentage change with sign
 */
export function formatPercentageChange(oldVal, newVal) {
  const change = safePercentageChange(oldVal, newVal);
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Parse a number from various formats
 */
export function parseAmount(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  // Remove currency symbols, commas, spaces
  const cleaned = String(value).replace(/[₱$,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
