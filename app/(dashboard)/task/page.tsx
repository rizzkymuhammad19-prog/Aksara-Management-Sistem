import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Plus, ChevronLeft, ChevronRight, Trash2, Calendar } from "lucide-react";

const COLUMNS: { status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"; label: string }[] = [
  { status: "TODO", label: "To Do" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "REVIEW", label: "Review" },
  { status: "DONE", label: "Done" },
];

const PRIORITY_COLOR: Record<string, string> = {
  LOW: "bg-slate-100 text-text-secondary",
  MEDIUM: "bg-primary-light text-primary",
  HIGH: "bg-warning/10 text-warning",
  URGENT: "bg-danger/10 text-danger",
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short" }).format(d);
}

async function moveTask(formData: FormData) {
  "use server";
  const taskId = formData.get("taskId") as string;
  const status = formData.get("status") as string;
  await prisma.task.update({ where: { id: taskId }, data: { status: status as any } });
  redirect("/task");
}

async function deleteTask(formData: FormData) {
  "use server";
  const taskId = formData.get("taskId") as string;
  await prisma.taskComment.deleteMany({ where: { taskId } });
  await prisma.task.delete({ where: { id: taskId } });
  redirect("/task");
}

export default async function TaskPage() {
  const tasks = await prisma.task.findMany({
    include: { division: true, assignee: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-xl font-medium text-text">Task</h1>
          <p className="text-sm text-text-secondary">{tasks.length} task — kelola dengan papan Kanban.</p>
        </div>
        <Link href="/task/tambah" className="inline-flex items-center gap-1.5 text-sm font-medium bg-ink text-white px-4 py-2 rounded-xl hover:bg-ink-soft transition-colors">
          <Plus size={16} /> Tambah Task
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-text font-medium mb-1">Belum ada task</p>
          <p className="text-sm text-text-secondary mb-4">Mulai dengan menambahkan task pertama untuk tim.</p>
          <Link href="/task/tambah" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <Plus size={14} /> Tambah Task
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col, colIndex) => {
            const columnTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm font-medium text-text">{col.label}</p>
                  <span className="text-xs text-text-secondary bg-slate-100 rounded-full px-2 py-0.5">{columnTasks.length}</span>
                </div>

                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <div key={task.id} className="card !p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium text-text leading-snug">{task.title}</p>
                        <form action={deleteTask}>
                          <input type="hidden" name="taskId" value={task.id} />
                          <button title="Hapus task" className="text-text-secondary hover:text-danger shrink-0">
                            <Trash2 size={14} />
                          </button>
                        </form>
                      </div>

                      <p className="text-xs text-text-secondary mb-2">{task.division.name}</p>

                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_COLOR[task.priority]}`}>
                          {PRIORITY_LABEL[task.priority]}
                        </span>
                        {task.deadline && (
                          <span className="text-xs text-text-secondary flex items-center gap-1">
                            <Calendar size={11} /> {fmtDate(task.deadline)}
                          </span>
                        )}
                      </div>

                      {task.assignee && (
                        <p className="text-xs text-text-secondary mb-3">👤 {task.assignee.user.name}</p>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                        <form action={moveTask}>
                          <input type="hidden" name="taskId" value={task.id} />
                          <input type="hidden" name="status" value={COLUMNS[Math.max(colIndex - 1, 0)].status} />
                          <button disabled={colIndex === 0} className="p-1 rounded text-text-secondary hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed">
                            <ChevronLeft size={16} />
                          </button>
                        </form>
                        <form action={moveTask}>
                          <input type="hidden" name="taskId" value={task.id} />
                          <input type="hidden" name="status" value={COLUMNS[Math.min(colIndex + 1, COLUMNS.length - 1)].status} />
                          <button disabled={colIndex === COLUMNS.length - 1} className="p-1 rounded text-text-secondary hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed">
                            <ChevronRight size={16} />
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="text-xs text-text-secondary text-center py-6 border border-dashed border-slate-200 rounded-xl">
                      Kosong
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
