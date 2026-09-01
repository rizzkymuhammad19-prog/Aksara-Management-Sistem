import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Settings as SettingsIcon, Lock, Trash2 } from "lucide-react";

const DAYS = [
  { key: "Mon", label: "Senin" },
  { key: "Tue", label: "Selasa" },
  { key: "Wed", label: "Rabu" },
  { key: "Thu", label: "Kamis" },
  { key: "Fri", label: "Jumat" },
  { key: "Sat", label: "Sabtu" },
  { key: "Sun", label: "Minggu" },
];

async function updateSettings(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (session?.user.role !== "DIRECTOR") {
    redirect("/settings?error=forbidden");
  }

  const selectedDays = DAYS.filter((d) => formData.get(`day_${d.key}`) === "on").map((d) => d.key);

  await prisma.setting.upsert({
    where: { id: "default" },
    update: {
      companyName: formData.get("companyName") as string,
      clockInTime: formData.get("clockInTime") as string,
      clockOutTime: formData.get("clockOutTime") as string,
      radiusM: Number(formData.get("radiusM")),
      officeAddress: (formData.get("officeAddress") as string) || null,
      workDays: selectedDays.join(","),
    },
    create: {
      id: "default",
      companyName: formData.get("companyName") as string,
      clockInTime: formData.get("clockInTime") as string,
      clockOutTime: formData.get("clockOutTime") as string,
      radiusM: Number(formData.get("radiusM")),
      officeAddress: (formData.get("officeAddress") as string) || null,
      workDays: selectedDays.join(","),
    },
  });

  redirect("/settings");
}

async function addHoliday(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (session?.user.role !== "DIRECTOR") {
    redirect("/settings?error=forbidden");
  }

  await prisma.holiday.create({
    data: {
      date: new Date(formData.get("date") as string),
      description: formData.get("description") as string,
    },
  });
  redirect("/settings");
}

async function deleteHoliday(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (session?.user.role !== "DIRECTOR") {
    redirect("/settings?error=forbidden");
  }

  await prisma.holiday.delete({ where: { id: formData.get("id") as string } });
  redirect("/settings");
}

const DAY_LABEL: Record<string, string> = Object.fromEntries(DAYS.map((d) => [d.key, d.label]));

export default async function SettingsPage({ searchParams }: { searchParams: { error?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const isDirector = session.user.role === "DIRECTOR";
  const settings = await prisma.setting.findUnique({ where: { id: "default" } });
  const holidays = await prisma.holiday.findMany({ orderBy: { date: "asc" } });
  const activeDays = (settings?.workDays || "Mon,Tue,Wed,Thu,Fri").split(",");

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-xl font-medium text-text flex items-center gap-2">
          <SettingsIcon size={20} /> Settings
        </h1>
        <p className="text-sm text-text-secondary">
          {isDirector
            ? "Jam kerja & hari kerja di sini otomatis dipakai modul Absensi."
            : "Hanya Direktur yang bisa mengubah pengaturan ini."}
        </p>
      </div>

      {searchParams.error === "forbidden" && (
        <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger flex items-center gap-2">
          <Lock size={14} /> Kamu tidak punya izin untuk mengubah pengaturan ini.
        </div>
      )}

      {!isDirector && (
        <div className="rounded-xl bg-primary-light border border-primary/20 px-4 py-3 text-sm text-primary flex items-center gap-2">
          <Lock size={14} /> Mode lihat saja — hubungi Direktur untuk mengubah pengaturan.
        </div>
      )}

      {isDirector ? (
        <form action={updateSettings} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Nama Perusahaan</label>
            <input type="text" name="companyName" defaultValue={settings?.companyName || "Aksara"} required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Alamat Kantor (opsional)</label>
            <input type="text" name="officeAddress" defaultValue={settings?.officeAddress || ""} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Jam Masuk</label>
              <input type="time" name="clockInTime" defaultValue={settings?.clockInTime || "08:00"} required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">Jam Pulang</label>
              <input type="time" name="clockOutTime" defaultValue={settings?.clockOutTime || "17:00"} required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Hari Kerja</label>
            <div className="grid grid-cols-4 gap-2">
              {DAYS.map((d) => (
                <label key={d.key} className="flex items-center gap-1.5 text-sm text-text">
                  <input type="checkbox" name={`day_${d.key}`} defaultChecked={activeDays.includes(d.key)} className="rounded border-slate-300" />
                  {d.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Radius Absensi (meter)</label>
            <input type="number" name="radiusM" defaultValue={settings?.radiusM || 100} min="10" required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <p className="text-xs text-text-secondary mt-1">
              {settings?.officeLat
                ? "Titik kantor sudah diatur. Untuk ubah titik lokasi, buka halaman Absensi."
                : "Titik lokasi kantor belum diatur — atur dari halaman Absensi."}
            </p>
          </div>

          <button type="submit" className="w-full rounded-xl bg-ink hover:bg-ink-soft transition-colors text-white font-medium py-2.5 text-sm">
            Simpan Pengaturan
          </button>
        </form>
      ) : (
        <div className="card space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Nama Perusahaan</span>
            <span className="text-text font-medium">{settings?.companyName || "Aksara"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Jam Masuk</span>
            <span className="text-text font-medium">{settings?.clockInTime || "08:00"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Jam Pulang</span>
            <span className="text-text font-medium">{settings?.clockOutTime || "17:00"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Hari Kerja</span>
            <span className="text-text font-medium">{activeDays.map((d) => DAY_LABEL[d]).join(", ")}</span>
          </div>
        </div>
      )}

      <div className="card">
        <p className="font-display font-medium text-text mb-1">Hari Libur</p>
        <p className="text-xs text-text-secondary mb-4">Tanggal-tanggal ini tidak dihitung sebagai hari kerja.</p>

        {isDirector && (
          <form action={addHoliday} className="flex gap-2 mb-4">
            <input type="date" name="date" required className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="text" name="description" required placeholder="Keterangan" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <button type="submit" className="px-4 py-2 rounded-xl bg-ink text-white text-sm font-medium hover:bg-ink-soft transition-colors">
              Tambah
            </button>
          </form>
        )}

        <div className="space-y-2">
          {holidays.map((h) => (
            <div key={h.id} className="flex items-center justify-between text-sm border-b border-slate-50 last:border-0 pb-2 last:pb-0">
              <div>
                <span className="text-text">{h.description}</span>
                <span className="text-text-secondary ml-2">
                  {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(h.date)}
                </span>
              </div>
              {isDirector && (
                <form action={deleteHoliday}>
                  <input type="hidden" name="id" value={h.id} />
                  <button className="text-text-secondary hover:text-danger">
                    <Trash2 size={14} />
                  </button>
                </form>
              )}
            </div>
          ))}
          {holidays.length === 0 && <p className="text-sm text-text-secondary">Belum ada hari libur yang diatur.</p>}
        </div>
      </div>
    </div>
  );
}
