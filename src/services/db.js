/**
 * IndexedDB Database Definition using Dexie.js
 * 
 * Schema designed for the hotel accounting system.
 * Indexes optimized for multi-dimensional filtering.
 */

import Dexie from 'dexie';

const db = new Dexie('HamersonsHotelAccounting');

db.version(1).stores({
  // Transactions table (both income and expenses)
  // One transaction = one record = many automatic views
  transactions: '++id, type, date, categoryId, departmentId, paymentMethodId, [type+date], [type+categoryId], [type+paymentMethodId], isDemo',
  
  // Categories (expense and income categories)
  categories: '++id, name, type, isActive, isDefault',
  
  // Payment methods
  paymentMethods: '++id, name, isActive, isDefault',
  
  // Departments
  departments: '++id, name, isActive, isDefault',
  
  // Settings (single record)
  settings: 'key'
});

export default db;
