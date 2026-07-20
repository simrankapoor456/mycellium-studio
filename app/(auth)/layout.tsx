import { AuthValuePanel } from "@/components/auth/AuthValuePanel";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="auth-shell">
      <AuthValuePanel />
      <div className="auth-shell__form-region">
        <div className="auth-shell__form-surface">{children}</div>
      </div>
    </main>
  );
}
