import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import L from 'leaflet';
import _ from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AppComponent } from 'src/app/app.component';
import { CameraGroupService } from 'src/app/services/camera-group.service';
import { CameraService } from 'src/app/services/camera.service';
import { ConfigureService } from 'src/app/services/configure.service';
import { MarkerService } from 'src/app/services/marker.service';
import { MessageService } from 'src/app/services/message.service';
import { StaticService } from 'src/app/services/static.service';
import { AdminConfigConfirmComponent } from '../admin-config-confirm/admin-config-confirm.component';
import { MapComponent } from '../map/map.component';

declare var $: any;

@Component({
  selector: 'app-cameras-create',
  host: {
    class: 'map-layout-info-container'
  },
  templateUrl: './cameras-create.component.html',
  styleUrls: ['./cameras-create.component.css'],
})
export class CamerasCreateComponent implements OnInit {
  validateCamera: string[];
  inputChange: boolean;
  countGeo: number;
  positionSelectGeojson: number;
  mapurl: string;
  button: any;
  geoCameraColorCode: string;
  hoverStyle: any;
  selectedStyle: any;
  listRoads: any;
  isCreate: boolean;
  newCamera: any;
  districtList: any;
  listCamGroup: any;
  error: any;
  markers: any;
  selected: any;
  ptzStatus: { id: boolean; name: string; }[];
  configStatus: { id: boolean; name: string; }[];
  connectStatus: any;
  listType: any;
  disableClick: boolean;
  sideMap?: L.Map;
  cameraTypeUrl: string;
  geojson: any;
  options:any
  
  constructor(public mapCom: MapComponent, private messageService:MessageService, private cdRef:ChangeDetectorRef, public configure:ConfigureService, private staticData:StaticService, private cameraGroupService:CameraGroupService, private cameraService:CameraService, private router: Router, private modalService:NzModalService, private route:ActivatedRoute, public nzMessage:NzMessageService,public appCom:AppComponent, private markerService:MarkerService, private location:Location) {
    this.button = this.messageService.getMessageObj().BUTTON;
    this.validateCamera = ['id', 'name', 'dist', 'tmpLocation'];
    this.inputChange = false;
    this.countGeo = 0;
    this.positionSelectGeojson = 0;
    this.mapurl = configure.livemap
    this.geoCameraColorCode = '#21ba45'
    this.hoverStyle = configure.itemHoverStyle;
    this.selectedStyle = configure.itemSelectedStyle;
    this.isCreate = !route.snapshot.paramMap.get('id')
    this.error = {};
    this.disableClick = false
    this.cameraTypeUrl = ""
    this.markers = {}

    this.newCamera = { 
      values:{}
    }

    this.ptzStatus = [
      { id: true, name: 'Có' },
      { id: false, name: 'Không' }
    ];

    this.configStatus = [
      { id: true, name: 'Có' },
      { id: false, name: 'Chưa' }
    ];
    this.connectStatus = configure.cameraConnectStatus;

    cameraService.getCameraType().subscribe({
      next: (typeList:any) => {
        this.listType = typeList;
      }
    });

    this.cameraGroupService.query().subscribe({
      next: (res:any) => {
        this.listCamGroup = res.data;
       
      }
    });

    this.cameraService.getdefaultcamera().subscribe({
      next:(data) => {
        this.newCamera = data
        this.newCamera['dist'] = ""
        this.newCamera['type'] = ""
        this.newCamera['values'] = {}
        this.newCamera['angle'] = 0
      }
    })

    this.sideMap = this.mapCom.sideMap
    this.markers = mapCom.markers
  }

  ngOnInit(): void {
    setTimeout(() => {
      $(".ui.dropdown").dropdown()
    }, 100)
    this.sideMap?.on('click', (event) => {      
      this.selectPosition(event)
    })
    this.getMarkers()
    this.mapCom.toggleLayout(true)
  }

  ngOnDestroy(): void {
    this.mapCom.removeOnClick()
    this.mapCom.removeLayers()
    this.mapCom.toggleLayout(false)
  }

  getMarkers() {
    this.staticData.loadDistrictAPI().subscribe({
      next: (hcmDistricts:any) => {
        this.districtList = hcmDistricts;
      }
    });

    this.cameraService.query().subscribe({
      next: (cameras:any) => {
        cameras.forEach((camera:any) => {
          if (camera._id != this.route.snapshot.paramMap.get("id")) {
            this.markers[camera._id] = this.createCameraMarker(camera)
          }
        });

        if (!this.isCreate) {
          this.loadCameraByID(this.route.snapshot.paramMap.get("id"))
          this.location.replaceState("./cameras/update")
        }

        this.mapCom.detectChanges()
      }
    })
  }

  createCameraMarker(camera:any) {
    var marker = L.marker([camera.loc.coordinates[1], camera.loc.coordinates[0]], {
      draggable: true,
      icon: camera.ptz ? this.markerService.getIcon('good', 'ptz') : this.markerService.getIcon('good', 'normal'),
      zIndexOffset: 10000,
      rotationAngle: camera.ptz ? 0 : camera.angle
    })
    
    return marker
  }

  updateNewCamera(latlng?:any) {
    
    
    if (this.markers['newMarker']?._latlng || latlng) {
      this.markers['newMarker'] = L.marker(latlng || this.markers['newMarker']._latlng, {
        draggable: true,
        icon: this.newCamera.ptz ? this.markerService.getIcon('new', 'ptz') : this.markerService.getIcon('new', 'normal'),
        zIndexOffset: 10000,
        rotationAngle: this.newCamera.ptz ? 0 : this.newCamera.angle
      })

      this.markers['newMarker'].on("dragend", (event:any) => {
        this.updateNewCamera(event.target._latlng)
      })

      if (latlng) {
        this.newCamera['tmpLocation'] = latlng.lat.toFixed(4) + ' , ' + latlng.lng.toFixed(4);
      }
    }
    this.mapCom.detectChanges()
  }

  selectPosition(event:any) {
    if (!this.selected) {
      this.updateNewCamera(event.latlng)
      this.inputChange = true;
    }
  }

  validateError(camera:any) {    
    if (camera.configStatus) {
      this.validateCamera.push('type');
    } else {
      if (this.validateCamera.indexOf('type') >= 0) {
        this.validateCamera.splice(this.validateCamera.indexOf('type'), 1);
      }
    }
    this.error ={}
    this.validateCamera.forEach((element) => {
      if (camera) {
        if (!camera[element]) {
          this.error[element] = this.messageService.WARNING.fieldRequire;
        } else {
          delete this.error[element];
        }
      } else {
        this.error[element] = this.messageService.WARNING.fieldRequire;
      }
    });
  }

  openModal(type:string) {
    var form = this.messageService.getMessageObj().POPUP(type,'');
    return this.modalService.create({
      nzContent: AdminConfigConfirmComponent,
      nzComponentParams: {
        form:form,
        isMessage: true
      }
    })
  }

  myIndexOf(arr:any, f:any) {
    for (var i = 0; i < arr.length; ++i) {
      if (f(arr[i])) {
          return i;
      }
    }
    return -1;
  };

  removeFeature(geojson:any, feature:any) {
    if (geojson && geojson.features) {
      var index = this.myIndexOf(geojson.features, (o:any) => {
        return JSON.stringify(o) === JSON.stringify(feature);
      });
      if (index > -1) {
        geojson.features.splice(index, 1);
      }
    }
    return geojson;
  };

  loadCameraByID(id:string | null) {
    if (id) {
      this.cameraService.get(id).subscribe({
        next: (camera:any) => {
          this.newCamera = camera
          if (!this.newCamera['values']) {
            this.newCamera['values'] = {}
          }
          

          var cameraGroup = $('.ui.dropdown');
          if (camera.groups && camera.groups.length > 0) {
            camera.groups.forEach((group:any) => {
              cameraGroup.dropdown('set selected', `${group._id}`);
            });
          }          
  
          this.updateNewCamera({
            lat: camera.loc.coordinates[1],
            lng: camera.loc.coordinates[0]
          })

          this.newCamera.tmpLocation = camera.loc.coordinates[1].toFixed(4) + ' , ' + camera.loc.coordinates[0].toFixed(4);
          
          this.mapCom.flyToBounds([[camera.loc.coordinates[1], camera.loc.coordinates[0]]])
        }
      })
    }
  };

  changeToMarker() {
    if (this.selected && this.selected.style && this.selected.style.color) {
      this.selected.style.color = this.geoCameraColorCode;
      this.selected = null;
    }
  };

  addGeoColor() {
    var geo = {
      type: 'FeatureCollection',
      features: []
    };
    this.geojson['selected' + (this.newCamera.references.length)] = {
      style: _.cloneDeep(this.selectedStyle),
      links: [],
      name: '',
      data: geo,
      onEachFeature: (feature:any, layer:any) => {
        layer.on({
          click: () => {
            this.selected.data = this.removeFeature(this.selected.data, feature);
          }
        });
      }
    };

    this.newCamera.references.push(this.geojson['selected' + (this.newCamera.references.length)]);
    if (this.selected) {
      this.selected.style.color = this.geoCameraColorCode;
    }

    this.selected = this.newCamera.references[this.newCamera.references.length - 1];
    this.positionSelectGeojson = this.newCamera.references.length - 1;
    this.countGeo++;
  };

  deleteGeoColor(ref:any, index:number) {
    for (var key in this.geojson) {
        var value = this.geojson[key];
        if (ref === value) {
          delete this.geojson[key];
        }
    }
    this.newCamera.references.splice(index, 1);
    this.selected = this.newCamera.references[this.newCamera.references.length - 1];
    this.countGeo--;
  };

  selectReference(ref:any, index:number) {
    this.positionSelectGeojson = index;
    if (!this.selected) {
      this.selected = ref;
      this.selected.style.color = _.cloneDeep(this.selectedStyle.color);
    } else if (this.selected !== ref) {
      this.selected.style.color = this.geoCameraColorCode;
      this.selected = ref;
      this.selected.style.color = _.cloneDeep(this.selectedStyle.color);
    }
  };

  doesNotChangeValue() {
    if (this.markers.length < 1) {
      this.newCamera.tmpLocation = '';
    } else {
      this.newCamera.tmpLocation = this.markers.newMarker.lat.toFixed(4) + ' , ' + this.markers.newMarker.lng.toFixed(4);
    }
  };

  create(newCamera:any) {
    this.disableClick = true;
    this.validateError(newCamera);
    if (Object.keys(this.error).length > 0) {
      this.disableClick = false;
      return;
    }
    
    if (!this.markers.newMarker) {
      return;
    }

    var loc:any = {
        type: 'Point',
        coordinates: [this.markers['newMarker']._latlng.lng, this.markers['newMarker']._latlng.lat]
    };


    newCamera['loc'] = loc

    newCamera['groups'] = $('.ui.dropdown').dropdown('get values')
    
    



    if (this.isCreate) {

      delete newCamera._id;
      this.cameraService.create(newCamera).subscribe({
        next: (res:any) => {
          this.router.navigate(['/cameras'], {queryParams: {camid:res._id, result:"create"}})
          // this.noti.showNotification('top','center');
        },
        error: (err) => {
          // this.noti.dangerNotification('top','center');
          console.log(err);
          
          if (err?.error?.err?.code === 11000) {
            this.openModal('duplicateCamera');
          }
        }
      })
    } else {
      var camId = newCamera._id;
      this.cameraService.update(newCamera._id, newCamera).subscribe({
        next: (res) => {
          this.router.navigate([`/cameras`], {queryParams: {camid:camId, result:"update"}})
          // this.noti.showNotification('top','center');
        },
        error: (err) => {
          // this.noti.dangerNotification('top','center');
        }
      })
    }
    // this.noti.dangerNotification
    this.disableClick = false;
  };

  deleteCamera(camera:any) {
    var modalInstance = this.openModal('remove');
    modalInstance.afterClose.subscribe({
      next: (res: string) => {
        if (res === 'yes') {
          this.cameraService.delete(camera._id).subscribe({
            next: (res) => {
              this.router.navigate(["/cameras"], {
                queryParams: {
                  camid: camera._id,
                  result: "remove"
                }
              })
            }
          })
        }
      }
    })
  };

  back() {
    if (this.inputChange) {
      var modalInstance = this.openModal('back');
      modalInstance.afterClose.subscribe({
        next: (res:string) => {
          if (res === 'yes') {
            this.router.navigateByUrl('..')
          }
        }
      })
    } else {
      this.router.navigateByUrl('..')
    }
  };

  preview(newCamera:any) {
    if (!this.disableClick) {
      this.disableClick = true;
      this.cameraService.getcamerapreview(newCamera).subscribe({
        next: (data:any) => {
          // this.modalService.show(CameraPreviewComponent, {
          //   initialState: {
          //     data: data.data
          //   },
          //   class: "modal-sm popupCameraPreview"
          // })
        
          // this.disableClick = false;
        },
        error: () => {
        //   this.modalService.show(CameraPreviewComponent, {
        //     class: "modal-sm popupCameraPreview"
        //   })
        // this.disableClick = false;
      }});
    }
  };

  inputChangeMethod() {
    this.inputChange = true;
    this.updateNewCamera()
  };

  getPosition() {
    this.disableClick = true;

    var options = {
        enableHighAccuracy: true,
        timeout: 10000
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.mapCom.flyToBounds([[position.coords.latitude, position.coords.longitude]])

          this.updateNewCamera(L.latLng([position.coords.latitude, position.coords.longitude]))
        }, (err) => {
          console.warn('ERROR(' + err.code + '): ' + err.message);
        }, options);
    } else {
      window.alert('Browser ko support!!!');
    }
    this.disableClick = false;
  };
}
