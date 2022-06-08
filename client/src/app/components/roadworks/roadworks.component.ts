import { animate, state, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import L from 'leaflet';
import _ from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ConfigureService } from 'src/app/services/configure.service';
import { MarkerService } from 'src/app/services/marker.service';
import { MessageService } from 'src/app/services/message.service';
import { RoadworkService } from 'src/app/services/roadwork.service';

@Component({
  selector: 'app-roadworks',
  templateUrl: './roadworks.component.html',
  styleUrls: ['./roadworks.component.css'],
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
export class RoadworksComponent implements OnInit {
  searchParams: any;
  sideMap: any;
  mess: any;
  oneDay: number;
  currentDate: Date;
  typeToClassName: any;
  allGeoStyle: any;
  styleGeojson: any;
  statusFilterValues: any[];
  markers: any;
  notice: any;
  exported: boolean;
  objectUrl: any;
  filter: any;
  listRoadwork: any;
  updateRoadwork: any;
  currentMarker:any;
  geojson: any;
  id?:string
  isLoading = true;

  constructor(public configure:ConfigureService, private route:ActivatedRoute, private messageService:MessageService, private roadworkService:RoadworkService, private location:Location, private cdRef:ChangeDetectorRef, private markerService:MarkerService, private nzMessage:NzMessageService,private sanitizer: DomSanitizer) { 
    this.searchParams = (new URL(window.location.href)).searchParams
    this.mess = messageService.getMessageObj();
    this.oneDay = 24 * 60 * 60 * 1000;
    this.currentDate = new Date();
    this.statusFilterValues = []
    this.markers = {}
    this.exported = false
    this.listRoadwork = []
    
    this.filter = ""

    this.typeToClassName = {
      'Sửa đường': 'marker-roadwork-roadwork',
      'Sửa hệ thống thoát nước': 'marker-roadwork-water_pipes_on_road',
      'Lễ hội': 'marker-roadwork-event_on_road',
      'Lắp camera': 'marker-roadwork-camera_on_road'
    };

    this.allGeoStyle = {
      color: '#00D',
      fillColor: 'red',
      weight: 5,
      opacity: 0.5,
      fillOpacity: 0.2
    };

    this.styleGeojson = {
      fillColor: 'green',
      weight: 4,
      opacity: 1,
      color: 'red',
      dashArray: '3',
      fillOpacity: 0.6
    };

    if (this.route.snapshot.queryParamMap.get('result')) {
      if (this.route.snapshot.queryParamMap.get('id')) {
        this.id = this.route.snapshot.queryParamMap.get('id') || ""
      }
      
      this.nzMessage.success(this.messageService.getMessageObj().NOTICE(this.route.snapshot.queryParamMap.get('result'), 'công trình giao thông'))
      this.location.replaceState("./roadworks")
    }
  }

  ngOnInit(): void {

  }

  initMap(map:any): void {
    this.sideMap = map
    this.loadRoadwork();
  }

  typeListToIcon(type:any) {
    return L.divIcon({
      className: ['marker-roadwork', this.typeToClassName[type]].join(' '),
      iconSize: [33.5, 40],
      iconAnchor: [16.5, 36.5]
    });
  }

  isExpiring(rw:any) {
    if (!rw.finishAt) {
        var fp = new Date(rw.finishPlan);
      if ((fp.getTime() - this.currentDate.getTime()) / this.oneDay <= 7 && (fp.getTime() - this.currentDate.getTime()) / this.oneDay > 0) {
        return true;
      }
    }
    return false;
  }

  isExpired(rw:any) {
    if (!rw.finishAt) {
        var fp = new Date(rw.finishPlan);
      if ((fp.getTime() - this.currentDate.getTime()) / this.oneDay <= 0) {
        return true;
      }
    }
    return false;
  }

  setStatusForRoadwork(rw:any) {
    rw.currentStatus = [];
    if (this.isExpiring(rw)) {
      rw.currentStatus.push('RW_EXPIRING');
    } else if (this.isExpired(rw)) {
      rw.currentStatus.push('RW_EXPIRED');
    } else if (rw.finishAt) {
      rw.currentStatus.push('RW_FINISHED');
    } else if (rw.status === 'Kế hoạch') {
      rw.currentStatus.push('RW_PLANNING');
    }
    if (rw.status === 'Đang thực hiện' && !rw.finishAt) {
      rw.currentStatus.push('RW_WORKING');
    }
  }


  selectFilter(title:any) {
    var index = this.statusFilterValues.indexOf(title);
    if (index > -1) {
      this.statusFilterValues.splice(index, 1);
    } else {
      this.statusFilterValues.push(title);
    }
    this.statusFilterValues = _.cloneDeep(this.statusFilterValues)
  }

  statusFilter(value:any, statusFilterValues:any) {
    if (statusFilterValues.length === 0) {
      return true;
    }
    var hadIndexOf = false;
    value.currentStatus.forEach((status:any) => {
      if (statusFilterValues.indexOf(status) > -1) {
        hadIndexOf = true;
      }
    });
    return hadIndexOf;
  }

  hadFilter(title:any) {
    if (this.statusFilterValues.indexOf(title) > -1) {
      return true;
    } else {
      return false;
    }
  }

  openRoadworkDetail(rw:any) {
    if (this.updateRoadwork) {
      this.markers[this.updateRoadwork._id]._icon = this.markerService.deSelectedMarker(this.markers[this.updateRoadwork._id]._icon);
    }
    
    if (this.markers[rw._id]._icon) {
      this.markers[rw._id]._icon = this.markerService.selectedMarker(this.markers[rw._id]._icon);
    }

    if (this.updateRoadwork != rw) {
      this.updateRoadwork = rw;
      if (!this.sideMap.getBounds().pad(-0.5).contains(this.markers[rw._id].getLatLng())) {
        this.sideMap.flyTo([rw.featureCollection.features[0].geometry.coordinates[1], rw.featureCollection.features[0].geometry.coordinates[0]], 15, {
          paddingBottomRight: [408, 0]
        })
      }
    }

    this.toggleLayoutInfo(true)
  }

  loadRoadwork() {
    this.roadworkService.query().subscribe({
      next: (roadworks) => {
        this.listRoadwork = roadworks
        
        var data:any = {
          type: 'FeatureCollection',
          features: []
        };

        this.listRoadwork.forEach((rw:any) => {
          this.setStatusForRoadwork(rw);

          var latlng = {
            lat: rw.featureCollection.features[0].geometry.coordinates[1],
            lng: rw.featureCollection.features[0].geometry.coordinates[0],
          }

         

          if (rw.featureCollection) {
            this.markers[rw._id] = L.marker(latlng, {
              draggable: false,
              icon: this.typeListToIcon(rw.type),
              zIndexOffset: 10000,
            }).on({
              click: () => {
                this.openRoadworkDetail(rw)
              }
            })

            this.sideMap.addLayer(this.markers[rw._id])
          }
        })

        if (this.id) {
          this.listRoadwork.forEach((rw:any) => {
            if (rw._id == this.id) {
              this.openRoadworkDetail(rw)
            } 
          })
        }

        this.isLoading = false
      }
    })
  }



  exportCSV() {
    delete this.objectUrl;
    this.exported = true;
    this.roadworkService.getRoadWorkCSV().subscribe({ 
      next:(res:any) => {
        const url = URL.createObjectURL(new Blob([res],{type:'text/csv'}));
        const e = document.createElement('a');
        e.href = url;
        e.download = "ttgt-roadworks.csv";
        document.body.appendChild(e);
        e.click();
        document.body.removeChild(e);
      }
    });
  }

  exportXLS(){
    delete this.objectUrl;
    this.exported = true;
    this.roadworkService.exportExcel(this.listRoadwork,'ttgt-roadworks');
  }

  exportJSON() {
    var theJSON = JSON.stringify(this.listRoadwork);

    const url = URL.createObjectURL(new Blob([theJSON],{type:'text/csv'}));
    const e = document.createElement('a');
    e.href = url;
    e.download = "ttgt-roadworks.json";
    document.body.appendChild(e);
    e.click();
    document.body.removeChild(e);
  }

  trackByFn(item:any) {
    return item;
  }
  
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
