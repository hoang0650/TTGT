import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import L from 'leaflet';
import { ConfigureService } from 'src/app/services/configure.service';
import { MarkerService } from 'src/app/services/marker.service';
import { MessageService } from 'src/app/services/message.service';
import { RoadEventsService } from 'src/app/services/road-events.service';

@Component({
  selector: 'app-roadevents',
  templateUrl: './roadevents.component.html',
  styleUrls: ['./roadevents.component.css'],
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
export class RoadeventsComponent implements OnInit {
  notice: any;
  objectUrl: any;
  exported: boolean;
  choosedRoadevent: any;
  roadevents: any;
  center: any;
  filter: any;
  sideMap: any;
  id: string;
  type: string
  showLength: any;
  geoLayer: L.GeoJSON<any>;
  isLoading: boolean;

  constructor(private messageService:MessageService, private roadeventsService:RoadEventsService, public configure:ConfigureService, private route:ActivatedRoute, private markerService:MarkerService, private cdRef:ChangeDetectorRef) {
    this.exported = false
    this.isLoading = true;
    this.showLength = {}
    this.type = route.snapshot.queryParamMap.get("state") || ""
    this.id = route.snapshot.queryParamMap.get("id") || ""
    this.roadevents = []
    this.geoLayer = L.geoJSON()
  }

  ngOnInit(): void {
    if (this.type) {
      this.notice = this.messageService.getMessageObj().NOTICE(this.type, "phân luồng")
    }
  }
  
  initMap(map:any) {
    this.sideMap = map

    this.roadeventsService.query().subscribe({
      next: (roadevents) => {
        this.roadevents = roadevents
        this.roadevents.forEach((road:any) => {
          if (this.id && this.id == road._id) {
            this.selectRoadevent(road);
          }
        })
        this.reDrawGeo()
      }
    })
  }

  reDrawGeo() {
    this.geoLayer = L.geoJSON(undefined, {
      style: (feature:any) => {
        return this.markerService.getPathStyle(feature.properties.type, feature.properties.color);
      },
      pointToLayer: (feature, latLng) => {
        return this.createMarker(feature, latLng);
      },
    })

    if (this.choosedRoadevent) {
      this.geoLayer.addData(this.choosedRoadevent.featureCollection)
    }
    else {
      var features:any = []
      this.roadevents.forEach((roadevent:any) => {
        this.geoLayer.addData(roadevent.featureCollection)
        features = features.concat(roadevent.featureCollection.features)
      })
      this.sideMap.flyToBounds(this.getBounds(features), {
        paddingBottomRight: [408, 0]
      })
    }
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
      this.sideMap.flyToBounds(this.getBounds(roadevent.featureCollection.features), {
        paddingBottomRight: [408, 0]
      })
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
    delete this.objectUrl;
    this.exported = true;
    this.roadeventsService.getRoadEventCSV().subscribe({
      next:(res:any) => {
        this.objectUrl = URL.createObjectURL(new Blob([res], { type: 'text/csv' }));
      }
    })
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
