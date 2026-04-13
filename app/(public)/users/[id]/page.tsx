"use client";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import Badge from "@/components/ui/Badge";
import { User, Calendar, Film, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function UserProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["user", id],
    queryFn: () => api.get(`/users/${id}`).then((r) => r.data.data ?? r.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-6 mb-10">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-display text-3xl text-crimson-400 tracking-widest">
          USER TIDAK DITEMUKAN
        </p>
      </div>
    );
  }

  const user = data;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-3xl mx-auto animate-fade-up">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12">
        <div className="w-24 h-24 rounded-full bg-gold-400/20 border-2 border-gold-400/40 flex items-center justify-center flex-shrink-0">
          <User size={36} className="text-gold-400" />
        </div>
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start mb-2">
            <h1 className="font-display text-4xl tracking-widest text-white">
              {user.username?.toUpperCase()}
            </h1>
            {user.role === "admin" && (
              <Badge variant="gold">
                <Shield size={10} className="mr-1" />
                Admin
              </Badge>
            )}
          </div>
          <p className="text-noir-500 text-sm">{user.email}</p>
          {user.created_at && (
            <div className="flex items-center gap-1.5 text-noir-600 text-xs mt-2 justify-center sm:justify-start">
              <Calendar size={11} />
              <span>Bergabung {formatDate(user.created_at)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {user.film_lists !== undefined && (
          <div className="bg-noir-800/60 border border-noir-700/50 rounded-xl p-5 text-center">
            <Film size={20} className="text-gold-400 mx-auto mb-2" />
            <p className="font-display text-3xl tracking-wider text-white">
              {Array.isArray(user.film_lists) ? user.film_lists.length : user.film_lists ?? 0}
            </p>
            <p className="text-noir-500 text-xs mt-1">Watchlist</p>
          </div>
        )}
        {user.reviews !== undefined && (
          <div className="bg-noir-800/60 border border-noir-700/50 rounded-xl p-5 text-center">
            <User size={20} className="text-gold-400 mx-auto mb-2" />
            <p className="font-display text-3xl tracking-wider text-white">
              {Array.isArray(user.reviews) ? user.reviews.length : user.reviews ?? 0}
            </p>
            <p className="text-noir-500 text-xs mt-1">Ulasan</p>
          </div>
        )}
      </div>
{Array.isArray(user.film_lists) && user.film_lists.some((fl: any) => fl.visibility === "public") && (
  <div className="mt-10">
    <h2 className="font-display text-xl tracking-widest text-white mb-5">
      WATCHLIST PUBLIK
    </h2>
    <div className="space-y-3">
      {user.film_lists
        .filter((fl: any) => fl.visibility === "public")
        .map((fl: any) => (
          <div
            key={fl.id}
            className="p-4 bg-noir-800/40 border border-noir-700/40 rounded-xl flex items-center gap-4"
          >
            <Film size={16} className="text-gold-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-white">{fl.film_title}</span>
              {fl.list_status && (
                <p className="text-xs text-noir-500 mt-0.5 capitalize">{fl.list_status}</p>
              )}
            </div>
          </div>
        ))}
    </div>
  </div>
)}
        
        <div className="mt-10">
        
          <div className="space-y-3">
            {user.film_lists
              .filter((fl: any) => fl.is_public)
              .map((fl: any) => (
                <div
                  key={fl.id}
                  className="p-4 bg-noir-800/40 border border-noir-700/40 rounded-xl flex items-center gap-4"
                >
                  <Film size={16} className="text-gold-400 flex-shrink-0" />
                  <span className="text-sm text-white">
                    {fl.film?.title ?? fl.film_id}
                  </span>
                </div>
              ))}
          </div>
        </div>
      
    </div>
  );
}
