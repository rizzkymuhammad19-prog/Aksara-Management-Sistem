import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Building2, ArrowRight, Users } from "lucide-react";

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
      <div>
        <h1 className="font-display text-xl font-medium text-text">Divisi</h1>
        <p className="text-sm text-text-secondary">5 divisi bisnis — klik untuk lihat dashboard lengkapnya.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {divisions.map((div) => {
          const income = div.incomes.reduce((s, t) => s + Number(t.amount), 0);
          const expense = div.expenses.reduce((s, t) => s + Number(t.amount), 0);
          const laba = income - expense;

          return (
            <Link
              key={div.id}
              href={`/divisi/${div.slug}`}
              className="card group hover:shadow-glow transition-shadow"
            >
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

      {divisions.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-text-secondary text-sm">Belum ada data divisi.</p>
        </div>
      )}
    </div>
  );
}
