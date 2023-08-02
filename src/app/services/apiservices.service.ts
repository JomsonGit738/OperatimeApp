import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

//creating headers of HttpHeaders Globally for overloading
const options = {
  headers:new HttpHeaders()
}

@Injectable({
  providedIn: 'root'
})
export class ApiservicesService {

  sessionUser = new BehaviorSubject('')

  constructor(private http:HttpClient) { }

  baseUrl = 'https://operatimeserver-2023.onrender.com'
  // baseUrl = 'http://localhost:3000'
  imageBASEurl = "https://image.tmdb.org/t/p/"

  //options url
  options:any = {method: 'GET',
    headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYzBlYTk4ZDZjMjg5ZTUyN2JiZWEzYWQ5MzQ4YzdiNyIsInN1YiI6IjY0OWE5NTBmZmVkNTk3MDEyY2ViYmU0YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-roI6am5rg37C19CbC3X-YoKitfUvSMKHzygcNI0_Mo'
  }}

  getMovies(){
     return this.http.get('https://api.themoviedb.org/3/movie/popular',this.options)
  }

  //Genre List
  genreList(){
    return this.http.get('https://api.themoviedb.org/3/genre/movie/list',this.options)
  }

  //get movie details with id
  getMovieById(id:any){
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}`,this.options)
  }

  //nowPlayingMovies
  nowPlayingMovies(){
    return this.http.get('https://api.themoviedb.org/3/movie/now_playing',this.options)
  }

  //search movies
  searchMovies(name:any){
    return this.http.get(`https://api.themoviedb.org/3/search/movie?query=${name}&include_adult=false&language=en-US&page=1`,this.options)
  }


  //full detauls
  getFull(id:any){
    return this.http.get(`https://api.themoviedb.org/3/movie/${id}?api_key=3c0ea98d6c289e527bbea3ad9348c7b7&append_to_response=videos,casts`)
  }

  //Sign up
  signUp(username:any,email:any,password:any){
    const body = {
      username,
      email,
      password
    }
    return this.http.post(`${this.baseUrl}/user/signup`,body)
  }

  //log In
  logIn(email:any,password:any){
    const body = {
      email,
      password
    }
    return this.http.post(`${this.baseUrl}/user/login`,body)
  }

  //Google Sing In
  GoogleSignIn(email:any,username:any){
    const body = {
      email,
      username
    }
    return this.http.post(`${this.baseUrl}/user/gosin`,body)
  }

  //get User details
  getUserDetails(email:any){
    const body = {
      email
    }
    return this.http.post(`${this.baseUrl}/user/details`,body)
  }

  //getBookedseats for film
  getBookedSeats(id:any){
    return this.http.get(`${this.baseUrl}/getseats/${id}`)
  }

  appednToken(){
    //get token from local storage
    const token = sessionStorage.getItem("token")
    //create http header
    let head = new HttpHeaders()
    if(token){
      //append token in headers
      head = head.append("access-token",token)
      options.headers = head
    }
    return options
  }

  //seatBooking
  seatBooking(date:any,operaId:any,movietitle:any,seats:any,email:any,time:any,mimage:any){
    const body = {
      date,
      operaId,
      movietitle,
      seats,
      email,
      time,
      mimage
    }

    return this.http.post(`${this.baseUrl}/booking`,body,this.appednToken())
  }

}
