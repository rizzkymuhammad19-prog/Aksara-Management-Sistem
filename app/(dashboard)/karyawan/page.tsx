import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users, Plus, Trash2, Power, MapPin, MapPinOff } from "lucide-react";

async function employeeAction(formData: FormData) {
  "use server";

  const employeeId = formData.get("employeeId") as string;
  const userId = formData.get("userId") as string;
  const intent = formData.get("intent") as string;

  if (intent === "toggle-active") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    await prisma.user.update({ where: { id: userId }, data: { isActive: !user?.isActive } });
    redirect("/karyawan");
  }

  if (intent === "toggle-attendance") {
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    await prisma.employee.update({ where: { id: employeeId }, data: { requiresAttendance: !employee?.requiresAttendance } });
    redirect("/karyawan");
  }

  if (intent === "set-location") {
    const locationId = (formData.get("locationId") as string) || null;
    await prisma.employee.update({ where: { id: employeeId }, data: { assignedLocationId: locationId } });
    redirect("/karyawan");
  }

  if (intent === "delete") {
    const [attendanceCount, incomeCount, expenseCount, designCount] = await Promise.all([
      prisma.attendance.count({ where: { employeeId } }),
      prisma.incomeTransaction.count({ where: { createdById: employeeId } }),
      prisma.expenseTransaction.count({ where: { createdById: employeeId } }),
      prisma.designTask.count({ where: { designerId: employeeId } }),
    ]);

    if (attendanceCount + incomeCount + expenseCount + designCount > 0) {
      redirect("/karyawan?error=has-data");
    }

    await prisma.task.updateMany({ where: { assigneeId: employeeId }, data: { assigneeId: null } });
    await prisma.employee.delete({ where: { id: employeeId } });
    await prisma.user.delete({ where: { id: userId } });
    redirect("/karyawan");
  }
}

export default async function KaryawanPage({ searchParams }: { searchParams: { error?: string } }) {
  const [employees, locations] = await Promise.all([
    prisma.employee.findMany({
      include: { user: true, division: true, assignedLocation: true },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.attendanceLocation.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-xl font-medium text-text">Karyawan</h1>
          <p className="text-sm text-text-secondary">{employees.length} karyawan terdaftar.</p>
        </div>
        <Link href="/karyawan/tambah" className="inline-flex items-center gap-1.5 text-sm font-medium bg-ink text-white px-4 py-2 rounded-xl hover:bg-ink-soft transition-colors">
          <Plus size={16} /> Tambah Karyawan
        </Link>
      </div>

      {searchParams.error === "has-data" && (
        <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
          Karyawan ini punya riwayat data (absensi/transaksi/design) sehingga tidak bisa dihapus permanen. Gunakan tombol <strong>Nonaktifkan</strong> saja.
        </div>
      )}

      {employees.length === 0 ? (
        <div className="card text-center py-16">
          <div className="h-12 w-12 rounded-xl bg-primary-light flex items-center justify-center text-primary mx-auto mb-4">
            <Users size={22} />
          </div>
          <p className="text-text font-medium mb-1">Belum ada karyawan</p>
          <p className="text-sm text-text-secondary mb-4">Pastikan sudah ada divisi dulu, baru tambahkan karyawan.</p>
          <Link href="/karyawan/tambah" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <Plus size={14} /> Tambah Karyawan
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile: stacked cards */}
          <div className="space-y-3 sm:hidden">
            {employees.map((emp) => (
              <div key={emp.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-text">{emp.user.name}</p>
                    <p className="text-xs text-text-secondary">{emp.division.name} · {emp.position}{emp.isDesigner ? " · Designer" : ""}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap ${emp.user.isActive ? "bg-primary-light text-primary" : "bg-slate-100 text-text-secondary"}`}>
                    {emp.user.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mb-1">{emp.user.email}</p>
                <p className="text-xs mb-3 flex items-center gap-1">
                  {emp.requiresAttendance ? (
                    <span className="text-primary flex items-center gap-1"><MapPin size={12} /> Wajib absen GPS</span>
                  ) : (
                    <span className="text-warning flex items-center gap-1"><MapPinOff size={12} /> Absensi manual</span>
                  )}
                </p>
                {emp.requiresAttendance && (
                  <form action={employeeAction} className="flex gap-2 mb-2">
                    <input type="hidden" name="employeeId" value={emp.id} />
                    <input type="hidden" name="intent" value="set-location" />
                    <select name="locationId" defaultValue={emp.assignedLocationId || ""} className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Semua lokasi</option>
                      {locations.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                    <button type="submit" className="text-xs font-medium bg-slate-100 text-text px-2.5 py-1.5 rounded-lg">Set</button>
                  </form>
                )}
                <form action={employeeAction} className="flex gap-2 flex-wrap">
                  <input type="hidden" name="employeeId" value={emp.id} />
                  <input type="hidden" name="userId" value={emp.userId} />
                  <button name="intent" value="toggle-active" className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-slate-100 text-text px-3 py-2 rounded-lg">
                    <Power size={14} /> {emp.user.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button name="intent" value="toggle-attendance" className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-slate-100 text-text px-3 py-2 rounded-lg">
                    {emp.requiresAttendance ? <MapPinOff size={14} /> : <MapPin size={14} />} {emp.requiresAttendance ? "Set Manual" : "Set GPS"}
                  </button>
                  <button name="intent" value="delete" className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-danger/10 text-danger px-3 py-2 rounded-lg">
                    <Trash2 size={14} /> Hapus
                  </button>
                </form>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-secondary border-b border-slate-100">
                    <th className="pb-2 font-medium">Nama</th>
                    <th className="pb-2 font-medium">Divisi</th>
                    <th className="pb-2 font-medium">Jabatan</th>
                    <th className="pb-2 font-medium">Absensi</th>
                    <th className="pb-2 font-medium">Lokasi</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 font-medium text-text">{emp.user.name}</td>
                      <td className="py-2.5">{emp.division.name}</td>
                      <td className="py-2.5">{emp.position}{emp.isDesigner ? " · Designer" : ""}</td>
                      <td className="py-2.5">
                        {emp.requiresAttendance ? (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-primary-light text-primary inline-flex items-center gap-1">
                            <MapPin size={11} /> GPS
                          </span>
                        ) : (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-warning/10 text-warning inline-flex items-center gap-1">
                            <MapPinOff size={11} /> Manual
                          </span>
                        )}
                      </td>
                      <td className="py-2.5">
                        {emp.requiresAttendance ? (
                          <form action={employeeAction} className="flex items-center gap-1.5">
                            <input type="hidden" name="employeeId" value={emp.id} />
                            <input type="hidden" name="intent" value="set-location" />
                            <select name="locationId" defaultValue={emp.assignedLocationId || ""} className="rounded-lg border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary">
                              <option value="">Semua lokasi</option>
                              {locations.map((l) => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                              ))}
                            </select>
                            <button type="submit" className="text-xs font-medium bg-slate-100 text-text px-2 py-1 rounded-lg">Set</button>
                          </form>
                        ) : (
                          <span className="text-xs text-text-secondary">—</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full ${emp.user.isActive ? "bg-primary-light text-primary" : "bg-slate-100 text-text-secondary"}`}>
                          {emp.user.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <form action={employeeAction} className="flex justify-end gap-2">
                          <input type="hidden" name="employeeId" value={emp.id} />
                          <input type="hidden" name="userId" value={emp.userId} />
                          <button name="intent" value="toggle-attendance" title={emp.requiresAttendance ? "Ubah ke absensi manual" : "Ubah ke wajib GPS"} className="p-1.5 rounded-lg hover:bg-slate-100 text-text-secondary">
                            {emp.requiresAttendance ? <MapPinOff size={16} /> : <MapPin size={16} />}
                          </button>
                          <button name="intent" value="toggle-active" title="Nonaktifkan/Aktifkan" className="p-1.5 rounded-lg hover:bg-slate-100 text-text-secondary">
                            <Power size={16} />
                          </button>
                          <button name="intent" value="delete" title="Hapus" className="p-1.5 rounded-lg hover:bg-danger/10 text-danger">
                            <Trash2 size={16} />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
