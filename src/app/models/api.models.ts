export interface MovieSummary {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  vote_average: number;
  release_date?: string;
  genre_ids: number[];
  backdrop_path: string;
  poster_path: string;
}

export interface MoviesResponse<T = MovieSummary> {
  page?: number;
  results: T[];
  total_pages?: number;
  total_results?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface GenresResponse {
  genres: Genre[];
}

export interface AuthUser {
  username: string;
  email: string;
  tickets: unknown[];
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
