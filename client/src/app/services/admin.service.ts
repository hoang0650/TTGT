import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class AdminService {
  readonly Root_url = 'http://localhost:3000/api/admin';
  constructor(private http: HttpClient) { }
  getUsers(){
    return this.http.get(`${this.Root_url}`);
  }

  getUser(id:string){
    return this.http.get(`${this.Root_url}/${id}`);
  }

  getUserInfo() {
    return this.http.get('http://localhost:3000/api/user/info');
  }


  blockUser(id: string, action:string, payload: Object){
    return this.http.post(`${this.Root_url}/${id}/${action}`,payload={'blocked':true});
  }

  unblockUser(id: string, action:string, payload: Object){
    return this.http.post(`${this.Root_url}/${id}/${action}`,payload={'blocked':false});
  }

  changeToGuest(id: string, action:string, payload: Object){
    return this.http.post(`${this.Root_url}/${id}/${action}`,payload={'app_metadata':{'roles':'guest'}});
  }

  changeToUser(id: string, action:string, payload: Object){
    return this.http.post(`${this.Root_url}/${id}/${action}`,payload={'app_metadata':{'roles':'user'}});
  }

  changeToAdmin(id: string, action:string, payload: Object){
    return this.http.post(`${this.Root_url}/${id}/${action}`,payload={'app_metadata':{'roles':'admin'}});
  }

  changePermissions(id: string, payload: Object){
    return this.http.post(`${this.Root_url}/${id}/permissions`,payload);
  }

  getLogs(id: string){
    return this.http.get(`${this.Root_url}/${id}`);
  }

}
