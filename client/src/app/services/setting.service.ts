import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigureService } from './configure.service';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  readonly Root_Url = this.configure.backend+'api/setting';
  constructor(private http: HttpClient, private configure:ConfigureService) { }

  getLastSetting(){
    return this.http.get(`${this.Root_Url}/getlastsetting/`)
  }

  saveSetting(payload:Object){
    return this.http.post(`${this.Root_Url}`,payload)
  }  

  getSession(){
    return this.http.get(`${this.Root_Url}/getsession`)
  }

  cancelSession(payload:object){
    return this.http.post(`${this.Root_Url}/cancelsession`,payload);
  }

  getMapUrl(){
    return this.http.get(`${this.Root_Url}/getmapurl`);
  }

  getFrontendSetting(){
    return this.http.get(`${this.Root_Url}/getfrontendsetting`).subscribe(succ => succ);
  }
}
