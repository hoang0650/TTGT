import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class CameraGroupService {
  readonly Url = 'http://localhost:3000/api/cameras/groups'
  constructor(private http: HttpClient) { }


  update(camGroupId: string,data:object){
    return this.http.put(`${this.Url}/${camGroupId}`,data);
  }

  save(data:object){
    return this.http.post(`${this.Url}`,data);
  }

  query() {
    return this.http.get(`${this.Url}`);
  }

  remove(camGroupId:string) {
    return this.http.delete(`${this.Url}/${camGroupId}`);
  }
}
