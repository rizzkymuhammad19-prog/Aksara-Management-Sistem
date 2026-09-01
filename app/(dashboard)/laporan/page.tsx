import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPeriodRange, Period } from "@/lib/dateRange";
import KpiCard from "@/components/KpiCard";
import ExportButtons from "@/components/ExportButtons";
import { Wallet, TrendingDown, TrendingUp, ClipboardCheck, Palette } from "lucide-react";

function fmtRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const TABS: { key: Period; label: string }[] = [
  { key: "harian", label: "Harian" },
  { key: "mingguan", label: "Mingguan" },
  { key: "bulanan", label: "Bulanan" },
];

export default async function LaporanPage({ searchParams }: { searchParams: { period?: string } }) {
  const period = (["harian", "mingguan", "bulanan"].includes(searchParams.period || "") ? searchParams.period : "bulanan") as Period;
  const { start, end, label } = getPeriodRange(period);

  const [divisions, incomes, expenses, attendanceRecords, employeeCount, designCount] = await Promise.all([
    prisma.division.findMany(),
    prisma.incomeTransaction.findMany({ where: { date: { gte: start, lte: end } } }),
    prisma.expenseTransaction.findMany({ where: { date: { gte: start, lte: end } } }),
    prisma.attendance.findMany({ where: { date: { gte: start, lte: end } } }),
    prisma.employee.count(),
    prisma.designTask.count({ where: { date: { gte: start, lte: end } } }),
  ]);

  const totalIncome = incomes.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const netProfit = totalIncome - totalExpense;
  const margin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  const presentCount = attendanceRecords.filter((a) => a.status === "HADIR" || a.status === "TERLAMBAT").length;
  const attendanceRate = attendanceRecords.length > 0 ? Math.round((presentCount / attendanceRecords.length) * 100) : 0;

  const divisionRanking = divisions
    .map((div) => {
      const divIncome = incomes.filter((i) => i.divisionId === div.id).reduce((s, t) => s + Number(t.amount), 0);
      const divExpense = expenses.filter((e) => e.divisionId === div.id).reduce((s, t) => s + Number(t.amount), 0);
      return { name: div.name, laba: divIncome - divExpense };
    })
    .sort((a, b) => b.laba - a.laba);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-xl font-medium text-text">Laporan Eksekutif</h1>
          <p className="text-sm text-text-secondary">{label} — seluruh divisi.</p>
        </div>
        <ExportButtons period={period} />
      </div>

      <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/laporan?period=${tab.key}`}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === tab.key ? "bg-white text-text shadow-sm" : "text-text-secondary hover:text-text"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Pendapatan" value={fmtRupiah(totalIncome)} icon={Wallet} />
        <KpiCard label="Pengeluaran" value={fmtRupiah(totalExpense)} icon={TrendingDown} />
        <KpiCard label="Laba Bersih" value={`${fmtRupiah(netProfit)} (${margin}%)`} icon={TrendingUp} signature />
        <KpiCard label="Kehadiran" value={`${attendanceRate}%`} icon={ClipboardCheck} />
        <KpiCard label="Total Karyawan" value={String(employeeCount)} icon={Wallet} />
        <KpiCard label="Design" value={String(designCount)} icon={Palette} />
      </div>

      <div className="card">
        <p className="font-display font-medium text-text mb-4">Ranking Divisi Berdasarkan Laba</p>
        <div className="space-y-3">
          {divisionRanking.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between border-b border-slate-50 last:border-0 pb-3 last:pb-0">
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 rounded-full bg-primary-light text-primary text-xs font-medium flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm text-text">{d.name}</span>
              </div>
              <span className={`text-sm font-medium ${d.laba >= 0 ? "text-success" : "text-danger"}`}>{fmtRupiah(d.laba)}</span>
            </div>
          ))}
          {divisionRanking.length === 0 && <p className="text-sm text-text-secondary">Belum ada data divisi.</p>}
        </div>
      </div>

      <div className="card">
        <p className="text-sm text-text-secondary">
          Untuk ranking produktivitas karyawan secara lengkap, buka halaman <Link href="/performance" className="text-primary hover:underline">Performance</Link>.
        </p>
      </div>
    </div>
  );
}
