import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ApiservicesService } from '../../core/services/apiservices.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { catchError, filter, map, Observable, of, switchMap } from 'rxjs';
import {
  FullMovieItemDetails,
  MovieViewModel,
} from 'src/shared/models/movie.interface';
import { LoaderComponent } from 'src/shared/components/loader/loader.component';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LoaderComponent],
})
export class DetailsComponent implements OnInit {
  imageBASEurl: any = 'https://image.tmdb.org/t/p/original';
  movie$!: Observable<MovieViewModel>;

  constructor(
    private api: ApiservicesService,
    private sanitizer: DomSanitizer,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.movie$ = this.route.paramMap.pipe(
      map((params) => params.get('id')),
      filter((id): id is string => !!id),
      switchMap((id) => this.api.getFull<FullMovieItemDetails>(id)),
      map((res) => this.toViewModel(res)),
      catchError((err) => {
        console.error(err);
        return of(null as any);
      })
    );
  }

  private toViewModel(res: FullMovieItemDetails): MovieViewModel {
    // rate
    const rate = res.vote_average?.toString().slice(0, 3) || '0';

    // starring (max 10)
    const starring = (res.casts?.cast || [])
      .slice(0, 10)
      .map((c) => c.name)
      .join(', ');

    // director
    const director =
      (res.casts?.crew || []).find((m) => m.job === 'Director')?.name || '';

    // trailer
    const trailer = (res.videos?.results || []).find(
      (v) => v.type === 'Trailer'
    );
    const trailerUrl = trailer
      ? this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${trailer.key}?&theme=dark&color=white&rel=0`
        )
      : null;

    return {
      ...res,
      rate,
      starring,
      director,
      trailerUrl,
    };
  }
}
