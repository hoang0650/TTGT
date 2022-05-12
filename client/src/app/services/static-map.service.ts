import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigureService } from './configure.service';

@Injectable({
  providedIn: 'root'
})
export class StaticMapService {

  readonly Root_Url = this.configure.backend+'api/staticmap';
  constructor(private http:HttpClient, private configure:ConfigureService) { }

  get(id:string) {
    return this.http.get(`${this.Root_Url}/${id}`)
  }

  create(data:any) {
    return this.http.post(`${this.Root_Url}`, data)
  }

  query() {
    return this.http.get(`${this.Root_Url}`)
  }

  delete(id:string){
    return this.http.delete(`${this.Root_Url}/${id}`)
  }

  update(id:string,data:any){
    return this.http.put(`${this.Root_Url}/${id}`,data);
  }

  getAllPublish() {
    return this.http.get(`${this.Root_Url}/publish`)
  }

  getIcons() {
    return this.http.get(`${this.Root_Url}/icons`)
  }

  getStaticCSV() {
    return this.http.get(`${this.Root_Url}/csv`, {
      responseType: 'blob'
    })
  }

  getStaticCSVById(id:string) {
    return this.http.get(`${this.Root_Url}/csv`, {
      params: {
        id: id
      }
    })
  }
}
