import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigureService } from './configure.service';

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
}
