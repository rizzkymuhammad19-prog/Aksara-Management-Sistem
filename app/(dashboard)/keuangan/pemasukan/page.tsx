import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChevronLeft } from "lucide-react";

async function createIncome(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Fall back to any employee record if the logged-in user (e.g. Director) has none,
  // since every transaction needs a recorded creator.
  let employeeId = session.user.employeeId;
  if (!employeeId) {
    const anyEmployee = await prisma.employee.findFirst();
    employeeId = anyEmployee?.id ?? null;
  }
  if (!employeeId) throw new Error("Tidak ada data karyawan untuk mencatat transaksi ini.");

  await prisma.incomeTransaction.create({
    data: {
      divisionId: formData.get("divisionId") as string,
      date: new Date(formData.get("date") as string),
      source: formData.get("source") as string,
      description: (formData.get("description") as string) || null,
      amount: Number(formData.get("amount")),
      paymentMethod: formData.get("paymentMethod") as string,
      createdById: employeeId,
    },
  });

  redirect("/keuangan");
}

export default async function TambahPemasukanPage() {
  const divisions = await prisma.division.findMany({ orderBy: { name: "asc" } });
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/keuangan" className="text-sm text-text-secondary hover:text-primary inline-flex items-center gap-1 mb-2">
          <ChevronLeft size={16} /> Keuangan
        </Link>
        <h1 className="font-display text-xl font-medium text-text">Tambah Pemasukan</h1>
      </div>

      <form action={createIncome} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Divisi</label>
          <select name="divisionId" required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Tanggal</label>
          <input type="date" name="date" defaultValue={today} required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Sumber Pemasukan</label>
          <input type="text" name="source" required placeholder="Penjualan / Jasa / dll" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Nominal (Rp)</label>
          <input type="number" name="amount" required min="0" step="1" placeholder="0" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Metode Pembayaran</label>
          <select name="paymentMethod" required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Transfer Bank</option>
            <option>Cash</option>
            <option>QRIS</option>
            <option>Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Deskripsi (opsional)</label>
          <textarea name="description" rows={3} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <button type="submit" className="w-full rounded-xl bg-ink hover:bg-ink-soft transition-colors text-white font-medium py-2.5 text-sm">
          Simpan Pemasukan
        </button>
      </form>
    </div>
  );
}
