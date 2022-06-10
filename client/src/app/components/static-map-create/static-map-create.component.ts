import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, ComponentFactoryResolver, Injector, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import L from 'leaflet';
import _ from 'lodash';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AppComponent } from 'src/app/app.component';
import { ConfigureService } from 'src/app/services/configure.service';
import { MarkerService } from 'src/app/services/marker.service';
import { MessageService } from 'src/app/services/message.service';
import { StaticMapService } from 'src/app/services/static-map.service';
import { AdminConfigConfirmComponent } from '../admin-config-confirm/admin-config-confirm.component';
import { MapComponent } from '../map/map.component';
import { StaticMapModalComponent } from '../static-map-modal/static-map-modal.component';
import { StaticMapPopupComponent } from '../static-map-popup/static-map-popup.component';

declare var $: any;

@Component({
  selector: 'app-static-map-create',
  host: {
    class: 'map-layout-info-container'
  },
  templateUrl: './static-map-create.component.html',
  styleUrls: ['./static-map-create.component.css'],
})
export class StaticMapCreateComponent implements OnInit, OnDestroy {
  sideMap?: L.DrawMap;
  options: any;
  button: any;
  id: string;
  newStatic: any;
  listIcons: any;
  listGeoLayers: any;
  currentRow: number;
  choosedFeature: any;
  currentDrawer: any;
  drawnItems: any;
  drawOptions: any;
  drawControl: any;
  temporaryStatic: any;
  listRoads: any;

  constructor(public mapCom:MapComponent, public configure:ConfigureService, private messageService:MessageService, private staticMapService:StaticMapService, private modalService:NzModalService, private markerService:MarkerService, private router:Router, private route:ActivatedRoute, private location:Location, private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector, private cdRef:ChangeDetectorRef, public appCom:AppComponent) {
    this.listRoads = []
    this.id = route.snapshot.paramMap.get('id') || ""
    if (this.id) {
      location.replaceState("./map/staticmaps/update")
    }
    this.button = messageService.getMessageObj().BUTTON;
    this.listGeoLayers = []
    this.currentRow = -1
    this.drawnItems = L.featureGroup();

    this.newStatic = {
      mapdatas: [],
      properties: []
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
    if(this.id) {
      this.loadStaticMapByID(this.id)
    } else {
      this.temporaryStatic = _.cloneDeep(this.newStatic)
    }

    this.staticMapService.getIcons().subscribe({
      next: (icons:any) => {
        this.listIcons = icons;
      }
    })
  }

  onDrawReady(control:any) {
    this.drawControl = control
  }

  onDrawCreated(e: any) {
    var layer = (e as L.DrawEvents.Created).layer.toGeoJSON();
    this.choosedFeature.features.push(layer)
 
    this.updateGeoLayer()
  }

  updateGeoLayer() {
    this.mapCom.markers = {}
    this.newStatic.mapdatas.forEach((mapdata:any, idx:number) => {
      this.mapCom.markers['newStaticMap_'+idx] = this.drawGeo(mapdata, this.newStatic, "black")
    })
  }

  addNewColumn() {
    var modalInstance = this.modalService.create({
      nzContent: StaticMapModalComponent,
      nzComponentParams: {
        type: "create",
        listColumn: this.newStatic.properties
      }
    })
    
    modalInstance.afterClose.subscribe({
      next: (res:any) => {
        if (res?.['action'] == "create") {
          this.newStatic.properties.push(res['column'])
        }
      }
    })
  }

  editColumn(column:any) {
    var modalInstance = this.modalService.create({
      nzContent: StaticMapModalComponent,
      nzComponentParams: {
        type: "update",
        listColumn: this.newStatic.mapdatas,
        column: column
      }
    })
    
    modalInstance.afterClose.subscribe({
      next: (res:any) => {
        if (res?.['action'] === "update") {
          var newColumn = res['column']
          column.name = newColumn.name
          column.type = newColumn.type
        } else if (res?.['action'] === "remove") {
          var index = this.newStatic.properties.indexOf(res['column']);
          this.newStatic.properties.splice(index, 1);
          this.newStatic.mapdatas.forEach((feature:any) => {
            feature.properties.splice(index, 1);
          });
        }
      }
    })
  }

  goBack(state?:string, id?:string) {
    this.router.navigate([`/map/staticmaps`], {queryParams: {state:state, id:id}})
  }

  createStatic(staticMap:any) {
    if (!this.id) {
      this.staticMapService.create(staticMap).subscribe({
        next: (res:any) => {
          this.goBack('create', res._id);
        }
      })
    } else {
      this.staticMapService.update(this.id, staticMap).subscribe({
        next: (res:any) => {
          this.goBack('update', this.id);
        }
      })
    }
  }

  remove(staticMap:any) {
    this.staticMapService.delete(staticMap._id).subscribe({
      next: (res) => {
        this.goBack('remove');
      }
    })
  }

  openPopupConfig(type:string, staticMap:any) {
    var form = this.messageService.getMessageObj().POPUP(type,'');

    var popupConfirm = this.modalService.create({
      nzContent: AdminConfigConfirmComponent,
      nzComponentParams: {
        form: form
      }
    })

    popupConfirm.afterClose.subscribe({
      next: (res:string) => {
        if (res === 'yes') {
          if (type === 'back') {
            this.goBack();
          } else {
            this.remove(staticMap);
          }
        }
      }
    })
  }

  removeStatic(staticMap:any) {
    this.openPopupConfig('remove', staticMap);
  }

  back(staticMap:any) {
    if (_.isEqual(this.temporaryStatic, staticMap)) {
      this.goBack()
    } else {
      this.openPopupConfig('back', staticMap);
    }
  }

  createMarker(feature:any, latLng:any, color:any, icon:any) {
    var type = 'marker';
    if (!icon) {
      return L.marker(latLng, {
          icon: this.markerService.geticon(type, color),
          draggable: true,
      });
    } else {
      return L.marker(latLng, {
        icon: L.icon(icon.data),
        draggable: true,
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
        if (staticmap['properties']?.length > 0) {
          var popup = L.popup({
            offset: [3, 45],
            closeButton:false,
            className:'stis-create-incident-popup'
          }).setContent(this.createStaticMapPopup(staticmap.properties, featureData.properties))
  
          layer.bindPopup(popup)
        }

        layer.on({
          mouseover: (event) => {
            
            if (staticmap['properties']?.length > 0) {
              
              layer.openPopup()
            }
          },
          mouseout: () => {
            
            if (staticmap['properties']?.length > 0) {
              layer.closePopup()
            }
          },
          dragend: (event:any) => {
            featureData.features[0].geometry.coordinates = [event.target._latlng.lng, event.target._latlng.lat]           
            this.updateGeoLayer()
          }
        });
      }
    });
  }

  chooseFeature(feature:any, scroll?:boolean) {
    if (this.choosedFeature !== feature) {
      this.currentRow = this.newStatic.mapdatas.indexOf(feature);
      this.choosedFeature = feature;
    }
  };

  chooseFeatureOnList(feature:any) {
    if (feature !== this.choosedFeature) {
      this.chooseFeature(feature);

      if (!feature.features.length && this.newStatic.type === 'marker') {
        this.createFeature()
      }
    }
  }

  unChooseFeature() {
    if (this.choosedFeature) {
      this.currentRow = -1

      this.choosedFeature = null;
    }
  }

  createFeature() {
    if (this.sideMap) {
      if (this.currentDrawer) {
        this.currentDrawer.disable()
      }
  
      if (this.newStatic['type'] === 'geo') {
        this.currentDrawer = new L.Draw.Polyline(this.sideMap, {
          allowIntersection: false,
          drawError: {
            message: '<strong>Sai rồi</strong> bạn không thể vẽ như thế!'
          },
        })
      } else {
        this.currentDrawer = new L.Draw.Marker(this.sideMap, {
          icon: !(this.newStatic['icon']) ? this.markerService.geticon(this.newStatic['type'], "red") : L.icon(this.newStatic['icon'].data)
        })
      }
      this.currentDrawer.enable()
    }
  }



  removeFeature(feature:any) {
    var index = this.newStatic.mapdatas.indexOf(feature);
    this.newStatic.mapdatas.splice(index, 1);
    this.updateGeoLayer()
  }

  addNewRow() {
    var newFeature = {
      type: 'FeatureCollection',
      features: [],
      properties: [],
    };
    
    if (this.currentRow >= 0) {
      this.newStatic.mapdatas.splice(this.currentRow + 1, 0, newFeature);
      this.chooseFeatureOnList(newFeature)
    } else {
      this.newStatic.mapdatas.push(newFeature);
      this.chooseFeatureOnList(newFeature)
    }
  }

  setMode(type:string) {
    if (type === 'geo') {

    } else {
      setTimeout(() => {
        $(".ui.dropdown").dropdown()
      },500)

    }
  }

  chooseType(type:string) {
    this.newStatic['type'] = type;
    this.setMode(type);
  }

  loadStaticMapByID(id:string) {
    this.staticMapService.get(id).subscribe({
      next: (staticmap:any) => {
        this.temporaryStatic = _.cloneDeep(staticmap)
        this.newStatic = staticmap
        this.setMode(staticmap.type)
        if (staticmap.type === 'marker' && staticmap.icon) {
          $('.dropdown').dropdown('set selected', staticmap.icon._id);
        }
        this.updateGeoLayer()
      }
    })
  };

  chooseIcon(icon:any) {
    this.newStatic['icon'] = icon;
    this.updateGeoLayer()
  }

  createStaticMapPopup(properties?:any, popupData?:any) { 
    const factory = this.componentFactoryResolver.resolveComponentFactory(StaticMapPopupComponent);
    const component:any = factory.create(this.injector);

    component.instance.properties = properties
    component.instance.popupData = popupData

    component.changeDetectorRef.detectChanges();

    return component.location.nativeElement;
  }
}
