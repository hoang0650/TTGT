import { HttpClient } from '@angular/common/http';
import { Component, Injectable } from '@angular/core';
import { ConfigureService } from './configure.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})

export class CameraService {
  readonly Root_Url = this.configure.backend+'api';
  constructor(private http:HttpClient, private configure:ConfigureService,private sanitizer: DomSanitizer) { }

  get(id:string) {
    return this.http.get(`${this.Root_Url}/cameras/${id}`)
  }

  create(data:any) {
    return this.http.post(`${this.Root_Url}/cameras`, data)
  }

  query() {
    return this.http.get(`${this.Root_Url}/cameras`)
  }

  delete(cameraId:string){
    return this.http.delete(`${this.Root_Url}/cameras/${cameraId}`)
  }

  update(cameraId:string,data:object){
    return this.http.put(`${this.Root_Url}/cameras/${cameraId}`,data);
  }

  sortbydistrict(){
    return this.http.get(`${this.Root_Url}/cameras/sortbydistrict`);
  }

  sortbytype(){
    return this.http.get(`${this.Root_Url}/cameras/sortbytype`);
  }

  getdefaultcamera(){
    return this.http.get(`${this.Root_Url}/cameras/getdefaultcamera`);
  }

  getcamerapreview(payload:object){
    return this.http.post(`${this.Root_Url}/snapshot/getcamerapreview`,payload={skip:0,limit:20});
  }

  getStatus(){
    return this.http.get(`${this.Root_Url}/snapshot/responsetime`);
  }

  getCameraWithBBox(){
    return this.http.get(`${this.Root_Url}/cameras/:bbox/geojson`);
  }

  getCameraByType(type:object){
    return this.http.get(`${this.Root_Url}/cameras/${type={type:'type'}}/:type/geojson`);
  }

  getCameraType(){
    return this.http.get(`${this.Root_Url}/cameras/getcameratype`);
  }

  getCameraConfig(){
    return this.http.get(`${this.Root_Url}/cameras/getcameraconfig`);
  }

  getCameraCSV(){
    return this.http.get(`${this.Root_Url}/cameras/csv`, {
      responseType: 'blob'
    });
  }

  exportExcel(jsonData: any[], filename:string): void{
      const ws : XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
      const wb : XLSX.WorkBook = { Sheets:{'cameras': ws}, SheetNames:['cameras']};
      const excelBuffer: any = XLSX.write(wb, {bookType:'xlsx',type:'array'});
      this.saveExcelFile(excelBuffer,filename)  
  }

  saveExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {type: this.configure.fileType});
    FileSaver.saveAs(data, fileName + this.configure.fileExtension);
  }

  transformResponse(data:any){
    return new Blob([data],{type:'text/csv'});
  };
}
