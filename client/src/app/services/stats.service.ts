import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigureService } from './configure.service';
// import * as FileSaver from 'file-saver';
// import * as XLSX from 'xlsx';
@Injectable({
  providedIn: 'root'
})
export class StatsService {

  readonly Root_url = this.configure.backend+'api/stats';
  constructor(private http: HttpClient, private configure:ConfigureService) { }

  getPointsForHeatmap(query:any) {
    return this.http.get(`${this.Root_url}/heatmap`, { params: query });
  }

  getEventsWeekly(query:any) {
    return this.http.get(`${this.Root_url}/events/weekly`, { params: query });
  }

  getEventsMonthly(query:any) {
    return this.http.get(`${this.Root_url}/events/monthly`, { params: query });
  }

  exportToCSV(query:any) {
    return this.http.get(`${this.Root_url}/events/csv`, { params: query,  responseType: 'blob' });
  }

  // exportExcel(jsonData: any[], filename:string): void{
  //   const ws : XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
  //   const wb : XLSX.WorkBook = { Sheets:{'stats': ws}, SheetNames:['stats']};
  //   const excelBuffer: any = XLSX.write(wb, {bookType:'xlsx',type:'array'});
  //   this.saveExcelFile(excelBuffer,filename)  
  // }

  // saveExcelFile(buffer: any, fileName: string): void {
  //   const data: Blob = new Blob([buffer], {type: this.configure.fileType});
  //   FileSaver.saveAs(data, fileName + this.configure.fileExtension);
  // }
}
