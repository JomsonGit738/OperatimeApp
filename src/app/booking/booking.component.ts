import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ApiservicesService } from '../services/apiservices.service';
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
import { ToastService } from '../services/toast.service';

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
    this.getSeats();
  }

  //loading movie details in booking component
  loadBookingMovie(id: string) {
    // let id = localStorage.getItem('bookId');
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
      if (isOccupied) {
        seat.selected = false;
      }
    });

    this.UserSelectedSeat = this.seats.filter((seat) => seat.selected).length;
    this.totalSeatAmount = this.UserSelectedSeat * this.perSeatAmount;
    this.buildSeatRows();
  }

  seatLocked() {
    //getting seat numbers from user selection

    this.seletedSeats = this.seats
      .filter((seat) => seat.selected)
      .map((seat) => seat.id.toString());

    //if ticket counter is closed
    var closingHour = new Date();
    closingHour.setHours(20, 0, 0); // 08:00:00 pm (20:00:00 pm)
    var openingHour = new Date();
    openingHour.setHours(24, 0, 0); // 12.00:00 pm (24:00:00 pm)
    if (this.newDate >= closingHour && this.newDate < openingHour) {
      this.toast.error(
        'Sorry! Counter closed',
        'Please read our terms and conditions'
      );
    }
    //if user could not signed in
    else if (!sessionStorage.getItem('email')) {
      this.toast.error(
        'Log in!',
        'Please login to continue booking'
      );
    }
    //if seat array is undefined or no seats are selected
    else if (this.seletedSeats == undefined || this.seletedSeats.length == 0) {
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
    //saving seats to Database
    else {
      this.payBoolean = true;
      this.seatContainer = true;
    }
  }

  cancelLocked() {
    this.seletedSeats = [];
    this.payBoolean = false;
    this.seatContainer = false;
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
    // localStorage.setItem('mId', id);
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
        //console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
        this.progressEvent = true;
        this.payBoolean = false;
        this.seatContainer = false;
        this.toast.success('Please wait!', 'Processing your booking...', {
          duration: 10000,
        });
        //resetting bill details
        this.UserSelectedSeat = 0;
        this.totalSeatAmount = 0;
        //api call to save seat details in db
        this.saveSeatsInDB();
        this.cdr.markForCheck();
      },
      onCancel: (data, actions) => {
        //console.log('OnCancel', data, actions);
        this.seletedSeats = [];
        this.payBoolean = false;
        this.seatContainer = false;
        this.toast.warning('Canceled!', 'Take time! We have seats for you.');
        this.cdr.markForCheck();
      },
      onError: (err) => {
        //console.log('OnError', err);
        this.seletedSeats = [];
        this.payBoolean = false;
        this.seatContainer = false;
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

  saveSeatsInDB() {
    let currentDate = this.newDate.toLocaleDateString('en-GB');
    let currentTime = this.newDate.toLocaleTimeString();
    let email = sessionStorage.getItem('email');
    const movietitle = this.movie.title;
    let mimage = this.movie.poster_path;
    //removing fetched seats from selected seat array
    const seats = this.seletedSeats.filter((val: any) => {
      return this.seater.indexOf(val) == -1;
    });
    let operaId = this.movie.id.toString() + '@' + currentDate;
    console.log(
      currentDate,
      operaId,
      movietitle,
      seats,
      email,
      currentTime,
      mimage
    );
    //OperaId

    this.api
      .seatBooking(
        currentDate,
        operaId,
        movietitle,
        seats,
        email,
        currentTime,
        mimage
      )
      .subscribe({
        next: (res: any) => {
          if (res) {
            setTimeout(() => {
              this.progressEvent = false;
              this.router.navigateByUrl('/profile');
              this.cdr.markForCheck();
            }, 4000);
          }
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }
}
