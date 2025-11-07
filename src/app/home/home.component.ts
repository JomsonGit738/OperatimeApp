import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import {
  ApiservicesService,
  MovieSummary,
} from '../services/apiservices.service';
import {
  GenresItem,
  GenresList,
  MovieItemDetails,
} from 'src/shared/models/movie.interface';
import { catchError, combineLatest, EMPTY, map, Observable, tap } from 'rxjs';
import { LoaderComponent } from 'src/shared/components/loader/loader.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, LoaderComponent],
})
export class HomeComponent implements OnInit {
  image = '';
  title = '';
  desc = '';
  rate: number | null = null;
  genre = '';
  mId: number | null = null;
  allMoviesData: MovieItemDetails[] = [];
  GenreList: Record<number, string> = {};
  NowPlaying: MovieSummary[] = [];
  readonly imageBASEurl = 'https://image.tmdb.org/t/p/original';
  combinedData!: Observable<any>;
  isLoading = signal(true);

  constructor(
    private readonly api: ApiservicesService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.combinedData = combineLatest({
      genersList: this.getGenreList(),
      homeMovies: this.getHomeMovies(),
      nowPlayingsMovies: this.getNowPlayingMovies(),
    });
  }

  getHomeMovies(): Observable<any> {
    return this.api.getMovies<MovieItemDetails>().pipe(
      map((res) => res.results),
      catchError((e) => this.onError(e))
    );
  }

  getGenreList(): Observable<any> {
    return this.api.genreList<GenresList>().pipe(
      map((res) => res.genres),
      tap((data) => {
        data.forEach((item: GenresItem) => {
          this.GenreList[item.id] = item.name;
        });
      }),
      catchError((e) => this.onError(e))
    );
  }

  getNowPlayingMovies(): Observable<any> {
    return this.api.nowPlayingMovies<MovieItemDetails>().pipe(
      map((res) => res.results),
      tap((data) => {
        this.NowPlaying = data;
        this.setHeader(0);
      }),
      catchError((e) => this.onError(e))
    );
  }

  setHeader(index: number): void {
    const movie = this.NowPlaying[index];
    if (!movie) {
      return;
    }

    this.image = `${this.imageBASEurl}${movie.backdrop_path ?? ''}`;
    this.title = movie.title ?? '';
    const overview = movie.overview ?? '';
    this.desc = overview ? `${overview.slice(0, 150)} ...` : '';
    this.rate = movie.vote_average ?? null;
    this.genre = movie.genre_ids
      .map((id) => this.GenreList[id])
      .filter((name): name is string => Boolean(name))
      .join(' - ');
    this.mId = movie.id ?? null;
  }

  getMovieWithId(index: number): void {
    this.setHeader(index);
  }

  routeWithId(movieId: number | null): void {
    if (movieId == null) {
      return;
    }
    localStorage.setItem('mId', movieId.toString());
    this.router.navigateByUrl('/movie/details');
  }

  routeForBooking(id: number | null, title: string): void {
    if (id == null) {
      return;
    }
    localStorage.setItem('bookId', id.toString());
    sessionStorage.setItem('mTitle', title);
    this.router.navigateByUrl('/booking');
  }

  onError(e: any) {
    console.error(e);
    return EMPTY;
  }
}
