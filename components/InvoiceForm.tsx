"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

type Item = { name: string; unit: string; quantity: string; unitPrice: string };

function fmtRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function InvoiceForm({ divisions }: { divisions: { id: string; name: string }[] }) {
  const router = useRouter();
  const [divisionId, setDivisionId] = useState(divisions[0]?.id || "");
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([{ name: "", unit: "pcs", quantity: "1", unitPrice: "0" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);

  function updateItem(index: number, field: keyof Item, value: string) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  }

  function addItem() {
    setItems((prev) => [...prev, { name: "", unit: "pcs", quantity: "1", unitPrice: "0" }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!clientName || items.some((it) => !it.name)) {
      setError("Nama client dan nama semua barang wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ divisionId, clientName, clientAddress, date, dueDate: dueDate || null, notes, items }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal menyimpan invoice.");
        setLoading(false);
        return;
      }

      router.push(`/invoice/${data.id}`);
    } catch {
      setError("Gagal menghubungi server.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Divisi</label>
        <select value={divisionId} onChange={(e) => setDivisionId(e.target.value)} required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          {divisions.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Nama Client</label>
          <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Alamat Client (opsional)</label>
          <input type="text" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Tanggal Invoice</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Jatuh Tempo (opsional)</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-text">Daftar Barang/Jasa</label>
          <button type="button" onClick={addItem} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            <Plus size={14} /> Tambah Baris
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                placeholder="Nama barang/jasa"
                value={item.name}
                onChange={(e) => updateItem(i, "name", e.target.value)}
                required
                className="col-span-5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="text"
                placeholder="Satuan"
                value={item.unit}
                onChange={(e) => updateItem(i, "unit", e.target.value)}
                className="col-span-2 rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="Qty"
                min="0"
                value={item.quantity}
                onChange={(e) => updateItem(i, "quantity", e.target.value)}
                className="col-span-2 rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="Harga satuan"
                min="0"
                value={item.unitPrice}
                onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                className="col-span-2 rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                disabled={items.length === 1}
                className="col-span-1 text-text-secondary hover:text-danger disabled:opacity-30 flex justify-center"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-3 pt-3 border-t border-slate-100">
          <p className="text-sm font-medium text-text">Total: <span className="font-display text-lg">{fmtRupiah(total)}</span></p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Catatan (opsional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button type="submit" disabled={loading} className="w-full rounded-xl bg-ink hover:bg-ink-soft transition-colors text-white font-medium py-2.5 text-sm disabled:opacity-60">
        {loading ? "Menyimpan..." : "Simpan Invoice"}
      </button>
    </form>
  );
}
