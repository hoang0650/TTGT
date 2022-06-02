import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigureService } from './configure.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class RoadEventsService {

  readonly Root_Url = this.configure.backend+'api';
  constructor(private http:HttpClient, private configure:ConfigureService) { }

  get(id:string) {
    return this.http.get(`${this.Root_Url}/roadevent/${id}`)
  }

  query() {
    return this.http.get(`${this.Root_Url}/roadevent`);
  }

  save(data:any) {
    return this.http.post(`${this.Root_Url}/roadevent`,data);
  }

  delete(id: string){
    return this.http.delete(`${this.Root_Url}/roadevent/${id}`);
  }

  update(id:string, data:object){
    return this.http.put(`${this.Root_Url}/roadevent/${id}`,data);
  }

  sortbydistrict(){
    return this.http.get(`${this.Root_Url}/roadevent/sortbydistrict`);
  }

  getRoadByDraw(data:object){
    return this.http.post('http://localhost:3000/link/shortestPath/geojson',data);
  }

  getAllPublish(){
    return this.http.get(`${this.Root_Url}/roadevent/publish`);
  }

  getRoadEventCSVById(id:string, payload:any){
    this.transformResponse = payload
    return this.http.get(`${this.Root_Url}/roadevent/${id}/csv`,payload);
  }

  getRoadEventCSV(){
    return this.http.get(`${this.Root_Url}/roadevent/csv`, {
      responseType: 'blob'
    });
  }

  exportExcel(jsonData: any[], filename:string): void{
    const ws : XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
    const wb : XLSX.WorkBook = { Sheets:{'roadevents': ws}, SheetNames:['roadevents']};
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
