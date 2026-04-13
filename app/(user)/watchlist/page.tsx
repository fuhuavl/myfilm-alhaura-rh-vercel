
"use client";
import { useState } from "react";
import { useWatchlist, useUpdateWatchlistVisibility } from "@/hooks/useWatchlist";
import { Skeleton } from "@/components/ui/Skeleton";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Globe, Lock, Film } from "lucide-react";
import toast from "react-hot-toast";

const IMAGE_BASE = "https://film-management-api.labse.id/api/static";

function WatchlistItem({ item, onToggle, isPending }: { item: any; onToggle: () => void; isPending: boolean }) {

  const src = "";
const [failed, setFailed] = useState(true);

  return (
    <div className="flex items-center gap-4 p-4 bg-noir-800/60 border border-noir-700/50 rounded-xl hover:border-noir-600/50 transition-all">
      <Link href={`/films/${item.film_id}`} className="flex-shrink-0">
        <div className="w-12 h-16 rounded-lg overflow-hidden border border-noir-700/50 bg-noir-800 flex items-center justify-center">
          {src && !failed ? (
           
            <img
              src={src}
              alt={item.film?.title ?? "Film"}
              className="w-full h-full object-cover"
              onError={() => setFailed(true)}
            />
          ) : (
            <Film size={16} className="text-noir-600" />
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link href="#">
          <h3 className="font-semibold text-white text-sm hover:text-gold-400 transition-colors truncate">
            {item.film_title ?? item.film_id}
          </h3>
        </Link>
        {item.list_status && (
          <p className="text-noir-500 text-xs mt-0.5 capitalize">{item.list_status}</p>
        )}
      </div>

      <Badge variant={item.visibility === "public" ? "green" : "neutral"}>
        {item.visibility === "public" ? (
          <><Globe size={10} className="mr-1" /> Publik</>
        ) : (
          <><Lock size={10} className="mr-1" /> Privat</>
        )}
      </Badge>

      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        loading={isPending}
        className="flex-shrink-0 text-xs"
      >
        {item.visibility === "public" ? <Lock size={12} /> : <Globe size={12} />}
        <span className="hidden sm:inline">
          Jadikan {item.visibility === "public" ? "Privat" : "Publik"}
        </span>
      </Button>
    </div>
  );
}

export default function WatchlistPage() {
  const { data: watchlist, isLoading, isError } = useWatchlist();
  const updateVisibility = useUpdateWatchlistVisibility();

  const handleToggleVisibility = async (item: any) => {
    try {
      await updateVisibility.mutateAsync({
        id: item.id,
        is_public: item.visibility !== "public",
      });
      toast.success(`Diubah ke ${item.visibility !== "public" ? "Publik" : "Privat"}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal mengubah visibilitas");
    }
  };

  const items: any[] = Array.isArray(watchlist) ? watchlist : [];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-4xl mx-auto">
      <div className="mb-10 animate-fade-up">
        <h1 className="font-display text-5xl sm:text-6xl tracking-widest text-white mb-2">
          WATCHLIST <span className="text-gold-400">KU</span>
        </h1>
        <p className="text-noir-500 text-sm">Film yang ingin atau sedang ditonton</p>
      </div>

      {isError && (
        <p className="text-crimson-400 text-sm text-center py-12">Gagal memuat watchlist.</p>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24">
          <Film size={48} className="mx-auto mb-4 text-noir-700" />
          <p className="font-display text-3xl text-noir-700 tracking-widest mb-2">MASIH KOSONG</p>
          <p className="text-noir-500 text-sm mb-6">Tambahkan film dari katalog ke watchlist kamu</p>
          <Link href="/films">
            <Button>Jelajahi Film</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
            >
              <WatchlistItem
                item={item}
                onToggle={() => handleToggleVisibility(item)}
                isPending={updateVisibility.isPending}
              />
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <p className="text-center text-noir-600 text-xs mt-8 font-mono tracking-widest">
          — {items.length} FILM DALAM WATCHLIST —
        </p>
      )}
    </div>
  );
}