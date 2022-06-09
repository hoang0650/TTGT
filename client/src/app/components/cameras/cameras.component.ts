
import { Location, ViewportScroller } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import L from 'leaflet';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AppComponent } from 'src/app/app.component';
import { CameraService } from 'src/app/services/camera.service';
import { ConfigureService } from 'src/app/services/configure.service';
import { MarkerService } from 'src/app/services/marker.service';
import { MessageService } from 'src/app/services/message.service';
import { StaticService } from 'src/app/services/static.service';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-cameras',
  host: {
    class: 'map-layout-info-container'
  },
  templateUrl: './cameras.component.html',
  styleUrls: ['./cameras.component.css'],
})
export class CamerasComponent implements OnInit, OnDestroy {
  @Input() layoutContent?:Element;

  sideMap?: L.Map;
  mess:any;
  filename = "";
  markers:any = {};
  districts:any = [];
  cameras: any = [];
  objectUrl: any;
  exported?: boolean;
  center: any;
  selectedCamera: any;
  selectedDist: any;
  filterText: string;
  notice: any;
  isLoading: boolean;
  filter: string | null;
  cameraId: string | null;
  result: string | null;


  constructor(public appCom:AppComponent,public mapCom:MapComponent, private messageService:MessageService, public configure:ConfigureService, private staticData:StaticService, private cameraService:CameraService, private markerModify:MarkerService, private route:ActivatedRoute, private viewportScroller: ViewportScroller, private location:Location, private cdRef:ChangeDetectorRef,private nzMessage: NzMessageService) {
    this.mess = this.messageService.getMessageObj();
    this.filterText = ""
    this.isLoading = true;

    var queryParams = this.route.snapshot.queryParamMap
    this.filter = queryParams.get("filter");
    this.cameraId = queryParams.get("camid");
    this.result = queryParams.get("result")
    this.location.replaceState("./map/cameras")

    this.sideMap = this.mapCom.sideMap
    this.markers = mapCom.markers

  }
  

  ngOnInit(): void {
    this.getMarkers()
    this.mapCom.toggleLayout(true)
  }

  ngOnDestroy(): void {
    this.mapCom.removeLayers()
    this.mapCom.toggleLayout(false)
  }

  getMarkers() {
    this.staticData.loadDistrictAPI().subscribe({
      next: (hcmDistricts) => {
        this.cameraService.query().subscribe({
          next: (cameras:any) => {

            this.cameras = cameras;
            this.isLoading = false;
  
            cameras.forEach((camera:any) => {
              this.markers[camera._id] = this.setMarkerForCamera(camera);
              this.addCameraToDistrict(hcmDistricts, camera);
            });
  
            this.districts = hcmDistricts;

            this.readDataFromSearchQuery()
          }
        })
      }
    })
  }

  focusToCamera(cam:any) {
    this.mapCom.toggleLayout(true)

    if (this.selectedCamera) {
      this.markers[this.selectedCamera._id]._icon = this.markerModify.deSelectedMarker(this.markers[this.selectedCamera._id]._icon);
    }
    
    if (this.markers[cam._id]._icon) {
      this.markers[cam._id]._icon = this.markerModify.selectedMarker(this.markers[cam._id]._icon);
    }

    if (this.selectedCamera != cam) {
      this.selectedCamera = cam;
      
      this.mapCom.flyToBounds([[cam.loc.coordinates[1],cam.loc.coordinates[0]]])
    }

  }

  selectDistrict(isOpen:boolean, district:any) {
    if (isOpen) {

        var bound:any = [];
        district.camera.forEach((element:any) => {
          bound.push([element.loc.coordinates[1], element.loc.coordinates[0]]);
        });

        this.mapCom.flyToBounds(bound)
    }
  };

  selectCamera(camera:any) {
    this.focusToCamera(camera);
    this.expandDistrict(camera._id)
  }

  expandDistrict(id:string) {
    var choosenDist: any
    var choosenCamera: any
    this.districts.forEach((district:any) => {
      if (district.camera) {
        district.camera.forEach((camera:any) => {
          if (camera._id === id) {
            choosenDist = district
            choosenCamera = camera
          }
        });
      }
    });

    if (this.selectedDist) {
      this.selectedDist.expand = false
    }
    this.selectedDist = choosenDist
    this.selectedDist.expand = true
  }

  imageError(event:any) {
    event.target.src = this.configure.backend + 'api/setting/getimageerror'
  }

  filterCustome(item:any, filter:string) {
    if (item.id && item.name) {
      if (!filter || ((item.id + '').toLowerCase().indexOf(filter.toLowerCase()) !== -1) || ((item.name + '').toLowerCase().indexOf(filter.toLowerCase()) !== -1)) {
        return true;
      }
    } else if (item.id) {
      if (!filter || ((item.id + '').toLowerCase().indexOf(filter.toLowerCase()) !== -1)) {
        return true;
      }
    } else if (item.name) {
      if (!filter || ((item.name + '').toLowerCase().indexOf(filter.toLowerCase()) !== -1)) {
        return true;
      }
    }
    return false;
  }


  setMarkerForCamera(camera:any) {
    var marker:any = {};
    
    marker = L.marker([camera.loc.coordinates[1], camera.loc.coordinates[0]], {
      draggable: false,
      
      icon: camera.ptz ? this.markerModify.getIcon('good', 'ptz') : this.markerModify.getIcon('good', 'normal'),
      rotationAngle: camera.ptz ? 0 : camera.angle
    }).on({
      click: () => {
        this.selectCamera(camera)
      }
    })

    return marker;
  }

  addCameraToDistrict(districts:any, camera:any) {
    districts.forEach((district:any) => {
      district['expand'] = false
      if (camera.dist === district.district) {
        district.camera = district.camera || [];
        district.camera.push(camera);
      }
    });
  }

  readDataFromSearchQuery() {

    if (this.result) {
      this.notice = this.mess.NOTICE(this.result, 'camera');

      this.nzMessage.success(this.messageService.getMessageObj().NOTICE(this.route.snapshot.queryParamMap.get('result'), 'camera'))
    }
    
    if (this.cameraId) {
      this.expandDistrict(this.cameraId);

      setTimeout((cameraId:string) => {
        this.viewportScroller.scrollToAnchor(cameraId)
      }, 100);
    }
    if (this.filter) {
      this.filterText = this.filter;
    }
  }

  filterChange() {
    this.route.queryParams.subscribe((params:any)=> {
      var cameraId = params.camid;
      if (cameraId) {
        this.expandDistrict(cameraId);
        setTimeout(() => {
            this.viewportScroller.scrollToAnchor(cameraId)
        }, 100);
      }
    })
  }

  exportCSV() {
    this.exported = true;
    this.cameraService.getCameraCSV().subscribe({
      next:(res:any) => {
        this.mapCom.download(URL.createObjectURL(new Blob([res],{type:'text/csv'})),"ttgt-cameras.csv")
      }
    })
  };

  exportXLS(){
    this.exported = true;
    this.cameraService.exportExcel(this.cameras,'ttgt-cameras');
  }

  exportJSON() {
    var theJSON = JSON.stringify(this.cameras);
    this.mapCom.download(URL.createObjectURL(new Blob([theJSON],{type:'text/csv'})),"ttgt-cameras.json")
  }
}
