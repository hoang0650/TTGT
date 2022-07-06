import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import L from 'leaflet';
import _ from 'lodash';
import 'leaflet-draw'
import 'leaflet.markercluster';
import { ConfigureService } from 'src/app/services/configure.service';

import { slidingMapLayout, slidingMapLayoutButton } from 'src/app/animations';
import { Subscription } from 'rxjs';

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
  subscriptions = new Subscription();
  
  constructor(public configure:ConfigureService, private cdRef:ChangeDetectorRef) {
    
  }

  ngOnInit(): void {
  
  }

  initMap(event:L.Map) {
    this.sideMap = event as L.DrawMap
    this.sideMap.on({
      click: (event) => {
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

    if (bounds.getCenter().distanceTo(curCenter) > 5) {
      this.sideMap?.flyToBounds(bounds, {
        paddingTopLeft: [window.innerWidth >= 992 ? window.innerWidth*0.33 : (window.innerWidth <= 450 ? 0 : 372 ), 0],
        duration: 0.666
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
    this.subscriptions.unsubscribe()
    this.subscriptions = new Subscription()
  }

  trackByFn(index:any) {
    return index;
  }

  detectChanges() {
    this.cdRef.detectChanges()
  }

  scrollTo(el: HTMLElement) {
    el.scrollIntoView({behavior: 'smooth'});
  }
}
