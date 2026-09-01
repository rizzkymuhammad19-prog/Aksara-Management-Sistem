import Image from "next/image";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: dark hero panel */}
      <section className="hidden lg:flex flex-col justify-between bg-ink-gradient text-text-inverse p-12">
        <div className="bg-white/95 rounded-xl px-4 py-3 w-fit">
          <Image src="/logo.png" alt="AKSARA" width={160} height={54} className="h-auto w-[160px]" />
        </div>

        <div>
          <p className="font-display text-7xl font-medium leading-none">5<span className="text-accent">.</span></p>
          <p className="text-lg text-slate-300 mt-3 max-w-xs">
            Divisi bisnis, dipantau dari satu sistem — keuangan, kehadiran, dan produktivitas dalam satu layar.
          </p>
        </div>

        <p className="text-sm text-slate-500">Aksara Management System — Internal Platform</p>
      </section>

      {/* Right: login form */}
      <section className="flex items-center justify-center p-8 bg-paper">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="bg-white/95 rounded-lg px-3 py-2.5 w-fit border border-slate-100">
              <Image src="/logo.png" alt="AKSARA" width={130} height={44} className="h-auto w-[130px]" />
            </div>
          </div>

          <h1 className="font-display text-2xl font-medium text-text mb-1">Masuk ke akun kamu</h1>
          <p className="text-sm text-text-secondary mb-8">Kelola divisi, keuangan, dan tim dari sini.</p>

          <LoginForm />
        </div>
      </section>
    </main>
  );
}
