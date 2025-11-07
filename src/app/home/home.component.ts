import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { ApiservicesService, MovieSummary } from '../services/apiservices.service';
import {
  GenresItem,
  GenresList,
  MovieItemDetails,
} from 'src/shared/models/movie.interface';
import {
  ResponseData,
  ResponseData2,
} from 'src/shared/models/common.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
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

  constructor(
    private readonly api: ApiservicesService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getGenreList();
    this.getHomeMovies();
    this.getNowPlayingMovies();
  }

  getHomeMovies(): void {
    this.api.getMovies<MovieItemDetails>().subscribe({
      next: (res: ResponseData<MovieItemDetails>) => {
        this.allMoviesData = res.results;
        this.cdr.markForCheck();
      },
      error: (err: unknown) => {
        console.error(err);
      },
    });
  }

  getGenreList(): void {
    this.api.genreList<GenresList>().subscribe({
      next: (res: GenresList) => {
        res.genres.forEach((item: GenresItem) => {
          this.GenreList[item.id] = item.name;
        });
        this.cdr.markForCheck();
      },
      error: (err: unknown) => {
        console.error(err);
      },
    });
  }

  getNowPlayingMovies(): void {
    this.api.nowPlayingMovies<MovieItemDetails>().subscribe({
      next: (res: ResponseData2<MovieItemDetails>) => {
        this.NowPlaying = res.results;
        this.setHeader(0);
        this.cdr.markForCheck();
      },
      error: (err: unknown) => {
        console.error(err);
      },
    });
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
}
