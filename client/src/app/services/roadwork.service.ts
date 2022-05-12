import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigureService } from './configure.service';
@Injectable({
  providedIn: 'root'
})
export class RoadworkService {
  readonly Root_Url = this.configure.backend+'api/roadwork'
  constructor(private http:HttpClient, private configure:ConfigureService) { }

  query() {
    return this.http.get(`${this.Root_Url}`)
  }

  get(id:string) {
    return this.http.get(`${this.Root_Url}/${id}`)
  }

  delete(id:string){
    return this.http.delete(`${this.Root_Url}/${id}`);
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

  getRoadWorkCSV(){
    return this.http.get(`${this.Root_Url}/csv`, {
      responseType: 'blob'
    });
  }

  transformResponse(data:any){
    return new Blob([data],{type:'text/csv'});
  };
}
