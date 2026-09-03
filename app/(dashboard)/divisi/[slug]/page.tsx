import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPeriodRange, Period } from "@/lib/dateRange";
import KpiCard from "@/components/KpiCard";
import RevenueChart from "@/components/charts/RevenueChart";
import ExportButtons from "@/components/ExportButtons";
import { Wallet, TrendingDown, TrendingUp, Users, ListTodo, Palette, ChevronLeft, Plus, PiggyBank, Pencil } from "lucide-react";

function fmtRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

const TABS: { key: Period; label: string }[] = [
  { key: "harian", label: "Harian" },
  { key: "mingguan", label: "Mingguan" },
  { key: "bulanan", label: "Bulanan" },
];

export default async function DivisionDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { period?: string };
}) {
  const division = await prisma.division.findUnique({ where: { slug: params.slug } });
  if (!division) notFound();

  const session = await getServerSession(authOptions);
  const isDirector = session?.user.role === "DIRECTOR";

  const period = (["harian", "mingguan", "bulanan"].includes(searchParams.period || "") ? searchParams.period : "bulanan") as Period;
  const { start, end, label } = getPeriodRange(period);

  const [employees, incomes, expenses, tasksDone, designCount] = await Promise.all([
    prisma.employee.findMany({ where: { divisionId: division.id }, include: { user: true } }),
    isDirector
      ? prisma.incomeTransaction.findMany({ where: { divisionId: division.id, date: { gte: start, lte: end } }, orderBy: { date: "desc" } })
      : Promise.resolve([]),
    prisma.expenseTransaction.findMany({ where: { divisionId: division.id, date: { gte: start, lte: end } }, include: { category: true }, orderBy: { date: "desc" } }),
    prisma.task.count({ where: { divisionId: division.id, status: "DONE" } }),
    prisma.designTask.count({ where: { divisionId: division.id, date: { gte: start, lte: end } } }),
  ]);

  const totalIncome = incomes.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const netProfit = totalIncome - totalExpense;

  let saldoKasDivisi = 0;
  if (isDirector) {
    const [allTimeIncomeAgg, allTimeExpenseAgg] = await Promise.all([
      prisma.incomeTransaction.aggregate({ where: { divisionId: division.id }, _sum: { amount: true } }),
      prisma.expenseTransaction.aggregate({ where: { divisionId: division.id }, _sum: { amount: true } }),
    ]);
    saldoKasDivisi = Number(division.openingBalance) + Number(allTimeIncomeAgg._sum.amount || 0) - Number(allTimeExpenseAgg._sum.amount || 0);
  }

  const trend = [{ period: label, pendapatan: totalIncome, pengeluaran: totalExpense, laba: netProfit }];

  const feed = isDirector
    ? [
        ...incomes.map((t) => ({ id: t.id, type: "income" as const, date: t.date, label: t.source })),
        ...expenses.map((t) => ({ id: t.id, type: "expense" as const, date: t.date, label: t.category.name, amount: Number(t.amount) })),
      ]
    : expenses.map((t) => ({ id: t.id, type: "expense" as const, date: t.date, label: t.category.name, amount: Number(t.amount) }));

  const sortedFeed = [...feed].sort((a: any, b: any) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link href="/divisi" className="text-sm text-text-secondary hover:text-primary inline-flex items-center gap-1 mb-2">
            <ChevronLeft size={16} /> Divisi
          </Link>
          <h1 className="font-display text-xl font-medium text-text">{division.name}</h1>
          <p className="text-sm text-text-secondary">{label}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/keuangan/pemasukan?divisionId=${division.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium bg-ink text-white px-4 py-2 rounded-xl hover:bg-ink-soft transition-colors">
            <Plus size={16} /> Pemasukan
          </Link>
          <Link href={`/keuangan/pengeluaran?divisionId=${division.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium bg-white border border-slate-200 text-text px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
            <Plus size={16} /> Pengeluaran
          </Link>
          {isDirector && <ExportButtons divisionId={division.id} period={period} />}
        </div>
      </div>

      <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/divisi/${division.slug}?period=${tab.key}`}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === tab.key ? "bg-white text-text shadow-sm" : "text-text-secondary hover:text-text"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isDirector && <KpiCard label="Saldo Kas Divisi" value={fmtRupiah(saldoKasDivisi)} icon={PiggyBank} signature />}
        {isDirector && <KpiCard label="Pendapatan" value={fmtRupiah(totalIncome)} icon={Wallet} />}
        <KpiCard label="Pengeluaran" value={fmtRupiah(totalExpense)} icon={TrendingDown} />
        {isDirector && <KpiCard label="Laba Bersih" value={fmtRupiah(netProfit)} icon={TrendingUp} />}
        <KpiCard label="Karyawan" value={String(employees.length)} icon={Users} />
        <KpiCard label="Task Selesai" value={String(tasksDone)} icon={ListTodo} />
        <KpiCard label="Design" value={String(designCount)} icon={Palette} />
      </div>

      {isDirector && <RevenueChart data={trend} />}

      <div className="card">
        <p className="font-display font-medium text-text mb-4">{isDirector ? `Transaksi — ${label}` : `Pengeluaran — ${label}`}</p>
        {sortedFeed.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-8">Belum ada data pada periode ini.</p>
        ) : (
          <div className="space-y-2">
            {sortedFeed.map((t: any) => (
              <div key={`${t.type}-${t.id}`} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0 text-sm">
                <div>
                  <p className="text-text">{t.label}</p>
                  <p className="text-xs text-text-secondary">{fmtDate(t.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {t.type === "expense" && (
                    <span className="font-medium text-danger">− {fmtRupiah(t.amount)}</span>
                  )}
                  {t.type === "income" && isDirector && (
                    <span className="font-medium text-success">+ {fmtRupiah(t.amount)}</span>
                  )}
                  <Link href={`/keuangan/${t.type === "income" ? "pemasukan" : "pengeluaran"}/${t.id}/edit`} className="text-text-secondary hover:text-primary">
                    <Pencil size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
