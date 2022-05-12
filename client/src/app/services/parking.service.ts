import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigureService } from './configure.service';

@Injectable({
  providedIn: 'root'
})
export class ParkingService {
  readonly Root_Url = this.configure.backend+'api/parking'
  constructor(private http: HttpClient, private configure:ConfigureService) { }

  get(parkingId:string) {
    return this.http.get(`${this.Root_Url}/${parkingId}`);
  }

  query() {
    return this.http.get(`${this.Root_Url}`)
  }

  delete(parkingId:string){
    return this.http.delete(`${this.Root_Url}/${parkingId}`);
  }

  update(id:string, data:object){
    return this.http.put(`${this.Root_Url}/${id}`,data);
  }

  save(data:object) {
    return this.http.post(`${this.Root_Url}`,data);
  }

  sortbydistrict(){
    return this.http.get(`${this.Root_Url}/sortbydistrict`);
  }

  deleteImageParking(imgName:object){
    return this.http.delete(`${this.Root_Url}/uploads/${imgName={imageName: 'imageName'}}`);
  }

  getParkingWithBBox(bbox:string){
    return this.http.get(`${this.Root_Url}/${bbox}/geojson`);
  }

  getAllParkingGeoJson(){
    return this.http.get(`${this.Root_Url}/geojson`);
  }

  getParkingCSV(){
    return this.http.get(`${this.Root_Url}/csv`, {
      responseType: 'blob'
    })
  }
  
  transformResponse(data:any){
    return new Blob([data],{type:'text/csv'});
  };
}
