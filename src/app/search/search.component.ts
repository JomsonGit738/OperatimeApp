import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { ApiservicesService } from '../services/apiservices.service';
import { NgToastService } from 'ng-angular-popup';
import { Router } from '@angular/router';
import { ThemePalette } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatProgressBarModule],
})
export class SearchComponent {
  progressEvent: boolean = false;
  color: ThemePalette = 'warn';
  searchKey: any = '';
  collection: any = [];
  imageBASEurl: any = 'https://image.tmdb.org/t/p/original';
  ErrorImage: any =
    'https://1338-wildhare.wpnet.stylenet.com/wp-content/uploads/sites/310/2018/03/image-not-available.jpg';

  constructor(
    private api: ApiservicesService,
    private toast: NgToastService,
    private router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  clickPress(event: any) {
    //console.log(event);

    if (this.searchKey == '') {
      this.collection = [];
    } else {
      if (event.key == 'Enter') {
        this.search();
      }
    }
  }

  search() {
    if (this.searchKey == '') {
      this.toast.error({
        detail: 'Empty field',
        summary: 'Please type movie name!',
        duration: 2500,
      });
    } else {
      this.progressEvent = true;
      // console.log(this.searchKey);
      this.api.searchMovies(this.searchKey).subscribe({
        next: (res: any) => {
          this.collection = res;
          setTimeout(() => {
            this.progressEvent = false;
            if (this.collection.results.length == 0) {
              this.toast.warning({
                detail: 'Not found!',
                summary: 'try with another movie name!',
                duration: 2000,
              });
            }
            this.cdr.markForCheck();
          }, 3000);
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.log(err);
        },
      });
    }
  }

  movieDetails(id: string) {
    localStorage.setItem('mId', id);
    this.router.navigateByUrl(`/movie/${id}`);
  }
}
