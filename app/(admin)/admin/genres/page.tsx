"use client";
import { useState } from "react";
import { useAdminGenres, useCreateGenre, useUpdateGenre } from "@/hooks/useGenres";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Plus, Pencil, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import type { Genre } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function AdminGenresPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Genre | null>(null);

  useEffect(() => {
    if (user && user.role?.toUpperCase() !== "ADMIN") {
      router.push("/films");
      toast.error("Akses ditolak");
    }
  }, [user, router]);

  const { data, isLoading } = useAdminGenres(page);
  const createGenre = useCreateGenre();
  const updateGenre = useUpdateGenre();

  const genres: Genre[] = data?.data ?? [];
  const meta = data?.meta ?? {};

  const createForm = useForm<FormData>({ resolver: zodResolver(schema) });
  const editForm = useForm<FormData>({ resolver: zodResolver(schema) });

  const onCreateSubmit = async (formData: FormData) => {
    try {
      await createGenre.mutateAsync(formData);
      toast.success("Genre berhasil ditambahkan!");
      setCreateOpen(false);
      createForm.reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal menambah genre");
    }
  };

  const onEditSubmit = async (formData: FormData) => {
    if (!editTarget) return;
    try {
      await updateGenre.mutateAsync({ id: editTarget.id, ...formData });
      toast.success("Genre berhasil diperbarui!");
      setEditTarget(null);
      editForm.reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal memperbarui genre");
    }
  };

  const openEdit = (genre: Genre) => {
    setEditTarget(genre);
    editForm.reset({ name: genre.name, description: genre.description ?? "" });
  };

  if (user?.role?.toUpperCase() !== "ADMIN") return null;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-10 animate-fade-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-gold-400" />
            <span className="text-xs text-gold-400 font-mono uppercase tracking-widest">
              Admin Panel
            </span>
          </div>
          <h1 className="font-display text-5xl tracking-widest text-white">
            KELOLA <span className="text-gold-400">GENRE</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/admin/films")}
          >
            + Tambah Film
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={14} /> Genre Baru
          </Button>
        </div>
      </div>

      <div className="bg-noir-800/60 border border-noir-700/50 rounded-2xl overflow-hidden animate-fade-up" style={{ animationDelay: "100ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-noir-700/50">
                <th className="text-left px-6 py-4 text-xs font-medium text-noir-500 uppercase tracking-widest">
                  #
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-noir-500 uppercase tracking-widest">
                  Nama Genre
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-noir-500 uppercase tracking-widest hidden md:table-cell">
                  Deskripsi
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-noir-500 uppercase tracking-widest">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-noir-700/30">
                      <td className="px-6 py-4"><Skeleton className="h-4 w-8" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4 hidden md:table-cell"><Skeleton className="h-4 w-64" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-20 ml-auto" /></td>
                    </tr>
                  ))
                : genres.map((genre, i) => (
                    <tr
                      key={genre.id}
                      className="border-b border-noir-700/30 hover:bg-noir-700/20 transition-colors group"
                    >
                      <td className="px-6 py-4 text-noir-600 font-mono text-xs">
                        {(page - 1) * 10 + i + 1}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-white text-sm">
                          {genre.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-noir-500 text-sm">
                        {genre.description ?? (
                          <span className="italic text-noir-700">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEdit(genre)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-noir-500 hover:text-gold-400 hover:bg-gold-400/10 border border-transparent hover:border-gold-400/30 rounded-lg transition-all"
                        >
                          <Pencil size={11} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!isLoading && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-noir-700/50">
            <p className="text-xs text-noir-500 font-mono">
              Hal {meta.page ?? 1} / {meta.totalPages ?? 1} — {meta.total ?? 0} genre
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-noir-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-white font-mono w-8 text-center">{page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta.hasNextPage}
                className="p-2 text-noir-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); createForm.reset(); }}
        title="TAMBAH GENRE"
      >
        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
          <Input
            label="Nama Genre"
            placeholder="Action, Drama, Horror..."
            error={createForm.formState.errors.name?.message}
            {...createForm.register("name")}
          />
          {/* <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-noir-500 uppercase tracking-wider">
              Deskripsi (Opsional)
            </label>
            <textarea
              {...createForm.register("description")}
              rows={3}
              placeholder="Deskripsi singkat genre ini..."
              className="w-full bg-noir-900 border border-noir-700 focus:border-gold-400/60 text-white placeholder-noir-600 rounded-lg px-4 py-3 text-sm transition-all outline-none resize-none"
            />
          </div> */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setCreateOpen(false); createForm.reset(); }}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              loading={createGenre.isPending}
              className="flex-1"
            >
              Simpan
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!editTarget}
        onClose={() => { setEditTarget(null); editForm.reset(); }}
        title="EDIT GENRE"
      >
        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
          <Input
            label="Nama Genre"
            error={editForm.formState.errors.name?.message}
            {...editForm.register("name")}
          />
          
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setEditTarget(null); editForm.reset(); }}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              loading={updateGenre.isPending}
              className="flex-1"
            >
              Perbarui
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
