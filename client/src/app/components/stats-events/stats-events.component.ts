import { animate, state, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import 'heatmap.js';
import { ConfigureService } from 'src/app/services/configure.service';
import { StatsService } from 'src/app/services/stats.service';

declare const HeatmapOverlay: any;

@Component({
  selector: 'app-stats-events',
  templateUrl: './stats-events.component.html',
  styleUrls: ['./stats-events.component.css'],
  animations: [
    trigger('mapLayoutInfo', [
      state('open', style({
        position: 'absolute',
        right: '0%',
      })),
      state('closed', style({
        position: 'absolute',
        right: '-408px',
      })),
      transition('open => closed', [
        animate('0.3s')
      ]),
      transition('closed => open', [
        animate('0.3s')
      ]),
    ]),
    trigger('mapLayoutInfoButton', [
    state('open', style({
      position: 'absolute',
      right: '408px',
    })),
    state('closed', style({
      position: 'absolute',
      right: '0px',
    })),
    transition('open => closed', [
      animate('0.3s')
    ]),
    transition('closed => open', [
      animate('0.3s')
    ]),
    ]),
  ]
})
export class StatsEventsComponent implements OnInit {
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
  sideMap: any;
  options: any;

  heatData: any = {
    data: [
    ]
  }
  heatmapLayer: any;

  constructor(public configure:ConfigureService, private statsService:StatsService, private datePipe:DatePipe, private cdRef:ChangeDetectorRef) {
    this.startDate = this.datePipe.transform(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    this.endDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    this.options = {
      layers: [
        this.configure.baselayer.tiles,
      ],

      worldCopyJump: true,
      center: [  10.762622, 106.660172 ],
      zoom: 14
    }
  }

  ngOnInit(): void {
    
  }

  initMap(map:any) {
    this.sideMap = map

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
      this.sideMap.invalidateSize()
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
  };

  isSearch = false;
  searchQuery = '';
  searchResults:any = [];

  searchIconClick() {
    this.isSearch = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.cdRef.detectChanges()
  }

  searchSelect(result:any) {
    if (result) {
      if (result.geometry) {
        this.searchQuery = result.properties.name
        this.isSearch = false
        this.sideMap?.flyTo([result.geometry.coordinates[1], result.geometry.coordinates[0]], 15);
      }
    }
  }

  isOpen = true;

  toggleLayoutInfo(onoff?:boolean) {
    this.isOpen = onoff || !this.isOpen;
    this.cdRef.detectChanges()
  }
}
