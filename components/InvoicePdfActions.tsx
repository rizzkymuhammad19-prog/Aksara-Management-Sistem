"use client";

import { useState } from "react";
import { FileDown, MessageCircle } from "lucide-react";

type InvoiceItem = { name: string; unit: string; quantity: number; unitPrice: number };

type InvoiceData = {
  invoiceNumber: string;
  clientName: string;
  clientAddress: string | null;
  date: string;
  dueDate: string | null;
  notes: string | null;
  divisionName: string;
  companyName: string;
  companyAddress: string | null;
  items: InvoiceItem[];
};

function fmtRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

async function loadLogoBase64(): Promise<string | null> {
  try {
    const res = await fetch("/logo.png");
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export default function InvoicePdfActions({ invoice }: { invoice: InvoiceData }) {
  const [loading, setLoading] = useState(false);

  const total = invoice.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);

  async function downloadPdf() {
    setLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const logoBase64 = await loadLogoBase64();

      const doc = new jsPDF();

      if (logoBase64) {
        try {
          doc.addImage(logoBase64, "PNG", 14, 12, 40, 14);
        } catch {
          // ignore image errors, continue without logo
        }
      }

      doc.setFontSize(18);
      doc.setTextColor(20);
      doc.text("INVOICE", 196, 20, { align: "right" });
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(invoice.invoiceNumber, 196, 26, { align: "right" });

      doc.setDrawColor(230);
      doc.line(14, 32, 196, 32);

      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(invoice.companyName, 14, 40);
      if (invoice.companyAddress) {
        doc.text(invoice.companyAddress, 14, 45);
      }
      doc.text(`Divisi: ${invoice.divisionName}`, 14, 50);

      doc.setFontSize(9);
      doc.text("Ditagihkan kepada:", 120, 40);
      doc.setFontSize(10);
      doc.setTextColor(20);
      doc.text(invoice.clientName, 120, 45);
      doc.setFontSize(9);
      doc.setTextColor(100);
      if (invoice.clientAddress) {
        doc.text(doc.splitTextToSize(invoice.clientAddress, 76), 120, 50);
      }

      doc.text(`Tanggal: ${invoice.date}`, 120, 60);
      if (invoice.dueDate) {
        doc.text(`Jatuh tempo: ${invoice.dueDate}`, 120, 65);
      }

      autoTable(doc, {
        startY: 72,
        head: [["Nama Barang/Jasa", "Satuan", "Qty", "Harga Satuan", "Subtotal"]],
        body: invoice.items.map((it) => [
          it.name,
          it.unit,
          String(it.quantity),
          fmtRupiah(it.unitPrice),
          fmtRupiah(it.quantity * it.unitPrice),
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 99, 255] },
      });

      const finalY = (doc as any).lastAutoTable.finalY + 8;
      doc.setFontSize(11);
      doc.setTextColor(20);
      doc.text(`TOTAL: ${fmtRupiah(total)}`, 196, finalY, { align: "right" });

      if (invoice.notes) {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text("Catatan:", 14, finalY + 12);
        doc.text(doc.splitTextToSize(invoice.notes, 180), 14, finalY + 17);
      }

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Dibuat oleh ${invoice.companyName} — ${new Date().toLocaleDateString("id-ID")}`, 14, 285);

      doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
    } finally {
      setLoading(false);
    }
  }

  function shareWhatsApp() {
    const message = `Halo ${invoice.clientName}, berikut invoice ${invoice.invoiceNumber} dari ${invoice.companyName} sebesar ${fmtRupiah(total)}. Mohon dicek ya. Invoice PDF akan saya lampirkan terpisah.`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={downloadPdf}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-sm font-medium bg-ink text-white px-4 py-2 rounded-xl hover:bg-ink-soft transition-colors disabled:opacity-60"
      >
        <FileDown size={16} /> {loading ? "Memproses..." : "Download PDF"}
      </button>
      <button
        onClick={shareWhatsApp}
        className="inline-flex items-center gap-1.5 text-sm font-medium bg-white border border-slate-200 text-text px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors"
      >
        <MessageCircle size={16} /> Kirim via WhatsApp
      </button>
    </div>
  );
}
