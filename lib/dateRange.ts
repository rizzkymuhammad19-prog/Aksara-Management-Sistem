export type Period = "harian" | "mingguan" | "bulanan" | "tahunan";

export function getPeriodRange(period: Period): { start: Date; end: Date; label: string } {
  const now = new Date();

  if (period === "harian") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    return { start, end, label: "Hari ini" };
  }

  if (period === "mingguan") {
    const day = now.getDay(); // 0 = Sunday
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59);
    return { start, end, label: "Minggu ini" };
  }

  if (period === "tahunan") {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    return { start, end, label: `Tahun ${now.getFullYear()}` };
  }

  // bulanan (default)
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end, label: "Bulan ini" };
}
