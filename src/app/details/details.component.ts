import { Component, OnInit } from '@angular/core';
import { ApiservicesService } from '../services/apiservices.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent implements OnInit {

  movieObject:any = []
  movieVideos:any = []
  rate:any = 0
  starring:any = ''
  director:any = ''
  trailerKey:any = ''
  imageBASEurl:any = 'https://image.tmdb.org/t/p/original'

  constructor(private api:ApiservicesService, private sanitizer:DomSanitizer){}


  ngOnInit(): void {
    this.getFull()
  }


  getFull(){
    const item = localStorage.getItem("mId")
    this.api.getFull(item).subscribe({
      next:(res:any)=>{     
        //console.log(res);
        this.movieObject = res
        //rate
        const r = this.movieObject.vote_average
        this.rate = r.toString().slice(0,3)
        //starring 
        let n  = ''
        for(let s of this.movieObject.casts.cast.slice(0,10)){
          n += s.name + ', '
        }
        this.starring = n
        //director
        let d = this.movieObject.casts.crew.filter((j:any)=>j.job == 'Director')
        this.director = d[0].name
        //Trailer
        let t = this.movieObject.videos.results.filter((a:any)=>a.type == 'Trailer')
        if(t){
          //this.trailerKey = `https://www.youtube.com/embed/${t[0].key}?&theme=dark&color=white&rel=0` 
          this.trailerKey = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${t[0].key}?&theme=dark&color=white&rel=0`)
        //console.log(this.trailerKey);
        }
        
        
      },error:(err:any)=>{
        console.log(err);
        
      }
    })
  }
}
