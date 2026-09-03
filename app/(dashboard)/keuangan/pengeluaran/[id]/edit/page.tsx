import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChevronLeft } from "lucide-react";

async function updateExpense(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const id = formData.get("id") as string;
  const divisionId = formData.get("divisionId") as string;

  await prisma.expenseTransaction.update({
    where: { id },
    data: {
      divisionId,
      categoryId: formData.get("categoryId") as string,
      date: new Date(formData.get("date") as string),
      description: (formData.get("description") as string) || null,
      amount: Number(formData.get("amount")),
      paymentMethod: formData.get("paymentMethod") as string,
    },
  });

  const division = await prisma.division.findUnique({ where: { id: divisionId } });
  redirect(division ? `/divisi/${division.slug}` : "/keuangan");
}

export default async function EditPengeluaranPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [expense, divisions, categories] = await Promise.all([
    prisma.expenseTransaction.findUnique({ where: { id: params.id } }),
    prisma.division.findMany({ orderBy: { name: "asc" } }),
    prisma.financialCategory.findMany({ where: { type: "EXPENSE" }, orderBy: { name: "asc" } }),
  ]);

  if (!expense) notFound();

  const dateStr = expense.date.toISOString().split("T")[0];
  const backHref = `/divisi/${divisions.find((d) => d.id === expense.divisionId)?.slug ?? ""}`;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href={backHref} className="text-sm text-text-secondary hover:text-primary inline-flex items-center gap-1 mb-2">
          <ChevronLeft size={16} /> Kembali
        </Link>
        <h1 className="text-xl font-bold text-text">Edit Pengeluaran</h1>
      </div>

      <form action={updateExpense} className="card space-y-4">
        <input type="hidden" name="id" value={expense.id} />

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Divisi</label>
          <select name="divisionId" required defaultValue={expense.divisionId} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Kategori</label>
          <select name="categoryId" required defaultValue={expense.categoryId} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Tanggal</label>
          <input type="date" name="date" defaultValue={dateStr} required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Nominal (Rp)</label>
          <input type="number" name="amount" required min="0" step="1" defaultValue={Number(expense.amount)} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Metode Pembayaran</label>
          <select name="paymentMethod" required defaultValue={expense.paymentMethod} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Cash</option>
            <option>Transfer Bank</option>
            <option>QRIS</option>
            <option>Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Deskripsi (opsional)</label>
          <textarea name="description" rows={3} defaultValue={expense.description || ""} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <button type="submit" className="w-full rounded-xl bg-ink hover:bg-ink-soft transition-colors text-white font-medium py-2.5 text-sm">
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
