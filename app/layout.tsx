import type { Metadata, Viewport } from "next";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mycellium Studio | AI Product Architect",
    template: "%s | Mycellium Studio",
  },
  description:
    "Develop rough product ideas into grounded understanding, architecture, requirements, and execution plans.",
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Mycellium Studio",
    title: "Mycellium Studio | AI Product Architect",
    description:
      "Turn rough product ideas into grounded understanding, architecture, requirements, and execution plans.",
    images: [{ url: "/brand/og-image.svg", width: 1200, height: 630, alt: "Mycellium Studio AI Product Architect" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mycellium Studio | AI Product Architect",
    description: "Give your product idea roots before delivery work begins.",
    images: ["/brand/og-image.svg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#173f31",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
