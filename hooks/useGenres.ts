import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: () => api.get("/genres").then((r) => r.data.data ?? r.data),
    staleTime: 1000 * 60 * 10,
  });
}

export function useAdminGenres(page: number) {
  return useQuery({
    queryKey: ["genres-admin", page],
    queryFn: () =>
      api
        .get("/genres/admin", { params: { page, take: 10 } })
        .then((r) => r.data),
  });
}

export function useCreateGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      api.post("/genres", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres-admin"] });
      queryClient.invalidateQueries({ queryKey: ["genres"] });
    },
  });
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name: string; description?: string }) =>
      api.put(`/genres/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres-admin"] });
      queryClient.invalidateQueries({ queryKey: ["genres"] });
    },
  });
}
