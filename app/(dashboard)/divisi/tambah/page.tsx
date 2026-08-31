import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChevronLeft } from "lucide-react";

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function createDivision(formData: FormData) {
  "use server";

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const slug = slugify(name);

  await prisma.division.create({
    data: { name, slug, description },
  });

  redirect("/divisi");
}

export default function TambahDivisiPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/divisi" className="text-sm text-text-secondary hover:text-primary inline-flex items-center gap-1 mb-2">
          <ChevronLeft size={16} /> Divisi
        </Link>
        <h1 className="font-display text-xl font-medium text-text">Tambah Divisi</h1>
      </div>

      <form action={createDivision} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Nama Divisi</label>
          <input type="text" name="name" required placeholder="mis. Aksara Kreatif Visual" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1.5">Deskripsi (opsional)</label>
          <textarea name="description" rows={3} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>

        <button type="submit" className="w-full rounded-xl bg-ink hover:bg-ink-soft transition-colors text-white font-medium py-2.5 text-sm">
          Simpan Divisi
        </button>
      </form>
    </div>
  );
}
