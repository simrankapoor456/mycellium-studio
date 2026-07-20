import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";
import "./phase-7-1.css";
import "./phase-7-2.css";
import "./living-product.css";
import "./form-trust.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mycellium Studio | Living Product Intelligence",
    template: "%s | Mycellium Studio",
  },
  description:
    "Turn scattered product context into grounded discovery, traceable architecture, and editable Product Blueprints.",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/brand/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/brand/icons/app-icon-512.png", sizes: "512x512", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Mycellium Studio",
    title: "Mycellium Studio | Living Product Intelligence",
    description:
      "Ideas take root. Products take shape through grounded discovery, architecture, and editable Product Blueprints.",
    images: [{ url: "/brand/social/open-graph.png", width: 1280, height: 640, alt: "Mycellium Studio. Ideas take root. Products take shape." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mycellium Studio | Living Product Intelligence",
    description: "Ideas take root. Products take shape.",
    images: ["/brand/social/open-graph.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07110d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
