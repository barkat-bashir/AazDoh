/**
 * Timezone-Safe Date Utility Functions for AazDoh
 * Avoids UTC drift from new Date().toISOString()
 */

/**
 * Formats a Date object to 'YYYY-MM-DD' in the user's local timezone.
 */
export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date string 'YYYY-MM-DD' in user's local timezone.
 */
export function getLocalTodayStr(): string {
  return formatLocalDate(new Date());
}

/**
 * Returns yesterday's date string 'YYYY-MM-DD' in user's local timezone.
 */
export function getLocalYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatLocalDate(d);
}

/**
 * Returns tomorrow's date string 'YYYY-MM-DD' in user's local timezone.
 */
export function getLocalTomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatLocalDate(d);
}

/**
 * Returns date in N days 'YYYY-MM-DD' in user's local timezone.
 */
export function getLocalDateInDaysStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatLocalDate(d);
}

/**
 * Returns upcoming Saturday 'YYYY-MM-DD' in user's local timezone.
 */
export function getLocalNextWeekendStr(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 6 ? 1 : 6 - day; // Saturday
  d.setDate(d.getDate() + diff);
  return formatLocalDate(d);
}

/**
 * Parses a 'YYYY-MM-DD' string safely into a local Date object.
 */
export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date();
}
