export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-blue-400 px-4">
      <div className="w-full max-w-sm bg-white rounded-card shadow-soft p-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
          <h1 className="text-xl font-semibold text-text">Aksara Management System</h1>
          <p className="text-sm text-text-secondary mt-1">Integrated Business & Employee Management</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Username / Email</label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@aksara.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary hover:bg-primary-dark transition-colors text-white font-medium py-2.5 text-sm"
          >
            Masuk ke Dashboard
          </button>
        </form>
      </div>
    </main>
  );
}
