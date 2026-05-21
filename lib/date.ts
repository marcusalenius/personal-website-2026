// All date math uses UTC to avoid timezone-dependent sorting.

const MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const MONTH_DAY = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const MONTH_DAY_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatMonthYear(date: string | Date): string {
  return MONTH_YEAR.format(new Date(date));
}

export function formatMonthDay(date: string | Date): string {
  return MONTH_DAY.format(new Date(date));
}

export function formatMonthDayYear(date: string | Date): string {
  return MONTH_DAY_YEAR.format(new Date(date));
}
