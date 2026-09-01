import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChevronLeft } from "lucide-react";

const DESIGN_TYPES = ["Poster", "Feed Instagram", "Story", "Banner", "Brosur", "Undangan", "Logo", "Thumbnail", "Video", "Packaging", "Lainnya"];

async function createDesign(formData: FormData) {
  "use server";

  const designerId = formData.get("designerId") as string;
  const designer = await prisma.employee.findUnique({ where: { id: designerId } });
  if (!designer) throw new Error("Designer tidak ditemukan.");

  const linkUrl = (formData.get("linkUrl") as string) || null;

  const design = await prisma.designTask.create({
    data: {
      divisionId: designer.divisionId,
      designerId,
      date: new Date(formData.get("date") as string),
      projectName: formData.get("projectName") as string,
      designType: formData.get("designType") as string,
      client: (formData.get("client") as string) || null,
      description: (formData.get("description") as string) || null,
      status: formData.get("status") as any,
      note: (formData.get("note") as string) || null,
    },
  });

  if (linkUrl) {
    await prisma.designFile.create({ data: { designTaskId: design.id, linkUrl } });
  }

  redirect("/design");
}

export default async function TambahDesignPage() {
  const designers = await prisma.employee.findMany({
    where: { isDesigner: true },
    include: { user: true, division: true },
    orderBy: { user: { name: "asc" } },
  });

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/design" className="text-sm text-text-secondary hover:text-primary inline-flex items-center gap-1 mb-2">
          <ChevronLeft size={16} /> Design Tracker
        </Link>
        <h1 className="font-display text-xl font-medium text-text">Tambah Pekerjaan Design</h1>
      </div>

      {designers.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-text-secondary mb-3">Belum ada karyawan dengan role Designer. Tandai seorang karyawan sebagai Designer dulu di halaman Karyawan.</p>
          <Link href="/karyawan" className="text-sm font-medium text-primary hover:underline">Ke Karyawan</Link>
        </div>
      ) : (
        <form action={createDesign} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Designer</label>
            <select name="designerId" required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {designers.map((d) => (
                <option key={d.id} value={d.id}>{d.user.name} — {d.division.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Nama Project</label>
            <input type="text" name="projectName" required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Jenis Design</label>
            <select name="designType" required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {DESIGN_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Tanggal</label>
            <input type="date" name="date" defaultValue={today} required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Client (opsional)</label>
            <input type="text" name="client" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Link Hasil Design (opsional)</label>
            <input type="url" name="linkUrl" placeholder="https://..." className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Status</label>
            <select name="status" required defaultValue="DRAFT" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="DRAFT">Draft</option>
              <option value="REVISI">Revisi</option>
              <option value="SELESAI">Selesai</option>
              <option value="APPROVED">Approved</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Deskripsi (opsional)</label>
            <textarea name="description" rows={3} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Catatan (opsional)</label>
            <textarea name="note" rows={2} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <button type="submit" className="w-full rounded-xl bg-ink hover:bg-ink-soft transition-colors text-white font-medium py-2.5 text-sm">
            Simpan Pekerjaan Design
          </button>
        </form>
      )}
    </div>
  );
}
