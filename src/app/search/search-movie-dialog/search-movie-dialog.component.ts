import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MovieSummary } from '../../services/apiservices.service';

export interface SearchMovieDialogData {
  movie: MovieSummary;
  imageBaseUrl: string;
  fallbackImage: string;
}

@Component({
  selector: 'app-search-movie-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-movie-dialog.component.html',
  styleUrls: ['./search-movie-dialog.component.css'],
})
export class SearchMovieDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: SearchMovieDialogData
  ) {}

  get posterUrl(): string {
    const path =
      this.data.movie.poster_path ??
      this.data.movie.backdrop_path ??
      '';
    return path ? `${this.data.imageBaseUrl}${path}` : this.data.fallbackImage;
  }

  get backdropStyle(): Record<string, string> {
    const path =
      this.data.movie.backdrop_path ??
      this.data.movie.poster_path ??
      '';
    const url = path ? `${this.data.imageBaseUrl}${path}` : '';
    return url
      ? {
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.6)), url(${url})`,
        }
      : {};
  }
}
