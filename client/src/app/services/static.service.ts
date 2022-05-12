import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigureService } from './configure.service';

@Injectable({
  providedIn: 'root'
})
export class StaticService {
  readonly Root_Url = this.configure.backend+'api/static';
  readonly Root_Url_1 = this.configure.backend+'api/parking';
  readonly Root_Url_2 = this.configure.backend+'api/setting';
  readonly Root_Url_3 = this.configure.backend+'link';
  constructor(private http:HttpClient, private configure:ConfigureService) { }

  getCameras(){
    return this.http.get(`${this.Root_Url}/cameras.json`);
  }

  getHdCameras(){
    return this.http.get(`${this.Root_Url}/hd_cameras.json`);
  }

  getTthCameras(){
    return this.http.get(`${this.Root_Url}/tth_cameras.json`);
  }

  getTthNewCameras(){
    return this.http.get(`${this.Root_Url}/tth_new_cameras.json`);
  }

  loadDistrictAPI(){
    return this.http.get(`${this.Root_Url_1}/hcmdistrict`,{});
  }

  loadDistrictParking(){
    return this.http.get(`${this.Root_Url_1}/loaddistrictname`,{});
  }

  loadGeoJSONByLocation(lng1:any, lat1:any){
    this.data = {
      lat: `${lng1}`,
      lng: `${lat1}`
    }
    return this.http.get(`${this.Root_Url_3}/lnglat`, this.data)
  }

  data: object ={
    lat: '',
    lng: ''
  }

  loadGeoJSONByLinkId(linkid:string){
    return this.http.get(`${this.Root_Url_3}/${linkid}/geojson`);
  }

  getFrontendSetting(){

  }
}
