import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Palette, Plus, Trash2, ExternalLink } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  REVISI: "Revisi",
  SELESAI: "Selesai",
  APPROVED: "Approved",
};

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-slate-100 text-text-secondary",
  REVISI: "bg-warning/10 text-warning",
  SELESAI: "bg-primary-light text-primary",
  APPROVED: "bg-success/10 text-success",
};

async function deleteDesign(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await prisma.designFile.deleteMany({ where: { designTaskId: id } });
  await prisma.designTask.delete({ where: { id } });
  redirect("/design");
}

export default async function DesignTrackerPage() {
  const designs = await prisma.designTask.findMany({
    include: { designer: { include: { user: true } }, division: true, files: true },
    orderBy: { date: "desc" },
  });

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const thisMonthCount = designs.filter((d) => d.date >= monthStart).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-xl font-medium text-text">Design Tracker</h1>
          <p className="text-sm text-text-secondary">{designs.length} total · {thisMonthCount} bulan ini</p>
        </div>
        <Link href="/design/tambah" className="inline-flex items-center gap-1.5 text-sm font-medium bg-ink text-white px-4 py-2 rounded-xl hover:bg-ink-soft transition-colors">
          <Plus size={16} /> Tambah Design
        </Link>
      </div>

      {designs.length === 0 ? (
        <div className="card text-center py-16">
          <div className="h-12 w-12 rounded-xl bg-primary-light flex items-center justify-center text-primary mx-auto mb-4">
            <Palette size={22} />
          </div>
          <p className="text-text font-medium mb-1">Belum ada pekerjaan design</p>
          <p className="text-sm text-text-secondary mb-4">Mulai catat pekerjaan design pertama.</p>
          <Link href="/design/tambah" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <Plus size={14} /> Tambah Design
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {designs.map((d) => (
            <div key={d.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div className="h-10 w-10 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                  <Palette size={18} />
                </div>
                <form action={deleteDesign}>
                  <input type="hidden" name="id" value={d.id} />
                  <button title="Hapus" className="text-text-secondary hover:text-danger">
                    <Trash2 size={15} />
                  </button>
                </form>
              </div>

              <p className="font-medium text-text mb-0.5">{d.projectName}</p>
              <p className="text-xs text-text-secondary mb-3">{d.designType} · {d.division.name}</p>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_COLOR[d.status]}`}>
                  {STATUS_LABEL[d.status]}
                </span>
                {d.client && <span className="text-xs text-text-secondary">Client: {d.client}</span>}
              </div>

              <p className="text-xs text-text-secondary mb-1">👤 {d.designer.user.name}</p>
              <p className="text-xs text-text-secondary mb-3">
                {new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(d.date)}
              </p>

              {d.files.length > 0 && d.files[0].linkUrl && (
                <a href={d.files[0].linkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  Lihat hasil <ExternalLink size={11} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
