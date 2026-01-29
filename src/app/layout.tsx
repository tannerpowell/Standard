import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald, Montserrat, Jost } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NavigationProgress } from "@/components/layout/navigation-progress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Standard Safety & Supply | Odessa, TX",
    template: "%s | Standard Safety & Supply",
  },
  description:
    "Your trusted partner for safety equipment, training, and environmental services in the Permian Basin. Serving Odessa, Midland, and West Texas since 1990.",
  keywords: [
    "safety equipment",
    "PPE",
    "safety training",
    "OSHA training",
    "H2S training",
    "environmental services",
    "Odessa TX",
    "Permian Basin",
    "oilfield safety",
  ],
  authors: [{ name: "Standard Safety & Supply" }],
  creator: "Standard Safety & Supply",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://standardtx.com",
    siteName: "Standard Safety & Supply",
    title: "Standard Safety & Supply | Odessa, TX",
    description:
      "Your trusted partner for safety equipment, training, and environmental services in the Permian Basin.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Standard Safety & Supply | Odessa, TX",
    description:
      "Your trusted partner for safety equipment, training, and environmental services in the Permian Basin.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} ${montserrat.variable} ${jost.variable} min-h-screen font-sans antialiased`}
      >
        <ThemeProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
