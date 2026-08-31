import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Building2, ArrowRight, Users, Plus } from "lucide-react";

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function fmtRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default async function DivisiPage() {
  const monthStart = startOfMonth();

  const divisions = await prisma.division.findMany({
    include: {
      employees: true,
      incomes: { where: { date: { gte: monthStart } } },
      expenses: { where: { date: { gte: monthStart } } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-xl font-medium text-text">Divisi</h1>
          <p className="text-sm text-text-secondary">Klik salah satu untuk lihat dashboard lengkapnya.</p>
        </div>
        <Link href="/divisi/tambah" className="inline-flex items-center gap-1.5 text-sm font-medium bg-ink text-white px-4 py-2 rounded-xl hover:bg-ink-soft transition-colors">
          <Plus size={16} /> Tambah Divisi
        </Link>
      </div>

      {divisions.length === 0 ? (
        <div className="card text-center py-16">
          <div className="h-12 w-12 rounded-xl bg-primary-light flex items-center justify-center text-primary mx-auto mb-4">
            <Building2 size={22} />
          </div>
          <p className="text-text font-medium mb-1">Belum ada divisi</p>
          <p className="text-sm text-text-secondary mb-4">Mulai dengan menambahkan divisi bisnis pertama.</p>
          <Link href="/divisi/tambah" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <Plus size={14} /> Tambah Divisi
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {divisions.map((div) => {
            const income = div.incomes.reduce((s, t) => s + Number(t.amount), 0);
            const expense = div.expenses.reduce((s, t) => s + Number(t.amount), 0);
            const laba = income - expense;

            return (
              <Link key={div.id} href={`/divisi/${div.slug}`} className="card group hover:shadow-glow transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                    <Building2 size={20} />
                  </div>
                  <ArrowRight size={18} className="text-text-secondary group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>

                <p className="font-display font-medium text-text mb-1">{div.name}</p>
                <p className="text-xs text-text-secondary flex items-center gap-1 mb-4">
                  <Users size={12} /> {div.employees.length} karyawan
                </p>

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Pendapatan</span>
                    <span className="text-text font-medium">{fmtRupiah(income)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Laba</span>
                    <span className={`font-medium ${laba >= 0 ? "text-success" : "text-danger"}`}>{fmtRupiah(laba)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
