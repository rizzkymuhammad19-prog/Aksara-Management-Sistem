import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Settings as SettingsIcon } from "lucide-react";

async function updateSettings(formData: FormData) {
  "use server";

  await prisma.setting.upsert({
    where: { id: "default" },
    update: {
      companyName: formData.get("companyName") as string,
      clockInTime: formData.get("clockInTime") as string,
      clockOutTime: formData.get("clockOutTime") as string,
      radiusM: Number(formData.get("radiusM")),
      officeAddress: (formData.get("officeAddress") as string) || null,
    },
    create: {
      id: "default",
      companyName: formData.get("companyName") as string,
      clockInTime: formData.get("clockInTime") as string,
      clockOutTime: formData.get("clockOutTime") as string,
      radiusM: Number(formData.get("radiusM")),
      officeAddress: (formData.get("officeAddress") as string) || null,
    },
  });

  redirect("/settings");
}

export default async function SettingsPage() {
  const settings = await prisma.setting.findUnique({ where: { id: "default" } });

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-xl font-medium text-text flex items-center gap-2">
          <SettingsIcon size={20} /> Settings
        </h1>
        <p className="text-sm text-text-secondary">Jam kerja di sini otomatis dipakai untuk menentukan status Hadir/Terlambat di modul Absensi.</p>
      </div>

      <form action={updateSettings} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Nama Perusahaan</label>
          <input
            type="text"
            name="companyName"
            defaultValue={settings?.companyName || "Aksara"}
            required
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Alamat Kantor (opsional)</label>
          <input
            type="text"
            name="officeAddress"
            defaultValue={settings?.officeAddress || ""}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Jam Masuk</label>
            <input
              type="time"
              name="clockInTime"
              defaultValue={settings?.clockInTime || "08:00"}
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Jam Pulang</label>
            <input
              type="time"
              name="clockOutTime"
              defaultValue={settings?.clockOutTime || "17:00"}
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Radius Absensi (meter)</label>
          <input
            type="number"
            name="radiusM"
            defaultValue={settings?.radiusM || 100}
            min="10"
            required
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-xs text-text-secondary mt-1">
            {settings?.officeLat
              ? `Titik kantor sudah diatur (${settings.officeLat.toFixed(5)}, ${settings.officeLng?.toFixed(5)}). Untuk ubah titik lokasi, buka halaman Absensi.`
              : "Titik lokasi kantor belum diatur — atur dari halaman Absensi."}
          </p>
        </div>

        <button type="submit" className="w-full rounded-xl bg-ink hover:bg-ink-soft transition-colors text-white font-medium py-2.5 text-sm">
          Simpan Pengaturan
        </button>
      </form>
    </div>
  );
}
