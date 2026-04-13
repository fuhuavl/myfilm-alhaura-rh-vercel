import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useFilms(search?: string, genre?: string) {
  return useInfiniteQuery({
    queryKey: ["films", search, genre],
    queryFn: ({ pageParam = 1 }) =>
      api
        .get("/films", {
          params: {
            page: pageParam,
            take: 12,
            ...(search ? { filter: search, filter_by: "title" } : {}),
          },
        })
        .then((r) => r.data),
    getNextPageParam: (lastPage) => {
      const meta = Array.isArray(lastPage?.meta) ? lastPage.meta[0] : lastPage?.meta;
      if (!meta) return undefined;
      return meta.page < meta.total_page ? meta.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useFilm(id: string) {
  return useQuery({
    queryKey: ["film", id],
    queryFn: () => api.get(`/films/${id}`).then((r) => r.data.data ?? r.data),
    enabled: !!id,
  });
}

export function useCreateFilm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) =>
      api.post("/films", data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["films"] });
    },
  });
}
