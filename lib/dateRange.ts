import { getJakartaParts } from "./jakarta";

export type Period = "harian" | "mingguan" | "bulanan" | "tahunan";

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

function jakartaMidnightUtc(year: number, month: number, day: number): Date {
  // month is 1-12
  return new Date(Date.UTC(year, month - 1, day) - JAKARTA_OFFSET_MS);
}

export function getPeriodRange(period: Period): { start: Date; end: Date; label: string } {
  const { year, month, day } = getJakartaParts();

  if (period === "harian") {
    const start = jakartaMidnightUtc(year, month, day);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1000);
    return { start, end, label: "Hari ini" };
  }

  if (period === "mingguan") {
    // Weekday of the Jakarta calendar date (0=Sun..6=Sat), computed safely via a UTC noon anchor
    const anchor = new Date(Date.UTC(year, month - 1, day, 12));
    const weekday = anchor.getUTCDay();
    const diffToMonday = weekday === 0 ? -6 : 1 - weekday;

    const mondayAnchor = new Date(Date.UTC(year, month - 1, day + diffToMonday, 12));
    const start = jakartaMidnightUtc(mondayAnchor.getUTCFullYear(), mondayAnchor.getUTCMonth() + 1, mondayAnchor.getUTCDate());
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1000);
    return { start, end, label: "Minggu ini" };
  }

  if (period === "tahunan") {
    const start = jakartaMidnightUtc(year, 1, 1);
    const end = jakartaMidnightUtc(year + 1, 1, 1);
    end.setTime(end.getTime() - 1000);
    return { start, end, label: `Tahun ${year}` };
  }

  // bulanan (default)
  const start = jakartaMidnightUtc(year, month, 1);
  const nextMonth = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  const end = new Date(jakartaMidnightUtc(nextMonth.y, nextMonth.m, 1).getTime() - 1000);
  return { start, end, label: "Bulan ini" };
}
