/**
 * Date Utility Layer — Timezone-Aware
 * 
 * ALL date functions derive from the actual system clock via `new Date()`.
 * Nothing is hard-coded. New months, years, leap years all work automatically.
 * 
 * Default timezone: Asia/Manila (configurable via settings)
 */

import { format, startOfDay, endOfDay, startOfMonth, endOfMonth,
  startOfYear, endOfYear, subMonths, subYears, addMonths, addYears,
  isWithinInterval, isSameDay, isValid,
  getDaysInMonth as fnsGetDaysInMonth, isLeapYear as fnsIsLeapYear,
  differenceInDays, startOfQuarter, endOfQuarter, getDay, parseISO,
  eachMonthOfInterval, isBefore, isAfter, isFuture
} from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

const DEFAULT_TIMEZONE = 'Asia/Manila';

/**
 * Get the current date/time in the configured timezone
 */
export function getNow(timezone = DEFAULT_TIMEZONE) {
  return toZonedTime(new Date(), timezone);
}

/**
 * Get today's date (start of day) in the configured timezone
 */
export function getToday(timezone = DEFAULT_TIMEZONE) {
  return startOfDay(getNow(timezone));
}

/**
 * Get current month number (1-12)
 */
export function getCurrentMonth(timezone = DEFAULT_TIMEZONE) {
  return getNow(timezone).getMonth() + 1;
}

/**
 * Get current month name
 */
export function getCurrentMonthName(timezone = DEFAULT_TIMEZONE) {
  return format(getNow(timezone), 'MMMM');
}

/**
 * Get current year
 */
export function getCurrentYear(timezone = DEFAULT_TIMEZONE) {
  return getNow(timezone).getFullYear();
}

/**
 * Get current day of month
 */
export function getCurrentDay(timezone = DEFAULT_TIMEZONE) {
  return getNow(timezone).getDate();
}

/**
 * Get current weekday name
 */
export function getCurrentWeekday(timezone = DEFAULT_TIMEZONE) {
  return format(getNow(timezone), 'EEEE');
}

/**
 * Format a date for display
 */
export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, formatStr);
}

/**
 * Format a date with time
 */
export function formatDateTime(date, timezone = DEFAULT_TIMEZONE) {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return formatInTimeZone(d, timezone, 'MMM dd, yyyy hh:mm a');
}

/**
 * Format a date for storage (ISO string without time)
 */
export function toStorageDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return '';
  return format(d, 'yyyy-MM-dd');
}

/**
 * Parse a storage date string back to Date
 */
export function fromStorageDate(dateStr) {
  if (!dateStr) return null;
  const d = parseISO(dateStr);
  return isValid(d) ? d : null;
}

/**
 * Get month name from month number (1-12)
 */
export function getMonthName(monthNum) {
  if (monthNum < 1 || monthNum > 12) return '';
  const d = new Date(2000, monthNum - 1, 1);
  return format(d, 'MMMM');
}

/**
 * Get short month name from month number (1-12)
 */
export function getShortMonthName(monthNum) {
  if (monthNum < 1 || monthNum > 12) return '';
  const d = new Date(2000, monthNum - 1, 1);
  return format(d, 'MMM');
}

/**
 * Get month number from a date
 */
export function getMonthFromDate(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d.getMonth() + 1;
}

/**
 * Get year from a date
 */
export function getYearFromDate(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d.getFullYear();
}

/**
 * Get number of days in a given month/year
 */
export function getDaysInMonth(year, month) {
  return fnsGetDaysInMonth(new Date(year, month - 1));
}

/**
 * Check if a year is a leap year
 */
export function isLeapYear(year) {
  return fnsIsLeapYear(new Date(year, 0, 1));
}

/**
 * Check if a date is within a range (inclusive)
 */
export function isDateInRange(date, startDate, endDate) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  if (!isValid(d) || !isValid(start) || !isValid(end)) return false;
  
  return isWithinInterval(d, { start: startOfDay(start), end: endOfDay(end) });
}

/**
 * Check if two dates are the same day
 */
export function isSameDayCheck(date1, date2) {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
}

/**
 * Check if a date is in a given month/year
 */
export function isInMonth(date, month, year) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d.getMonth() + 1 === month && d.getFullYear() === year;
}

/**
 * Check if a date is in a given year
 */
export function isInYear(date, year) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d.getFullYear() === year;
}

/**
 * Check if a date is today
 */
export function isToday(date, timezone = DEFAULT_TIMEZONE) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isSameDay(d, getNow(timezone));
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isFuture(d);
}

/**
 * Get date range for predefined periods
 */
export function getDateRange(period, timezone = DEFAULT_TIMEZONE) {
  const now = getNow(timezone);
  
  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'thisWeek': {
      const dayOfWeek = getDay(now);
      const start = new Date(now);
      start.setDate(start.getDate() - dayOfWeek);
      return { start: startOfDay(start), end: endOfDay(now) };
    }
    case 'thisMonth':
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'lastMonth': {
      const lastMonth = subMonths(now, 1);
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
    }
    case 'thisQuarter':
      return { start: startOfQuarter(now), end: endOfQuarter(now) };
    case 'thisYear':
      return { start: startOfYear(now), end: endOfYear(now) };
    case 'lastYear': {
      const lastYear = subYears(now, 1);
      return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
    }
    case 'last3Months': {
      return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
    }
    case 'last6Months': {
      return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) };
    }
    case 'last12Months': {
      return { start: startOfMonth(subMonths(now, 11)), end: endOfMonth(now) };
    }
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
}

/**
 * Get all months between two dates
 */
export function getMonthsBetween(startDate, endDate) {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return eachMonthOfInterval({ start, end }).map(d => ({
    month: d.getMonth() + 1,
    year: d.getFullYear(),
    label: format(d, 'MMM yyyy'),
    date: d
  }));
}

/**
 * Get all unique years from a list of dates
 */
export function getUniqueYears(dates) {
  const years = new Set(dates.map(d => {
    const date = typeof d === 'string' ? parseISO(d) : d;
    return date.getFullYear();
  }));
  return [...years].sort((a, b) => b - a);
}

/**
 * Build calendar grid for a given month/year
 * Returns array of weeks, each containing 7 day objects
 */
export function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
  
  const grid = [];
  let currentWeek = [];
  
  // Fill leading empty days
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }
  
  // Fill month days
  for (let day = 1; day <= daysInMonth; day++) {
    currentWeek.push(new Date(year, month - 1, day));
    if (currentWeek.length === 7) {
      grid.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Fill trailing empty days
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    grid.push(currentWeek);
  }
  
  return grid;
}

/**
 * Validate a date string
 */
export function isValidDate(dateStr) {
  if (!dateStr) return false;
  const d = parseISO(dateStr);
  return isValid(d);
}

/**
 * Get start of month for a given month/year
 */
export function getMonthStart(year, month) {
  return startOfMonth(new Date(year, month - 1));
}

/**
 * Get end of month for a given month/year
 */
export function getMonthEnd(year, month) {
  return endOfMonth(new Date(year, month - 1));
}

/**
 * Get start of year
 */
export function getYearStart(year) {
  return startOfYear(new Date(year, 0));
}

/**
 * Get end of year
 */
export function getYearEnd(year) {
  return endOfYear(new Date(year, 11));
}

// Re-export commonly used date-fns functions
export { format, parseISO, isValid, isBefore, isAfter, subMonths, addMonths, subYears, addYears, differenceInDays };
