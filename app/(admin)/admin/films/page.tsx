"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useGenres } from "@/hooks/useGenres";
import { useCreateFilm } from "@/hooks/useFilms";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { Shield, ImageIcon, X } from "lucide-react";
import type { Genre } from "@/types";

const schema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  synopsis: z.string().min(10, "Sinopsis minimal 10 karakter"),
  airing_status: z.string().default("finished_airing"),
  total_episodes: z.string().default("1"),
  release_date: z.string().min(1, "Tanggal rilis wajib diisi"),
  genre_ids: z.array(z.string()).min(1, "Pilih minimal 1 genre"),
});

type FormData = z.infer<typeof schema>;

export default function AdminFilmsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { data: genres } = useGenres();
  const createFilm = useCreateFilm();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role?.toUpperCase() !== "ADMIN") {
      router.push("/films");
      toast.error("Akses ditolak");
    }
  }, [user, router]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { genre_ids: [], airing_status: "finished_airing", total_episodes: "1" },
  });

  const selectedGenres = watch("genre_ids") ?? [];

  const toggleGenre = (id: string) => {
    const current = selectedGenres;
    if (current.includes(id)) {
      setValue("genre_ids", current.filter((g) => g !== id), { shouldValidate: true });
    } else {
      setValue("genre_ids", [...current, id], { shouldValidate: true });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormData) => {
    const fd = new FormData();
    fd.append("title", data.title);
    fd.append("synopsis", data.synopsis);
    fd.append("airing_status", data.airing_status);
    fd.append("total_episodes", data.total_episodes);
    fd.append("release_date", data.release_date + " 00:00:00");
    fd.append("genres", data.genre_ids.join(","));
    if (imageFile) fd.append("images", imageFile);

    try {
      await createFilm.mutateAsync(fd);
      toast.success("Film berhasil ditambahkan!");
      reset();
      setImageFile(null);
      setImagePreview(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal menambah film");
    }
  };

  if (user?.role?.toUpperCase() !== "ADMIN") return null;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-3xl mx-auto">
      <div className="mb-10 animate-fade-up">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-gold-400" />
          <span className="text-xs text-gold-400 font-mono uppercase tracking-widest">
            Admin Panel
          </span>
        </div>
        <h1 className="font-display text-5xl tracking-widest text-white">
          TAMBAH <span className="text-gold-400">FILM</span>
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 animate-fade-up"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-noir-500 uppercase tracking-wider">
            Poster Film (Opsional)
          </label>
          <div className="flex items-start gap-4">
            <div className="relative w-32 h-48 rounded-xl overflow-hidden bg-noir-800 border border-noir-700 flex-shrink-0 flex items-center justify-center">
              {imagePreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-1 right-1 bg-noir-950/80 rounded-full p-0.5 text-white hover:text-crimson-400"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <ImageIcon size={24} className="text-noir-600" />
              )}
            </div>
            <div className="flex-1">
              <label className="flex items-center justify-center w-full h-14 bg-noir-800 border border-dashed border-noir-600 hover:border-gold-400/50 rounded-xl cursor-pointer transition-all text-sm text-noir-500 hover:text-white">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                Pilih gambar...
              </label>
              <p className="text-xs text-noir-600 mt-2">JPG, PNG, WebP. Maks 5MB.</p>
            </div>
          </div>
        </div>

        <Input
          label="Judul Film"
          placeholder="Interstellar, Inception..."
          error={errors.title?.message}
          {...register("title")}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-noir-500 uppercase tracking-wider">Sinopsis</label>
          <textarea
            {...register("synopsis")}
            rows={5}
            placeholder="Ceritakan tentang film ini..."
            className="w-full bg-noir-800 border border-noir-700 focus:border-gold-400/60 hover:border-noir-600 text-white placeholder-noir-600 rounded-lg px-4 py-3 text-sm transition-all outline-none resize-none"
          />
          {errors.synopsis && <p className="text-xs text-crimson-400">{errors.synopsis.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-noir-500 uppercase tracking-wider">Status Tayang</label>
            <select
              {...register("airing_status")}
              className="bg-noir-800 border border-noir-700 focus:border-gold-400/60 text-white rounded-lg px-4 py-3 text-sm outline-none"
            >
              <option value="finished_airing">Selesai Tayang</option>
              <option value="airing">Sedang Tayang</option>
              <option value="not_yet_aired">Belum Tayang</option>
            </select>
          </div>
          <Input
            label="Total Episode"
            placeholder="12"
            type="number"
            {...register("total_episodes")}
          />
        </div>

        <Input
          label="Tanggal Rilis"
          placeholder="2024-01-01"
          type="date"
          error={errors.release_date?.message}
          {...register("release_date")}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-noir-500 uppercase tracking-wider">
            Genre {selectedGenres.length > 0 && `(${selectedGenres.length} dipilih)`}
          </label>
          <div className="flex flex-wrap gap-2 p-4 bg-noir-800 border border-noir-700 rounded-xl">
            {Array.isArray(genres) &&
              genres.map((genre: Genre) => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => toggleGenre(genre.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedGenres.includes(genre.id)
                      ? "bg-gold-400/15 text-gold-400 border-gold-400/40"
                      : "text-noir-500 border-noir-600 hover:text-white hover:border-noir-500"
                  }`}
                >
                  {genre.name}
                </button>
              ))}
          </div>
          {errors.genre_ids && <p className="text-xs text-crimson-400">{errors.genre_ids.message}</p>}
        </div>

        <div className="flex gap-4 pt-2">
          <Button type="button" variant="secondary" onClick={() => router.push("/admin/genres")} className="flex-1">
            Batal
          </Button>
          <Button type="submit" loading={isSubmitting} className="flex-1" size="lg">
            Tambah Film
          </Button>
        </div>
      </form>
    </div>
  );
}