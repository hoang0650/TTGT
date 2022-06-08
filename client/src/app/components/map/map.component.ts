import { Location } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, HostListener, Injector, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import L from 'leaflet';
import _ from 'lodash';
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
  sideMap?: L.Map;
  isSearch: boolean = false;
  searchQuery: string = '';
  searchResults?: any
  shareLink?: string;
  isShare: boolean = false;
  isOpen = false;
  curWidth = window.innerWidth;
  markers = {};
  
  constructor(public configure:ConfigureService, private staticMapService:StaticMapService, private markerService:MarkerService, private roadEventService:RoadEventsService, private route:ActivatedRoute, private location:Location, private mapService:MapService, private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector, private geocoding:GeocodingService, private cameraService:CameraService, private parkingService:ParkingService, private cdRef:ChangeDetectorRef, private nzMessage:NzMessageService) {
  
  }

  ngOnInit(): void {
 
  }

  initMap(event:L.Map) {
    this.sideMap = event
    // L.control.zoom({ position: 'bottomright' }).addTo(this.sideMap);
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

  flyToBounds(bounds:L.LatLngBoundsExpression) {

    this.sideMap?.flyToBounds(bounds, {
      paddingTopLeft: [window.innerWidth >= 992 ? window.innerWidth*0.33 : (window.innerWidth <= 450 ? 0 : 372 ), 0],
      duration: 1
    })
    
  }

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
  }

  trackByFn(item:any) {
    return item;
  }

  detectChanges() {
    this.cdRef.detectChanges()
  }
}
