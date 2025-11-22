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
  mId: number | null = null;
  activePosterId: number | null = null;
  readonly imageBASEurl = 'https://image.tmdb.org/t/p/original';
  combinedData!: Observable<any>;
  isLoading = signal(true);

  constructor(
    private readonly api: ApiservicesService,
    private readonly router: Router
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
      catchError((e) => this.onError(e))
    );
  }

  getNowPlayingMovies(): Observable<any> {
    return this.api.nowPlayingMovies<MovieItemDetails>().pipe(
      map((res) => res.results),
      tap((data) => this.onChangeMovieCard(data[0])),
      catchError((e) => this.onError(e))
    );
  }

  onChangeMovieCard(md: MovieItemDetails): void {
    if (!md) return;
    this.image = `${this.imageBASEurl}${md.backdrop_path ?? ''}`;
    this.title = md.title;
    this.desc = `${md.overview.slice(0, 150)}...`;
    this.mId = md.id;
    this.activePosterId = md.id;
  }

  routeWithId(movieId: number | null) {
    this.router.navigateByUrl(`/movie/${movieId}`);
  }

  routeForBooking(id: number | null, title: string): void {
    // if (id == null) {
    //   return;
    // }
    // localStorage.setItem('bookId', id.toString());
    // sessionStorage.setItem('mTitle', title);
    this.router.navigate([`/booking/${id}`], { queryParams: { title } });
  }

  getGenres(allGenres: GenresItem[], ids: number[], max: number = 2): string {
    const names: string[] = [];
    for (const id of ids) {
      const match = allGenres.find((g) => g.id === id);
      if (match) {
        names.push(match.name);
        if (names.length === max) break; // stop at max
      }
    }
    return names.join(', ');
  }

  onError(e: any) {
    console.error(e);
    return EMPTY;
  }
}
