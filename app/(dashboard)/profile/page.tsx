import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserCircle } from "lucide-react";

async function updateProfile(formData: FormData) {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const currentPassword = formData.get("currentPassword") as string;
  const newName = formData.get("name") as string;
  const newEmail = formData.get("email") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const isValid = await bcrypt.compare(currentPassword, user!.passwordHash);
  if (!isValid) {
    redirect("/profile?error=wrong-password");
  }

  if (newPassword && newPassword !== confirmPassword) {
    redirect("/profile?error=mismatch");
  }

  const data: any = { name: newName, email: newEmail };
  if (newPassword) {
    if (newPassword.length < 6) {
      redirect("/profile?error=too-short");
    }
    data.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await prisma.user.update({ where: { id: session.user.id }, data });

  redirect("/profile?success=1");
}

export default async function ProfilePage({ searchParams }: { searchParams: { error?: string; success?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  const errorMessages: Record<string, string> = {
    "wrong-password": "Password saat ini salah.",
    "mismatch": "Konfirmasi password baru tidak cocok.",
    "too-short": "Password baru minimal 6 karakter.",
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-xl font-medium text-text flex items-center gap-2">
          <UserCircle size={20} /> Profil Saya
        </h1>
        <p className="text-sm text-text-secondary">Ubah nama, email, atau password akun kamu.</p>
      </div>

      {searchParams.success && (
        <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-3 text-sm text-success">
          Profil berhasil diperbarui.
        </div>
      )}
      {searchParams.error && errorMessages[searchParams.error] && (
        <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3 text-sm text-danger">
          {errorMessages[searchParams.error]}
        </div>
      )}

      <form action={updateProfile} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Nama</label>
          <input type="text" name="name" defaultValue={user?.name} required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Email</label>
          <input type="email" name="email" defaultValue={user?.email} required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <hr className="border-slate-100" />

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Password Baru (opsional)</label>
          <input type="password" name="newPassword" placeholder="Kosongkan jika tidak ingin ganti password" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Konfirmasi Password Baru</label>
          <input type="password" name="confirmPassword" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <hr className="border-slate-100" />

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Password Saat Ini <span className="text-danger">*</span></label>
          <input type="password" name="currentPassword" required placeholder="Wajib diisi untuk konfirmasi perubahan" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <button type="submit" className="w-full rounded-xl bg-ink hover:bg-ink-soft transition-colors text-white font-medium py-2.5 text-sm">
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
