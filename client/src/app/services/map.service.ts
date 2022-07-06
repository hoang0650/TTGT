import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigureService } from './configure.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  readonly Root_Url = this.configure.backend+'api';;
  constructor(private http:HttpClient, private configure:ConfigureService, private _zone:NgZone) { }

  set(key:any,value:any){
    return localStorage[key] = value;
  }

  get(key:any,defaultValue:any){
    return localStorage[key] || defaultValue;
  }

  setObject(key:any, value:any){
    return localStorage[key] = JSON.stringify(value);
  }

  getObject(key:any){
    return JSON.parse(localStorage[key] || '{}');
  }

  getArray(key: any){
    return JSON.parse(localStorage[key] || '[]');
  }

  removeItem(key: any){
    return localStorage.removeItem(key);
  }

  // map service

  sendHistory(data:object){
    return this.http.post(`${this.Root_Url}/user/addhistory`, data);
  }

  sendFavorite(data:object){
    return this.http.post(`${this.Root_Url}/user/addfavorite`, data);
  }

  getInfoOfUser(){
    return this.http.get(`${this.Root_Url}/user`);
  }

  getAllType(){
    return this.http.get(`${this.Root_Url}/event/getalltype`);
  }

  submitEvent(data:object){
    return this.http.post(`${this.Root_Url}/event`,data);
  }

  getAllEvent(){
    return this.http.get(`${this.Root_Url}/event`);
  }

  getParkingGeoJSON(){
    return this.http.get(`${this.Root_Url}/parking/geojson`);
  }

  getCameraGeoJSON(){
    return this.http.get(`${this.Root_Url}/camera/geojson`);
  }

  getViaroute(){
    return this.http.get(`${this.Root_Url}/v1/routing/viaroute`);
  }

  streamEvent() {
    return new Observable<any>((obs) => {
      let token =  JSON.parse(localStorage.getItem('id_token') || "")
      const eventSource = new EventSource(`${this.Root_Url}/event/stream?token=${token}`)

      eventSource.onmessage = event => {
        this._zone.run(() => {
          let data = JSON.parse(event.data)

          obs.next(data)
        })
      }

      eventSource.onerror = event => {
        this._zone.run(() => {
          obs.error(event)
        })
      }

      return () => {
        eventSource.close();
      };
    })
  }

  // roadTranlate service

  listAction:any = {
    0: 'Đi thẳng',
    1: 'Đi thẳng',
    2: 'Chếch sang bên phải',
    3: 'Rẽ phải',
    4: 'Ngoặt phải',
    5: 'Quay đầu',
    6: 'Ngoặc trái',
    7: 'Rẽ trái',
    8: 'Chếch sang bên trái',
    9: 'Đến vị trí',
    10: 'Đi thẳng',
    11: 'Vào vòng xoay',
    12: 'Ra khỏi vòng xoay',
    13: 'Tại vòng xoay',
    14: 'Bắt đầu tại cuối đường',
    15: 'Đến điểm cuối',
    16: 'Vào đường ngược chiều',
    17: 'Thoát khỏi đường ngược chiều',
    127: 'InverseAccessRestrictionFlag',
    128: 'AccessRestrictionFlag',
    129: 'AccessRestrictionPenalty',
    '11-1': 'Vào vòng xoay và đi thẳng',
    '11-2': 'Vào vòng xoay và chếch sang bên phải',
    '11-3': 'Vào vòng xoay và rẽ phải',
    '11-4': 'Vào vòng xoay và ngoặt phải',
    '11-5': 'Vào vòng xoay và quay đầu',
    '11-6': 'Vào vòng xoay và chếch sang bên trái',
    '11-7': 'Vào vòng xoay và rẽ trái',
    '11-8': 'Vào vòng xoay và ngoặt trái',
    '12-1': 'Ra khỏi vòng xoay và đi thẳng',
    '12-2': 'Ra khỏi vòng xoay và chếch sang bên phải',
    '12-3': 'Ra khỏi vòng xoay và rẽ phải',
    '12-4': 'Ra khỏi vòng xoay và ngoặt phải',
    '12-5': 'Ra vòng xoay và quay đầu',
    '12-6': 'Ra khỏi vòng xoay và chếch sang bên trái',
    '12-7': 'Ra khỏi vòng xoay và rẽ trái',
    '12-8': 'Ra khỏi vòng xoay và ngoặt trái',
  }

  listDirection:any = {
    E: 'Đông',
    W: 'Tây',
    S: 'Nam',
    N: 'Bắc',
    SE: 'Đông Nam',
    SW: 'Tây Nam',
    NE: 'Đông Bắc',
    NW: 'Tây Bắc'
  }

  getTextFromCode(code:any){
    return this.listAction[code];
  }

  getDirection(code:any){
    return this.listAction[code];
  }
}
