import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChevronLeft } from "lucide-react";

async function createExpense(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let employeeId = session.user.employeeId;
  if (!employeeId) {
    const anyEmployee = await prisma.employee.findFirst();
    employeeId = anyEmployee?.id ?? null;
  }
  if (!employeeId) throw new Error("Tidak ada data karyawan untuk mencatat transaksi ini.");

  await prisma.expenseTransaction.create({
    data: {
      divisionId: formData.get("divisionId") as string,
      categoryId: formData.get("categoryId") as string,
      date: new Date(formData.get("date") as string),
      description: (formData.get("description") as string) || null,
      amount: Number(formData.get("amount")),
      paymentMethod: formData.get("paymentMethod") as string,
      createdById: employeeId,
    },
  });

  redirect("/keuangan");
}

export default async function TambahPengeluaranPage() {
  const [divisions, categories] = await Promise.all([
    prisma.division.findMany({ orderBy: { name: "asc" } }),
    prisma.financialCategory.findMany({ where: { type: "EXPENSE" }, orderBy: { name: "asc" } }),
  ]);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/keuangan" className="text-sm text-text-secondary hover:text-primary inline-flex items-center gap-1 mb-2">
          <ChevronLeft size={16} /> Keuangan
        </Link>
        <h1 className="font-display text-xl font-medium text-text">Tambah Pengeluaran</h1>
      </div>

      <form action={createExpense} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Divisi</label>
          <select name="divisionId" required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Kategori</label>
          <select name="categoryId" required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Tanggal</label>
          <input type="date" name="date" defaultValue={today} required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Nominal (Rp)</label>
          <input type="number" name="amount" required min="0" step="1" placeholder="0" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Metode Pembayaran</label>
          <select name="paymentMethod" required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Cash</option>
            <option>Transfer Bank</option>
            <option>QRIS</option>
            <option>Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Deskripsi (opsional)</label>
          <textarea name="description" rows={3} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <button type="submit" className="w-full rounded-xl bg-ink hover:bg-ink-soft transition-colors text-white font-medium py-2.5 text-sm">
          Simpan Pengeluaran
        </button>
      </form>
    </div>
  );
}
