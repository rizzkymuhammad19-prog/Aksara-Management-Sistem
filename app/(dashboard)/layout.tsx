import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Selamat datang,</p>
            <p className="font-semibold text-text">{session.user.name}</p>
          </div>
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary-light text-primary">
            {session.user.role}
          </span>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
