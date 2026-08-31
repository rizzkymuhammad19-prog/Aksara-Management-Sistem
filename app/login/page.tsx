import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: dark hero panel */}
      <section className="hidden lg:flex flex-col justify-between bg-ink-gradient text-text-inverse p-12">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-ink font-display font-bold">
            A
          </div>
          <span className="font-display font-medium tracking-tight">AKSARA</span>
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
          <div className="mb-8 lg:hidden flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-white font-display font-bold">
              A
            </div>
            <span className="font-display font-medium">AKSARA</span>
          </div>

          <h1 className="font-display text-2xl font-medium text-text mb-1">Masuk ke akun kamu</h1>
          <p className="text-sm text-text-secondary mb-8">Kelola divisi, keuangan, dan tim dari sini.</p>

          <LoginForm />

          <p className="text-xs text-text-secondary mt-6">
            Demo: direktur@aksara.com / password123
          </p>
        </div>
      </section>
    </main>
  );
}
