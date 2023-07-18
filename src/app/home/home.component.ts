import { Component, OnInit, ElementRef } from '@angular/core';
import { ApiservicesService } from '../services/apiservices.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  image:any = ''
  title:any = ''
  desc:any = ''
  rate:any = ''
  genre:any = ''
  mId:any = ''
  allMoviesData:any = []
  GenreList:any = []
  NowPlaying:any = []
  st:string = ", "
  imageBASEurl:any = 'https://image.tmdb.org/t/p/original'
  constructor(private api:ApiservicesService, 
    private e:ElementRef,
    private router:Router){
    
   }

  ngOnInit(): void {
    this.getGenreList()
    this.getHomeMovies() 
    this.getNowPlayingMovies()
  }

  getHomeMovies(){
    this.api.getMovies().subscribe({
      next:(res:any)=>{
        this.allMoviesData = res.results
      },error:(err:any)=>{
        console.log(err);
      }
    })
  }

  getGenreList(){

    this.api.genreList().subscribe({
      next:(res:any)=>{
        //console.log(res);
        for(const {id,name} of res.genres){
          //console.log(id+name);
          this.GenreList[id] = name
        }
        //console.log(this.GenreList);
        
      },error:(err:any)=>{
        console.log(err);
        
      }
    })
  }
  
  getNowPlayingMovies(){
    this.api.nowPlayingMovies().subscribe({
      next:(res:any)=>{
        //console.log(res);
        this.NowPlaying = res.results
        let i = 0
        this.setHeader(i)
      },error:(err:any)=>{
        console.log(err);
        
      }
    })
  }


  setHeader(i:any){
    this.image = this.imageBASEurl+this.NowPlaying[i].backdrop_path
    this.title = this.NowPlaying[i].title
    this.desc = this.NowPlaying[i].overview.slice(0,150)+" ..."
    this.rate = this.NowPlaying[i].vote_average
    this.genre = ''
    for(let m of this.NowPlaying[i].genre_ids){
      this.genre += ' • '+this.GenreList[m]
    }
    this.mId = this.NowPlaying[i].id   
    
  }

  getMovieWithId(i:any){
    this.setHeader(i)
  }

  routeWithId(movie_id:any){
    localStorage.setItem("mId",movie_id)
    //console.log(movie_id);
    this.router.navigateByUrl('/movie/details')
  }

  routeForBooking(id:any,title:any){
    localStorage.setItem("bookId",id)
    sessionStorage.setItem("mTitle",title)
    //console.log(movie_id);
    this.router.navigateByUrl('/booking')
  }
}
