/**
 * Data Service Layer
 * 
 * Abstracted CRUD interface over IndexedDB (Dexie).
 * All database operations go through this service.
 * Designed to be swappable for Supabase/PostgreSQL later.
 */

import db from './db';
import { generateId } from '../utils/formatUtils';
import { toStorageDate, getNow } from '../utils/dateUtils';

// ============================================
// TRANSACTIONS
// ============================================

export async function getAllTransactions() {
  return await db.transactions.toArray();
}

export async function getTransactionById(id) {
  return await db.transactions.get(id);
}

export async function addTransaction(transaction) {
  const now = getNow();
  const record = {
    ...transaction,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    isDemo: transaction.isDemo || false
  };
  const id = await db.transactions.add(record);
  return { ...record, id };
}

export async function updateTransaction(id, updates) {
  const now = getNow();
  await db.transactions.update(id, {
    ...updates,
    updatedAt: now.toISOString()
  });
  return await db.transactions.get(id);
}

export async function deleteTransaction(id) {
  await db.transactions.delete(id);
}

export async function bulkAddTransactions(transactions) {
  const now = getNow();
  const records = transactions.map(t => ({
    ...t,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }));
  return await db.transactions.bulkAdd(records);
}

export async function clearDemoTransactions() {
  await db.transactions.where('isDemo').equals(1).delete();
}

export async function getTransactionCount() {
  return await db.transactions.count();
}

// ============================================
// CATEGORIES
// ============================================

export async function getAllCategories() {
  return await db.categories.toArray();
}

export async function getCategoriesByType(type) {
  return await db.categories.where('type').equals(type).toArray();
}

export async function addCategory(category) {
  const record = {
    ...category,
    isActive: category.isActive !== undefined ? category.isActive : true,
    isDefault: category.isDefault || false,
    createdAt: new Date().toISOString()
  };
  const id = await db.categories.add(record);
  return { ...record, id };
}

export async function updateCategory(id, updates) {
  await db.categories.update(id, updates);
  return await db.categories.get(id);
}

export async function deleteCategory(id) {
  // Don't actually delete — disable instead (preserve historical records)
  await db.categories.update(id, { isActive: false });
}

// ============================================
// PAYMENT METHODS
// ============================================

export async function getAllPaymentMethods() {
  return await db.paymentMethods.toArray();
}

export async function addPaymentMethod(pm) {
  const record = {
    ...pm,
    isActive: pm.isActive !== undefined ? pm.isActive : true,
    isDefault: pm.isDefault || false,
    createdAt: new Date().toISOString()
  };
  const id = await db.paymentMethods.add(record);
  return { ...record, id };
}

export async function updatePaymentMethod(id, updates) {
  await db.paymentMethods.update(id, updates);
  return await db.paymentMethods.get(id);
}

export async function deletePaymentMethod(id) {
  await db.paymentMethods.update(id, { isActive: false });
}

// ============================================
// DEPARTMENTS
// ============================================

export async function getAllDepartments() {
  return await db.departments.toArray();
}

export async function addDepartment(dept) {
  const record = {
    ...dept,
    isActive: dept.isActive !== undefined ? dept.isActive : true,
    isDefault: dept.isDefault || false,
    createdAt: new Date().toISOString()
  };
  const id = await db.departments.add(record);
  return { ...record, id };
}

export async function updateDepartment(id, updates) {
  await db.departments.update(id, updates);
  return await db.departments.get(id);
}

export async function deleteDepartment(id) {
  await db.departments.update(id, { isActive: false });
}

// ============================================
// SETTINGS
// ============================================

const DEFAULT_SETTINGS = {
  hotelName: "Hamerson's Hotel",
  hotelAddress: '',
  hotelContact: '',
  currency: 'PHP',
  currencySymbol: '₱',
  timezone: 'Asia/Manila',
  fiscalYearStart: 1, // January
  dateFormat: 'MMM dd, yyyy',
  demoDataLoaded: false
};

export async function getSettings() {
  const settings = {};
  const records = await db.settings.toArray();
  records.forEach(r => {
    settings[r.key] = r.value;
  });
  return { ...DEFAULT_SETTINGS, ...settings };
}

export async function updateSettings(updates) {
  const entries = Object.entries(updates);
  for (const [key, value] of entries) {
    await db.settings.put({ key, value });
  }
  return await getSettings();
}

// ============================================
// SEED DEFAULT DATA
// ============================================

let defaultDataSeedPromise;

export function seedDefaultData() {
  if (!defaultDataSeedPromise) defaultDataSeedPromise = seedDefaultDataOnce();
  return defaultDataSeedPromise;
}

async function seedDefaultDataOnce() {
  // Check if already seeded
  const catCount = await db.categories.count();
  if (catCount > 0) return;
  
  // Default expense categories
  const expenseCategories = [
    { name: 'Salaries & Wages', type: 'expense', isActive: true, isDefault: true, icon: 'users', color: '#3b82f6' },
    { name: 'Utilities', type: 'expense', isActive: true, isDefault: true, icon: 'zap', color: '#f59e0b' },
    { name: 'Food & Beverage', type: 'expense', isActive: true, isDefault: true, icon: 'utensils', color: '#10b981' },
    { name: 'Housekeeping', type: 'expense', isActive: true, isDefault: true, icon: 'spray-can', color: '#8b5cf6' },
    { name: 'Maintenance', type: 'expense', isActive: true, isDefault: true, icon: 'wrench', color: '#ef4444' },
    { name: 'Supplies', type: 'expense', isActive: true, isDefault: true, icon: 'package', color: '#06b6d4' },
    { name: 'Transportation', type: 'expense', isActive: true, isDefault: true, icon: 'truck', color: '#ec4899' },
    { name: 'Marketing', type: 'expense', isActive: true, isDefault: true, icon: 'megaphone', color: '#84cc16' },
    { name: 'Rent', type: 'expense', isActive: true, isDefault: true, icon: 'building', color: '#f97316' },
    { name: 'Internet / Communication', type: 'expense', isActive: true, isDefault: true, icon: 'wifi', color: '#14b8a6' },
    { name: 'Office Expenses', type: 'expense', isActive: true, isDefault: true, icon: 'briefcase', color: '#a855f7' },
    { name: 'Taxes / Fees', type: 'expense', isActive: true, isDefault: true, icon: 'receipt', color: '#e11d48' },
    { name: 'Other Expenses', type: 'expense', isActive: true, isDefault: true, icon: 'more-horizontal', color: '#64748b' }
  ];
  
  // Default income categories
  const incomeCategories = [
    { name: 'Room Revenue', type: 'income', isActive: true, isDefault: true, icon: 'bed-double', color: '#c8a951' },
    { name: 'Food & Beverage Revenue', type: 'income', isActive: true, isDefault: true, icon: 'utensils-crossed', color: '#10b981' },
    { name: 'Events Revenue', type: 'income', isActive: true, isDefault: true, icon: 'calendar-heart', color: '#8b5cf6' },
    { name: 'Other Revenue', type: 'income', isActive: true, isDefault: true, icon: 'coins', color: '#3b82f6' }
  ];
  
  for (const cat of [...expenseCategories, ...incomeCategories]) {
    await db.categories.add({ ...cat, createdAt: new Date().toISOString() });
  }
  
  // Default payment methods
  const paymentMethods = [
    { name: 'Cash', isActive: true, isDefault: true, icon: 'banknote' },
    { name: 'Bank Transfer', isActive: true, isDefault: true, icon: 'landmark' },
    { name: 'Credit Card', isActive: true, isDefault: true, icon: 'credit-card' },
    { name: 'Debit Card', isActive: true, isDefault: true, icon: 'credit-card' },
    { name: 'Check', isActive: true, isDefault: true, icon: 'file-text' },
    { name: 'GCash', isActive: true, isDefault: true, icon: 'smartphone' },
    { name: 'Maya', isActive: true, isDefault: true, icon: 'smartphone' },
    { name: 'Other', isActive: true, isDefault: true, icon: 'circle-dot' }
  ];
  
  for (const pm of paymentMethods) {
    await db.paymentMethods.add({ ...pm, createdAt: new Date().toISOString() });
  }
  
  // Default departments
  const departments = [
    { name: 'Front Office', isActive: true, isDefault: true },
    { name: 'Housekeeping', isActive: true, isDefault: true },
    { name: 'Food & Beverage', isActive: true, isDefault: true },
    { name: 'Engineering / Maintenance', isActive: true, isDefault: true },
    { name: 'Administration', isActive: true, isDefault: true },
    { name: 'Security', isActive: true, isDefault: true },
    { name: 'Sales & Marketing', isActive: true, isDefault: true }
  ];
  
  for (const dept of departments) {
    await db.departments.add({ ...dept, createdAt: new Date().toISOString() });
  }
}

export async function seedDemoData() {
  const settings = await getSettings();
  if (settings.demoDataLoaded || await db.transactions.count() > 0) return false;

  const categories = await getAllCategories();
  const paymentMethods = await getAllPaymentMethods();
  const departments = await getAllDepartments();
  const categoryId = name => categories.find(c => c.name === name)?.id;
  const paymentMethodId = name => paymentMethods.find(p => p.name === name)?.id;
  const departmentId = name => departments.find(d => d.name === name)?.id;
  const demo = [
    ['2024-01-12', 'expense', 'Generator maintenance', 'Maintenance', 'Engineering / Maintenance', 'Bank Transfer', 18500],
    ['2024-03-08', 'income', 'March room bookings', 'Room Revenue', 'Front Office', 'Bank Transfer', 218000],
    ['2024-06-21', 'expense', 'Guest amenities', 'Supplies', 'Housekeeping', 'Credit Card', 12400],
    ['2025-02-04', 'expense', 'Power and water bill', 'Utilities', 'Administration', 'Bank Transfer', 33200],
    ['2025-05-17', 'income', 'Corporate event package', 'Events Revenue', 'Sales & Marketing', 'Bank Transfer', 156000],
    ['2025-09-23', 'expense', 'Kitchen provisions', 'Food & Beverage', 'Food & Beverage', 'Cash', 28750],
    ['2026-01-10', 'income', 'January room revenue', 'Room Revenue', 'Front Office', 'Bank Transfer', 264000],
    ['2026-04-14', 'expense', 'Aircon repair', 'Maintenance', 'Engineering / Maintenance', 'Bank Transfer', 8500],
    ['2026-07-03', 'expense', 'Digital campaign', 'Marketing', 'Sales & Marketing', 'GCash', 14500],
    ['2026-09-05', 'income', 'Weekend room revenue', 'Room Revenue', 'Front Office', 'Credit Card', 98500]
  ].map(([date, type, description, category, department, paymentMethod, amount], index) => ({
    date, type, description, categoryId: categoryId(category), departmentId: departmentId(department),
    paymentMethodId: paymentMethodId(paymentMethod), amount, reference: `DEMO-${date.replaceAll('-', '')}-${index + 1}`,
    supplier: type === 'expense' ? 'Demo Supplier' : '', notes: 'Clearly labelled demo record', isDemo: true
  }));
  await bulkAddTransactions(demo);
  await updateSettings({ demoDataLoaded: true });
  return true;
}

// ============================================
// FULL BACKUP / RESTORE
// ============================================

export async function exportFullBackup() {
  const [transactions, categories, paymentMethods, departments, settings] = await Promise.all([
    getAllTransactions(),
    getAllCategories(),
    getAllPaymentMethods(),
    getAllDepartments(),
    getSettings()
  ]);
  
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      transactions,
      categories,
      paymentMethods,
      departments,
      settings
    }
  };
}

export async function importFullBackup(backup) {
  if (!backup || !backup.data) {
    throw new Error('Invalid backup file');
  }
  
  const { transactions, categories, paymentMethods, departments, settings } = backup.data;
  
  // Clear existing data
  await db.transactions.clear();
  await db.categories.clear();
  await db.paymentMethods.clear();
  await db.departments.clear();
  await db.settings.clear();
  
  // Import data
  if (categories?.length) await db.categories.bulkAdd(categories);
  if (paymentMethods?.length) await db.paymentMethods.bulkAdd(paymentMethods);
  if (departments?.length) await db.departments.bulkAdd(departments);
  if (transactions?.length) await db.transactions.bulkAdd(transactions);
  if (settings) {
    for (const [key, value] of Object.entries(settings)) {
      await db.settings.put({ key, value });
    }
  }
}
