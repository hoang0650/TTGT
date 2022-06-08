import { ChangeDetectorRef, Component, ComponentFactoryResolver, Injector, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import L from 'leaflet';
import { map } from 'lodash';
import { ConfigureService } from 'src/app/services/configure.service';
import { MarkerService } from 'src/app/services/marker.service';
import { MessageService } from 'src/app/services/message.service';
import { StaticMapService } from 'src/app/services/static-map.service';
import { MapComponent } from '../map/map.component';
import { StaticMapPopupComponent } from '../static-map-popup/static-map-popup.component';

@Component({
  selector: 'app-static-map',
  host: {
    class: 'map-layout-info-container'
  },
  templateUrl: './static-map.component.html',
  styleUrls: ['./static-map.component.css']
})
export class StaticMapComponent implements OnInit {
  notice: any;
  params: any;
  sideMap: any;
  listData: any;
  searchText: string;
  listColors: any;
  exported: boolean;
  objectUrl: any;
  isLoading: boolean;
  markers:any;

  constructor(public mapCom:MapComponent, private messageService:MessageService, route:ActivatedRoute, public configure:ConfigureService, private markerService:MarkerService, private staticMap:StaticMapService, private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector, private cdRef:ChangeDetectorRef,private sanitizer: DomSanitizer) {
    this.params = route.snapshot.paramMap
    this.listData = [];
    this.searchText = ""
    this.listColors = markerService.getListColors();
    this.exported = false;
    this.isLoading = true

    this.sideMap = mapCom.sideMap
    this.markers = mapCom.markers

    if (this.params.get('state')) {
      this.notice = this.messageService.getMessageObj().NOTICE(this.params.get('state'), 'lớp thông tin tĩnh');
    }

    setInterval(() => {
      console.log(this.markers);
      
    }, 1000)
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
    this.staticMap.query().subscribe({
      next: (staticMapList:any) => {
        staticMapList.forEach((staticMap:any) => {
            var listGeo:any = [];
            
            staticMap.color = 'black';
            staticMap.mapdatas.forEach((data:any) => {
              listGeo.push(this.drawGeo(data, staticMap, staticMap.color));
            });

            var staticMapObject = {
                id: staticMap._id,
                staticMapData: staticMap,
                listGeo: listGeo
            };
            
            this.listData.push(staticMapObject);
            // if (staticMapObject.staticMapData._id === $location.search().id) {
            //     selectStaticMap(staticMapObject);
            // }
        });

        this.isLoading = false
      }
    })
  }

  createMarker(feature:any, latLng:any, color:any, icon:any) {
    var type = 'marker';
    if (!icon) {
      return L.marker(latLng, {
          icon: this.markerService.geticon(type, color),
          draggable: false,
      });
    } else {
      return L.marker(latLng, {
        icon: L.icon(icon.data),
        draggable: false,
      });
    }
  }

  drawGeo(featureData:any, staticmap:any, color:string) {
    return L.geoJSON(featureData, {
      style: () => {
        if (staticmap.type === 'geo') {
          return this.markerService.getPathStyle('geo', color);
        } else {
          return this.markerService.getPathStyle('circle', color);
        }
      },

      pointToLayer: (feature, latLng) => {
        return this.createMarker(feature, latLng, color, staticmap.icon);
      },

      onEachFeature: (feature, layer) => {
        var popup = L.popup({
          closeButton:false,
          className:'stis-create-incident-popup'
        }).setContent(this.createStaticMapPopup(staticmap.properties, featureData.properties))

        layer.bindPopup(popup)

        layer.on({
          mouseover: () => {
            if (popup) {
              layer.openPopup()
            }
          },
          mouseout: () => {
            if (popup) {
              layer.closePopup()
            }
          }
        });
      }
    });
  }

  selectStaticMap(staticMap:any) {
    staticMap.selected = !staticMap.selected;
    staticMap.listGeo.forEach((geo:any, idx:number) => {
      if (staticMap.selected) {
        this.markers[staticMap.id+"_"+idx] = geo
      } else {
        delete this.markers[staticMap.id+"_"+idx]
      }
    });
  }

  changeColorStaticMap(staticMap:any, color:any) {
    staticMap.color = color;
    staticMap.listGeo.forEach((geo:any, idx:number) => {
      delete this.markers[staticMap.id+"_"+idx]
      var newGeo = this.drawGeo(staticMap.staticMapData.mapdatas[idx], staticMap.staticMapData, staticMap.color);
      staticMap.listGeo[idx] = newGeo;
      if (staticMap.selected) {
        this.markers[staticMap.id+"_"+idx] = staticMap.listGeo[idx]
      }
    });
    
  }

  exportCSV() {
    delete this.objectUrl;
    this.exported = true;
    this.staticMap.getStaticCSV().subscribe({
      next: (data:any) => {
        this.objectUrl = URL.createObjectURL(new Blob([data],{type:'text/csv'}));
      }
    });
  }

  exportXLS(){
    delete this.objectUrl;
    this.exported = true;
    this.staticMap.exportExcel(this.listData,'static-maps');
  }

  exportJSON() {
    var theJSON = JSON.stringify(this.listData);
    var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
    this.objectUrl =uri;
  }

  trackByFn(item:any) {
    return item;
  }

  createStaticMapPopup(properties?:any, popupData?:any) { 
    const factory = this.componentFactoryResolver.resolveComponentFactory(StaticMapPopupComponent);
    const component:any = factory.create(this.injector);

    component.instance.properties = properties
    component.instance.popupData = popupData

    component.changeDetectorRef.detectChanges();

    return component.location.nativeElement;
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
