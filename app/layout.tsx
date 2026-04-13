import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: {
    default: "MyFilm — Discover Cinema",
    template: "%s | MyFilm",
  },
  description:
    "MyFilm adalah platform manajemen film modern. Temukan, ulas, dan simpan film favoritmu.",
  keywords: ["film", "movie", "review", "watchlist", "cinema"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "MyFilm",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
