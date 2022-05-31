import { animate, state, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import L from 'leaflet';
import _ from 'lodash';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ConfigureService } from 'src/app/services/configure.service';
import { MarkerService } from 'src/app/services/marker.service';
import { MessageService } from 'src/app/services/message.service';
import { RoadEventsService } from 'src/app/services/road-events.service';
import { AdminConfigConfirmComponent } from '../admin-config-confirm/admin-config-confirm.component';

@Component({
  selector: 'app-roadevents-create',
  templateUrl: './roadevents-create.component.html',
  styleUrls: ['./roadevents-create.component.css'],
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
export class RoadeventsCreateComponent implements OnInit {
  currentType: any
  currentDrawer: any;
  listColorCanUse: any;
  button: any;
  geoObject: any;
  temporaryGeo: any;
  choosedFeature: any;
  searchText: string;
  listRoads: any;
  isLoading: boolean;
  geoLayer:any;
  sideMap: any;
  layers: any;
  noticeBoard: any;
  searchImage: string;
  drawnItems: any;
  showButton: any;
  options: any;
  drawOptions: any;
  drawControl: any;
  tmpLocation: string;
  id: string;

  constructor(private messageService:MessageService, public configure:ConfigureService, private modalService:NzModalService, private router:Router, private markerService:MarkerService, private roadeventService:RoadEventsService, private route:ActivatedRoute, private location:Location, private cdRef: ChangeDetectorRef) {
    this.button = messageService.getMessageObj().BUTTON;
    this.listColorCanUse = configure.roadEventColor;
    this.id = route.snapshot.paramMap.get("id") || "";
    if (this.id) {
      location.replaceState("./roadevents/update")
    }
    this.searchText = ""
    this.searchImage = ""
    this.listRoads = ""
    this.tmpLocation = ""
    this.isLoading = false
    this.noticeBoard = configure.noticeBoard;
    this.drawnItems = L.featureGroup();
    

    this.options = {
      layers: [
        this.configure.baselayer.tiles,
      ],

      worldCopyJump: true,
      center: [  10.762622, 106.660172 ],
      zoom: 14
    }

    this.geoLayer = L.geoJSON()

    this.drawOptions = {
      position: 'topleft',
      draw: false,
      edit: {
        featureGroup: this.drawnItems, //REQUIRED!!
        edit: false,
        remove: false
      }
    }

    this.geoObject = {
      featureCollection: {
        'type': 'FeatureCollection',
        'properties': {
          'center': L.latLng(this.options.center),
          'url':'',
          'title':'',
        },
        'features': []
      },
      publish: false
    };
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void { 

  }

  updateGeoLayer() {
    this.geoLayer = L.geoJSON(this.geoObject.featureCollection, {
      onEachFeature: (feature, layer) => {
        // console.log(feature);
        // console.log(layer);
        
      },
      style: (feature:any) => {
        return this.markerService.getPathStyle(feature.properties.type, feature.properties.color);
      },
      pointToLayer: (feature, latLng) => {
        return this.createMarker(feature, latLng);
      },
      // onEachFeature: function (feature, layer) {
      //   var type = feature.properties.type;
      //   listEvent[type](feature, layer);
      //   layer.on('click', function () {
      //     if (_this.choosedFeature !== feature) {
      //       chooseFeature(feature);
      //     }
      //   });
      // }
    });

    this.getAutoPosition()
  }

  onDrawCreated(e: any) {
    
    var layer = (e as L.DrawEvents.Created).layer.toGeoJSON();

    layer.properties = {
      color: "red",
      type: this.currentType,
      title: ""
    }
    if (this.currentType == "image") {
      layer.properties['image'] = this.noticeBoard[0]
    }

  
    
    

    this.currentType = ""
    // this.drawnItems.addLayer((e as L.DrawEvents.Created).layer);
    this.geoObject.featureCollection.features.push(layer)

    this.updateGeoLayer()
  }

  onDrawReady(control:any) {
    this.drawControl = control
  }

  receiveListRoads(data:any) {
    this.listRoads = data
  }

  getAutoPosition() {
    var bounds = L.latLngBounds(this.getBounds(this.geoLayer.getLayers()))
    this.sideMap.flyToBounds(bounds, {
      paddingBottomRight: [408, 0]
    })
    this.tmpLocation = [bounds.getCenter().lat.toFixed(4), bounds.getCenter().lng.toFixed(4)].join(",")
  }

  getBounds(layers:any) {
    var bound:any = []
    
    layers.forEach((layer:any) => {
      if (layer.feature.geometry.type == "Point") {
        bound.push([layer.feature.geometry.coordinates[1], layer.feature.geometry.coordinates[0]])
      } else if (layer.feature.geometry.type == "Polygon") {
        layer.feature.geometry.coordinates[0].forEach((coordinate:any) => {
          bound.push([coordinate[1], coordinate[0]])
        })
      } else {
        layer.feature.geometry.coordinates.forEach((coordinate:any) => {
          bound.push([coordinate[1], coordinate[0]])
        })
      }
    })

    return bound
  }

  chooseFeature(feature:any) {

    this.choosedFeature = feature;
    // if (feature) {
    //   this.geoLayer.eachLayer((layer:any) => {
    //     if (layer.feature === feature) {
    //       var type = feature.properties.type;
    //       this.listChooseFeature[type](feature, layer);
    //     }
    // });
    // }
  }

  chooseFeatureFromList(feature:any) {
    if (this.choosedFeature === feature) {
      this.choosedFeature = null;
    } else {
      if (feature) {
        this.chooseFeature(feature);
        
        this.sideMap.flyToBounds(this.getBounds([{feature:feature}]), {
          paddingBottomRight: [408, 0]
        })
      }
    }
  }

  reDrawGeo() {
    this.updateGeoLayer()
  }

  // var geoObject;

  getGeoById(id:string) {
    this.isLoading = true;
    this.roadeventService.get(id).subscribe({
      next: (res:any) => {
        this.geoObject = res
        this.temporaryGeo = _.cloneDeep(this.geoObject)


        this.updateGeoLayer()
        this.getAutoPosition()
        this.isLoading = false
      }}
    )
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

    if (type === 'label') {
      title = feature.properties.title || "Nhập thông tin nhãn";
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
        draggable: true,
        zIndexOffset: 700
    }).on({
      dragend: (event:any) => {
        feature.geometry.coordinates = [event.target._latlng.lng, event.target._latlng.lat]
        this.reDrawGeo()
      }
    })
  }

  changeToMeter(kilometer:number) {
    return Math.round(kilometer * 1000);
  }

  createFeature(type:any) {
    if (type !== this.currentType) {
      this.currentType = type
      if (this.currentDrawer) {
        this.currentDrawer.disable()
      }

      if (type === 'custom') {
        this.currentDrawer = new L.Draw.Polygon(this.sideMap)
        this.currentDrawer.enable()
      } else if (type === 'geo') {
        this.currentDrawer = new L.Draw.Polyline(this.sideMap, {
          allowIntersection: false,
          drawError: {
            message: '<strong>Sai rồi</strong> bạn không thể vẽ như thế!'
          },
        })
      } else {
        this.currentDrawer = new L.Draw.Marker(this.sideMap, {
          icon: this.markerService.geticon(type, "red")
        })
      }
      this.currentDrawer.enable()
    } else {
      this.currentType = null;
      this.currentDrawer.disable()
    }
  }

  removeFeature(feature:any) {
    if (feature === this.choosedFeature) {
      this.choosedFeature = null;
    }
    var index = this.geoObject.featureCollection.features.indexOf(feature);
    this.geoObject.featureCollection.features.splice(index, 1);
    this.reDrawGeo();
  }

  changeFeatureColor(feature:any, color:any) {
    feature.properties.color = color;
    this.reDrawGeo();
  }

  chooseImage(feature:any, image:any) {
    feature.properties.image = image;
    this.reDrawGeo();
  }

  goBack(id?:string, state?:string) {
    var query:any = {}
    query['state'] = state
    query['id'] = id

    this.router.navigate(['/roadevents'], {queryParams:query})
  }


  validateGeo(geo:any) {
    var validate = true;
    var listColor:any = {
      geo: '',
      custom: ''
    };

    geo.features.forEach((feature:any) => {
      if (feature.properties.type === 'geo' || feature.properties.type === 'custom') {
        if (listColor[feature.properties.type].indexOf(feature.properties.color) < 0) {
          listColor[feature.properties.type] = listColor[feature.properties.type] + feature.properties.color;
        } else {
          validate = false;
        }
      }
    });
    return validate;
  }

  createGeo(geo:any) {
    if (this.validateGeo(geo.featureCollection)) {
      this.roadeventService.save(geo).subscribe({
        next: (res:any) => {
          this.goBack(res._id, 'create')
        }
      })
    }
  }

  updateGeo(geo:any) {
    if (this.validateGeo(geo.featureCollection)) {
      this.roadeventService.update(this.id, geo).subscribe({
        next: (res:any) => {
          this.goBack(res._id, 'update')
        }
      })
    }
  }

  totalLength(feature:any) {
    var total = 0;
    for (var i = 1; i < feature.geometry.coordinates.length; i++) {
      total += L.latLng(feature.geometry.coordinates[i]).distanceTo(L.latLng(feature.geometry.coordinates[i-1]));
    }

    return total.toFixed(2);
  }

  haveGeoType(data:any) {
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

  initMap(map:any) {
    this.sideMap = map;

    if (this.id) {
      this.getGeoById(this.id)
    }
  }



  openPopupConfig(type:any) {
    var backdrop:any = true;
    if (type === 'back' || type === 'remove') {
      backdrop = 'static';
    }

    var form = this.messageService.getMessageObj().POPUP(type,'');

    var popupConfirm = this.modalService.create({
      nzContent: AdminConfigConfirmComponent,
      nzComponentParams: {
        form: form
      }
    })

    popupConfirm.afterClose.subscribe({
      next: (reponse:any) => {
        if (reponse === 'yes') {
          if (type === 'back') {
            this.goBack(this.id);
          } else {
            this.removeGeo();
          }
        }
      }
    })
  }

  back() {
    if (this.temporaryGeo) {
      if (!_.isEqual(this.temporaryGeo, this.geoObject)) {
        this.openPopupConfig('back');
      }
    }
    this.goBack(this.id);
  }

  searchRoad(geo:any) {
    this.sideMap.flyTo([geo.geometry.coordinates[1], geo.geometry.coordinates[0]], 15, {duration:1})
    this.searchText = geo.properties.name;
  }

  removeGeo() {
    this.roadeventService.delete(this.id).subscribe({
      next: (res:any) => {
        this.goBack('', 'remove')
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
