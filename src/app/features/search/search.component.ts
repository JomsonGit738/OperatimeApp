import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { ThemePalette } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  scan,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import {
  ApiservicesService
} from '../../core/services/apiservices.service';
import { MovieSummary, MoviesResponse } from '../../models/api.models';
import { SearchMovieDialogComponent, SearchMovieDialogData } from './search-movie-dialog/search-movie-dialog.component';
import { ToastService } from '../../core/services/toast.service';

interface SearchViewModel {
  query: string;
  page: number;
  totalPages: number;
  totalResults: number;
  pages: number[];
  isLoading: boolean;
  results: MovieSummary[];
  showInitialHint: boolean;
  showNoResults: boolean;
  errorMessage: string | null;
}

interface SearchParams {
  query: string;
  page: number;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatDialogModule,
    SearchMovieDialogComponent,
  ],
})
export class SearchComponent implements OnDestroy {
  readonly color: ThemePalette = 'warn';
  readonly imageBASEurl = 'https://image.tmdb.org/t/p/original';
  readonly fallbackImage =
    'https://1338-wildhare.wpnet.stylenet.com/wp-content/uploads/sites/310/2018/03/image-not-available.jpg';
  private readonly maxPageButtons = 5;
  private readonly initialState = this.buildState();

  readonly searchControl = new FormControl('', { nonNullable: true });

  private readonly destroy$ = new Subject<void>();
  private readonly searchParams$ = new BehaviorSubject<SearchParams>({
    query: '',
    page: 1,
  });

  readonly vm$: Observable<SearchViewModel> = this.searchParams$.pipe(
    distinctUntilChanged(
      (prev, curr) => prev.query === curr.query && prev.page === curr.page
    ),
    switchMap((params) =>
      this.searchMovies(params).pipe(
        map((state) => ({ ...state, isLoading: false })),
        startWith({
          query: params.query,
          page: params.page,
          isLoading: true,
          errorMessage: null,
        })
      )
    ),
    scan(
      (state, patch) => ({
        ...state,
        ...patch,
      }),
      this.initialState
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private readonly api: ApiservicesService,
    private readonly toast: ToastService,
    private readonly router: Router,
    private readonly dialog: MatDialog
  ) {
    this.resetResultsWhenClearing();
  }

  submitSearch(): void {
    const query = this.searchControl.value.trim();
    if (!query) {
      this.toast.error('Empty search', 'Type a movie name to search.', {
        duration: 2500,
      });
      this.updateSearchParams({ query: '', page: 1 });
      return;
    }
    this.updateSearchParams({ query, page: 1 });
  }

  movieDetails(movie: MovieSummary): void {
    this.dialog.open<SearchMovieDialogComponent, SearchMovieDialogData>(
      SearchMovieDialogComponent,
      {
        data: {
          movie,
          imageBaseUrl: this.imageBASEurl,
          fallbackImage: this.fallbackImage,
        },
        panelClass: 'movie-dialog-panel',
        maxWidth: '650px',
        width: '90vw',
      }
    );
  }

  trackMovieById(_: number, movie: MovieSummary): number {
    return movie.id;
  }

  goToPage(targetPage: number, totalPages: number): void {
    const current = this.searchParams$.value;
    if (!current.query || totalPages <= 0) {
      return;
    }
    const nextPage = Math.min(Math.max(targetPage, 1), totalPages);
    if (nextPage === current.page) {
      return;
    }
    this.updateSearchParams({
      query: current.query,
      page: nextPage,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetResultsWhenClearing(): void {
    this.searchControl.valueChanges
      .pipe(
        map((value) => value.trim()),
        filter((value) => value === ''),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.updateSearchParams({ query: '', page: 1 }));
  }

  private searchMovies({
    query,
    page,
  }: SearchParams): Observable<Partial<SearchViewModel>> {
    if (!query) {
      return of(this.buildState());
    }

    return this.api.searchMovies<MovieSummary>(query, page).pipe(
      map((res: MoviesResponse<MovieSummary>) => ({
        results: res.results ?? [],
        totalPages: res.total_pages ?? 0,
        totalResults: res.total_results ?? 0,
        page: res.page ?? page,
      })),
      tap(({ results }) => {
        if (!results.length) {
          this.toast.warning('No matches', 'Try another movie name.', {
            duration: 2000,
          });
        }
      }),
      map(({ results, totalPages, totalResults, page: resolvedPage }) => {
        const pages = this.buildPageRange(resolvedPage, totalPages);
        return {
          query,
          results,
          showInitialHint: false,
          showNoResults: results.length === 0,
          page: resolvedPage,
          totalPages,
          totalResults,
          pages,
          errorMessage: null,
        };
      }),
      catchError((error) => {
        console.error(error);
        this.toast.error(
          'Search failed',
          'Unable to fetch movies right now.',
          { duration: 2500 }
        );
        return of(
          {
            query,
            errorMessage: 'Unable to fetch movies right now.',
            showInitialHint: false,
            page,
            totalPages: 0,
            totalResults: 0,
            pages: [],
            isLoading: false,
          }
        );
      })
    );
  }

  private buildState(
    overrides: Partial<SearchViewModel> = {}
  ): SearchViewModel {
    return {
      query: '',
      page: 1,
      totalPages: 0,
      totalResults: 0,
      pages: [],
      isLoading: false,
      results: [],
      showInitialHint: true,
      showNoResults: false,
      errorMessage: null,
      ...overrides,
    };
  }

  private updateSearchParams(params: SearchParams): void {
    this.searchParams$.next(params);
  }

  private buildPageRange(
    current: number,
    total: number,
    maxButtons: number = this.maxPageButtons
  ): number[] {
    if (total <= 0) {
      return [];
    }
    const pages: number[] = [];
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, current - half);
    let end = start + maxButtons - 1;

    if (end > total) {
      end = total;
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  }
}
