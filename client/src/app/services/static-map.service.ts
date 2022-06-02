import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigureService } from './configure.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class StaticMapService {

  readonly Root_Url = this.configure.backend+'api/staticmap';
  constructor(private http:HttpClient, private configure:ConfigureService) { }

  get(id:string) {
    return this.http.get(`${this.Root_Url}/${id}`)
  }

  create(data:any) {
    return this.http.post(`${this.Root_Url}`, data)
  }

  query() {
    return this.http.get(`${this.Root_Url}`)
  }

  delete(id:string){
    return this.http.delete(`${this.Root_Url}/${id}`)
  }

  update(id:string,data:any){
    return this.http.put(`${this.Root_Url}/${id}`,data);
  }

  getAllPublish() {
    return this.http.get(`${this.Root_Url}/publish`)
  }

  getIcons() {
    return this.http.get(`${this.Root_Url}/icons`)
  }

  getStaticCSV() {
    return this.http.get(`${this.Root_Url}/csv`, {
      responseType: 'blob'
    })
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

  getStaticCSVById(id:string) {
    return this.http.get(`${this.Root_Url}/csv`, {
      params: {
        id: id
      }
    })
  }
}
