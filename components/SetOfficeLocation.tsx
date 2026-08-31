"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

export default function SetOfficeLocation({
  saveAction,
}: {
  saveAction: (lat: number, lng: number, radius: number, address: string) => Promise<void>;
}) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(100);
  const [address, setAddress] = useState("");
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
    if (!coords) return;
    setLoading(true);
    await saveAction(coords.lat, coords.lng, radius, address);
    setLoading(false);
  }

  return (
    <div className="card border-l-4 border-l-warning">
      <div className="flex items-center gap-2 mb-2 text-text font-medium text-sm">
        <MapPin size={16} className="text-warning" />
        Lokasi kantor belum diatur
      </div>
      <p className="text-sm text-text-secondary mb-4">
        Karyawan belum bisa absen sampai titik lokasi kantor & radius diatur.
      </p>

      <div className="space-y-3">
        <button
          onClick={useCurrentLocation}
          type="button"
          className="text-sm font-medium text-primary hover:underline"
        >
          Gunakan lokasi saya saat ini sebagai titik kantor
        </button>

        {coords && (
          <p className="text-xs text-text-secondary">
            Lokasi terdeteksi: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Nama / Alamat Kantor</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="mis. Kantor Pusat Aksara"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Radius (meter)</label>
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            min="10"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          onClick={handleSave}
          disabled={!coords || loading}
          className="w-full rounded-xl bg-ink hover:bg-ink-soft transition-colors text-white font-medium py-2.5 text-sm disabled:opacity-40"
        >
          {loading ? "Menyimpan..." : "Simpan Lokasi Kantor"}
        </button>
      </div>
    </div>
  );
}
