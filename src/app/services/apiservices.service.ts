import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  ResponseData,
  ResponseData2,
  ServerResponse,
} from 'src/shared/models/common.interface';

export interface MovieSummary {
  id: number;
  title: string;
  overview: string;
  vote_average: number;
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

@Injectable({
  providedIn: 'root',
})
export class ApiservicesService {
  readonly sessionUser = new BehaviorSubject<string>('');

  // private readonly baseUrl = 'https://operatimeserver-2023.onrender.com';
  private readonly baseUrl = 'http://localhost:3000';
  readonly imageBASEurl = 'https://image.tmdb.org/t/p/';
  private readonly tmdbApiBase = 'https://api.themoviedb.org/3';

  private readonly tmdbHeaders = new HttpHeaders({
    accept: 'application/json',
    Authorization:
      'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYzBlYTk4ZDZjMjg5ZTUyN2JiZWEzYWQ5MzQ4YzdiNyIsInN1YiI6IjY0OWE5NTBmZmVkNTk3MDEyY2ViYmU0YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-roI6am5rg37C19CbC3X-YoKitfUvSMKHzygcNI0_Mo',
  });

  constructor(private http: HttpClient) {}

  private buildTmdbUrl(path: string): string {
    return `${this.tmdbApiBase}/${path}`;
  }

  private createAuthOptions(): { headers: HttpHeaders } {
    const token = sessionStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ 'access-token': token })
      : new HttpHeaders();
    return { headers };
  }

  getMovies<T>(): Observable<ResponseData<T>> {
    return this.http.get<ResponseData<T>>(this.buildTmdbUrl('movie/popular'), {
      headers: this.tmdbHeaders,
    });
  }

  genreList<T>(): Observable<T> {
    return this.http.get<T>(this.buildTmdbUrl('genre/movie/list'), {
      headers: this.tmdbHeaders,
    });
  }

  getMovieById(id: string | number | null): Observable<any> {
    return this.http.get(this.buildTmdbUrl(`movie/${id}`), {
      headers: this.tmdbHeaders,
    });
  }

  nowPlayingMovies<T>(): Observable<ResponseData2<T>> {
    return this.http.get<ResponseData2<T>>(
      this.buildTmdbUrl('movie/now_playing'),
      { headers: this.tmdbHeaders }
    );
  }

  searchMovies<T = MovieSummary>(
    name: string,
    page: number = 1
  ): Observable<MoviesResponse<T>> {
    const params = new HttpParams()
      .set('query', name)
      .set('include_adult', 'false')
      .set('language', 'en-US')
      .set('page', page.toString());

    return this.http.get<MoviesResponse<T>>(this.buildTmdbUrl('search/movie'), {
      headers: this.tmdbHeaders,
      params,
    });
  }

  getFull<T>(id: string): Observable<T> {
    const params = new HttpParams()
      .set('api_key', '3c0ea98d6c289e527bbea3ad9348c7b7')
      .set('append_to_response', 'videos,casts');

    return this.http.get<T>(this.buildTmdbUrl(`movie/${id}`), { params });
  }

  signUp(
    username: string | null | undefined,
    email: string | null | undefined,
    password: string | null | undefined
  ): Observable<unknown> {
    const body = { username, email, password };
    return this.http.post(`${this.baseUrl}/user/signup`, body);
  }

  logIn(
    email: string | null | undefined,
    password: string | null | undefined
  ): Observable<unknown> {
    const body = { email, password };
    return this.http.post(`${this.baseUrl}/user/login`, body);
  }

  GoogleSignIn(
    email: string | null | undefined,
    username: string | null | undefined
  ): Observable<unknown> {
    const body = { email, username };
    return this.http.post(`${this.baseUrl}/user/gosin`, body);
  }

  getUserDetails(email: string | null): Observable<unknown> {
    const body = { email };
    return this.http.post(`${this.baseUrl}/user/details`, body);
  }

  getBookedSeats<T>(id: string | null): Observable<ServerResponse<T>> {
    return this.http.get<ServerResponse<T>>(`${this.baseUrl}/getseats/${id}`);
  }

  seatBooking(
    date: string,
    operaId: string,
    movietitle: string,
    seats: Array<string | number>,
    email: string | null,
    time: string,
    mimage: string
  ): Observable<unknown> {
    const body = { date, operaId, movietitle, seats, email, time, mimage };

    return this.http.post(
      `${this.baseUrl}/booking`,
      body,
      this.createAuthOptions()
    );
  }
}
