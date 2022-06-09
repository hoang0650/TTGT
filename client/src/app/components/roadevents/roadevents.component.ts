import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import L from 'leaflet';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ConfigureService } from 'src/app/services/configure.service';
import { MarkerService } from 'src/app/services/marker.service';
import { MessageService } from 'src/app/services/message.service';
import { RoadEventsService } from 'src/app/services/road-events.service';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-roadevents',
  host: {
    class: 'map-layout-info-container'
  },
  templateUrl: './roadevents.component.html',
  styleUrls: ['./roadevents.component.css'],
})

export class RoadeventsComponent implements OnInit, OnDestroy {
  objectUrl: any;
  exported: boolean;
  choosedRoadevent: any;
  roadevents: any;
  center: any;
  filter: any;
  sideMap: any;
  id?: string;
  showLength: any;
  isLoading: boolean;

  constructor(public mapCom:MapComponent, private messageService:MessageService, private roadeventsService:RoadEventsService, public configure:ConfigureService, private route:ActivatedRoute, private markerService:MarkerService, private cdRef:ChangeDetectorRef, private location:Location, private nzMessage:NzMessageService,private sanitizer: DomSanitizer) {
    this.exported = false
    this.isLoading = true;
    this.showLength = {}
    this.roadevents = []

    if (this.route.snapshot.queryParamMap.get('state')) {
      if (this.route.snapshot.queryParamMap.get('id')) {
        this.id = this.route.snapshot.queryParamMap.get('id') || ""
      }
      
      this.nzMessage.success(this.messageService.getMessageObj().NOTICE(this.route.snapshot.queryParamMap.get('state'), 'phân luồng giao thông'))
      this.location.replaceState("./map/roadevents")
    }

    this.sideMap = mapCom.sideMap
  }

  ngOnInit(): void {
    this.getGeo()
    this.mapCom.toggleLayout(true)
  }

  ngOnDestroy(): void {
    this.mapCom.removeLayers()
    this.mapCom.toggleLayout(false)
  }

  getGeo() {
    this.roadeventsService.query().subscribe({
      next: (roadevents) => {
        this.roadevents = roadevents
        this.roadevents.forEach((road:any) => {
          if (this.id && this.id == road._id) {
            this.selectRoadevent(road);
          }
        })
        this.reDrawGeo()
        this.isLoading = false
      }
    })
  }

  reDrawGeo() {
    this.mapCom.geoLayer = L.geoJSON(undefined, {
      style: (feature:any) => {
        return this.markerService.getPathStyle(feature.properties.type, feature.properties.color);
      },
      pointToLayer: (feature, latLng) => {
        return this.createMarker(feature, latLng);
      },
    })

    if (this.choosedRoadevent) {
      this.mapCom.geoLayer.addData(this.choosedRoadevent.featureCollection)
    }
    else {
      var features:any = []
      this.roadevents.forEach((roadevent:any) => {
        this.mapCom.geoLayer.addData(roadevent.featureCollection)
        features = features.concat(roadevent.featureCollection.features)
      })

      this.mapCom.flyToBounds(this.getBounds(features))
    }

    this.mapCom.detectChanges()
    this.cdRef.detectChanges()
  }

  createMarker(feature:any, latLng:any) {
    var type = feature.properties.type;
    var color = feature.properties.color || "red";
    var imageUrl;
    var radius = 10 ;
    var title;

    if (type == "image") {
      color = ""
      radius = 20
    }

    if (feature.properties.type === 'label') {
      type = 'label'
      if (type === 'label') {
        title = feature.properties.title || "Nhập thông tin nhãn";
      }
    } else {
      title = feature.properties.title;
    }
    if (feature.properties.image) {
      imageUrl = feature.properties.image.url;
    }
    if (feature.properties.radius) {
      radius = feature.properties.radius;
    }
    
    return L.marker(latLng, {
        icon: this.markerService.geticon(type, color, title, imageUrl, radius),
        draggable: false,
        zIndexOffset: 700
    }).on({
      dragend: (event:any) => {
        feature.geometry.coordinates = [event.target._latlng.lng, event.target._latlng.lat]
        this.reDrawGeo()
      }
    })
  }

  totalLength(feature:any) {
    var total = 0;
    for (var i = 1; i < feature.geometry.coordinates.length; i++) {
      total += L.latLng(feature.geometry.coordinates[i]).distanceTo(L.latLng(feature.geometry.coordinates[i-1]));
    }

    return total.toFixed(2);
  }

  haveGeoType(data:any) {
    if (data) {
      var have = false;
      if (data) {
        data.features.forEach((feature:any) => {
          if (feature.properties.type === 'geo') {
            have = true;
          }
        });
      }
      return have;
    }
    return false
  }

  selectRoadevent(roadevent:any) {
    if (roadevent != this.choosedRoadevent) {
      this.choosedRoadevent = roadevent;
      this.mapCom.flyToBounds(this.getBounds(roadevent.featureCollection.features))
    }
    else {
      this.choosedRoadevent = null
    }   
    this.reDrawGeo();   
  }

  getBounds(features:any) {
    var bound:any = []
    
    features.forEach((feature:any) => {
      if (feature.geometry.type == "Point") {
        bound.push([feature.geometry.coordinates[1], feature.geometry.coordinates[0]])
      } else if (feature.geometry.type == "Polygon") {
        feature.geometry.coordinates[0].forEach((coordinate:any) => {
          bound.push([coordinate[1], coordinate[0]])
        })
      } else {
        feature.geometry.coordinates.forEach((coordinate:any) => {
          bound.push([coordinate[1], coordinate[0]])
        })
      }
    })

    return bound
  }


  exportCSV() {
    this.exported = true;
    this.roadeventsService.getRoadEventCSV().subscribe({
      next:(res:any) => {
        this.mapCom.download(URL.createObjectURL(new Blob([res],{type:'text/csv'})),"ttgt-roadevents.csv")
      }
    })
  };

  exportXLS(){
    this.exported = true;
    this.roadeventsService.exportExcel(this.roadevents,'ttgt-roadevents');
  }

  exportJSON() {
    var theJSON = JSON.stringify(this.roadevents);
    this.mapCom.download(URL.createObjectURL(new Blob([theJSON],{type:'text/csv'})),"ttgt-roadevents.json")
  }
}
