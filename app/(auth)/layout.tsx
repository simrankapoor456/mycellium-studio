import { AuthValuePanel } from "@/components/auth/AuthValuePanel";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="grid min-h-[100dvh] bg-canvas text-ink lg:grid-cols-[0.9fr_1.1fr]">
      <AuthValuePanel />
      <div className="flex items-center justify-center px-5 py-12 sm:px-10 lg:py-16">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>
  );
}
