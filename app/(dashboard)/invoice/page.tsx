import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FileText, Plus, Trash2 } from "lucide-react";

function fmtRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

async function deleteInvoice(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
  await prisma.invoice.delete({ where: { id } });
  redirect("/invoice");
}

export default async function InvoiceListPage() {
  const invoices = await prisma.invoice.findMany({
    include: { division: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-xl font-medium text-text">Invoice</h1>
          <p className="text-sm text-text-secondary">{invoices.length} invoice dibuat.</p>
        </div>
        <Link href="/invoice/tambah" className="inline-flex items-center gap-1.5 text-sm font-medium bg-ink text-white px-4 py-2 rounded-xl hover:bg-ink-soft transition-colors">
          <Plus size={16} /> Buat Invoice
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="card text-center py-16">
          <div className="h-12 w-12 rounded-xl bg-primary-light flex items-center justify-center text-primary mx-auto mb-4">
            <FileText size={22} />
          </div>
          <p className="text-text font-medium mb-1">Belum ada invoice</p>
          <p className="text-sm text-text-secondary mb-4">Buat invoice pertama untuk client.</p>
          <Link href="/invoice/tambah" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <Plus size={14} /> Buat Invoice
          </Link>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-slate-100">
                  <th className="pb-2 font-medium">No. Invoice</th>
                  <th className="pb-2 font-medium">Client</th>
                  <th className="pb-2 font-medium">Divisi</th>
                  <th className="pb-2 font-medium">Tanggal</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                  <th className="pb-2 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const total = inv.items.reduce((s, it) => s + it.quantity * Number(it.unitPrice), 0);
                  return (
                    <tr key={inv.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5">
                        <Link href={`/invoice/${inv.id}`} className="font-medium text-primary hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-2.5">{inv.clientName}</td>
                      <td className="py-2.5 text-text-secondary">{inv.division.name}</td>
                      <td className="py-2.5 text-text-secondary">{fmtDate(inv.date)}</td>
                      <td className="py-2.5 text-right font-medium text-text">{fmtRupiah(total)}</td>
                      <td className="py-2.5 text-right">
                        <form action={deleteInvoice}>
                          <input type="hidden" name="id" value={inv.id} />
                          <button className="text-text-secondary hover:text-danger">
                            <Trash2 size={15} />
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
