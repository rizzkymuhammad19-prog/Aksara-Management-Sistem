"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

export default function AddLocationForm({
  addAction,
}: {
  addAction: (name: string, lat: number, lng: number, radius: number) => Promise<void>;
}) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [name, setName] = useState("");
  const [radius, setRadius] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function useCurrentLocation() {
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Gagal mengambil lokasi. Izinkan akses lokasi di browser.")
    );
  }

  async function handleSave() {
    if (!coords || !name) return;
    setLoading(true);
    await addAction(name, coords.lat, coords.lng, radius);
    setName("");
    setCoords(null);
    setLoading(false);
  }

  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
      <p className="text-sm font-medium text-text flex items-center gap-1.5">
        <MapPin size={15} className="text-primary" /> Tambah Lokasi Kantor
      </p>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama kantor (mis. Kantor Pusat / Kantor Cabang)"
        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
      />

      <button onClick={useCurrentLocation} type="button" className="text-sm font-medium text-primary hover:underline">
        Gunakan lokasi saya saat ini
      </button>

      {coords && (
        <p className="text-xs text-text-secondary">Lokasi terdeteksi: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>
      )}

      <div>
        <label className="block text-sm font-medium text-text mb-1.5">Radius (meter)</label>
        <input
          type="number"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          min="10"
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        onClick={handleSave}
        disabled={!coords || !name || loading}
        className="w-full rounded-xl bg-ink hover:bg-ink-soft transition-colors text-white font-medium py-2.5 text-sm disabled:opacity-40"
      >
        {loading ? "Menyimpan..." : "Simpan Lokasi Ini"}
      </button>
    </div>
  );
}
