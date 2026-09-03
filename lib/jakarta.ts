const JAKARTA_TZ = "Asia/Jakarta";

/** Wall-clock date/time parts in Asia/Jakarta (WIB, UTC+7, no DST), regardless of server timezone. */
export function getJakartaParts(date: Date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: JAKARTA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const hour = get("hour");
  return {
    year: get("year"),
    month: get("month"), // 1-12
    day: get("day"),
    hour: hour === 24 ? 0 : hour,
    minute: get("minute"),
    second: get("second"),
  };
}

/**
 * A Date representing "today" as a date-only value (00:00 UTC on Jakarta's current
 * calendar day) — correct for Prisma `@db.Date` columns (attendance.date,
 * income/expense.date, etc.), which only store the calendar date, not a time.
 */
export function jakartaTodayDateOnly(): Date {
  const { year, month, day } = getJakartaParts();
  return new Date(Date.UTC(year, month - 1, day));
}

/** Real UTC instant for 00:00:00 WIB on Jakarta's current calendar day — for DateTime range queries. */
export function jakartaStartOfToday(): Date {
  const { year, month, day } = getJakartaParts();
  return new Date(Date.UTC(year, month - 1, day) - 7 * 60 * 60 * 1000);
}

export function jakartaEndOfToday(): Date {
  return new Date(jakartaStartOfToday().getTime() + 24 * 60 * 60 * 1000 - 1000);
}

export function jakartaStartOfMonth(): Date {
  const { year, month } = getJakartaParts();
  return new Date(Date.UTC(year, month - 1, 1) - 7 * 60 * 60 * 1000);
}

/** Formats a time as HH:mm in WIB. */
export function formatJakartaTime(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { timeZone: JAKARTA_TZ, hour: "2-digit", minute: "2-digit" }).format(date);
}

/** Formats a full date (e.g. "Kamis, 3 September 2026") in WIB. */
export function formatJakartaDateLong(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", { timeZone: JAKARTA_TZ, weekday: "long", year: "numeric", month: "long", day: "numeric" }).format(date);
}

/**
 * Given the WIB clock-in deadline "HH:mm" (from Settings.clockInTime), returns whether
 * the current WIB time is at/before that deadline — used to decide Hadir vs Terlambat.
 */
export function isBeforeJakartaDeadline(deadlineHHmm: string): boolean {
  const { hour, minute } = getJakartaParts();
  const [dh, dm] = deadlineHHmm.split(":").map(Number);
  return hour < dh || (hour === dh && minute <= dm);
}
