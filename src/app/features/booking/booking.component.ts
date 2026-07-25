import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiservicesService } from '../../core/services/apiservices.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  IPayPalConfig,
  ICreateOrderRequest,
  NgxPayPalModule,
} from 'ngx-paypal';
import { ThemePalette } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  catchError,
  combineLatest,
  EMPTY,
  filter,
  forkJoin,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { ServerResponse } from 'src/shared/models/common.interface';
import { ToastService } from '../../core/services/toast.service';

interface Seat {
  id: number;
  occupied: boolean;
  selected: boolean;
}

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, MatProgressBarModule, NgxPayPalModule],
})
export class BookingComponent implements OnInit {
  //paypal config
  public payPalConfig?: IPayPalConfig;

  progressEvent: boolean = false;
  seatContainer: boolean = false;
  color: ThemePalette = 'warn';
  payBoolean: boolean = false;
  showPayPalSandbox = false;
  today: any = '';
  UserSelectedSeat: number = 0;
  perSeatAmount: number = 5;
  readonly totalSeatCount = 48;
  readonly seatsPerRow = 8;
  totalSeatAmount: number = 0;
  newDate = new Date();
  imageBASEurl: any = 'https://image.tmdb.org/t/p/original';
  image: any = '';
  rate: any = 0;
  movie: any = [];
  seletedSeats: string[] = [];
  seats: Seat[] = [];
  seatRows: Seat[][] = [];
  seater: string[] = [];
  seatsFromServer: any = [];
  newArray: number[] = [];
  movieID = '';
  movieTitle = '';
  checkoutAuthPending = false;
  private readonly seatsToRestore = new Set<number>();

  // stream of { id, title }
  readonly routeParams$ = combineLatest([
    this.route.paramMap.pipe(
      map((params) => params.get('id')),
      filter((id): id is string => !!id)
    ),
    this.route.queryParamMap.pipe(
      map((q) => q.get('title')),
      filter((title): title is string => !!title)
    ),
  ]).pipe(map(([id, title]) => ({ id, title })));

  // call both APIs once we have id + title
  readonly data$ = this.routeParams$.pipe(
    switchMap(({ id, title }) => {
      console.log(id, title);
      return forkJoin({
        // adjust to your real methods:
        seats: this.getBookedSeats(title),
        movie: this.loadBookingMovie(id),
      });
    })
  );

  constructor(
    private api: ApiservicesService,
    private router: Router,
    private toast: ToastService,
    private route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Preserve a guest's chosen seats across the login round-trip. Occupied
    // seats are checked again before any selection is restored.
    const restoredSeats = this.route.snapshot.queryParamMap.get('seats') ?? '';
    restoredSeats
      .split(',')
      .map((seat) => Number(seat))
      .filter(
        (seat) =>
          Number.isInteger(seat) &&
          seat >= 1 &&
          seat <= this.totalSeatCount
      )
      .forEach((seat) => this.seatsToRestore.add(seat));

    this.getSeats();
  }

  //loading movie details in booking component
  loadBookingMovie(id: string) {
    return this.api.getMovieById(id).pipe(
      tap((res) => {
        this.movie = res;
        this.image = this.imageBASEurl + this.movie.poster_path;
        // this.cdr.markForCheck();
      }),
      catchError((e) => {
        console.error(e);
        return EMPTY;
      })
    );
  }

  //seat configuration
  getSeats() {
    //set date of today in the bill
    const weekday = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ][new Date().getDay()];
    this.today =
      weekday.toUpperCase() + ' • ' + new Date().toLocaleDateString('en-GB');

    this.initializeSeatLayout();
  }

  //from backend
  getBookedSeats(title: string) {
    return this.api.getBookedSeats<any>(title).pipe(
      tap((res: ServerResponse<any>) => {
        if (res.status === 200) {
          this.seatsFromServer = res.data;
          //getting seats from array
          const tempArray = [];
          for (let s of this.seatsFromServer.userseats) {
            tempArray.push(s.seats);
          }
          //console.log(tempArray);
          this.newArray = tempArray.flat().map((seat) => Number(seat));
          this.seatPusher();
        } else {
          console.log('no seats booked, yet...');
        }
        this.cdr.markForCheck();
        this.initConfig();
      }),
      catchError((e) => {
        console.error(e);
        return EMPTY;
      })
    );
  }

  seatPusher() {
    if (!this.seats.length) {
      this.initializeSeatLayout();
    }
    const occupiedSeatIds = new Set<number>(this.newArray);
    this.seater = [...occupiedSeatIds].map((seatId) => seatId.toString());

    this.seats.forEach((seat) => {
      const isOccupied = occupiedSeatIds.has(seat.id);
      seat.occupied = isOccupied;
      seat.selected = !isOccupied && this.seatsToRestore.has(seat.id);
    });

    this.seatsToRestore.clear();
    this.UserSelectedSeat = this.seats.filter((seat) => seat.selected).length;
    this.totalSeatAmount = this.UserSelectedSeat * this.perSeatAmount;
    this.buildSeatRows();
  }

  seatLocked() {
    //getting seat numbers from user selection

    this.seletedSeats = this.seats
      .filter((seat) => seat.selected)
      .map((seat) => seat.id.toString());

    // Let every visitor inspect availability and choose seats before asking
    // them to create an account or log in.
    if (this.seletedSeats == undefined || this.seletedSeats.length == 0) {
      this.seletedSeats = [];
      this.toast.error('No seats selected!', 'Please select your seats');
    }
    //if seats are selected more than 4
    else if (this.seletedSeats.length >= 5) {
      this.seletedSeats = [];
      this.toast.error(
        'Only 4 seats!',
        'Online booking limited to 4 seats, read terms and conditions'
      );
    }
    // The backend session is the source of truth. Checking it here also avoids
    // relying on a possibly stale client-side session value.
    else {
      this.checkoutAuthPending = true;
      this.api.getOptionalSession().subscribe({
        next: (user) => {
          this.checkoutAuthPending = false;
          if (!user) {
            this.redirectToLoginWithSeats();
            return;
          }

          this.payBoolean = true;
          this.seatContainer = true;
          this.showPayPalSandbox = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.checkoutAuthPending = false;
          this.toast.error(
            'Unable to continue',
            'Please check your connection and try again.'
          );
          this.cdr.markForCheck();
        },
      });
    }
  }

  private redirectToLoginWithSeats(): void {
    // Put the selected seat IDs in the internal return URL so they survive the
    // login page without storing authentication or booking data in localStorage.
    const returnUrl = this.router.serializeUrl(
      this.router.createUrlTree([], {
        relativeTo: this.route,
        queryParams: { seats: this.seletedSeats.join(',') },
        queryParamsHandling: 'merge',
      })
    );

    this.toast.warning(
      'Seats selected',
      'Log in or sign up to continue to checkout.'
    );
    this.router.navigate(['/login'], {
      queryParams: { mode: 'login', returnUrl },
    });
  }

  cancelLocked() {
    this.seletedSeats = [];
    this.payBoolean = false;
    this.seatContainer = false;
    this.showPayPalSandbox = false;
  }

  togglePayPalSandbox(): void {
    this.showPayPalSandbox = !this.showPayPalSandbox;
  }

  completeDemoBooking(): void {
    // This portfolio path demonstrates checkout without requiring payment credentials.
    this.processBooking(
      'Demo booking confirmed',
      'No real payment was processed.'
    );
  }

  onSeatToggle(seat: Seat) {
    if (seat.occupied || this.seatContainer) {
      return;
    }
    seat.selected = !seat.selected;
    this.UserSelectedSeat += seat.selected ? 1 : -1;
    this.totalSeatAmount += seat.selected
      ? this.perSeatAmount
      : -this.perSeatAmount;
  }

  trackRow(index: number): number {
    return index;
  }

  trackSeat(_index: number, seat: Seat): number {
    return seat.id;
  }

  private initializeSeatLayout() {
    this.seats = Array.from({ length: this.totalSeatCount }, (_, index) => ({
      id: index + 1,
      occupied: false,
      selected: false,
    }));
    this.UserSelectedSeat = 0;
    this.totalSeatAmount = 0;
    this.buildSeatRows();
  }

  private buildSeatRows() {
    const rows: Seat[][] = [];
    for (let i = 0; i < this.seats.length; i += this.seatsPerRow) {
      rows.push(this.seats.slice(i, i + this.seatsPerRow));
    }
    this.seatRows = rows;
  }

  //routing view to details component for Details of Movie
  routeWithId(id: string) {
    this.router.navigateByUrl(`/movie/${id}`);
  }

  //paypal
  private initConfig(): void {
    this.payPalConfig = {
      currency: 'USD',
      clientId: 'sb',
      createOrderOnClient: (data) =>
        <ICreateOrderRequest>{
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: this.totalSeatAmount.toString(),
                breakdown: {
                  item_total: {
                    currency_code: 'USD',
                    value: this.totalSeatAmount.toString(),
                  },
                },
              },
            },
          ],
        },
      advanced: {
        commit: 'true',
      },
      style: {
        label: 'paypal',
        layout: 'vertical',
      },
      onApprove: (data, actions) => {
        //console.log('onApprove - transaction was approved, but not authorized', data, actions);
        actions.order.get().then((details: any) => {
          //console.log('onApprove - you can get full order details inside onApprove: ', details);
        });
      },
      //successful transaction
      onClientAuthorization: (data) => {
        this.processBooking(
          'Sandbox payment approved',
          'Processing your demo ticket...'
        );
      },
      onCancel: (data, actions) => {
        //console.log('OnCancel', data, actions);
        this.seletedSeats = [];
        this.payBoolean = false;
        this.seatContainer = false;
        this.showPayPalSandbox = false;
        this.toast.warning('Canceled!', 'Take time! We have seats for you.');
        this.cdr.markForCheck();
      },
      onError: (err) => {
        //console.log('OnError', err);
        this.seletedSeats = [];
        this.payBoolean = false;
        this.seatContainer = false;
        this.showPayPalSandbox = false;
        this.toast.warning(
          'Error!',
          'Recheck selected seats and internet connection, then try again.'
        );
        this.cdr.markForCheck();
      },
      onClick: (data, actions) => {
        //console.log('onClick', data, actions);
      },
    };
  }

  private processBooking(title: string, message: string): void {
    this.progressEvent = true;
    this.payBoolean = false;
    this.showPayPalSandbox = false;
    this.toast.success(title, message);
    this.saveSeatsInDB();
    this.cdr.markForCheck();
  }

  saveSeatsInDB() {
    let currentDate = this.newDate.toLocaleDateString('en-GB');
    let currentTime = this.newDate.toLocaleTimeString();
    const movietitle = this.movie.title;
    let mimage = this.movie.poster_path;
    //removing fetched seats from selected seat array
    const seats = this.seletedSeats.filter((val: any) => {
      return this.seater.indexOf(val) == -1;
    });
    let operaId = this.movie.id.toString() + '@' + currentDate;
    //OperaId

    this.api
      .seatBooking(
        currentDate,
        operaId,
        movietitle,
        seats,
        currentTime,
        mimage
      )
      .subscribe({
        next: (res: any) => {
          if (res) {
            this.UserSelectedSeat = 0;
            this.totalSeatAmount = 0;
            setTimeout(() => {
              this.progressEvent = false;
              this.router.navigateByUrl('/profile');
              this.cdr.markForCheck();
            }, 4000);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.progressEvent = false;
          this.seatContainer = false;
          console.log(err);
          if (err.status === 401) {
            this.toast.error('Session expired', 'Please log in to book seats');
            this.router.navigate(['/login'], {
              queryParams: { mode: 'login', returnUrl: this.router.url },
            });
          } else {
            this.toast.error('Booking failed', 'Please try again.');
          }
        },
      });
  }
}
