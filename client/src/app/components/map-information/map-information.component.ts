import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, ComponentFactoryResolver, Injector, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import L from 'leaflet';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CameraService } from 'src/app/services/camera.service';
import { ConfigureService } from 'src/app/services/configure.service';
import { GeocodingService } from 'src/app/services/geocoding.service';
import { MapService } from 'src/app/services/map.service';
import { MarkerService } from 'src/app/services/marker.service';
import { ParkingService } from 'src/app/services/parking.service';
import { RoadEventsService } from 'src/app/services/road-events.service';
import { StaticMapService } from 'src/app/services/static-map.service';
import { MapPopupCreateEventComponent } from '../map-popup-create-event/map-popup-create-event.component';
import { MapComponent } from '../map/map.component';
import { StaticMapPopupComponent } from '../static-map-popup/static-map-popup.component';

declare var $:any

@Component({
  selector: 'app-map-information',
  host: {
    class: 'map-layout-info-container'
  },
  templateUrl: './map-information.component.html',
  styleUrls: ['./map-information.component.css'],
})
export class MapInformationComponent implements OnInit, OnDestroy {
  sideMap?: L.Map;

  userInfo: any;
  isSubmit: boolean;
  
  listStaticMaps: any;
  listRoadEvents: any;
  listEvent: any;
  listCamera: any

  event: any;
  listEventType: any;
  markers: any;

  newCreateEvent: any;
  listParking: any;
  chosenMarkers: any;
  listFavoriteCamera: any;
  listFavoriteParking: any;
  cameraLoading: boolean;

  component?:any
  filterRoadEvent: any;
  filterStaticMap: any;
  paramMap: any;
  backend: string;
  shareLink?: string;

  isShare: boolean;
  currentMode?:string;
  dividerText?:string;
  
  constructor(public mapCom:MapComponent, private configure:ConfigureService, private staticMapService:StaticMapService, private markerService:MarkerService, private roadEventService:RoadEventsService, private route:ActivatedRoute, private location:Location, private mapService:MapService, private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector, private geocoding:GeocodingService, private cameraService:CameraService, private parkingService:ParkingService, private cdRef:ChangeDetectorRef, private nzMessage:NzMessageService) {
    this.setCurrentMode("incidents")
    this.listEvent = []
    this.listCamera = []
    this.listParking = []
    this.listFavoriteCamera = []
    this.listFavoriteParking = []
    this.isSubmit = true;
    this.userInfo = JSON.parse(localStorage.getItem("profile") || "")
    this.filterRoadEvent = ""
    this.filterStaticMap = ""
    this.cameraLoading = false
    this.backend = this.configure.backend

    this.event = {}
    this.chosenMarkers = {}
    this.markers = {}
    
    this.paramMap = {type: route.snapshot.queryParamMap.get("type"), id: route.snapshot.queryParamMap.get("id")}

    this.isShare = false

    this.sideMap = mapCom.sideMap
    this.markers = mapCom.markers
  }

 
  ngOnInit(): void {
    this.getData()
    this.mapCom.toggleLayout(true)
  }

  ngOnDestroy(): void {
    this.mapCom.removeLayers()
    this.mapCom.toggleLayout(false)
  }



  getData() {
    setTimeout(() => {
      this.sideMap?.invalidateSize()
    }, 300)

    this.getAllStaticMaps()
    this.getAllRoadEvents()

    this.getAllType()
    this.getAllCameras()
    this.getAllParkings()
    this.getInfoOfUser()
  }

  // //Get list history and favorite
  resetList(user:any) {
    this.listFavoriteCamera = [];
    this.listFavoriteParking = [];
    user.favorite.forEach((fav:any) => {
      switch (fav.fType) {
        case 'camera':
          this.listFavoriteCamera.push(fav);
          break;
        case 'parking':
          this.listFavoriteParking.push(fav);
          break;
        default:
      }
    });
    
    this.cdRef.detectChanges()
  }

  getInfoOfUser() {
    this.mapService.getInfoOfUser().subscribe({
      next: (res) => {
        
        this.resetList(res);
      }
    })
  }

  chooseCameraFromList(camid:string) {
    this.listCamera.forEach((camera:any) => {
      if (camera._id == camid) {
        this.mapCom.flyToBounds([[camera.loc.coordinates[1], camera.loc.coordinates[0]]])
        this.chosenMarkers['camera'] = camera
        this.location.replaceState(`./map?type=camera&id=${camid}`)
      }
    })
  }

  // //Favorite Camera
  favoriteCamera(camera:any) {
    this.mapService.sendFavorite({
      fId: camera._id,
      fType: 'camera',
    }).subscribe({
      next:(res) => {
        if (res) {
          this.resetList(res);
        }
      }
    })
  }


  favoriteParking(parking:any) {
    this.mapService.sendFavorite({
      fId: parking._id,
      fType: 'parking',
    }).subscribe({
      next:(res) => {
        if (res) {
          this.resetList(res);
        }
      }
    })
  }

   checkExistInFavoriteList(camId:string) {
    var status = false;
    if (this.listFavoriteCamera) {
      this.listFavoriteCamera.forEach((cam:any) => {
        if (camId === cam.fId) {
          status = true;
        }
      });
    }
    return status;
  }

  checkParkingExistInFavoriteList(camId:string) {
    var status = false;
    if (this.listFavoriteParking) {
      this.listFavoriteParking.forEach((cam:any) => {
        if (camId === cam.fId) {
          status = true;
        }
      });
    }
    return status;
  }

  toggleParkingActive() {
      
    this.markers['parkings'] = L.markerClusterGroup({
      disableClusteringAtZoom: 16,
      maxClusterRadius: 64,
      removeOutsideVisibleBounds: true,
      animateAddingMarkers: true,
      animate: true,
      iconCreateFunction:(cluster) => {
        var markers = cluster.getAllChildMarkers();
        var icon = L.divIcon({
          className: 'marker-parking',
          iconSize: [33.5, 40],
          iconAnchor: [16.5, 36.5],
          html: `<div class="circle-cluster">${markers.length}</div>`
        });
        
        return icon;
      },
    })

    this.listParking.forEach((parking:any) => {
      this.markers['parkings']?.addLayer(this.createParkingMarker(parking))
    })
  }

  toggleCameraActive() {   
    this.markers['cameras'] = L.markerClusterGroup({
      disableClusteringAtZoom: 16,
      maxClusterRadius: 64,
      removeOutsideVisibleBounds: true,
      animateAddingMarkers: true,
      animate: true,
      iconCreateFunction:(cluster) => {
        var markers = cluster.getAllChildMarkers();
        var icon = L.divIcon({
          className: "modify-marker good normal",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          html: `<div class="marker-background"></div>` +
                `<div class="circle-cluster">${markers.length}</div>` +
                `<div class="marker-icon"></div>` +
                `<div class="marker-content"></div>`
        });
        
        
        return icon;
      },
    })

    this.listCamera.forEach((camera:any) => {
      this.markers['cameras']?.addLayer(this.createCameraMarker(camera))
    })

    //     _this._map.removeLayer(cameraClusterLayer);
  }

  createParkingMarker(parking:any) {
    var icon = L.divIcon({
      className: 'marker-parking',
      iconSize: [33.5, 40],
      iconAnchor: [16.5, 36.5]
    });

    var marker = L.marker([parking.loc.coordinates[1], parking.loc.coordinates[0]], {
      draggable: false,
      icon: icon,
    }).on({
      click: () => {
        this.mapCom.flyToBounds([[parking.loc.coordinates[1], parking.loc.coordinates[0]]])
        this.setCurrentMode("parkings")
        this.chosenMarkers['parking'] = parking
        this.location.replaceState(`./map?type=parking&id=${parking._id}`)
        this.cdRef.detectChanges()
      }
    })

    return marker;
  }

  createCameraMarker(camera:any) {
    var marker:any = {};

    marker = L.marker([camera.loc.coordinates[1], camera.loc.coordinates[0]], {
      draggable: false,
      icon: camera.ptz ? this.markerService.getIcon('good', 'ptz') : this.markerService.getIcon('good', 'normal'),
      rotationAngle: camera.ptz ? 0 : camera.angle
    }).on({
      click: () => {
        
        this.setCurrentMode("cameras")
        this.mapCom.flyToBounds([[camera.loc.coordinates[1], camera.loc.coordinates[0]]])
        
        if (camera.angle) {
          camera.angleStyle = {
            '-ms-transform': 'rotate(' + (90 + camera.angle) + 'deg)',
            '-webkit-transform': 'rotate(' + (90 + camera.angle) + 'deg)',
            'transform': 'rotate(' + (90 + camera.angle) + 'deg)'
          };
        } else if (!camera.ptz) {
          camera.angleStyle = {
            '-ms-transform': 'rotate(' + (90) + 'deg)',
            '-webkit-transform': 'rotate(' + (90) + 'deg)',
            'transform': 'rotate(' + (90) + 'deg)'
          };
        }

        this.chosenMarkers['camera'] = camera;
        this.location.replaceState(`./map?type=camera&id=${camera._id}`)
        this.cdRef.detectChanges()
        // this.selectCamera(camera)
      }
    })

    return marker;
  }

  toggleIncidentActive() {

      if (this.listEvent.length > 0) {
        this.toggleIncidentMarkers()
      }
    
  }

  imageError(event:any) {
    event.target.src = this.backend + 'api/setting/getimageerror'
  }

  chooseParkingFromList(parkingId:string) {
    this.listParking.forEach((parking:any) => {
      if (parking._id == parkingId) {
        this.mapCom?.flyToBounds([[parking.loc.coordinates[1], parking.loc.coordinates[0]]])
        this.chosenMarkers['parking'] = parking
        this.location.replaceState(`./map?type=parking&id=${parkingId}`)
      }
    })
  }

  getParkingFromFavorList() {
    var tempParkings:any = []
    
    
    this.listFavoriteParking.forEach((favPark:any) => {
      this.listParking.forEach((parking:any) => {
        
        if (parking._id == favPark.fId) {
          tempParkings.push(parking)
        }
      })
    })
    return tempParkings
  }

  incidents:any = {};
  toggleIncidentMarkers() {
    this.listEvent.forEach((trafficEvent:any) => {
      var latlng = [trafficEvent.loc.coordinates[1], trafficEvent.loc.coordinates[0]]
      
      var popup = L.popup({
        closeButton:false,
        className:'stis-create-incident-popup'
      }).setContent(this.createCustomPopup(trafficEvent))

      var marker = this.createTrafficEventMarker(latlng, trafficEvent.type).bindPopup(popup).on({
        popupopen: () => {
          this.chooseIncident(trafficEvent, true)
        }
      })
      
      this.incidents[trafficEvent._id] = marker
      this.markers['incidents'].addLayer(marker)
    }) 
    
  }
  
  createTrafficEventMarker(latlng:any, type:string) {
    var icon = this.markerService.jamIcon[type]
    icon.iconSize = [33.5, 40]
    icon.iconAnchor = [0, 0]

    return L.marker(latlng, {
      icon: L.divIcon(icon),
      draggable: false,
    })
  }

  createNewEventMarker(latlng:any) {
    if (!this.newCreateEvent) {
      var icon = this.markerService.jamIcon['congestion']
      icon.className = 'creEventMarker';
      icon.iconSize = [33.5, 40]
      icon.iconAnchor = [0, 0]
      
      this.event['createdBy'] = this.userInfo.nickname;
      this.event['type'] = this.listEventType.congestion.type;
      this.event['desc'] = ["","",""]
      this.event['desc'][1] = this.listEventType.congestion.name

      var popup = L.popup({
        closeButton:false,
        className:'stis-create-incident-popup'
      }).setContent(this.createCustomPopup())

      this.newCreateEvent = L.marker(latlng, {
        icon: L.divIcon(icon),
        draggable: true,
      }).on({
        dragend: (event) => {
          this.createNewEventMarker(event.target._latlng)
        }
      }).bindPopup(popup)

      this.markers['newEvent'] = this.newCreateEvent
      this.cdRef.detectChanges()
    } else {
      this.newCreateEvent.setLatLng(latlng)
    }
    
    this.event['loc'] = {type:"Point", coordinates: [latlng.lng, latlng.lat]}
    
    setTimeout(() => {
      this.newCreateEvent.openPopup()
    }, 100)
    
    
    this.mapCom.detectChanges()
    this.cdRef.detectChanges()
  } 
  

  chooseTypeEvent(type:string) {
    var eventType = this.listEventType[type];
    if (eventType) {
      this.event.desc[1] = eventType.name;
      var icon = this.markerService.jamIcon[type]
      icon.className = 'creEventMarker';
      icon.iconSize = [33.5, 40]
      icon.iconAnchor = [0, 0]
      this.newCreateEvent.setIcon(L.divIcon(icon))

      this.component.changeDetectorRef.detectChanges()
    }
  }

  getAllEvent() {
    this.mapService.getAllEvent().subscribe({
      next: (res) => {
        this.listEvent = res
        if (this.listEvent.length > 0) {
          this.toggleIncidentMarkers()
        }
        this.checkParam()
      }
    })
  }


  getAllType() {
    this.mapService.getAllType().subscribe({
      next: (res) => {
        this.listEventType = res;
        this.markers['incidents'] = L.layerGroup()
        this.sideMap?.on({
          contextmenu: (event:any) => {
            this.createNewEventMarker(event.latlng)
          },
          popupopen: (event:any) => {
            setTimeout(() => {
              $(".ui.dropdown").dropdown()
              this.component?.changeDetectorRef.detectChanges()
            }, 300)
          }
        })

        this.getAllEvent();
      }
    })
  }

  submitEvent(event:any) {
    if (this.isSubmit) {
      this.isSubmit = false;

      this.mapService.submitEvent(event).subscribe({
        next: (trafficEvent:any) => {

          this.isSubmit = true
          this.newCreateEvent.closePopup()
          delete this.newCreateEvent
          delete this.markers['newEvent']
          
          
          var latlng = [trafficEvent.loc.coordinates[1], trafficEvent.loc.coordinates[0]]
      
          var popup = L.popup({
            closeButton:false,
            className:'stis-create-incident-popup'
          }).setContent(this.createCustomPopup(trafficEvent))

          var marker = this.createTrafficEventMarker(latlng, trafficEvent.type).bindPopup(popup).on({
            popupopen: () => {
              this.chooseIncident(trafficEvent, true)
            }
          })
          this.incidents[trafficEvent._id] = marker
          this.markers['incidents']?.addLayer(marker)
          marker.openPopup()
          this.nzMessage.success('Đã tạo cảnh báo mới, chờ quản trị viên duyệt')
        },
        error: (err) => {
          this.nzMessage.error('Tạo cảnh báo mới thất bại, hãy thử lại')
          this.isSubmit = true
        }
      })
    }
  }

  cancelEvent() {
    this.newCreateEvent?.closePopup()
    if (this.newCreateEvent) {
      this.sideMap?.removeLayer(this.newCreateEvent)
      delete this.newCreateEvent;
    }
    this.event = {desc:{}}
  }

  createdEventByCamera(camera:any) {
      // _this.showBigImage = false;
    this.cancelEvent()
    var latlng = L.latLng(camera.loc.coordinates[1], camera.loc.coordinates[0]);
    this.mapCom.flyToBounds([[camera.loc.coordinates[1], camera.loc.coordinates[0]]]);
    this.createNewEventMarker(latlng);
    this.event.desc[0] = camera.name;
    
    if (camera.contentType && camera.img) {
      this.event['snapshot'] = 'data:' + camera.contentType + ';base64,' + camera.img;
    }
    else {
      this.event['snapshot'] = this.backend + 'api/setting/getimageerror'
    }
  }

  removeEventImage() {
    delete this.event['snapshot'];
    this.component.changeDetectorRef.detectChanges()
  }

  chooseIncident(event:any, noFly?:boolean) {
    this.setCurrentMode('incidents')
    if (!noFly) {
      this.mapCom.flyToBounds([[event.loc.coordinates[1], event.loc.coordinates[0]]]);
    }
    
    this.chosenMarkers['incident'] = event._id
    this.location.replaceState(`./map?type=event&id=${event._id}`)
    this.incidents[event._id].openPopup()
    this.cdRef.detectChanges()
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
        });
      }
    });
  }

  getAllStaticMaps() {
    this.listStaticMaps = []

    this.staticMapService.getAllPublish().subscribe({
      next: (staticMapsList:any) => {
      staticMapsList.forEach((staticMap:any) => {
        var listGeo:any = [];
        staticMap.color = 'black';
        staticMap.mapdatas.forEach((data:any) => {
          listGeo.push(this.drawGeo(data, staticMap, staticMap.color));
        });
        var staticMapObject = {
          staticMapData: staticMap,
          listGeo: listGeo,
        };
        this.listStaticMaps.push(staticMapObject);

      });
      }
    })
  }

  getAllCameras() {
    this.listCamera = []
    this.cameraService.query().subscribe({
      next: (res) => {
        this.listCamera = res
        this.toggleCameraActive()
        this.checkParam()
      }
    })
  }

  getAllParkings() {
    this.listParking = []
    this.parkingService.query().subscribe({
      next: (res) => {
        this.listParking = res
        this.toggleParkingActive()
        this.checkParam()
      }
    })
  }

  checkParam() {
    if (this.paramMap.id && this.paramMap.type) {
      if (this.paramMap.type == "camera") {
        this.listCamera.forEach((camera:any) => {
          if (camera._id == this.paramMap.id) {
            this.mapCom.flyToBounds([[camera.loc.coordinates[1], camera.loc.coordinates[0]]])
            if (camera.angle) {
              camera.angleStyle = {
                '-ms-transform': 'rotate(' + (90 + camera.angle) + 'deg)',
                '-webkit-transform': 'rotate(' + (90 + camera.angle) + 'deg)',
                'transform': 'rotate(' + (90 + camera.angle) + 'deg)'
              };
            } else if (!camera.ptz) {
              camera.angleStyle = {
                '-ms-transform': 'rotate(' + (90) + 'deg)',
                '-webkit-transform': 'rotate(' + (90) + 'deg)',
                'transform': 'rotate(' + (90) + 'deg)'
              };
            }
            this.setCurrentMode('cameras')
            this.chosenMarkers['camera'] = camera;
            this.cdRef.detectChanges()
          }
        })
      } else if (this.paramMap.type == "parking") {
        this.listParking.forEach((parking:any) => {
          if (parking._id == this.paramMap.id) {
            this.setCurrentMode('parkings')
            this.mapCom.flyToBounds([[parking.loc.coordinates[1], parking.loc.coordinates[0]]])
            this.chosenMarkers['parking'] = parking;
            this.cdRef.detectChanges()
          }
        })
      } else if (this.paramMap.type == "event") {
        this.listEvent.forEach((event:any) => {
          if (event._id == this.paramMap.id) {
            this.mapCom.flyToBounds([[event.loc.coordinates[1], event.loc.coordinates[0]]])
            this.chooseIncident(event)
            this.setCurrentMode('incidents')
            this.chosenMarkers['incident'] = event;
            
            
            this.cdRef.detectChanges()
          }
        })
      }
    }
  }

  toggleStaticMap(staticMapObject:any) {
    staticMapObject['toggle'] = !staticMapObject['toggle']
    staticMapObject.listGeo.forEach((geo:any) => {
      if (staticMapObject['toggle']) {
        this.sideMap?.addLayer(geo);
      } else {
        this.sideMap?.removeLayer(geo);
      }
    });
  }

  createRoadEventMarker(feature:any, latLng:any) {
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
    })
  }

  getRoadEventGeo() {
    var geo = L.geoJSON(undefined, {
      style: (feature:any) => {
          return this.markerService.getPathStyle(feature.properties.type, feature.properties.color);
      },
      pointToLayer: (feature, latLng) => {
          return this.createRoadEventMarker(feature, latLng);
      },
      onEachFeature: (feature, layer) => {
        // listEvent[feature.properties.type](feature, layer, geo);
      }
    });
    return geo
  }

  getAllRoadEvents() {
    this.listRoadEvents = []
    this.roadEventService.getAllPublish().subscribe({
      next: (roadeventsList:any) => {
        roadeventsList.forEach((geo:any) => {
          var geoObject = this.getRoadEventGeo();
          geoObject.addData(geo.featureCollection);

          this.listRoadEvents.push({
            geoObject: geo,
            geoLayer: geoObject
          });
        })
      }
    })
  }

  toggleRoadEvent(roadEventObject:any) {
    roadEventObject['toggle'] = !roadEventObject['toggle']
    if (roadEventObject.toggle) {
      this.sideMap?.addLayer(roadEventObject.geoLayer);
    } else {
      this.sideMap?.removeLayer(roadEventObject.geoLayer);
    }
  }

  share(type:string, id:string) {
    this.shareLink = location.origin + '/map?type=' + type + '&id=' + id;
    this.isShare = true
    this.cdRef.detectChanges()
  }

  trackByFn(item:any) {
    return item;
  }

  createCustomPopup(trafficEvent?:any, isNew=false) { 
    if( this.component && isNew) {
      this.component?.destroy()
    }
    const factory = this.componentFactoryResolver.resolveComponentFactory(MapPopupCreateEventComponent);
    if (isNew) {
      var component = factory.create(this.injector);
      component.instance.event = trafficEvent
      component.changeDetectorRef.detectChanges();
      return component.location.nativeElement
    } else {
      this.component = factory.create(this.injector);
      this.component.instance.event = trafficEvent
      this.component.changeDetectorRef.detectChanges();
      return this.component.location.nativeElement
    }
  }

  previewImage() {
    var imageUpload:any = document.getElementById('imageUpload');
    if (imageUpload != null && typeof (FileReader) !== 'undefined') {
      var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.gif|.png|.bmp)$/;
      var file = imageUpload.files[0];
      if (regex.test(file.name.toLowerCase())) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e:any) => {
          this.event['snapshot'] = e.currentTarget.result
          this.component.changeDetectorRef.detectChanges()
        };     
      }
    }
  }

  createStaticMapPopup(properties?:any, popupData?:any) { 
    const factory = this.componentFactoryResolver.resolveComponentFactory(StaticMapPopupComponent);
    const component:any = factory.create(this.injector);

    component.instance.properties = properties
    component.instance.popupData = popupData

    component.changeDetectorRef.detectChanges();

    return component.location.nativeElement;
  }

  closeModal() {
    this.isShare = false
    this.shareLink = ""
  }

  setCurrentMode(mode?:string) {
    this.currentMode = mode
    this.chosenMarkers = {}
    this.location.replaceState(`./map`)
    if (mode == "cameras") {
      this.dividerText = "Camera"
    } else if (mode == "parkings") {
      this.dividerText = "Bãi đỗ xe"
    } else if (mode == "roadevents") {
      this.dividerText = "Phân luồng"
    } else if (mode == "staticmaps") {
      this.dividerText = "Thông tin tĩnh"
    } else if (mode == "incidents") {
      this.dividerText = "Cảnh báo giao thông"
    } else {
      this.dividerText = ""
    }

    if (mode) {
      this.mapCom.toggleLayout(true)
    } else {
      this.mapCom.toggleLayout(false)
    }
  }
}
