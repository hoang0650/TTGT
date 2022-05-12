import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigureService } from './configure.service';
@Injectable({
  providedIn: 'root'
})
export class GroupService {
  readonly Root_Url = this.configure.backend+'api/groups'
  constructor(private http:HttpClient, private configure:ConfigureService) { }

  query() {
    return this.http.get(`${this.Root_Url}`);
  }

  delete(id:string){
    return this.http.delete(`${this.Root_Url}/${id}`)
  }

  save(data:any) {
    return this.http.post(`${this.Root_Url}`, data);
  }

  update(groupId:string, data:object) {
    return this.http.put(`${this.Root_Url}/${groupId}`, data);
  }

  getGroupById(groupId:string){
    return this.http.get(`${this.Root_Url}/${groupId}`);
  }
}
