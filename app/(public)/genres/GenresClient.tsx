"use client";
import { useGenres } from "@/hooks/useGenres";
import { Skeleton } from "@/components/ui/Skeleton";
import { List, Film } from "lucide-react";
import type { Genre } from "@/types";

export default function GenresClient() {
  const { data: genres, isLoading, isError } = useGenres();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <div className="mb-10 animate-fade-up">
        <h1 className="font-display text-5xl sm:text-6xl tracking-widest text-white mb-2">
          SEMUA <span className="text-gold-400">GENRE</span>
        </h1>
        <p className="text-noir-500 text-sm">
          Seluruh kategori film yang tersedia
        </p>
      </div>

      {isError && (
        <p className="text-crimson-400 text-sm text-center py-12">
          Gagal memuat genre. Coba lagi nanti.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          : Array.isArray(genres) &&
            genres.map((genre: Genre, i: number) => (
              <div
                key={genre.id}
                className="group p-5 bg-noir-800/60 border border-noir-700/50 rounded-xl hover:border-gold-400/40 hover:bg-noir-800 transition-all duration-200 animate-fade-up cursor-default"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center group-hover:border-gold-400/40 transition-colors">
                    <Film size={14} className="text-gold-400" />
                  </div>
                </div>
                <h3 className="font-semibold text-white text-sm group-hover:text-gold-400 transition-colors">
                  {genre.name}
                </h3>
                {genre.description && (
                  <p className="text-noir-500 text-xs mt-1 line-clamp-2">
                    {genre.description}
                  </p>
                )}
              </div>
            ))}
      </div>

      {!isLoading && (!genres || (Array.isArray(genres) && genres.length === 0)) && (
        <div className="text-center py-20">
          <List size={32} className="mx-auto mb-3 text-noir-700" />
          <p className="text-noir-500 text-sm">Belum ada genre tersedia</p>
        </div>
      )}
    </div>
  );
}
