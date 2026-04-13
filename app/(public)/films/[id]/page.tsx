"use client";
import { useFilm } from "@/hooks/useFilms";
import { useAuthStore } from "@/store/authStore";
import { useAddToWatchlist, useWatchlist } from "@/hooks/useWatchlist";
import ReviewCard from "@/components/reviews/ReviewCard";
import AddReviewForm from "@/components/reviews/AddReviewForm";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { User, Plus, ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";

export default function FilmDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: film, isLoading, isError } = useFilm(id);
  const { user } = useAuthStore();
  const addToWatchlist = useAddToWatchlist();
  const { data: watchlist } = useWatchlist();
  const isInWatchlist = user && Array.isArray(watchlist) && watchlist.some((w: any) => w.film_title === film?.title);
  const handleAddToWatchlist = async () => {
    if (!user) {
      toast.error("Login dulu untuk menambah ke watchlist");
      return;
    }
    try {
      await addToWatchlist.mutateAsync(film.id);
      toast.success("Ditambahkan ke watchlist!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal menambah ke watchlist");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 mt-8">
            <Skeleton className="w-full md:w-64 lg:w-80 aspect-[2/3] flex-shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-4 pt-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !film) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-3xl text-crimson-400 tracking-widest mb-4">
            FILM TIDAK DITEMUKAN
          </p>
          <Link href="/films">
            <Button variant="outline">
              <ArrowLeft size={14} /> Kembali ke Katalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const avgRating =
    film.reviews && film.reviews.length > 0
      ? (
          film.reviews.reduce((s: number, r: any) => s + r.rating, 0) /
          film.reviews.length
        ).toFixed(1)
      : null;

  return (
    <div className="min-h-screen pt-20 pb-16">
      
      <div className="absolute top-0 left-0 right-0 h-[50vh] overflow-hidden -z-10">
        {film.images?.[0] && (
          <img
            src={`https://film-management-api.labse.id/api/static/${film.images[0]}`}
            alt=""
            className="w-full h-full object-cover opacity-10 blur-xl scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-noir-950/50 via-noir-950/80 to-noir-950" />
      </div>

      <div className="max-w-6xl mx-auto px-4">
        
        <Link
          href="/films"
          className="inline-flex items-center gap-2 text-noir-500 hover:text-white transition-colors text-sm mb-8 mt-6 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Kembali
        </Link>

       
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 animate-fade-up">
          
          <div className="w-full md:w-56 lg:w-72 flex-shrink-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-noir-700/50 shadow-2xl">
              {film.images?.[0] ? (
                
                <img
                  src={`https://film-management-api.labse.id/api/static/${film.images[0]}`}
                  alt={film.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-noir-700 text-xs bg-noir-800">
                  No Poster
                </div>
              )}
            </div>

        
            <Button
              className="w-full mt-4"
              variant="secondary"
              onClick={handleAddToWatchlist}
              loading={addToWatchlist.isPending}
              disabled={!!isInWatchlist}
            >
              <Plus size={14} /> {isInWatchlist ? "Sudah di Watchlist" : "Tambah ke Watchlist"}
            </Button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3 mb-2">
              {film.release_year && (
                <span className="font-mono text-sm text-gold-400 bg-gold-400/10 border border-gold-400/30 px-3 py-1 rounded-full">
                  {film.release_year}
                </span>
              )}
              {avgRating && (
                <span className="font-mono text-sm text-white bg-noir-700 border border-noir-600 px-3 py-1 rounded-full">
                  ★ {avgRating}
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-wider text-white leading-none mb-4">
              {film.title}
            </h1>

            {film.director && (
              <div className="flex items-center gap-2 text-noir-500 text-sm mb-5">
                <User size={13} />
                <span>
                  Sutradara: <span className="text-white">{film.director}</span>
                </span>
              </div>
            )}

            {film.genres && film.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {film.genres.map((g: any) => (
                  <Badge key={g.id} variant="gold">{g.name}</Badge>
                ))}
              </div>
            )}

            {film.synopsis && (
              <div className="mb-8">
                <h2 className="text-xs font-medium text-noir-500 uppercase tracking-widest mb-3">
                  Sinopsis
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  {film.synopsis}
                </p>
              </div>
            )}
          </div>
        </div>

  
        <div className="mt-16 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare size={18} className="text-gold-400" />
            <h2 className="font-display text-2xl tracking-widest text-white">
              ULASAN{" "}
              <span className="text-gold-400">({film.reviews?.length ?? 0})</span>
            </h2>
          </div>

          {user ? (
            <div className="mb-8">
              <AddReviewForm filmId={film.id} />
            </div>
          ) : (
            <div className="mb-8 p-5 bg-noir-800/40 border border-noir-700/50 rounded-xl text-center">
              <p className="text-noir-500 text-sm">
                <Link href="/login" className="text-gold-400 hover:underline">Login</Link>{" "}
                untuk menulis ulasan
              </p>
            </div>
          )}

          <div className="space-y-4">
            {film.reviews && film.reviews.length > 0 ? (
              film.reviews.map((review: any) => (
                <ReviewCard key={review.id} review={review} filmId={film.id} />
              ))
            ) : (
              <div className="text-center py-12 text-noir-600">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Belum ada ulasan. Jadilah yang pertama!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}