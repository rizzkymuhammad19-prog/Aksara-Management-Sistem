import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import KpiCard from "@/components/KpiCard";
import RevenueChart from "@/components/charts/RevenueChart";
import { Wallet, TrendingDown, TrendingUp, Users, ListTodo, Palette, ChevronLeft } from "lucide-react";

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function fmtRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function DivisionDetailPage({ params }: { params: { slug: string } }) {
  const division = await prisma.division.findUnique({ where: { slug: params.slug } });
  if (!division) notFound();

  const monthStart = startOfMonth();

  const [employees, incomes, expenses, tasksDone, designCount] = await Promise.all([
    prisma.employee.findMany({ where: { divisionId: division.id }, include: { user: true } }),
    prisma.incomeTransaction.findMany({ where: { divisionId: division.id, date: { gte: monthStart } } }),
    prisma.expenseTransaction.findMany({ where: { divisionId: division.id, date: { gte: monthStart } } }),
    prisma.task.count({ where: { divisionId: division.id, status: "DONE" } }),
    prisma.designTask.count({ where: { divisionId: division.id, date: { gte: monthStart } } }),
  ]);

  const totalIncome = incomes.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const netProfit = totalIncome - totalExpense;

  const trend = [{ period: "Bulan ini", pendapatan: totalIncome, pengeluaran: totalExpense, laba: netProfit }];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/divisi" className="text-sm text-text-secondary hover:text-primary inline-flex items-center gap-1 mb-2">
          <ChevronLeft size={16} /> Divisi
        </Link>
        <h1 className="font-display text-xl font-medium text-text">{division.name}</h1>
        <p className="text-sm text-text-secondary">Dashboard divisi — bulan ini</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Pendapatan" value={fmtRupiah(totalIncome)} icon={Wallet} />
        <KpiCard label="Pengeluaran" value={fmtRupiah(totalExpense)} icon={TrendingDown} />
        <KpiCard label="Laba Bersih" value={fmtRupiah(netProfit)} icon={TrendingUp} signature />
        <KpiCard label="Karyawan" value={String(employees.length)} icon={Users} />
        <KpiCard label="Task Selesai" value={String(tasksDone)} icon={ListTodo} />
        <KpiCard label="Design Bulan Ini" value={String(designCount)} icon={Palette} />
      </div>

      <RevenueChart data={trend} />

      <div className="card">
        <p className="font-display font-medium text-text mb-4">Karyawan {division.name}</p>
        <div className="space-y-3">
          {employees.map((emp) => (
            <div key={emp.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0">
              <div>
                <p className="text-sm font-medium text-text">{emp.user.name}</p>
                <p className="text-xs text-text-secondary">{emp.position}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary-light text-primary">
                {emp.isDesigner ? "Designer" : "Staff"}
              </span>
            </div>
          ))}
          {employees.length === 0 && (
            <p className="text-sm text-text-secondary">Belum ada karyawan di divisi ini.</p>
          )}
        </div>
      </div>
    </div>
  );
}
