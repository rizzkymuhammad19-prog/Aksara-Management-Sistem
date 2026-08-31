"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  Wallet,
  ClipboardCheck,
  Users,
  ListTodo,
  Palette,
  TrendingUp,
  FileBarChart,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/divisi", label: "Divisi", icon: Building2 },
  { href: "/keuangan", label: "Keuangan", icon: Wallet },
  { href: "/absensi", label: "Absensi", icon: ClipboardCheck },
  { href: "/karyawan", label: "Karyawan", icon: Users },
  { href: "/task", label: "Task", icon: ListTodo },
  { href: "/design", label: "Design Tracker", icon: Palette },
  { href: "/performance", label: "Performance", icon: TrendingUp },
  { href: "/laporan", label: "Laporan", icon: FileBarChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-ink-gradient min-h-screen sticky top-0">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-ink font-display font-bold">
          A
        </div>
        <div>
          <p className="font-display font-medium text-text-inverse leading-tight">AKSARA</p>
          <p className="text-xs text-slate-500 leading-tight">Management System</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-white/10 text-accent"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-3 mx-3 mb-6 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-danger transition-colors"
      >
        <LogOut size={18} />
        Keluar
      </button>
    </aside>
  );
}
