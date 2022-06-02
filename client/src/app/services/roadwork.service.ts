import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigureService } from './configure.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
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

  exportExcel(jsonData: any[], filename:string): void{
    const ws : XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
    const wb : XLSX.WorkBook = { Sheets:{'roadworks': ws}, SheetNames:['roadworks']};
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
