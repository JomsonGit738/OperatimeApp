import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  ResponseData,
  ResponseData2,
  ServerResponse,
} from 'src/shared/models/common.interface';
import {
  AuthResponse,
  AuthUser,
  MovieSummary,
  MoviesResponse,
} from '../../models/api.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiservicesService {
  readonly sessionUser = new BehaviorSubject<AuthUser | null>(null);

  private readonly baseUrl = environment.apiBaseUrl;
  readonly imageBASEurl = 'https://image.tmdb.org/t/p/';

  constructor(private http: HttpClient) {}

  setSessionUser(user: AuthUser): void {
    this.sessionUser.next(user);
  }

  getCurrentUser(): Observable<AuthUser> {
    return this.http
      .get<AuthUser>(`${this.baseUrl}/user/me`)
      .pipe(tap((user) => this.sessionUser.next(user)));
  }

  getOptionalSession(): Observable<AuthUser | null> {
    return this.http
      .get<AuthUser | null>(`${this.baseUrl}/user/session`)
      .pipe(tap((user) => this.sessionUser.next(user)));
  }

  getMovies<T>(): Observable<ResponseData<T>> {
    return this.http.get<ResponseData<T>>(`${this.baseUrl}/movies/popular`);
  }

  genreList<T>(): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/movies/genres`);
  }

  getMovieById(id: string | number | null): Observable<any> {
    return this.http.get(`${this.baseUrl}/movies/${id}`);
  }

  nowPlayingMovies<T>(): Observable<ResponseData2<T>> {
    return this.http.get<ResponseData2<T>>(`${this.baseUrl}/movies/now-playing`);
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

    return this.http.get<MoviesResponse<T>>(`${this.baseUrl}/movies/search`, {
      params,
    });
  }

  getFull<T>(id: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/movies/${id}/full`);
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
  ): Observable<AuthResponse> {
    const body = { email, password };
    return this.http.post<AuthResponse>(`${this.baseUrl}/user/login`, body);
  }

  GoogleSignIn(
    idToken: string
  ): Observable<AuthResponse> {
    // The server verifies this signed Google token and derives identity from it.
    const body = { idToken };
    return this.http.post<AuthResponse>(`${this.baseUrl}/user/gosin`, body);
  }

  logOut(): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/user/logout`, {})
      .pipe(tap(() => this.sessionUser.next(null)));
  }

  getBookedSeats<T>(id: string | null): Observable<ServerResponse<T>> {
    return this.http.get<ServerResponse<T>>(`${this.baseUrl}/getseats/${id}`);
  }

  seatBooking(
    date: string,
    operaId: string,
    movietitle: string,
    seats: Array<string | number>,
    time: string,
    mimage: string
  ): Observable<unknown> {
    // Email is intentionally absent: the backend derives ownership from the cookie.
    const body = { date, operaId, movietitle, seats, time, mimage };
    return this.http.post(`${this.baseUrl}/booking`, body);
  }
}
