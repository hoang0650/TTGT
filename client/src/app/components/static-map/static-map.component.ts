import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, ComponentFactoryResolver, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import L from 'leaflet';
import { ConfigureService } from 'src/app/services/configure.service';
import { MarkerService } from 'src/app/services/marker.service';
import { MessageService } from 'src/app/services/message.service';
import { StaticMapService } from 'src/app/services/static-map.service';
import { StaticMapPopupComponent } from '../static-map-popup/static-map-popup.component';

@Component({
  selector: 'app-static-map',
  templateUrl: './static-map.component.html',
  styleUrls: ['./static-map.component.css'],
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
export class StaticMapComponent implements OnInit {
  notice: any;
  params: any;
  options: any;
  sideMap: any;
  listData: any;
  searchText: string;
  listColors: any;
  exported: boolean;
  objectUrl: any;
  geojsons: any;

  constructor(private messageService:MessageService, private route:ActivatedRoute, public configure:ConfigureService, private markerService:MarkerService, private staticMap:StaticMapService, private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector, private cdRef:ChangeDetectorRef) {
    this.params = route.snapshot.paramMap
    this.listData = [];
    this.geojsons = {}
    this.searchText = ""
    this.listColors = markerService.getListColors();
    this.exported = false;

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
    if (this.params.get('state')) {
      this.notice = this.messageService.getMessageObj().NOTICE(this.params.get('state'), 'lớp thông tin tĩnh');
    }
  }

  initMap(map:any) {
    this.sideMap = map

    this.staticMap.query().subscribe({
      next: (staticMapList:any) => {
        staticMapList.forEach((staticMap:any) => {
            var listGeo:any = [];

            staticMap.color = 'black';
            staticMap.mapdatas.forEach((data:any) => {
              listGeo.push(this.drawGeo(data, staticMap, staticMap.color));
            });

            var staticMapObject = {
                staticMapData: staticMap,
                listGeo: listGeo
            };
            console.log(staticMapObject);
            
            this.listData.push(staticMapObject);
            // if (staticMapObject.staticMapData._id === $location.search().id) {
            //     selectStaticMap(staticMapObject);
            // }
        });
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
          mouseover: (event) => {
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
    staticMap.listGeo.forEach((geo:any) => {
      if (staticMap.selected) {
        this.sideMap.addLayer(geo);
      } else {
        this.sideMap.removeLayer(geo);
      }
    });
  }

  changeColorStaticMap(staticMap:any, color:any) {
    staticMap.color = color;
    staticMap.listGeo.forEach((geo:any, index:number) => {
      this.sideMap.removeLayer(geo);
      var newGeo = this.drawGeo(staticMap.staticMapData.mapdatas[index], staticMap.staticMapData, staticMap.color);
      staticMap.listGeo[index] = newGeo;
      if (staticMap.selected) {
        this.sideMap.addLayer(staticMap.listGeo[index]);
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
