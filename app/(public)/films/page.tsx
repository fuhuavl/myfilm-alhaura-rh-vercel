"use client";
import { useEffect, useRef, useState } from "react";
import { useFilms } from "@/hooks/useFilms";
import { useGenres } from "@/hooks/useGenres";
import FilmCard from "@/components/films/FilmCard";
import { FilmCardSkeleton } from "@/components/ui/Skeleton";
import { useDebounce } from "use-debounce";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Film, Genre } from "@/types";

export default function FilmsPage() {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useFilms(debouncedSearch || undefined, selectedGenre || undefined);

  const { data: genres } = useGenres();

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allFilms: Film[] = data?.pages.flatMap((p) => Array.isArray(p?.data) ? p.data : []) ?? [];  
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-7xl mx-auto">
      
      <div className="mb-10 animate-fade-up">
        <h1 className="font-display text-5xl sm:text-6xl tracking-widest text-white mb-2">
          KATALOG <span className="text-gold-400">FILM</span>
        </h1>
        <p className="text-noir-500 text-sm">
          Temukan film dari berbagai genre dan era
        </p>
      </div>

  
      <div className="flex flex-col sm:flex-row gap-3 mb-8 animate-fade-up" style={{ animationDelay: "100ms" }}>
       
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul film..."
            className="w-full bg-noir-800 border border-noir-700 hover:border-noir-600 focus:border-gold-400/60 text-white placeholder-noir-600 rounded-xl pl-10 pr-10 py-3 text-sm transition-all outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

 
        
      </div>

      {isError && (
        <div className="text-center py-20">
          <p className="text-crimson-400 text-sm">Gagal memuat film. Coba lagi nanti.</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <FilmCardSkeleton key={i} />)
          : allFilms.map((film, i) => (
              <FilmCard key={film.id} film={film} index={i % 12} />
            ))}

        {isFetchingNextPage &&
          Array.from({ length: 6 }).map((_, i) => <FilmCardSkeleton key={`more-${i}`} />)}
      </div>

      {!isLoading && allFilms.length === 0 && (
        <div className="text-center py-24">
          <p className="font-display text-3xl text-noir-700 tracking-widest mb-2">
            TIDAK DITEMUKAN
          </p>
          <p className="text-noir-500 text-sm">
            Coba dengan kata kunci lain
          </p>
        </div>
      )}

      <div ref={loadMoreRef} className="h-8 mt-4" />

      {!isLoading && !hasNextPage && allFilms.length > 0 && (
        <p className="text-center text-noir-600 text-xs mt-8 font-mono tracking-widest">
          — SEMUA FILM DITAMPILKAN —
        </p>
      )}
    </div>
  );
}
