import { redirect } from "next/navigation";
import Link from "next/link";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { ChevronLeft } from "lucide-react";

async function createEmployee(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = (formData.get("phone") as string) || null;
  const divisionId = formData.get("divisionId") as string;
  const position = formData.get("position") as string;
  const role = formData.get("role") as string;
  const isDesigner = formData.get("isDesigner") === "on";

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, phone, role: role as any },
  });

  await prisma.employee.create({
    data: { userId: user.id, divisionId, position, isDesigner },
  });

  redirect("/karyawan");
}

export default async function TambahKaryawanPage() {
  const divisions = await prisma.division.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/karyawan" className="text-sm text-text-secondary hover:text-primary inline-flex items-center gap-1 mb-2">
          <ChevronLeft size={16} /> Karyawan
        </Link>
        <h1 className="font-display text-xl font-medium text-text">Tambah Karyawan</h1>
      </div>

      {divisions.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-text-secondary mb-3">Belum ada divisi. Tambahkan divisi dulu sebelum menambah karyawan.</p>
          <Link href="/divisi/tambah" className="text-sm font-medium text-primary hover:underline">+ Tambah Divisi</Link>
        </div>
      ) : (
        <form action={createEmployee} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Nama Lengkap</label>
            <input type="text" name="name" required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Email</label>
            <input type="email" name="email" required placeholder="nama@aksara.com" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Password Login</label>
            <input type="text" name="password" required minLength={6} placeholder="Minimal 6 karakter" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Nomor HP (opsional)</label>
            <input type="text" name="phone" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Divisi</label>
            <select name="divisionId" required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Jabatan</label>
            <input type="text" name="position" required placeholder="mis. Staff, Designer, Manager" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Role Sistem</label>
            <select name="role" required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="EMPLOYEE">Karyawan</option>
              <option value="ADMIN">Admin / Manager Divisi</option>
              <option value="DIRECTOR">Direktur</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-text">
            <input type="checkbox" name="isDesigner" className="rounded border-slate-300" />
            Karyawan ini seorang Designer
          </label>

          <button type="submit" className="w-full rounded-xl bg-ink hover:bg-ink-soft transition-colors text-white font-medium py-2.5 text-sm">
            Simpan Karyawan
          </button>
        </form>
      )}
    </div>
  );
}
