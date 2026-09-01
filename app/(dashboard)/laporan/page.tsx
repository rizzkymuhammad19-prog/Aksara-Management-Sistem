import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPeriodRange, Period } from "@/lib/dateRange";
import KpiCard from "@/components/KpiCard";
import ExportButtons from "@/components/ExportButtons";
import DivisionFilter from "@/components/DivisionFilter";
import { Wallet, TrendingDown, TrendingUp, ClipboardCheck, Palette, Users, Lock } from "lucide-react";

function fmtRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

const TABS: { key: Period; label: string }[] = [
  { key: "harian", label: "Harian" },
  { key: "mingguan", label: "Mingguan" },
  { key: "bulanan", label: "Bulanan" },
];

export default async function LaporanPage({ searchParams }: { searchParams: { period?: string; divisionId?: string } }) {
  const session = await getServerSession(authOptions);
  const isDirector = session?.user.role === "DIRECTOR";

  if (!isDirector) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="card text-center py-12">
          <div className="h-12 w-12 rounded-xl bg-primary-light flex items-center justify-center text-primary mx-auto mb-4">
            <Lock size={22} />
          </div>
          <p className="text-text font-medium mb-1">Halaman ini khusus Direktur</p>
          <p className="text-sm text-text-secondary">Laporan berisi data pendapatan dan laba-rugi perusahaan.</p>
        </div>
      </div>
    );
  }

  const period = (["harian", "mingguan", "bulanan"].includes(searchParams.period || "") ? searchParams.period : "bulanan") as Period;
  const { start, end, label } = getPeriodRange(period);
  const divisionId = searchParams.divisionId || undefined;

  const allDivisions = await prisma.division.findMany({ orderBy: { name: "asc" } });
  const selectedDivision = divisionId ? allDivisions.find((d) => d.id === divisionId) : null;

  const [incomes, expenses, attendanceRecords, employeeCount, designCount] = await Promise.all([
    prisma.incomeTransaction.findMany({ where: { date: { gte: start, lte: end }, ...(divisionId ? { divisionId } : {}) } }),
    prisma.expenseTransaction.findMany({ where: { date: { gte: start, lte: end }, ...(divisionId ? { divisionId } : {}) } }),
    prisma.attendance.findMany({
      where: { date: { gte: start, lte: end }, ...(divisionId ? { employee: { divisionId } } : {}) },
    }),
    prisma.employee.count({ where: divisionId ? { divisionId } : {} }),
    prisma.designTask.count({ where: { date: { gte: start, lte: end }, ...(divisionId ? { divisionId } : {}) } }),
  ]);

  const totalIncome = incomes.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const netProfit = totalIncome - totalExpense;
  const margin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  const presentCount = attendanceRecords.filter((a) => a.status === "HADIR" || a.status === "TERLAMBAT").length;
  const attendanceRate = attendanceRecords.length > 0 ? Math.round((presentCount / attendanceRecords.length) * 100) : 0;

  let divisionRanking: { name: string; laba: number }[] = [];
  if (!divisionId) {
    const [allIncomes, allExpenses] = await Promise.all([
      prisma.incomeTransaction.findMany({ where: { date: { gte: start, lte: end } } }),
      prisma.expenseTransaction.findMany({ where: { date: { gte: start, lte: end } } }),
    ]);
    divisionRanking = allDivisions
      .map((div) => {
        const divIncome = allIncomes.filter((i) => i.divisionId === div.id).reduce((s, t) => s + Number(t.amount), 0);
        const divExpense = allExpenses.filter((e) => e.divisionId === div.id).reduce((s, t) => s + Number(t.amount), 0);
        return { name: div.name, laba: divIncome - divExpense };
      })
      .sort((a, b) => b.laba - a.laba);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-xl font-medium text-text">Laporan Eksekutif</h1>
          <p className="text-sm text-text-secondary">{label} — {selectedDivision ? selectedDivision.name : "seluruh divisi"}.</p>
        </div>
        <ExportButtons period={period} divisionId={divisionId} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/laporan?period=${tab.key}${divisionId ? `&divisionId=${divisionId}` : ""}`}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === tab.key ? "bg-white text-text shadow-sm" : "text-text-secondary hover:text-text"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <DivisionFilter divisions={allDivisions.map((d) => ({ id: d.id, name: d.name }))} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Pendapatan" value={fmtRupiah(totalIncome)} icon={Wallet} />
        <KpiCard label="Pengeluaran" value={fmtRupiah(totalExpense)} icon={TrendingDown} />
        <KpiCard label="Laba Bersih" value={`${fmtRupiah(netProfit)} (${margin}%)`} icon={TrendingUp} signature />
        <KpiCard label="Kehadiran" value={`${attendanceRate}%`} icon={ClipboardCheck} />
        <KpiCard label="Total Karyawan" value={String(employeeCount)} icon={Users} />
        <KpiCard label="Design" value={String(designCount)} icon={Palette} />
      </div>

      {!divisionId && (
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
      )}

      <div className="card">
        <p className="text-sm text-text-secondary">
          Untuk ranking produktivitas karyawan secara lengkap, buka halaman <Link href="/performance" className="text-primary hover:underline">Performance</Link>.
          {selectedDivision && (
            <> Atau lihat dashboard lengkap divisi ini di <Link href={`/divisi/${selectedDivision.slug}`} className="text-primary hover:underline">halaman Divisi</Link>.</>
          )}
        </p>
      </div>
    </div>
  );
}
