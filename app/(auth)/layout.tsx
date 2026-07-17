import Link from "next/link";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen bg-canvas px-5 py-10 text-ink sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <Link className="font-serif text-xl font-semibold text-forest" href="/">
          mycellium studio
        </Link>
        {children}
      </div>
    </main>
  );
}
