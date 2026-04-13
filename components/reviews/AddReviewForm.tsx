"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateReview } from "@/hooks/useReviews";
import Button from "@/components/ui/Button";
import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const schema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, "Minimal 5 karakter").max(500, "Maksimal 500 karakter"),
});
type FormData = z.infer<typeof schema>;

export default function AddReviewForm({ filmId }: { filmId: string }) {
  const [hovered, setHovered] = useState(0);
  const createReview = useCreateReview();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { rating: 0 } });

  const rating = watch("rating");

  const onSubmit = async (data: FormData) => {
    try {
      await createReview.mutateAsync({ ...data, film_id: filmId });
      toast.success("Ulasan berhasil ditambahkan!");
      reset();
      setHovered(0);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal menambah ulasan");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5 bg-noir-800/40 border border-noir-700/50 rounded-xl">
      <h3 className="font-display text-lg tracking-wider text-white">Tulis Ulasan</h3>

      {/* Star rating */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-noir-500 uppercase tracking-wider">Rating</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setValue("rating", s, { shouldValidate: true })}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={24}
                className={cn(
                  "transition-colors",
                  s <= (hovered || rating)
                    ? "text-gold-400 fill-gold-400"
                    : "text-noir-600"
                )}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gold-400 font-mono">{rating}/5</span>
          )}
        </div>
        {errors.rating && (
          <p className="text-xs text-crimson-400">Pilih rating terlebih dahulu</p>
        )}
      </div>

      {/* Comment */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-noir-500 uppercase tracking-wider">
          Komentar
        </label>
        <textarea
          {...register("comment")}
          rows={4}
          placeholder="Bagikan pendapatmu tentang film ini..."
          className="w-full bg-noir-900 border border-noir-700 focus:border-gold-400/60 text-white placeholder-noir-600 rounded-lg px-4 py-3 text-sm transition-all outline-none resize-none"
        />
        {errors.comment && (
          <p className="text-xs text-crimson-400">{errors.comment.message}</p>
        )}
      </div>

      <Button type="submit" loading={createReview.isPending}>
        Kirim Ulasan
      </Button>
    </form>
  );
}
