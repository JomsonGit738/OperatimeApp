import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiservicesService } from '../services/apiservices.service';

@Component({
  selector: 'app-myprofile',
  templateUrl: './myprofile.component.html',
  styleUrls: ['./myprofile.component.css'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class MyprofileComponent implements OnInit {

  user:any = ''
  userImage:any = ''
  revTicketArray:any = []
  imageBASEurl:any = 'https://image.tmdb.org/t/p/original'

  constructor(private api:ApiservicesService, private readonly cdr: ChangeDetectorRef){}

  ngOnInit(): void {
    this.getuser()
  }

  getuser()
  {
    let email = sessionStorage.getItem('email')
    this.api.getUserDetails(email).subscribe({
      next:(res:any)=>{ 
          this.user = res
          //reversing array
          this.revTicketArray = this.user.tickets.slice().reverse()          
        if(sessionStorage.getItem('photo')){
          this.userImage = sessionStorage.getItem('photo')
        }        
        this.cdr.markForCheck();
      },error:(err:any)=>{
        console.log(err);
        
      }
    })
  } 

  //creating QR code with operaID
  downloadTicket(index:any){
    let key = this.user.tickets[index].operaId
    var url = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + key; 
    window.open(url);
  }

}
