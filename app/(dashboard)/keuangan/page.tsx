import Link from "next/link";
import { prisma } from "@/lib/prisma";
import KpiCard from "@/components/KpiCard";
import { Wallet, TrendingDown, TrendingUp, Plus } from "lucide-react";

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function fmtRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

export default async function KeuanganPage() {
  const monthStart = startOfMonth();

  const [incomes, expenses] = await Promise.all([
    prisma.incomeTransaction.findMany({
      where: { date: { gte: monthStart } },
      include: { division: true },
      orderBy: { date: "desc" },
    }),
    prisma.expenseTransaction.findMany({
      where: { date: { gte: monthStart } },
      include: { division: true, category: true },
      orderBy: { date: "desc" },
    }),
  ]);

  const totalIncome = incomes.reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const netProfit = totalIncome - totalExpense;

  // Merge into one feed, most recent first
  const feed = [
    ...incomes.map((t) => ({ id: t.id, type: "income" as const, date: t.date, division: t.division.name, label: t.source, desc: t.description, amount: Number(t.amount) })),
    ...expenses.map((t) => ({ id: t.id, type: "expense" as const, date: t.date, division: t.division.name, label: t.category.name, desc: t.description, amount: Number(t.amount) })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-xl font-medium text-text">Keuangan</h1>
          <p className="text-sm text-text-secondary">Ringkasan bulan ini — semua divisi.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/keuangan/pemasukan" className="inline-flex items-center gap-1.5 text-sm font-medium bg-ink text-white px-4 py-2 rounded-xl hover:bg-ink-soft transition-colors">
            <Plus size={16} /> Pemasukan
          </Link>
          <Link href="/keuangan/pengeluaran" className="inline-flex items-center gap-1.5 text-sm font-medium bg-white border border-slate-200 text-text px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">
            <Plus size={16} /> Pengeluaran
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Pendapatan" value={fmtRupiah(totalIncome)} icon={Wallet} />
        <KpiCard label="Pengeluaran" value={fmtRupiah(totalExpense)} icon={TrendingDown} />
        <KpiCard label="Laba Bersih" value={fmtRupiah(netProfit)} icon={TrendingUp} signature />
      </div>

      <div className="card">
        <p className="font-display font-medium text-text mb-4">Transaksi Bulan Ini</p>

        {feed.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-sm mb-4">Belum ada transaksi. Mulai catat pemasukan atau pengeluaran pertama.</p>
            <div className="flex justify-center gap-2">
              <Link href="/keuangan/pemasukan" className="text-sm font-medium text-primary hover:underline">+ Tambah Pemasukan</Link>
              <span className="text-text-secondary">·</span>
              <Link href="/keuangan/pengeluaran" className="text-sm font-medium text-primary hover:underline">+ Tambah Pengeluaran</Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-slate-100">
                  <th className="pb-2 font-medium">Tanggal</th>
                  <th className="pb-2 font-medium">Divisi</th>
                  <th className="pb-2 font-medium">Kategori</th>
                  <th className="pb-2 font-medium">Deskripsi</th>
                  <th className="pb-2 font-medium text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {feed.map((t) => (
                  <tr key={`${t.type}-${t.id}`} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 text-text-secondary">{fmtDate(t.date)}</td>
                    <td className="py-2.5">{t.division}</td>
                    <td className="py-2.5">{t.label}</td>
                    <td className="py-2.5 text-text-secondary">{t.desc || "—"}</td>
                    <td className={`py-2.5 text-right font-medium ${t.type === "income" ? "text-success" : "text-danger"}`}>
                      {t.type === "income" ? "+" : "−"} {fmtRupiah(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
