export interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  created_at?: string;
}

export interface Genre {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Film {
  id: string;
  title: string;
  synopsis: string;
  director?: string;
  release_year?: number;
  release_date?: string;
  airing_status?: string;
  total_episodes?: number;
  average_rating?: number;
  images?: string[] | null;
  image_path?: string | null;
  genres?: Genre[];
  reviews?: Review[];
  created_at?: string;
}

export interface Review {
  id: string;
  film_id: string;
  user_id: string;
  user?: User;
  rating: number;
  comment: string;
  reactions?: Reaction[];
  created_at?: string;
}

export interface Reaction {
  id: string;
  review_id: string;
  user_id: string;
  type: "like" | "dislike";
  created_at?: string;
}

export interface FilmList {
  id: string;
  user_id: string;
  film_id: string;
  film?: Film;
  is_public: boolean;
  created_at?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
