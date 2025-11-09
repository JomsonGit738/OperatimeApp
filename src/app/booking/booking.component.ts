import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ApiservicesService } from '../services/apiservices.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
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
  UserSelectedSeat: any = 0;
  perSeatAmount: number = 5;
  totalSeatAmount: number = 0;
  newDate = new Date();
  imageBASEurl: any = 'https://image.tmdb.org/t/p/original';
  image: any = '';
  rate: any = 0;
  movie: any = [];
  seletedSeats: any = [];
  seats: any = [];
  seater: any = [];
  seatsFromServer: any = [];
  newArray: any = [];
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
    private myToast: NgToastService,
    private route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef
  ) {
    // console.log(this.route.snapshot.params['id']);
    // console.log(this.route.snapshot.queryParams['title']);
  }

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
    let weekday = [
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

    const toggleSelected = (e: any) => {
      if (e.target.classList.toggle('selected')) {
        this.UserSelectedSeat++;
        this.totalSeatAmount += this.perSeatAmount;
      } else {
        this.UserSelectedSeat--;
        this.totalSeatAmount -= this.perSeatAmount;
      }
    };

    this.seats = Array.from(document.getElementsByClassName('seat'));
    //console.log(seats[0].getAttribute('value'));
    for (let seat of this.seats) {
      seat.addEventListener('click', toggleSelected);
    }
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
          this.newArray = tempArray.flat();
          this.seatPusher();
        } else {
          console.log('no seats booked, yet...');
        }
        this.cdr.markForCheck();
      }),
      catchError((e) => {
        console.error(e);
        return EMPTY;
      })
    );

    // .subscribe({
    //   next: (res: any) => {
    //     if (res != null) {
    //       this.seatsFromServer = res;
    //       //getting seats from array
    //       const tempArray = [];
    //       for (let s of this.seatsFromServer.userseats) {
    //         tempArray.push(s.seats);
    //       }
    //       //console.log(tempArray);

    //       this.newArray = tempArray.flat();
    //       this.seatPusher();
    //     } else {
    //       console.log('no seats booked, yet...');
    //     }
    //     this.cdr.markForCheck();
    //   },
    //   error: (err: any) => {
    //     console.log(err);
    //   },
    // });
    // //paypal initialization
    // this.initConfig();
  }

  seatPusher() {
    const tseats = Array.from(document.getElementsByClassName('seat'));
    this.newArray.sort((a: any, b: any) => a - b);
    let i = 0;
    tseats.forEach((seat: any) => {
      if (seat.getAttribute('value') == this.newArray[i]) {
        seat.classList.add('occupied');
        i = i + 1;
      }
    });
  }

  seatLocked() {
    //getting seat numbers from user selection

    this.seats.forEach((seat: any) => {
      if (seat.classList.contains('selected')) {
        //seat.classList.add('occupied')
        //seat.classList.remove('selected')
        //console.log(seat.getAttribute('value'));
        this.seletedSeats.push(seat.getAttribute('value'));
      }
    });

    //if ticket counter is closed
    var closingHour = new Date();
    closingHour.setHours(20, 0, 0); // 08:00:00 pm (20:00:00 pm)
    var openingHour = new Date();
    openingHour.setHours(24, 0, 0); // 12.00:00 pm (24:00:00 pm)
    if (this.newDate >= closingHour && this.newDate < openingHour) {
      this.myToast.error({
        detail: 'Sorry! Counter closed',
        summary: 'please read our terms and conditions',
        duration: 5000,
      });
    }
    //if user could not signed in
    else if (!sessionStorage.getItem('email')) {
      this.myToast.error({
        detail: 'Log in!',
        summary: 'Please login to continue booking',
        duration: 5000,
      });
    }
    //if seat array is undefined or no seats are selected
    else if (this.seletedSeats == undefined || this.seletedSeats.length == 0) {
      this.seletedSeats = [];
      this.myToast.error({
        detail: 'No Seats selected!',
        summary: 'Please select your seats',
        duration: 5000,
      });
    }
    //if seats are selected more than 4
    else if (this.seletedSeats.length >= 5) {
      this.seletedSeats = [];
      this.myToast.error({
        detail: 'Only 4 seats!',
        summary: 'Online booking limited to 4 seats, read terms and conditions',
        duration: 5000,
      });
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

  //routing view to details component for Details of Movie
  routeWithId(id: string) {
    localStorage.setItem('mId', id);
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
        this.myToast.success({
          detail: 'Please wait!',
          summary: 'Do not refresh or close, we are processing...',
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
        this.myToast.warning({
          detail: 'Canceled!',
          summary: 'Take time! we have seats for you.',
          duration: 5000,
        });
        this.cdr.markForCheck();
      },
      onError: (err) => {
        //console.log('OnError', err);
        this.seletedSeats = [];
        this.payBoolean = false;
        this.seatContainer = false;
        this.myToast.warning({
          detail: 'Error!',
          summary:
            'Recheck selected seats and Ineternet connection! try again!',
          duration: 5000,
        });
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

    //OperaId
    let operaId = this.movie.id.toString() + '@' + currentDate;

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
