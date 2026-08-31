import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChevronLeft } from "lucide-react";

async function createTask(formData: FormData) {
  "use server";

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const divisionId = formData.get("divisionId") as string;
  const assigneeId = (formData.get("assigneeId") as string) || null;
  const deadlineRaw = formData.get("deadline") as string;
  const priority = formData.get("priority") as string;

  await prisma.task.create({
    data: {
      title,
      description,
      divisionId,
      assigneeId: assigneeId || null,
      deadline: deadlineRaw ? new Date(deadlineRaw) : null,
      priority: priority as any,
      status: "TODO",
    },
  });

  redirect("/task");
}

export default async function TambahTaskPage() {
  const [divisions, employees] = await Promise.all([
    prisma.division.findMany({ orderBy: { name: "asc" } }),
    prisma.employee.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } }),
  ]);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/task" className="text-sm text-text-secondary hover:text-primary inline-flex items-center gap-1 mb-2">
          <ChevronLeft size={16} /> Task
        </Link>
        <h1 className="font-display text-xl font-medium text-text">Tambah Task</h1>
      </div>

      {divisions.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-sm text-text-secondary mb-3">Belum ada divisi. Tambahkan divisi dulu.</p>
          <Link href="/divisi/tambah" className="text-sm font-medium text-primary hover:underline">+ Tambah Divisi</Link>
        </div>
      ) : (
        <form action={createTask} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Nama Task</label>
            <input type="text" name="title" required className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Deskripsi (opsional)</label>
            <textarea name="description" rows={3} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
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
            <label className="block text-sm font-medium text-text mb-1.5">Ditugaskan ke (opsional)</label>
            <select name="assigneeId" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">— Belum ditentukan —</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.user.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Deadline (opsional)</label>
            <input type="date" name="deadline" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1.5">Priority</label>
            <select name="priority" required defaultValue="MEDIUM" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <button type="submit" className="w-full rounded-xl bg-ink hover:bg-ink-soft transition-colors text-white font-medium py-2.5 text-sm">
            Simpan Task
          </button>
        </form>
      )}
    </div>
  );
}
