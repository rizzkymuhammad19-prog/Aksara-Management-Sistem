import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import InvoicePdfActions from "@/components/InvoicePdfActions";
import { ChevronLeft } from "lucide-react";

function fmtRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(d);
}

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: { division: true, items: true },
  });
  if (!invoice) notFound();

  const settings = await prisma.setting.findUnique({ where: { id: "default" } });
  const total = invoice.items.reduce((s, it) => s + it.quantity * Number(it.unitPrice), 0);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link href="/invoice" className="text-sm text-text-secondary hover:text-primary inline-flex items-center gap-1 mb-2">
            <ChevronLeft size={16} /> Invoice
          </Link>
          <h1 className="font-display text-xl font-medium text-text">{invoice.invoiceNumber}</h1>
        </div>
        <InvoicePdfActions
          invoice={{
            invoiceNumber: invoice.invoiceNumber,
            clientName: invoice.clientName,
            clientAddress: invoice.clientAddress,
            date: fmtDate(invoice.date),
            dueDate: invoice.dueDate ? fmtDate(invoice.dueDate) : null,
            notes: invoice.notes,
            divisionName: invoice.division.name,
            companyName: settings?.companyName || "Aksara",
            companyAddress: settings?.officeAddress || null,
            items: invoice.items.map((it) => ({ name: it.name, unit: it.unit, quantity: it.quantity, unitPrice: Number(it.unitPrice) })),
          }}
        />
      </div>

      <div className="card space-y-5">
        <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-text-secondary">Dari</p>
            <p className="font-medium text-text">{settings?.companyName || "Aksara"}</p>
            {settings?.officeAddress && <p className="text-xs text-text-secondary">{settings.officeAddress}</p>}
            <p className="text-xs text-text-secondary">Divisi: {invoice.division.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-secondary">Ditagihkan kepada</p>
            <p className="font-medium text-text">{invoice.clientName}</p>
            {invoice.clientAddress && <p className="text-xs text-text-secondary max-w-[200px]">{invoice.clientAddress}</p>}
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">Tanggal: <span className="text-text">{fmtDate(invoice.date)}</span></span>
          {invoice.dueDate && <span className="text-text-secondary">Jatuh tempo: <span className="text-text">{fmtDate(invoice.dueDate)}</span></span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-secondary border-b border-slate-100">
                <th className="pb-2 font-medium">Nama Barang/Jasa</th>
                <th className="pb-2 font-medium">Satuan</th>
                <th className="pb-2 font-medium text-right">Qty</th>
                <th className="pb-2 font-medium text-right">Harga Satuan</th>
                <th className="pb-2 font-medium text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it) => (
                <tr key={it.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5">{it.name}</td>
                  <td className="py-2.5 text-text-secondary">{it.unit}</td>
                  <td className="py-2.5 text-right">{it.quantity}</td>
                  <td className="py-2.5 text-right text-text-secondary">{fmtRupiah(Number(it.unitPrice))}</td>
                  <td className="py-2.5 text-right font-medium text-text">{fmtRupiah(it.quantity * Number(it.unitPrice))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <p className="font-display text-lg font-medium text-text">Total: {fmtRupiah(total)}</p>
        </div>

        {invoice.notes && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs text-text-secondary mb-1">Catatan</p>
            <p className="text-sm text-text">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
