import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CheckInOut from "@/components/CheckInOut";
import SetOfficeLocation from "@/components/SetOfficeLocation";

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
  await prisma.setting.upsert({
    where: { id: "default" },
    update: { officeLat: lat, officeLng: lng, radiusM: radius, officeAddress: address || undefined },
    create: { id: "default", officeLat: lat, officeLng: lng, radiusM: radius, officeAddress: address },
  });
}

export default async function AbsensiPage() {
  const session = await getServerSession(authOptions);
  const isManagement = session?.user.role === "DIRECTOR" || session?.user.role === "ADMIN";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const settings = await prisma.setting.findUnique({ where: { id: "default" } });

  let myAttendance = null;
  if (session?.user.employeeId) {
    myAttendance = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: session.user.employeeId, date: today } },
    });
  }

  const todayAll = isManagement
    ? await prisma.attendance.findMany({
        where: { date: today },
        include: { employee: { include: { user: true, division: true } } },
        orderBy: { checkInAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-medium text-text">Absensi</h1>
        <p className="text-sm text-text-secondary">
          {today.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {isManagement && (!settings?.officeLat || !settings?.officeLng) && (
        <SetOfficeLocation saveAction={saveOfficeLocation} />
      )}

      {session?.user.employeeId ? (
        <CheckInOut hasCheckedIn={!!myAttendance?.checkInAt} hasCheckedOut={!!myAttendance?.checkOutAt} />
      ) : (
        <div className="card">
          <p className="text-sm text-text-secondary">Akun ini (Direktur) tidak terdaftar sebagai karyawan, jadi tidak perlu absen.</p>
        </div>
      )}

      {isManagement && (
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
                        {a.checkInAt ? new Date(a.checkInAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-2.5 text-text-secondary">
                        {a.checkOutAt ? new Date(a.checkOutAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "—"}
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
