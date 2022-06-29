import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigureService } from './configure.service';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class EventService {

  readonly Root_Url = this.configure.backend+'api/event';
  constructor(private http:HttpClient, private configure:ConfigureService, private _zone:NgZone) { }

  delete(cameraId:string){
    return this.http.delete(`${this.Root_Url}/${cameraId}`)
  }

  update(cameraId:string,data:object){
    return this.http.put(`${this.Root_Url}/${cameraId}`,data);
  }

  sortbydistrict(){
    return this.http.get(`${this.Root_Url}/sortbydistrict`);
  }

  sortbytype(){
    return this.http.get(`${this.Root_Url}/sortbytype`);
  }
  
  geoJson(){
    return this.http.get(`${this.Root_Url}/geojson`);
  }

  getAllEventInData(){
    return this.http.get(`${this.Root_Url}/getall`);
  }

  getAllType(){
    return this.http.get(`${this.Root_Url}/getalltype`);
  }

  approveEvent(id:string,data:object){
    return this.http.put(`${this.Root_Url}/${id}/approve`,data);
  }

  updateEvent(id:string,data:object){
    return this.http.put(`${this.Root_Url}/${id}/update`,data);
  }

  rejectEvent(id:string,data:object){
    return this.http.put(`${this.Root_Url}/${id}/reject`,data);
  }

  expireEvent(id:string,data:object){
    return this.http.put(`${this.Root_Url}/${id}/expire`,data);
  }

  streamEvent() {
    return new Observable<any>((obs) => {
      const eventSource = new EventSource(`${this.Root_Url}/stream`)

      eventSource.onmessage = event => {
        this._zone.run(() => {
          obs.next(event)
        })
      }

      eventSource.onerror = event => {
        this._zone.run(() => {
          obs.error(event)
        })
      }
    })
  }
}
