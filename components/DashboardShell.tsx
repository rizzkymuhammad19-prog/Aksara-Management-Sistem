"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function DashboardShell({
  children,
  userName,
  userRole,
}: {
  children: React.ReactNode;
  userName: string;
  userRole: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex">
      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 shrink-0 sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85%] shadow-2xl">
            <div className="relative h-full">
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-4 z-10 text-slate-400 hover:text-white p-1"
                aria-label="Tutup menu"
              >
                <X size={22} />
              </button>
              <Sidebar onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-paper/80 backdrop-blur border-b border-slate-200/70 px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="md:hidden text-text p-1 -ml-1"
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>
            <div>
              <p className="text-sm text-text-secondary hidden sm:block">Selamat datang,</p>
              <p className="font-display font-medium text-text">{userName}</p>
            </div>
          </div>
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary-light text-primary whitespace-nowrap">
            {userRole}
          </span>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
