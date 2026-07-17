import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "mycellium studio | Planning foundations",
  description:
    "Turn an early software idea into a grounded, reviewable execution plan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
