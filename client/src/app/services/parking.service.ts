import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigureService } from './configure.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

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

  exportExcel(jsonData: any[], filename:string): void{
    const ws : XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
    const wb : XLSX.WorkBook = { Sheets:{'parkings': ws}, SheetNames:['parkings']};
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
