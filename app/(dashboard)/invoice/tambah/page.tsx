import Link from "next/link";
import { prisma } from "@/lib/prisma";
import InvoiceForm from "@/components/InvoiceForm";
import { ChevronLeft } from "lucide-react";

export default async function TambahInvoicePage() {
  const divisions = await prisma.division.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/invoice" className="text-sm text-text-secondary hover:text-primary inline-flex items-center gap-1 mb-2">
          <ChevronLeft size={16} /> Invoice
        </Link>
        <h1 className="font-display text-xl font-medium text-text">Buat Invoice Baru</h1>
      </div>

      {divisions.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-text-secondary mb-3">Belum ada divisi. Tambahkan divisi dulu.</p>
          <Link href="/divisi/tambah" className="text-sm font-medium text-primary hover:underline">+ Tambah Divisi</Link>
        </div>
      ) : (
        <InvoiceForm divisions={divisions.map((d) => ({ id: d.id, name: d.name }))} />
      )}
    </div>
  );
}
