import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  readonly Root_Url = 'https://api.dongnai.ttgt.vn/v4/routing/geocoding';
  constructor(private http:HttpClient) { }

  geocodingByText(params:any){
    return this.http.get(`${this.Root_Url}`, {
      params: params
    });
  }
}
