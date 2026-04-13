import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useWatchlist() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const me = await api.get("/auth/me");
      const userId = me.data.data?.personal_info?.id;
      const res = await api.get(`/users/${userId}`);
      return res.data.data?.film_lists ?? [];
    },
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (film_id: string) => api.post("/film-lists", { film_id, list_status: "watching" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}

export function useUpdateWatchlistVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_public }: { id: string; is_public: boolean }) =>
  api.patch(`/film-lists/${id}`, { visibility: is_public ? "public" : "private" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
}
