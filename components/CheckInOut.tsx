"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, LogIn, LogOut } from "lucide-react";

export default function CheckInOut({
  hasCheckedIn,
  hasCheckedOut,
}: {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"in" | "out" | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleAction(action: "in" | "out") {
    setLoading(action);
    setMessage(null);

    if (!navigator.geolocation) {
      setMessage({ type: "error", text: "Browser ini tidak mendukung layanan lokasi." });
      setLoading(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`/api/absensi/check${action === "in" ? "in" : "out"}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
          });
          const data = await res.json();

          if (!res.ok) {
            setMessage({ type: "error", text: data.error || "Terjadi kesalahan." });
          } else {
            setMessage({
              type: "success",
              text: action === "in" ? `Absen masuk berhasil — status: ${data.status}` : "Absen pulang berhasil.",
            });
            router.refresh();
          }
        } catch {
          setMessage({ type: "error", text: "Gagal menghubungi server." });
        } finally {
          setLoading(null);
        }
      },
      () => {
        setMessage({ type: "error", text: "Izin lokasi ditolak. Aktifkan akses lokasi untuk absen." });
        setLoading(null);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4 text-text-secondary text-sm">
        <MapPin size={16} />
        Absensi menggunakan lokasi GPS Anda saat ini.
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleAction("in")}
          disabled={hasCheckedIn || loading !== null}
          className="flex items-center justify-center gap-2 rounded-xl bg-ink hover:bg-ink-soft transition-colors text-white font-medium py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <LogIn size={16} />
          {loading === "in" ? "Memproses..." : hasCheckedIn ? "Sudah Absen Masuk" : "Absen Masuk"}
        </button>
        <button
          onClick={() => handleAction("out")}
          disabled={!hasCheckedIn || hasCheckedOut || loading !== null}
          className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 text-text hover:bg-slate-50 transition-colors font-medium py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <LogOut size={16} />
          {loading === "out" ? "Memproses..." : hasCheckedOut ? "Sudah Absen Pulang" : "Absen Pulang"}
        </button>
      </div>

      {message && (
        <p className={`text-sm mt-3 ${message.type === "success" ? "text-success" : "text-danger"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
