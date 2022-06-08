import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import 'heatmap.js';
import { ConfigureService } from 'src/app/services/configure.service';
import { StatsService } from 'src/app/services/stats.service';
import { MapComponent } from '../map/map.component';

declare const HeatmapOverlay: any;

@Component({
  selector: 'app-stats-events',
  host: {
    class: 'map-layout-info-container'
  },
  templateUrl: './stats-events.component.html',
  styleUrls: ['./stats-events.component.css'],
})
export class StatsEventsComponent implements OnInit, OnDestroy {
  isWeeklyLoading = false;
  isHeatmapLoading = false;
  isMonthlyLoading = false;
  exportUrl: any;
  exported = false;
  weekly?:ChartConfiguration['data'];
  monthly?:ChartConfiguration['data'];

  startDate:any;
  endDate:any;
  chartType: ChartType = 'bar';
  sideMap?: L.Map;

  heatData: any = {
    data: [
    ]
  }
  heatmapLayer: any;

  constructor(public mapCom:MapComponent, public configure:ConfigureService, private statsService:StatsService, private datePipe:DatePipe, private cdRef:ChangeDetectorRef) {
    this.startDate = this.datePipe.transform(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    this.endDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    this.sideMap = mapCom.sideMap
  }

  ngOnInit(): void {
    this.getHeatMap()
    this.mapCom.toggleLayout(true)
  }

  ngOnDestroy(): void {
    this.mapCom.removeLayers()
    this.mapCom.toggleLayout(false)
  }

  getHeatMap() {
    const heatLayerConfig = {
      "radius": 0.001,
      "maxOpacity": .5,
      "scaleRadius": true,
      "useLocalExtrema": true,

      latField: 'lat',
      lngField: 'lng',
      valueField: 'count'
    };

    this.heatmapLayer = new HeatmapOverlay(heatLayerConfig);
    this.heatmapLayer.addTo(this.sideMap);

    this.refresh()
    setTimeout(() => {
      this.sideMap?.invalidateSize()
    })
  }

  refreshExport() {
    this.exported = false;
    delete this.exportUrl
    this.statsService.exportToCSV({ startDate: this.startDate, endDate: this.endDate }).subscribe({
      next: (res:any) => {
        this.exportUrl = URL.createObjectURL(new Blob([res], { type: 'text/csv' }));
        this.exported = true
      },
      error: (err) => {
        console.log(err)
        this.exported = true
      }
    })
  }

  

  loadWeeklyChart() {
    this.isWeeklyLoading = true;
    this.statsService.getEventsWeekly({ startDate: this.startDate, endDate: this.endDate }).subscribe({
      next: (res:any) => {
        this.weekly = {
          datasets: [],
          labels: res.labels
        };

        for (var i = 0; i < res.series.length; i++) {
          this.weekly['datasets'].push({data:res.data[i], label:res.series[i]})
        }

        this.isWeeklyLoading = false;
      },
      error: (err) => {
        console.log(err)
        this.isWeeklyLoading = false;
      }
    })
  }

   loadMonthlyChart() {
    this.isMonthlyLoading = true;
    this.statsService.getEventsMonthly({ startDate: this.startDate, endDate: this.endDate }).subscribe({
      next: (res:any) => {

        this.monthly = {
          datasets: [],
          labels: res.labels
        };

        for (var i = 0; i < res.series.length; i++) {
          this.monthly['datasets'].push({data:res.data[i], label:res.series[i]})
        }

        this.isMonthlyLoading = false;
      },
      error: (err) => {
        console.log(err)
        this.isMonthlyLoading = false;
      }
    })
  }

  loadHeatmap() {
    this.isHeatmapLoading = true;

    this.statsService.getPointsForHeatmap({ startDate: this.startDate, endDate: this.endDate }).subscribe({
      next: (res:any) => {
        this.heatData['data'] = []
        res.forEach((latlng:any) => {
          this.heatData['data'].push({lat:latlng[0], lng:latlng[1], count:1})
        })
        
        this.heatmapLayer.setData(this.heatData);
        this.isHeatmapLoading = false;
      },
      error: (err) => {
        console.log(err)
        this.isHeatmapLoading = false;
      }
    })
  }

  refresh() {
    this.loadHeatmap();
    this.loadWeeklyChart();
    this.loadMonthlyChart();

    this.refreshExport();
    
    this.mapCom.detectChanges()
    this.cdRef.detectChanges()
  };
}
