"use client";
import { useAuthStore } from "@/store/authStore";
import { useReaction } from "@/hooks/useReviews";
import { formatDate } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";

interface ReviewCardProps {
  review: any;
  filmId: string;
}

export default function ReviewCard({ review, filmId }: ReviewCardProps) {
  const { user } = useAuthStore();
  const { addReaction, updateReaction } = useReaction();

  const myReaction = review.reactions?.find(
    (r: any) => r.user_id === user?.id || r.user?.id === user?.id
  );
  const likeCount = review.reactions?.filter(
    (r: any) => r.type === "like" || r.status === "like"
  ).length ?? 0;
  const dislikeCount = review.reactions?.filter(
    (r: any) => r.type === "dislike" || r.status === "dislike"
  ).length ?? 0;

  const handleReaction = async (type: "like" | "dislike") => {
    if (!user) {
      toast.error("Login dulu untuk bereaksi");
      return;
    }
    try {
      if (myReaction) {
        if ((myReaction.type ?? myReaction.status) === type) return; // same, no-op
        await updateReaction.mutateAsync({ id: myReaction.id, type });
        toast.success("Reaksi diubah!");
      } else {
        await addReaction.mutateAsync({ review_id: review.id, type });
        toast.success("Reaksi ditambahkan!");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal memberi reaksi");
    }
  };

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  const myStatus = myReaction?.type ?? myReaction?.status;

  return (
    <div className="p-5 bg-noir-800/60 border border-noir-700/50 rounded-xl hover:border-noir-600/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/users/${review.user_id}`}
            className="w-9 h-9 rounded-full bg-gold-400/20 border border-gold-400/30 flex items-center justify-center flex-shrink-0 hover:border-gold-400/60 transition-colors"
          >
            <User size={14} className="text-gold-400" />
          </Link>
          <div>
            <Link
              href={`/users/${review.user_id}`}
              className="text-sm font-semibold text-white hover:text-gold-400 transition-colors"
            >
              {review.user?.username ?? review.user?.display_name ?? "Anonymous"}
            </Link>
            <p className="text-xs text-noir-500">{formatDate(review.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {stars.map((s) => (
            <Star
              key={s}
              size={12}
              className={cn(
                s <= review.rating ? "text-gold-400 fill-gold-400" : "text-noir-600"
              )}
            />
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed mb-4">{review.comment}</p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleReaction("like")}
          disabled={addReaction.isPending || updateReaction.isPending}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
            myStatus === "like"
              ? "bg-gold-400/15 text-gold-400 border-gold-400/40"
              : "text-noir-500 border-noir-700 hover:text-white hover:border-noir-600"
          )}
        >
          <ThumbsUp size={12} />
          {likeCount}
        </button>
        <button
          onClick={() => handleReaction("dislike")}
          disabled={addReaction.isPending || updateReaction.isPending}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
            myStatus === "dislike"
              ? "bg-crimson-400/15 text-crimson-400 border-crimson-400/40"
              : "text-noir-500 border-noir-700 hover:text-white hover:border-noir-600"
          )}
        >
          <ThumbsDown size={12} />
          {dislikeCount}
        </button>
      </div>
    </div>
  );
}