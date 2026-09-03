import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Lock } from "lucide-react";

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function PerformancePage() {
  const session = await getServerSession(authOptions);
  const isDirector = session?.user.role === "DIRECTOR";

  if (!isDirector) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="card text-center py-12">
          <div className="h-12 w-12 rounded-xl bg-primary-light flex items-center justify-center text-primary mx-auto mb-4">
            <Lock size={22} />
          </div>
          <p className="text-text font-medium mb-1">Halaman ini khusus Direktur</p>
          <p className="text-sm text-text-secondary">Ranking produktivitas karyawan hanya bisa dilihat Direktur.</p>
        </div>
      </div>
    );
  }

  const monthStart = startOfMonth();

  const employees = await prisma.employee.findMany({
    include: { user: true, division: true },
  });

  const rows = await Promise.all(
    employees.map(async (emp) => {
      const [attendanceRecords, assignedTasks, doneTasks, designCount] = await Promise.all([
        prisma.attendance.findMany({ where: { employeeId: emp.id, date: { gte: monthStart } } }),
        prisma.task.count({ where: { assigneeId: emp.id } }),
        prisma.task.count({ where: { assigneeId: emp.id, status: "DONE" } }),
        prisma.designTask.count({ where: { designerId: emp.id, date: { gte: monthStart } } }),
      ]);

      const presentCount = attendanceRecords.filter((a) => a.status === "HADIR" || a.status === "TERLAMBAT").length;
      const attendanceScore = attendanceRecords.length > 0 ? Math.round((presentCount / attendanceRecords.length) * 100) : 0;
      const taskCompletion = assignedTasks > 0 ? Math.round((doneTasks / assignedTasks) * 100) : 0;

      const overall = Math.round((attendanceScore + taskCompletion) / 2);

      return {
        id: emp.id,
        name: emp.user.name,
        division: emp.division.name,
        attendanceScore,
        taskCompletion,
        designCount,
        overall,
      };
    })
  );

  rows.sort((a, b) => b.overall - a.overall);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-medium text-text flex items-center gap-2">
          <TrendingUp size={20} /> Performance
        </h1>
        <p className="text-sm text-text-secondary">Ranking produktivitas karyawan — bulan ini.</p>
      </div>

      {rows.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-sm text-text-secondary">Belum ada data karyawan.</p>
        </div>
      ) : (
        <div className="card">
          <div className="space-y-4">
            {rows.map((r, i) => (
              <div key={r.id} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="h-7 w-7 rounded-full bg-primary-light text-primary text-xs font-medium flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-text">{r.name}</p>
                      <p className="text-xs text-text-secondary">{r.division}</p>
                    </div>
                  </div>
                  <span className="font-display text-lg font-medium text-text">{r.overall}%</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-text-secondary mb-1">Kehadiran</p>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: `${r.attendanceScore}%` }} />
                    </div>
                    <p className="text-text-secondary mt-0.5">{r.attendanceScore}%</p>
                  </div>
                  <div>
                    <p className="text-text-secondary mb-1">Task Selesai</p>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${r.taskCompletion}%` }} />
                    </div>
                    <p className="text-text-secondary mt-0.5">{r.taskCompletion}%</p>
                  </div>
                  <div>
                    <p className="text-text-secondary mb-1">Design Bulan Ini</p>
                    <p className="font-medium text-text mt-1.5">{r.designCount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
