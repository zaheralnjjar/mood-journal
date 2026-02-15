import type { Metadata, Viewport } from "next";
import { Cairo, Tajawal, Amiri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth-context";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "مفكرتي - المفكرة اليومية الذكية",
  description: "تطبيق مفكرة يومية متقدم يدعم اللغة العربية مع ميزات الذكاء الاصطناعي وتتبع المزاج",
  keywords: ["مفكرة", "يوميات", "عربي", "تتبع المزاج", "صحتك النفسية"],
  authors: [{ name: "Mood Journal Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
  openGraph: {
    title: "مفكرتي - المفكرة اليومية الذكية",
    description: "سجل يومياتك وتتبع مزاجك مع ميزات ذكية",
    type: "website",
    images: [{ url: "/icons/icon-512x512.png", width: 512, height: 512 }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "مفكرتي",
  },
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${cairo.variable} ${tajawal.variable} ${amiri.variable} antialiased bg-background text-foreground font-cairo`}
        style={{ fontFamily: 'var(--font-cairo), var(--font-tajawal), var(--font-amiri), sans-serif' }}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
