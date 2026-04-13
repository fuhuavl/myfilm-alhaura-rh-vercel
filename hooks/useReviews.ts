import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { film_id: string; rating: number; comment: string }) =>
      api.post("/reviews", data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["film", vars.film_id] });
    },
  });
}

export function useReaction() {
  const queryClient = useQueryClient();

  const addReaction = useMutation({
    mutationFn: (data: { review_id: string; type: "like" | "dislike" }) =>
      api.post("/reactions", { review_id: data.review_id, status: data.type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["film"] });
    },
  });

  const updateReaction = useMutation({
    mutationFn: ({ id, type }: { id: string; type: "like" | "dislike" }) =>
      api.put(`/reactions/${id}`, { status: type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["film"] });
    },
  });

  return { addReaction, updateReaction };
}
