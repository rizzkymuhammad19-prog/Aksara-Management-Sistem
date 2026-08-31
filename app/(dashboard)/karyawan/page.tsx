import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Users, Plus } from "lucide-react";

export default async function KaryawanPage() {
  const employees = await prisma.employee.findMany({
    include: { user: true, division: true },
    orderBy: { user: { name: "asc" } },
  });

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

      {employees.length === 0 ? (
        <div className="card text-center py-16">
          <div className="h-12 w-12 rounded-xl bg-primary-light flex items-center justify-center text-primary mx-auto mb-4">
            <Users size={22} />
          </div>
          <p className="text-text font-medium mb-1">Belum ada karyawan</p>
          <p className="text-sm text-text-secondary mb-4">
            {"Pastikan sudah ada divisi dulu, baru tambahkan karyawan."}
          </p>
          <Link href="/karyawan/tambah" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <Plus size={14} /> Tambah Karyawan
          </Link>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary border-b border-slate-100">
                  <th className="pb-2 font-medium">Nama</th>
                  <th className="pb-2 font-medium">Divisi</th>
                  <th className="pb-2 font-medium">Jabatan</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 font-medium text-text">{emp.user.name}</td>
                    <td className="py-2.5">{emp.division.name}</td>
                    <td className="py-2.5">{emp.position}{emp.isDesigner ? " · Designer" : ""}</td>
                    <td className="py-2.5 text-text-secondary">{emp.user.email}</td>
                    <td className="py-2.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${emp.user.isActive ? "bg-primary-light text-primary" : "bg-slate-100 text-text-secondary"}`}>
                        {emp.user.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
