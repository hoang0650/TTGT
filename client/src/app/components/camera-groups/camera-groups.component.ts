import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'src/app/services/message.service';
import * as L from 'leaflet';
import _, { map } from 'lodash';
import 'leaflet-rotatedmarker';
import 'leaflet.markercluster'
import { ConfigureService } from 'src/app/services/configure.service';
import { CameraService } from 'src/app/services/camera.service';
import { MarkerService } from 'src/app/services/marker.service';
import { forkJoin, Observable } from 'rxjs';
import { CameraGroupService } from 'src/app/services/camera-group.service';
import { ViewportScroller } from '@angular/common';
import { AdminConfigConfirmComponent } from '../admin-config-confirm/admin-config-confirm.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { MapComponent } from '../map/map.component';
import { AppComponent } from 'src/app/app.component';

declare var $: any;

@Component({
  selector: 'app-cameras-groups',
  host: {
    class: 'map-layout-info-container'
  },
  templateUrl: './camera-groups.component.html',
  styleUrls: ['./camera-groups.component.css'],
})
export class CameraGroupsComponent implements OnInit {
  button: any;
  sideMap: any;
  inputChange: boolean;
  isLoading: boolean;
  cameraClusterLayer: any;
  cameras: any;
  markers: any;
  cameraGroups: any;
  cameraGroupCounts: any;
  isCreate: boolean;
  isRemoving: boolean;
  group: any;
  availableCameras: any;
  center: any;
  lastResult:any
  selectedGroup: any;
  error:any;
  lastCamera: any;
  validateCameraGroup: string[];
  options: any;
  filter:string;

  constructor(public mapCom:MapComponent, private messageService:MessageService, public configure:ConfigureService, private nzMessage:NzMessageService, private cameraService:CameraService, private markerModify:MarkerService, private cameraGroupService:CameraGroupService, private viewportScroller: ViewportScroller, private modalService:NzModalService, private cdRef:ChangeDetectorRef, public appCom:AppComponent) {
    this.button = messageService.getMessageObj().BUTTON;
    this.filter = ""
    this.inputChange = false;
    this.isLoading = false;
    this.markers = {};
    this.isCreate = false
    this.isRemoving = false;
    this.validateCameraGroup = ['name'];
    this.error = {}

    
    this.cameraClusterLayer = L.markerClusterGroup({
      disableClusteringAtZoom: 16,
      maxClusterRadius: 64,
      removeOutsideVisibleBounds: true,
      animateAddingMarkers: true,
      animate: true
    })

    this.mapCom.geoLayer = this.cameraClusterLayer
    this.sideMap = mapCom.sideMap
  }

  ngOnInit(): void {
    this.getData()
    this.mapCom.toggleLayout(true)
  }

  ngOnDestroy(): void {
    this.mapCom.removeLayers()
    this.mapCom.toggleLayout(false)
  }


  validateError(camG:any) {
    this.validateCameraGroup.forEach((element) => {
      if (camG) {
        if (!camG[element]) {
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
        form: form
      }
    })
  }


  selectCameraById(camera:any) {
    var newIcon = L.divIcon(this.markerModify.selectedMarker(this.markers[camera._id].options.icon.options));
    this.markers[camera._id].setIcon(newIcon);

    this.cameraClusterLayer.removeLayer(this.markers[camera._id]);
    this.mapCom.markers[camera._id] = this.markers[camera._id]
  }

  deselectCameraById(camera:any) {
    var newIcon = L.divIcon(this.markerModify.deSelectedMarker(this.markers[camera._id].options.icon.options));
    this.markers[camera._id].setIcon(newIcon);
    delete this.mapCom.markers[camera._id]
    this.refreshCluster()
  }

  refreshCluster() {
    this.cameraClusterLayer.clearLayers();
    var markers:any = {}
    this.cameras.forEach((camera:any) => {
      markers[camera._id] = this.setMarkerForCamera(camera);
      this.cameraClusterLayer.addLayer(markers[camera._id]);
    });
    
    this.markers = markers;
  }

  focusGroup(group:any) {
    var latLngs:any = [];
    if (group.cameras.length) {
      group.cameras.forEach((camera:any) => {
        latLngs.push(L.latLng(camera.loc.coordinates[1], camera.loc.coordinates[0]));
      });
      this.mapCom.flyToBounds(L.latLngBounds(latLngs));
    }
  }

  focusCamera(camera:any) {
    if (this.lastCamera) {
      this.deselectCameraById(this.lastCamera);
    }
    this.selectCameraById(camera);
    this.mapCom.flyToBounds([[camera.loc.coordinates[1], camera.loc.coordinates[0]]])
    this.lastCamera = camera;
  }


  selectCamera(camera:any) {
    this.selectCameraById(camera._id);
  }

  setMarkerForCamera(camera:any) {
    var cameraIcon = this.markerModify.getIcon('good', 'normal');
    if (camera.ptz) {
      cameraIcon = this.markerModify.getIcon('good', 'ptz');
    }

    var marker = L.marker(
      [
        camera.loc.coordinates[1], camera.loc.coordinates[0]
      ],
      {
        icon: cameraIcon,
        rotationAngle: (camera.angle) || 0
      }
    );

    marker.on("click", () => {
      if (this.group) {
        if (this.group.cameras.includes(camera)) {
          this.group.cameras = this.group.cameras.filter((item:any) => {
            return item !== camera
          })
          this.deselectCameraById(camera)
        } else {
          this.addCamera(camera)
          this.selectCameraById(camera)
        }
      }
    })

    return marker;
  }

  getData() {
    this.isLoading = true;
    var tmpCameraGroups:any = {};
    forkJoin([this.cameraGroupService.query(), this.cameraService.query()]).subscribe({
      next: (response:any) => {
        this.cameras = response[1];
        this.refreshCluster()

        

        this.cameras.forEach((camera:any) => {
          if (camera.groups) {
            camera.groups.forEach((group:any) => {
              tmpCameraGroups[group._id] = tmpCameraGroups[group._id] || [];
              tmpCameraGroups[group._id].push(camera);
            });
          }
        });

        this.cameraGroups = response[0].data;

        this.cameraGroups.forEach((group:any) => {
          group.cameras = tmpCameraGroups[group._id] || [];
        });

        this.cameraGroupCounts = tmpCameraGroups;       
        this.cameraGroups = response[0].data;
        
       
        this.isLoading = false;
      },
      error: (err) => {
        this.appCom.errorHandler(err[0])
        this.appCom.errorHandler(err[1])
      }
    });
  }

  deselectGroup(group:any) {
    if (group) {
      group.isSelected = false;
      delete this.selectedGroup

      var cameras = this.cameraGroupCounts[group._id];
      
      if (cameras) {
        cameras.forEach((camera:any) => {
          this.deselectCameraById(camera);
        });
      }
    }
  }

  selectGroup(group:any) {
    if (group) {
      this.selectedGroup = group;
      this.selectedGroup.isSelected = true;
      var cameras = this.cameraGroupCounts[group._id];

      if (cameras) {
        cameras.forEach((camera:any) => {
          this.selectCameraById(camera);
        });
      }
    }
  }

  initEditor(group?:any) {
    setTimeout(() => {
      $(".dropdown").dropdown()
    }, 100)
    
    this.isRemoving = false;

    group = group || {cameras:[]};
    this.group = _.cloneDeep(group);

    this.availableCameras = _.cloneDeep(this.cameras);

    this.group.cameras.forEach((currentCamera:any) => {
        this.availableCameras.forEach((camera:any, index:number, cameras:any) =>{
            if (camera._id === currentCamera._id) {
              this.selectCameraById(currentCamera)
              cameras.splice(index, 1);
            }
        });
    });
  }

  createGroup() {
    this.refreshCluster()
    this.isCreate = true;
    this.initEditor();
  }

  editGroup(group:any) {
    if (group) {
      this.isCreate = false;
      this.initEditor(group);
    }
  }

  clickGroup(group:any) {
    
    if (this.selectedGroup != group) {
      this.selectGroup(group);
      this.focusGroup(group);
    } else {
      this.deselectGroup(this.selectedGroup);
    }
  }


  addCamera(currentCamera:any) {
    this.group.cameras.push(currentCamera);
    
    this.availableCameras = this.availableCameras.filter((camera:any) => {
      return camera._id != currentCamera._id
    })
  }

  removeCameraByIndex(index:number) {
    if (this.group.cameras[index]) {
      this.availableCameras.push(this.group.cameras[index]);
      this.deselectCameraById(this.group.cameras[index])
      
      this.availableCameras = _.cloneDeep(this.availableCameras)
      this.group.cameras.splice(index, 1);
    }
  }

  clickCamera(camera:any) {
    this.focusCamera(camera);
  }

  closeEditor(action:string) {
    this.lastResult = { action: action };
    this.group = null;
  }

  submit(group:any) {
    
    this.validateError(group);
    if (Object.keys(this.error).length > 0) {
      return ;
    }

    // var newCameraGroup = new this.cameraGroupService(group);
    var listCamId:any = [];
   
    group.cameras.forEach((camera:any) => {
      listCamId.push(camera._id);
    });

    group['listCamId'] = listCamId

    this.cameraGroupService.save(group).subscribe({
      next: (res) => {
        this.getData();

        this.closeEditor('update');
        this.inputChange = false;
        
      },
      error: (err) => {
        this.appCom.errorHandler(err)
      }
    })

  }

  cancel() {
    if (this.inputChange) {
      var modalInstance = this.openModal('back');
      modalInstance.afterClose.subscribe({
        next: (reponse:any) => {
          if (reponse === 'yes') {
            this.lastResult = null;
            this.group = null;
          }
        },
        error: (err) => {
          this.appCom.errorHandler(err)
        }
      })

      this.inputChange = false;
    } else {
      this.lastResult = null;
      this.group = null;
    }
    this.refreshCluster()
    this.mapCom.markers = {}
  }

  remove() {
    this.isRemoving = true;
    this.inputChange = false;
    setTimeout(() => {
      this.viewportScroller.scrollToAnchor('bottom-buttons')
    }, 100);
  }

  confirmRemove(group:any) {
    this.cameraGroupService.remove(group._id).subscribe({
      next: (res) => {
        this.getData();

        this.closeEditor('remove');
        this.nzMessage.success(this.messageService.getMessageObj().NOTICE('remove', 'phân luồng giao thông'))
      },
      error: (err) => {
        this.appCom.errorHandler(err)
      }
    })
  }

  abortRemove() {
    this.isRemoving = false;
  }

  inputChangeMethod() {
    this.inputChange = true;
  };

  trackByFn(item:any) {
    return item;
  }
}

