import type { Metadata, Viewport } from "next";
import { Geist, Oswald, Montserrat, Jost } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { Analytics } from "@vercel/analytics/react";
import { companyInfo } from "@/data/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
  metadataBase: new URL("https://standardtx.com"),
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
    images: [
      {
        url: "/images/hero-truck.jpg",
        width: 1200,
        height: 630,
        alt: "Standard Safety & Supply — Permian Basin safety services",
      },
    ],
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: companyInfo.name,
              description:
                "Safety equipment, training, and environmental services for the oil & gas industry in the Permian Basin.",
              url: "https://standardtx.com",
              telephone: companyInfo.phone,
              email: companyInfo.email,
              address: {
                "@type": "PostalAddress",
                streetAddress: companyInfo.address.street,
                addressLocality: companyInfo.address.city,
                addressRegion: companyInfo.address.state,
                postalCode: companyInfo.address.zip,
                addressCountry: "US",
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                opens: "00:00",
                closes: "23:59",
              },
              areaServed: {
                "@type": "GeoCircle",
                geoMidpoint: {
                  "@type": "GeoCoordinates",
                  latitude: 31.8457,
                  longitude: -102.3676,
                },
                geoRadius: "150mi",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${oswald.variable} ${montserrat.variable} ${jost.variable} min-h-screen font-sans antialiased`}
      >
        <ThemeProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
