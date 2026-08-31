import LoginForm from "@/components/LoginForm";

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

        <LoginForm />

        <p className="text-xs text-text-secondary text-center mt-6">
          Demo: direktur@aksara.com / password123
        </p>
      </div>
    </main>
  );
}
