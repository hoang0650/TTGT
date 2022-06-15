import { Location } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, HostListener, Injector, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import L from 'leaflet';
import _ from 'lodash';
import 'leaflet-draw'
import 'leaflet.markercluster';
import { CameraService } from 'src/app/services/camera.service';
import { ConfigureService } from 'src/app/services/configure.service';
import { GeocodingService } from 'src/app/services/geocoding.service';
import { MapService } from 'src/app/services/map.service';
import { MarkerService } from 'src/app/services/marker.service';
import { ParkingService } from 'src/app/services/parking.service';
import { RoadEventsService } from 'src/app/services/road-events.service';
import { StaticMapService } from 'src/app/services/static-map.service';
import { MapPopupCreateEventComponent } from '../map-popup-create-event/map-popup-create-event.component';
import { StaticMapPopupComponent } from '../static-map-popup/static-map-popup.component';

import { NzMessageService } from 'ng-zorro-antd/message';
import { slidingMapLayout, slidingMapLayoutButton } from 'src/app/animations';
import { AdminConfigConfirmComponent } from '../admin-config-confirm/admin-config-confirm.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MessageService } from 'src/app/services/message.service';

declare var $: any

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  animations: [
    slidingMapLayout,
    slidingMapLayoutButton
  ]
})
export class MapComponent implements OnInit {
  sideMap?: L.DrawMap;
  isSearch: boolean = false;
  searchQuery: string = '';
  searchResults?: any
  shareLink?: string;
  isShare: boolean = false;
  isOpen = false;
  curWidth = window.innerWidth;
  markers:any = {};
  geoLayer:any = L.geoJSON();
  
  permissions = localStorage.getItem('permissions')||'{}';

  drawnItems = L.featureGroup();
  drawOptions:any = {
    position: 'topleft',
    draw: false,
    edit: {
      featureGroup: this.drawnItems, //REQUIRED!!
      edit: false,
      remove: false
    }
  }

  componentRef:any

  constructor(public configure:ConfigureService, private staticMapService:StaticMapService, private markerService:MarkerService, private roadEventService:RoadEventsService, private route:ActivatedRoute, private location:Location, private mapService:MapService, private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector, private geocoding:GeocodingService, private cameraService:CameraService, private parkingService:ParkingService, private cdRef:ChangeDetectorRef, private nzMessage:NzMessageService, private modalService:NzModalService, private messageService:MessageService) {
    
  }

  ngOnInit(): void {
  
  }

  initMap(event:L.Map) {
    this.sideMap = event as L.DrawMap
    this.sideMap.on({
      dblclick: (event) => {
        console.log(event);
        
      }
    })
    // L.control.zoom({ position: 'bottomright' }).addTo(this.sideMap);
  }

  onRouteOutletReady(componentRef:any) {
    this.componentRef = componentRef
    this.cdRef.detectChanges()
  }

  onDrawCreated(e:any) {
    if (this.componentRef) {
      this.componentRef.onDrawCreated(e)
    }
  }

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
 
  share(type:string, id:string) {
    this.shareLink = location.origin + '/map?type=' + type + '&id=' + id;
    this.isShare = true
    this.cdRef.detectChanges()
  }

  @HostListener('window:resize', ['$event']) onResize(event:any) {
    this.curWidth = event.target.innerWidth
  }

  toggleLayout(onoff?:boolean) {
    this.isOpen = onoff || !this.isOpen;
    this.curWidth = window.innerWidth;
    this.cdRef.detectChanges()
  }

  closeModal() {
    this.isShare = false
    this.shareLink = ""
  }

  flyToBounds(bounds:any) {
    var curCenter:any = this.sideMap?.getCenter()
    
    var point = this.sideMap?.latLngToContainerPoint(curCenter);
    if (point) {
      var newPoint = L.point([point.x + (window.innerWidth >= 992 ? window.innerWidth*0.33 : (window.innerWidth <= 450 ? 0 : 372 ))/2, point.y]); 
      curCenter = this.sideMap?.containerPointToLatLng(newPoint);
    }

    if (!(bounds instanceof L.LatLngBounds)) {
      bounds = L.latLngBounds(bounds)
    } 

    if (bounds.getCenter().distanceTo(curCenter) > 1) {
      this.sideMap?.flyToBounds(bounds, {
        paddingTopLeft: [window.innerWidth >= 992 ? window.innerWidth*0.33 : (window.innerWidth <= 450 ? 0 : 372 ), 0],
        duration: 1
      })
    }
  }

  window = window

  download(url:string, filename:string) {
    const e = document.createElement('a');
    e.href = url;
    e.download = filename;
    document.body.appendChild(e);
    e.click();
    document.body.removeChild(e);
  }

  removeOnClick() {
    this.sideMap?.off('click')
  }

  removeLayers() {
    this.markers = {}
    this.geoLayer = L.geoJSON()
    this.componentRef = null
  }

  trackByFn(item:any) {
    return item;
  }

  detectChanges() {
    this.cdRef.detectChanges()
  }
}
