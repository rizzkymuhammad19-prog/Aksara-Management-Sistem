import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CheckInOut from "@/components/CheckInOut";
import SetOfficeLocation from "@/components/SetOfficeLocation";
import { jakartaTodayDateOnly, formatJakartaTime, formatJakartaDateLong } from "@/lib/jakarta";
import { MapPinOff, Lock } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  HADIR: "Hadir",
  TERLAMBAT: "Terlambat",
  IZIN: "Izin",
  SAKIT: "Sakit",
  TIDAK_HADIR: "Tidak Hadir",
};

const STATUS_COLOR: Record<string, string> = {
  HADIR: "bg-success/10 text-success",
  TERLAMBAT: "bg-warning/10 text-warning",
  IZIN: "bg-primary-light text-primary",
  SAKIT: "bg-slate-100 text-text-secondary",
  TIDAK_HADIR: "bg-danger/10 text-danger",
};

async function saveOfficeLocation(lat: number, lng: number, radius: number, address: string) {
  "use server";
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "DIRECTOR") return;

  await prisma.setting.upsert({
    where: { id: "default" },
    update: { officeLat: lat, officeLng: lng, radiusM: radius, officeAddress: address || undefined },
    create: { id: "default", officeLat: lat, officeLng: lng, radiusM: radius, officeAddress: address },
  });
}

async function setManualAttendance(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (session?.user.role !== "DIRECTOR") {
    redirect("/absensi?error=forbidden");
  }

  const employeeId = formData.get("employeeId") as string;
  const status = formData.get("status") as string;

  const today = jakartaTodayDateOnly();

  await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId, date: today } },
    update: { status: status as any, note: `Diinput manual oleh ${session?.user.name}` },
    create: { employeeId, date: today, status: status as any, note: `Diinput manual oleh ${session?.user.name}` },
  });

  redirect("/absensi");
}

export default async function AbsensiPage({ searchParams }: { searchParams: { error?: string } }) {
  const session = await getServerSession(authOptions);
  const isDirector = session?.user.role === "DIRECTOR";

  const today = jakartaTodayDateOnly();

  const settings = await prisma.setting.findUnique({ where: { id: "default" } });

  let myEmployee = null;
  let myAttendance = null;
  if (session?.user.employeeId) {
    myEmployee = await prisma.employee.findUnique({ where: { id: session.user.employeeId } });
    myAttendance = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: session.user.employeeId, date: today } },
    });
  }

  const todayAll = isDirector
    ? await prisma.attendance.findMany({
        where: { date: today },
        include: { employee: { include: { user: true, division: true } } },
        orderBy: { checkInAt: "desc" },
      })
    : [];

  const manualEmployees = isDirector
    ? await prisma.employee.findMany({
        where: { requiresAttendance: false },
        include: { user: true, division: true },
        orderBy: { user: { name: "asc" } },
      })
    : [];

  const manualTodayMap = new Map(
    isDirector
      ? (await prisma.attendance.findMany({ where: { date: today, employeeId: { in: manualEmployees.map((e) => e.id) } } })).map((a) => [a.employeeId, a.status])
      : []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-xl font-medium text-text">Absensi</h1>
          <p className="text-sm text-text-secondary">
            {formatJakartaDateLong(new Date())} (WIB)
          </p>
        </div>
        {isDirector && (
          <Link href="/absensi/laporan-bulanan" className="text-sm font-medium text-primary hover:underline">
            Lihat Rekap Bulanan →
          </Link>
        )}
      </div>

      {searchParams.error === "forbidden" && (
        <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger flex items-center gap-2">
          <Lock size={14} /> Kamu tidak punya izin untuk input absensi manual.
        </div>
      )}

      {isDirector && (!settings?.officeLat || !settings?.officeLng) && (
        <SetOfficeLocation saveAction={saveOfficeLocation} />
      )}

      {session?.user.employeeId ? (
        myEmployee?.requiresAttendance ? (
          <CheckInOut hasCheckedIn={!!myAttendance?.checkInAt} hasCheckedOut={!!myAttendance?.checkOutAt} />
        ) : (
          <div className="card flex items-center gap-3 text-sm text-text-secondary">
            <MapPinOff size={18} className="text-warning shrink-0" />
            Kamu tidak wajib absen GPS. Kehadiranmu diinput manual oleh Direktur.
          </div>
        )
      ) : (
        <div className="card">
          <p className="text-sm text-text-secondary">Akun ini (Direktur) tidak terdaftar sebagai karyawan, jadi tidak perlu absen.</p>
        </div>
      )}

      {!isDirector && (
        <div className="card flex items-center gap-3 text-sm text-text-secondary">
          <Lock size={16} className="text-primary shrink-0" />
          Rekap kehadiran seluruh karyawan hanya bisa dilihat oleh Direktur.
        </div>
      )}

      {isDirector && manualEmployees.length > 0 && (
        <div className="card">
          <p className="font-display font-medium text-text mb-1">Absensi Manual</p>
          <p className="text-xs text-text-secondary mb-4">Karyawan yang tidak wajib absen GPS — input kehadirannya untuk hari ini di sini.</p>

          <div className="space-y-3">
            {manualEmployees.map((emp) => {
              const currentStatus = manualTodayMap.get(emp.id);
              return (
                <form key={emp.id} action={setManualAttendance} className="flex items-center justify-between gap-3 border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                  <input type="hidden" name="employeeId" value={emp.id} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text truncate">{emp.user.name}</p>
                    <p className="text-xs text-text-secondary truncate">{emp.division.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {currentStatus && (
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLOR[currentStatus]}`}>
                        {STATUS_LABEL[currentStatus]}
                      </span>
                    )}
                    <select name="status" defaultValue={currentStatus || "HADIR"} className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="HADIR">Hadir</option>
                      <option value="TERLAMBAT">Terlambat</option>
                      <option value="IZIN">Izin</option>
                      <option value="SAKIT">Sakit</option>
                      <option value="TIDAK_HADIR">Tidak Hadir</option>
                    </select>
                    <button type="submit" className="text-xs font-medium bg-ink text-white px-3 py-1.5 rounded-lg hover:bg-ink-soft transition-colors">
                      Simpan
                    </button>
                  </div>
                </form>
              );
            })}
          </div>
        </div>
      )}

      {isDirector && (
        <div className="card">
          <p className="font-display font-medium text-text mb-4">Kehadiran Hari Ini — Semua Karyawan</p>

          {todayAll.length === 0 ? (
            <p className="text-sm text-text-secondary">Belum ada yang absen hari ini.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-secondary border-b border-slate-100">
                    <th className="pb-2 font-medium">Nama</th>
                    <th className="pb-2 font-medium">Divisi</th>
                    <th className="pb-2 font-medium">Check In</th>
                    <th className="pb-2 font-medium">Check Out</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAll.map((a) => (
                    <tr key={a.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 font-medium text-text">{a.employee.user.name}</td>
                      <td className="py-2.5">{a.employee.division.name}</td>
                      <td className="py-2.5 text-text-secondary">
                        {a.checkInAt ? formatJakartaTime(a.checkInAt) : "—"}
                      </td>
                      <td className="py-2.5 text-text-secondary">
                        {a.checkOutAt ? formatJakartaTime(a.checkOutAt) : "—"}
                      </td>
                      <td className="py-2.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_COLOR[a.status]}`}>
                          {STATUS_LABEL[a.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
