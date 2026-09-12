/**
 * Calculation Utilities
 * Grouping, aggregation, and comparison functions for transaction data
 */

import { getMonthFromDate, getYearFromDate, getMonthName, isDateInRange, toStorageDate } from './dateUtils';

const sameId = (left, right) => String(left ?? '') === String(right ?? '');

/**
 * Calculate totals from a list of transactions
 */
export function calculateTotals(transactions) {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  return {
    totalIncome: income,
    totalExpenses: expenses,
    netIncome: income - expenses,
    transactionCount: transactions.length,
    incomeCount: transactions.filter(t => t.type === 'income').length,
    expenseCount: transactions.filter(t => t.type === 'expense').length
  };
}

/**
 * Group transactions by category
 */
export function groupByCategory(transactions, categories = []) {
  const groups = {};
  
  transactions.forEach(t => {
    const catId = t.categoryId || 'uncategorized';
    if (!groups[catId]) {
      const cat = categories.find(c => sameId(c.id, catId));
      groups[catId] = {
        categoryId: catId,
        categoryName: cat ? cat.name : 'Uncategorized',
        transactions: [],
        total: 0,
        count: 0
      };
    }
    groups[catId].transactions.push(t);
    groups[catId].total += t.amount || 0;
    groups[catId].count += 1;
  });
  
  return Object.values(groups).sort((a, b) => b.total - a.total);
}

/**
 * Group transactions by month
 */
export function groupByMonth(transactions) {
  const groups = {};
  
  transactions.forEach(t => {
    const month = getMonthFromDate(t.date);
    const year = getYearFromDate(t.date);
    const key = `${year}-${String(month).padStart(2, '0')}`;
    
    if (!groups[key]) {
      groups[key] = {
        key,
        month,
        year,
        monthName: getMonthName(month),
        label: `${getMonthName(month)} ${year}`,
        transactions: [],
        income: 0,
        expenses: 0,
        net: 0,
        count: 0
      };
    }
    
    groups[key].transactions.push(t);
    if (t.type === 'income') {
      groups[key].income += t.amount || 0;
    } else {
      groups[key].expenses += t.amount || 0;
    }
    groups[key].net = groups[key].income - groups[key].expenses;
    groups[key].count += 1;
  });
  
  return Object.values(groups).sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * Group transactions by year
 */
export function groupByYear(transactions) {
  const groups = {};
  
  transactions.forEach(t => {
    const year = getYearFromDate(t.date);
    
    if (!groups[year]) {
      groups[year] = {
        year,
        transactions: [],
        income: 0,
        expenses: 0,
        net: 0,
        count: 0
      };
    }
    
    groups[year].transactions.push(t);
    if (t.type === 'income') {
      groups[year].income += t.amount || 0;
    } else {
      groups[year].expenses += t.amount || 0;
    }
    groups[year].net = groups[year].income - groups[year].expenses;
    groups[year].count += 1;
  });
  
  return Object.values(groups).sort((a, b) => b.year - a.year);
}

/**
 * Group transactions by payment method
 */
export function groupByPaymentMethod(transactions, paymentMethods = []) {
  const groups = {};
  
  transactions.forEach(t => {
    const pmId = t.paymentMethodId || 'unknown';
    if (!groups[pmId]) {
      const pm = paymentMethods.find(p => sameId(p.id, pmId));
      groups[pmId] = {
        paymentMethodId: pmId,
        paymentMethodName: pm ? pm.name : 'Unknown',
        transactions: [],
        total: 0,
        count: 0
      };
    }
    groups[pmId].transactions.push(t);
    groups[pmId].total += t.amount || 0;
    groups[pmId].count += 1;
  });
  
  return Object.values(groups).sort((a, b) => b.total - a.total);
}

/**
 * Group transactions by department
 */
export function groupByDepartment(transactions, departments = []) {
  const groups = {};
  
  transactions.forEach(t => {
    const deptId = t.departmentId || 'unassigned';
    if (!groups[deptId]) {
      const dept = departments.find(d => sameId(d.id, deptId));
      groups[deptId] = {
        departmentId: deptId,
        departmentName: dept ? dept.name : 'Unassigned',
        transactions: [],
        total: 0,
        count: 0
      };
    }
    groups[deptId].transactions.push(t);
    groups[deptId].total += t.amount || 0;
    groups[deptId].count += 1;
  });
  
  return Object.values(groups).sort((a, b) => b.total - a.total);
}

/**
 * Filter transactions by multiple criteria
 */
export function filterTransactions(transactions, filters = {}) {
  return transactions.filter(t => {
    // Type filter
    if (filters.type && t.type !== filters.type) return false;
    
    // Date range filter
    if (filters.startDate && filters.endDate) {
      if (!isDateInRange(t.date, filters.startDate, filters.endDate)) return false;
    }
    
    // Single date filter
    if (filters.date) {
      if (toStorageDate(t.date) !== toStorageDate(filters.date)) return false;
    }
    
    // Month filter
    if (filters.month && filters.year) {
      const tMonth = getMonthFromDate(t.date);
      const tYear = getYearFromDate(t.date);
      if (tMonth !== filters.month || tYear !== filters.year) return false;
    }
    
    // Year-only filter
    if (filters.year && !filters.month) {
      if (getYearFromDate(t.date) !== filters.year) return false;
    }
    
    // Category filter
    if (filters.categoryId && !sameId(t.categoryId, filters.categoryId)) return false;
    
    // Department filter
    if (filters.departmentId && !sameId(t.departmentId, filters.departmentId)) return false;
    
    // Payment method filter
    if (filters.paymentMethodId && !sameId(t.paymentMethodId, filters.paymentMethodId)) return false;
    
    // Search filter (searches description, reference, supplier, notes)
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const searchFields = [
        t.description, t.reference, t.supplier, t.notes
      ].filter(Boolean).join(' ').toLowerCase();
      if (!searchFields.includes(query)) return false;
    }
    
    // Amount range filter
    if (filters.minAmount !== undefined && t.amount < filters.minAmount) return false;
    if (filters.maxAmount !== undefined && t.amount > filters.maxAmount) return false;
    
    return true;
  });
}

/**
 * Sort transactions
 */
export function sortTransactions(transactions, sortBy = 'date', sortOrder = 'desc') {
  return [...transactions].sort((a, b) => {
    let valA, valB;
    
    switch (sortBy) {
      case 'date':
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
        break;
      case 'amount':
        valA = a.amount;
        valB = b.amount;
        break;
      case 'description':
        valA = (a.description || '').toLowerCase();
        valB = (b.description || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      case 'category':
        valA = (a.categoryName || '').toLowerCase();
        valB = (b.categoryName || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      default:
        valA = a[sortBy];
        valB = b[sortBy];
    }
    
    if (sortOrder === 'asc') return valA - valB;
    return valB - valA;
  });
}

/**
 * Paginate an array
 */
export function paginate(items, page = 1, perPage = 25) {
  const totalPages = Math.ceil(items.length / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;
  
  return {
    items: items.slice(start, end),
    page,
    perPage,
    totalPages,
    totalItems: items.length,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

/**
 * Calculate comparison between two sets of transactions
 */
export function calculateComparison(transactionsA, transactionsB) {
  const totalsA = calculateTotals(transactionsA);
  const totalsB = calculateTotals(transactionsB);
  
  const safePercent = (oldVal, newVal) => {
    if (oldVal === 0 && newVal === 0) return 0;
    if (oldVal === 0) return newVal > 0 ? 100 : -100;
    return ((newVal - oldVal) / Math.abs(oldVal)) * 100;
  };
  
  return {
    periodA: totalsA,
    periodB: totalsB,
    incomeDiff: totalsB.totalIncome - totalsA.totalIncome,
    expenseDiff: totalsB.totalExpenses - totalsA.totalExpenses,
    netDiff: totalsB.netIncome - totalsA.netIncome,
    incomeChange: safePercent(totalsA.totalIncome, totalsB.totalIncome),
    expenseChange: safePercent(totalsA.totalExpenses, totalsB.totalExpenses),
    netChange: safePercent(totalsA.netIncome, totalsB.netIncome)
  };
}

/**
 * Get top N items from a grouped result
 */
export function getTopN(groupedData, n = 5) {
  return groupedData.slice(0, n);
}

/**
 * Calculate statistics for a set of transactions
 */
export function calculateStats(transactions) {
  if (transactions.length === 0) {
    return { total: 0, count: 0, average: 0, highest: 0, lowest: 0, median: 0 };
  }
  
  const amounts = transactions.map(t => t.amount || 0).sort((a, b) => a - b);
  const total = amounts.reduce((sum, a) => sum + a, 0);
  const count = amounts.length;
  const mid = Math.floor(count / 2);
  
  return {
    total,
    count,
    average: total / count,
    highest: amounts[count - 1],
    lowest: amounts[0],
    median: count % 2 === 0 ? (amounts[mid - 1] + amounts[mid]) / 2 : amounts[mid]
  };
}
