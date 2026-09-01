import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Building2, ArrowRight, Users, Plus, Trash2 } from "lucide-react";

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function fmtRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

async function deleteDivision(formData: FormData) {
  "use server";

  const divisionId = formData.get("divisionId") as string;

  const employeeCount = await prisma.employee.count({ where: { divisionId } });
  if (employeeCount > 0) {
    redirect("/divisi?error=has-employees");
  }

  const [incomeCount, expenseCount, taskCount, designCount] = await Promise.all([
    prisma.incomeTransaction.count({ where: { divisionId } }),
    prisma.expenseTransaction.count({ where: { divisionId } }),
    prisma.task.count({ where: { divisionId } }),
    prisma.designTask.count({ where: { divisionId } }),
  ]);
  if (incomeCount + expenseCount + taskCount + designCount > 0) {
    redirect("/divisi?error=has-data");
  }

  await prisma.division.delete({ where: { id: divisionId } });
  redirect("/divisi");
}

export default async function DivisiPage({ searchParams }: { searchParams: { error?: string } }) {
  const session = await getServerSession(authOptions);
  const isDirector = session?.user.role === "DIRECTOR";
  const monthStart = startOfMonth();

  const divisions = await prisma.division.findMany({
    include: {
      employees: true,
      incomes: isDirector ? { where: { date: { gte: monthStart } } } : false,
      expenses: isDirector ? { where: { date: { gte: monthStart } } } : false,
    },
    orderBy: { name: "asc" },
  });

  const errorMessages: Record<string, string> = {
    "has-employees": "Divisi ini masih punya karyawan. Pindahkan atau hapus karyawannya dulu sebelum menghapus divisi.",
    "has-data": "Divisi ini masih punya data transaksi/task/design. Divisi dengan riwayat data tidak bisa dihapus.",
  };

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

      {searchParams.error && errorMessages[searchParams.error] && (
        <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
          {errorMessages[searchParams.error]}
        </div>
      )}

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
          {divisions.map((div: any) => {
            const income = isDirector ? div.incomes.reduce((s: number, t: any) => s + Number(t.amount), 0) : 0;
            const expense = isDirector ? div.expenses.reduce((s: number, t: any) => s + Number(t.amount), 0) : 0;
            const laba = income - expense;

            return (
              <div key={div.id} className="card group hover:shadow-glow transition-shadow relative">
                <form action={deleteDivision} className="absolute top-4 right-4">
                  <input type="hidden" name="divisionId" value={div.id} />
                  <button title="Hapus divisi" className="p-1.5 rounded-lg hover:bg-danger/10 text-text-secondary hover:text-danger transition-colors">
                    <Trash2 size={16} />
                  </button>
                </form>

                <Link href={`/divisi/${div.slug}`} className="block">
                  <div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary mb-4">
                    <Building2 size={20} />
                  </div>

                  <p className="font-display font-medium text-text mb-1 pr-8">{div.name}</p>
                  <p className="text-xs text-text-secondary flex items-center gap-1 mb-4">
                    <Users size={12} /> {div.employees.length} karyawan
                  </p>

                  {isDirector ? (
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
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-primary group-hover:gap-1.5 transition-all">
                      Lihat detail <ArrowRight size={12} />
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
