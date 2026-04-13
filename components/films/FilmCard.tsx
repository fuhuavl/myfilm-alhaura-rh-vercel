"use client";
import Link from "next/link";
import { Film } from "@/types";
import Badge from "@/components/ui/Badge";
import { getFilmImage } from "@/lib/utils";
import { useState } from "react";
import { ImageOff } from "lucide-react";

interface FilmCardProps {
  film: Film;
  index?: number;
}

export default function FilmCard({ film, index = 0 }: FilmCardProps) {
  const src = getFilmImage(film);
  const [failed, setFailed] = useState(false);

  return (
    <Link
      href={`/films/${film.id}`}
      className="group block animate-fade-up"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      <div className="relative overflow-hidden rounded-xl bg-noir-800 border border-noir-700/50 hover:border-gold-400/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gold-400/5">
        <div className="relative aspect-[2/3] overflow-hidden bg-noir-800">
          {src && !failed ? (
            
            <img
              src={src}
              alt={film.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-noir-700">
              <ImageOff size={28} />
              <span className="text-xs">No Image</span>
            </div>
          )}
          {film.release_year && (
            <div className="absolute top-2 right-2 bg-noir-950/80 backdrop-blur-sm text-gold-400 text-xs font-mono px-2 py-1 rounded-md border border-noir-700/50">
              {film.release_year}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-white text-sm leading-tight mb-1 group-hover:text-gold-400 transition-colors line-clamp-2">
            {film.title}
          </h3>
          {film.director && (
            <p className="text-noir-500 text-xs mb-3 truncate">{film.director}</p>
          )}
          {film.genres && film.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {film.genres.slice(0, 2).map((g) => (
                <Badge key={g.id} variant="neutral" className="text-[10px]">{g.name}</Badge>
              ))}
              {film.genres.length > 2 && (
                <Badge variant="neutral" className="text-[10px]">+{film.genres.length - 2}</Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
