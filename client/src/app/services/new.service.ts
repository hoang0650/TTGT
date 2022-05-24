import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class NewService {
  readonly Root_Url = 'http://localhost:3000/api/news'
  constructor(private http:HttpClient) { }
  getNew(){
    return this.http.get(`${this.Root_Url}`);
  }
}
