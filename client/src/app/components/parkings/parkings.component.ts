import { animate, state, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import L from 'leaflet';
import { ConfigureService } from 'src/app/services/configure.service';
import { MessageService } from 'src/app/services/message.service';
import { ParkingService } from 'src/app/services/parking.service';

@Component({
  selector: 'app-parkings',
  templateUrl: './parkings.component.html',
  styleUrls: ['./parkings.component.css'],
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
export class ParkingsComponent implements OnInit {
  center: any;
  notice: any;
  exported: boolean;
  objectUrl: any;
  filter: string;
  listdistrict: any;
  markers: any;
  sideMap: any;
  listParking: any;
  options: any;
  layers: any;
  normalIcon: any;
  selectedIcon:any;
  currentMarker: any;
  previousId: string;

  constructor(private messageService:MessageService, private parkingService:ParkingService, public configure:ConfigureService, private route:ActivatedRoute, private location:Location, private cdRef:ChangeDetectorRef) {
    this.exported = false
    this.filter = ""
    this.markers = {};
    this.previousId =""

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
  }

  ngOnInit(): void {
    if (this.route.snapshot.paramMap.get('result')) {
      this.notice = this.messageService.getMessageObj().NOTICE(this.route.snapshot.paramMap.get('result'), 'bãi đỗ xe');
      this.location.replaceState("./")
    }
  }

  initMap(map:L.Map) {
    this.sideMap = map

    this.parkingService.query().subscribe({
      next: (parkings: any) => {
        parkings.sort(this.distCompare)
        parkings.forEach((element:any) => {
          this.markers[element._id] = L.marker([element.loc.coordinates[1], element.loc.coordinates[0]], {
            draggable: false,
            icon: this.normalIcon,
            zIndexOffset: 10000,
          })
          this.sideMap.addLayer(this.markers[element._id])
          
          this.markers[element._id].on("click", (event:any) => {
            this.focusAndExpandParking(element._id);
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
        
          
          if (this.route.snapshot.paramMap.get('id')) {
            // focusAndExpandParking(this.route.snapshot.paramMap.get('id'));
          }
        })
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
    this.sideMap.flyTo([prk.loc.coordinates[1], prk.loc.coordinates[0]], 15)

    this.markers[prk._id].setIcon(this.selectedIcon);
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
    this.cdRef.detectChanges()
  };

  filterCustome(item:any) {
    if (item.addr && item.name) {
      if (!this.filter || ((item.addr + '').toLowerCase().indexOf(this.filter.toLowerCase()) !== -1) || ((item.name + '').toLowerCase().indexOf(this.filter.toLowerCase()) !== -1)) {
        return true;
      }
    } else if (item.addr) {
      if (!this.filter || ((item.addr + '').toLowerCase().indexOf(this.filter.toLowerCase()) !== -1)) {
        return true;
      }
    } else if (item.name) {
      if (!this.filter || ((item.name + '').toLowerCase().indexOf(this.filter.toLowerCase()) !== -1)) {
        return true;
      }
    }
    return false;
  }

  selectDistrict(district:any) {
    //find topleft and bottomright position of list marker
    var bound:any = [];
    district.forEach((element:any) => {
        bound.push([element.loc.coordinates[1], element.loc.coordinates[0]]);
    });
    this.sideMap.flyToBounds(L.latLngBounds(bound))
  };

  exportCSV() {
    delete this.objectUrl;
    this.exported = true;
    this.parkingService.getParkingCSV().subscribe({
      next:(res:any) => {
        this.objectUrl = URL.createObjectURL(new Blob([res], { type: 'text/csv' }));
      }
    })
  };

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
