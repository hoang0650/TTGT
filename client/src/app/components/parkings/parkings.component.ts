import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import L from 'leaflet';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ConfigureService } from 'src/app/services/configure.service';
import { MessageService } from 'src/app/services/message.service';
import { ParkingService } from 'src/app/services/parking.service';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-parkings',
  host: {
    class: 'map-layout-info-container'
  },
  templateUrl: './parkings.component.html',
  styleUrls: ['./parkings.component.css'],
})

export class ParkingsComponent implements OnInit, OnDestroy {
  center: any;
  notice: any;
  exported: boolean;
  filter: string;
  listdistrict: any;
  markers: any;
  sideMap?: L.Map;
  listParking: any;
  options: any;
  layers: any;
  normalIcon: any;
  selectedIcon:any;
  currentMarker: any;
  id?: string;
  isLoading = true;

  constructor(public mapCom:MapComponent, private messageService:MessageService, private nzMessage:NzMessageService, private parkingService:ParkingService, public configure:ConfigureService, private route:ActivatedRoute, private location:Location, private cdRef:ChangeDetectorRef,private sanitizer: DomSanitizer) {
    this.exported = false
    this.filter = ""
    this.markers = {};
    this.listParking = []

    if (this.route.snapshot.queryParamMap.get('result')) {
      if (this.route.snapshot.queryParamMap.get('id')) {
        this.id = this.route.snapshot.queryParamMap.get('id') || ""
      }
      
      this.nzMessage.success(this.messageService.getMessageObj().NOTICE(this.route.snapshot.queryParamMap.get('result'), 'bãi đỗ xe'))
      this.location.replaceState("./parkings")
    }

    

    this.normalIcon = L.divIcon({
      className: 'marker-parking',
      iconSize: [33.5, 40],
      iconAnchor: [16.5, 36.5]
    });

    this.selectedIcon = L.divIcon({
      className: 'marker-parking selected',
      iconSize: [33.5, 40],
      iconAnchor: [16.5, 36.5]
    });

    this.sideMap = this.mapCom.sideMap
    this.markers = this.mapCom.markers
  }

  ngOnInit(): void {
    this.getMarkers()
    this.mapCom.toggleLayout(true)
  }

  ngOnDestroy(): void {
    this.mapCom.removeLayers()
    this.mapCom.toggleLayout(false)
  }

  getMarkers() {
    this.parkingService.query().subscribe({
      next: (parkings: any) => {

        parkings.sort(this.distCompare)
        parkings.forEach((element:any) => {
          this.markers[element._id] = L.marker([element.loc.coordinates[1], element.loc.coordinates[0]], {
            draggable: false,
            icon: this.normalIcon,
            zIndexOffset: 10000,
          })
          
          this.markers[element._id].on("click", (event:any) => {
            this.focusAndExpandParking(element._id);
            this.mapCom.toggleLayout(true)
          //         // setTimeout(function () {
          //         //     $anchorScroll(element._id);
          //         // }, 1000);
          })

          var result = this.groupBy(parkings, (item:any) => {
            return [item.dist];
          });

          result.forEach((element) => {
            element.sort(this.nameCompare);
          });

          this.listParking = parkings;
          this.listdistrict = result;

          if (this.id) {
            this.focusAndExpandParking(this.id);
          }

        })
        this.isLoading = false;
      
        this.mapCom.detectChanges()
        this.cdRef.detectChanges()
      }
    })
  }

  groupBy(array:any, f:any) {
    var groups:any = {};
    array.forEach((element:any) => {
      var group = JSON.stringify(f(element));
      groups[group] = groups[group] || [];
      groups[group].push(element);
    });

    return Object.keys(groups).map((group) => {
      return groups[group];
    });
  }

  distCompare(a:any, b:any, f:any) {
    var ax:any = [], bx:any = [];
    a.dist.replace(/(\d+)|(\D+)/g, (_:any, num1:any, num2:any) => { ax.push([num1 || Infinity, num2 || '']); });
    b.dist.replace(/(\d+)|(\D+)/g, (_:any, num1:any, num2:any) => { bx.push([num1 || Infinity, num2 || '']); });
    return compare(ax, bx);
  };

  nameCompare(a:any, b:any) {
    var fullname1:any = a.name + ' ' + a.addr;
    var fullname2:any = b.name + ' ' + b.addr;
    var ax:any = [], bx:any = [];
    fullname1.replace(/(\d+)|(\D+)/g, (_:any, num1:any, num2:any) => { ax.push([num1 || Infinity, num2 || '']); });
    fullname2.replace(/(\d+)|(\D+)/g, (_:any, num1:any, num2:any) => { bx.push([num1 || Infinity, num2 || '']); });
    return compare(ax, bx);
  };

  // var currentMarker;
  // var listMarkers = {};

  focusToParking(prk:any) {
    if (this.currentMarker) {
      this.currentMarker.setIcon(this.normalIcon);
    }
    this.currentMarker = this.markers[prk._id];
    
    if (!this.sideMap?.getBounds().contains([prk.loc.coordinates[1], prk.loc.coordinates[0]])) {
      this.mapCom.flyToBounds([[prk.loc.coordinates[1], prk.loc.coordinates[0]]])
    }
    this.markers[prk._id].setIcon(this.selectedIcon);
    this.mapCom.detectChanges()
    this.cdRef.detectChanges()
  };

  focusAndExpandParking(id:string) {
    this.listdistrict.forEach((district:any) => {
      district['expand'] = false;
      district.forEach((parking:any) => {
        if (parking._id === id) {
          district['expand'] = true;
          parking['expand'] = true;
          this.focusToParking(parking);
        } else {

          parking['expand'] = false;
        }
      });
    });
    this.mapCom.detectChanges()
    this.cdRef.detectChanges()
  };

  filterCustome(item:any, arg:string) {
    if (item.addr && item.name) {
      if (!arg || ((item.addr + '').toLowerCase().indexOf(arg.toLowerCase()) !== -1) || ((item.name + '').toLowerCase().indexOf(arg.toLowerCase()) !== -1)) {
        return true;
      }
    } else if (item.addr) {
      if (!arg || ((item.addr + '').toLowerCase().indexOf(arg.toLowerCase()) !== -1)) {
        return true;
      }
    } else if (item.name) {
      if (!arg || ((item.name + '').toLowerCase().indexOf(arg.toLowerCase()) !== -1)) {
        return true;
      }
    }
    return false;
  }

  previousDistrict:any;
  selectDistrict(isOpen:boolean, district:any) {
    if (isOpen) {
      if (this.previousDistrict != district) {
        var bound:any = [];
        district.forEach((element:any) => {
            bound.push([element.loc.coordinates[1], element.loc.coordinates[0]]);
        });
        this.mapCom.flyToBounds(bound)
        this.previousDistrict = district
        this.mapCom.detectChanges()
        this.cdRef.detectChanges()
      }
    }
  };

  exportCSV() {
    this.exported = true;
    this.parkingService.getParkingCSV().subscribe({
      next:(res:any) => {
        this.mapCom.download(URL.createObjectURL(new Blob([res],{type:'text/csv'})),"ttgt-parkings.csv")
      }
    })
  };

  exportXLS(){
    this.exported = true;
    this.parkingService.exportExcel(this.listParking,'ttgt-parkings');
  }

  exportJSON() {
    var theJSON = JSON.stringify(this.listParking);
    this.mapCom.download(URL.createObjectURL(new Blob([theJSON],{type:'text/csv'})),"ttgt-parkings.json")
  }
}

function compare(ax:any, bx:any) {
  while (ax.length && bx.length) {
    var an = ax.shift();
    var bn = bx.shift();
    var nn = (an[0] - bn[0]) || an[1].localeCompare(bn[1]);
    if (nn) {
      return nn;
    }
  }
  return (ax.length - bx.length);
};
