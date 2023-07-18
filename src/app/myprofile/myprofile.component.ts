import { Component, OnInit } from '@angular/core';
import { ApiservicesService } from '../services/apiservices.service';

@Component({
  selector: 'app-myprofile',
  templateUrl: './myprofile.component.html',
  styleUrls: ['./myprofile.component.css']
})
export class MyprofileComponent implements OnInit {

  user:any = ''
  userImage:any = ''
  revTicketArray:any = []
  imageBASEurl:any = 'https://image.tmdb.org/t/p/original'

  constructor(private api:ApiservicesService){}

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
