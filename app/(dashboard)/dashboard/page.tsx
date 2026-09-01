import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import KpiCard from "@/components/KpiCard";
import RevenueChart from "@/components/charts/RevenueChart";
import ProfitByDivisionChart from "@/components/charts/ProfitByDivisionChart";
import AttendanceDonut from "@/components/charts/AttendanceDonut";
import { Wallet, TrendingDown, TrendingUp, Users, ClipboardCheck, Palette, PiggyBank } from "lucide-react";

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function fmtRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const isDirector = session?.user.role === "DIRECTOR";
  const monthStart = startOfMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [divisions, incomes, expenses, employeesCount, todayAttendance, designThisMonth, settings, allTimeIncomeAgg, allTimeExpenseAgg] = await Promise.all([
    prisma.division.findMany(),
    isDirector ? prisma.incomeTransaction.findMany({ where: { date: { gte: monthStart } } }) : Promise.resolve([]),
    prisma.expenseTransaction.findMany({ where: { date: { gte: monthStart } } }),
    prisma.employee.count(),
    prisma.attendance.findMany({ where: { date: { gte: today } } }),
    prisma.designTask.count({ where: { date: { gte: monthStart } } }),
    isDirector ? prisma.setting.findUnique({ where: { id: "default" } }) : Promise.resolve(null),
    isDirector ? prisma.incomeTransaction.aggregate({ _sum: { amount: true } }) : Promise.resolve(null),
    isDirector ? prisma.expenseTransaction.aggregate({ _sum: { amount: true } }) : Promise.resolve(null),
  ]);

  const totalIncome = incomes.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
  const netProfit = totalIncome - totalExpense;
  const hadirToday = todayAttendance.filter((a) => a.status === "HADIR" || a.status === "TERLAMBAT").length;

  const saldoKas = isDirector
    ? Number(settings?.openingBalance || 0) + Number(allTimeIncomeAgg?._sum.amount || 0) - Number(allTimeExpenseAgg?._sum.amount || 0)
    : 0;

  const profitByDivision = isDirector
    ? divisions.map((div) => {
        const divIncome = incomes.filter((i) => i.divisionId === div.id).reduce((s, t) => s + Number(t.amount), 0);
        const divExpense = expenses.filter((e) => e.divisionId === div.id).reduce((s, t) => s + Number(t.amount), 0);
        return { division: div.name, laba: divIncome - divExpense };
      })
    : [];

  const attendanceBreakdown = [
    { name: "Hadir", value: todayAttendance.filter((a) => a.status === "HADIR").length },
    { name: "Terlambat", value: todayAttendance.filter((a) => a.status === "TERLAMBAT").length },
    { name: "Izin", value: todayAttendance.filter((a) => a.status === "IZIN").length },
    { name: "Sakit", value: todayAttendance.filter((a) => a.status === "SAKIT").length },
    { name: "Tidak Hadir", value: Math.max(employeesCount - todayAttendance.length, 0) },
  ];

  const trend = [{ period: "Bulan ini", pendapatan: totalIncome, pengeluaran: totalExpense, laba: netProfit }];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-medium text-text">
          Selamat Datang, {isDirector ? "Direktur" : session?.user.name}
        </h1>
        <p className="text-sm text-text-secondary">
          {today.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isDirector && <KpiCard label="Saldo Kas" value={fmtRupiah(saldoKas)} icon={PiggyBank} signature />}
        {isDirector && <KpiCard label="Pendapatan Bulan Ini" value={fmtRupiah(totalIncome)} icon={Wallet} />}
        <KpiCard label="Pengeluaran Bulan Ini" value={fmtRupiah(totalExpense)} icon={TrendingDown} />
        {isDirector && <KpiCard label="Laba Bersih Bulan Ini" value={fmtRupiah(netProfit)} icon={TrendingUp} />}
        <KpiCard label="Total Karyawan" value={String(employeesCount)} icon={Users} />
        <KpiCard label="Kehadiran Hari Ini" value={`${hadirToday}/${employeesCount}`} icon={ClipboardCheck} />
        <KpiCard label="Design Bulan Ini" value={String(designThisMonth)} icon={Palette} />
      </div>

      {isDirector && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={trend} />
          <ProfitByDivisionChart data={profitByDivision} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AttendanceDonut data={attendanceBreakdown} />

        <div className="lg:col-span-2 card">
          <p className="font-display font-medium text-text mb-4">Ringkasan Divisi</p>
          <div className="space-y-3">
            {divisions.map((div) => {
              const divExpense = expenses.filter((e) => e.divisionId === div.id).reduce((s, t) => s + Number(t.amount), 0);
              const divIncome = isDirector ? incomes.filter((i) => i.divisionId === div.id).reduce((s, t) => s + Number(t.amount), 0) : 0;
              return (
                <div key={div.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0">
                  <span className="text-sm font-medium text-text">{div.name}</span>
                  <div className="flex gap-6 text-sm">
                    {isDirector ? (
                      <>
                        <span className="text-text-secondary">Pendapatan: {fmtRupiah(divIncome)}</span>
                        <span className={divIncome - divExpense >= 0 ? "text-success" : "text-danger"}>
                          Laba: {fmtRupiah(divIncome - divExpense)}
                        </span>
                      </>
                    ) : (
                      <span className="text-text-secondary">Pengeluaran: {fmtRupiah(divExpense)}</span>
                    )}
                  </div>
                </div>
              );
            })}
            {divisions.length === 0 && (
              <p className="text-sm text-text-secondary">Belum ada data divisi.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
