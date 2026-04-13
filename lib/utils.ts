import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const IMAGE_BASE = "https://film-management-api.labse.id/api/static";

// Ambil gambar pertama dari film (images[] array dari API)
export function getFilmImage(film: { images?: string[] | null; image_path?: string | null }): string {
  const path = film?.images?.[0] ?? film?.image_path ?? null;
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${IMAGE_BASE}/${path}`;
}

export function getImageUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${IMAGE_BASE}/${path}`;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + "…" : str;
}
