import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Film",
  description: "Jelajahi ribuan film dari berbagai genre di MyFilm",
};

export default function FilmsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
