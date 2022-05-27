import { animate, state, style, transition, trigger } from '@angular/animations';
import { Location, ViewportScroller } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import L from 'leaflet';
import { CameraService } from 'src/app/services/camera.service';
import { ConfigureService } from 'src/app/services/configure.service';
import { MarkerService } from 'src/app/services/marker.service';
import { MessageService } from 'src/app/services/message.service';
import { StaticService } from 'src/app/services/static.service';

@Component({
  selector: 'app-cameras',
  templateUrl: './cameras.component.html',
  styleUrls: ['./cameras.component.css'],
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
export class CamerasComponent implements OnInit {
  mess:any;
  sideMap:any;
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


  constructor(private messageService:MessageService, public configure:ConfigureService, private staticData:StaticService, private cameraService:CameraService, private markerModify:MarkerService, private route:ActivatedRoute, private viewportScroller: ViewportScroller, private location:Location, private cdRef:ChangeDetectorRef) {
    this.mess = this.messageService.getMessageObj();
    this.filterText = ""
    this.isLoading = true;
  }

  ngOnInit(): void {

  }

  initMap(map:any): void {
    this.sideMap = map
    this.getMarkers()
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
    if (this.selectedCamera) {
      this.markers[this.selectedCamera._id]._icon = this.markerModify.deSelectedMarker(this.markers[this.selectedCamera._id]._icon);
    }
    
    if (this.markers[cam._id]._icon) {
      this.markers[cam._id]._icon = this.markerModify.selectedMarker(this.markers[cam._id]._icon);
    }

    if (this.selectedCamera != cam) {
      this.selectedCamera = cam;
      // this.sideMap.flyTo([cam.loc.coordinates[1],cam.loc.coordinates[0]], 18, {duration: 1.5})
    }

  }

  selectCamera(camera:any) {
    this.focusToCamera(camera);
    this.expandDistrict(camera._id)
    this.isOpen = true
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
    
    this.cdRef.detectChanges()
    this.focusToCamera(choosenCamera);
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

    this.sideMap.addLayer(marker)
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
    var queryParams = this.route.snapshot.queryParamMap
    var filter = queryParams.get("filter");
    var cameraId = queryParams.get("camid");
    var result = queryParams.get("result")

    if (result) {
      this.notice = this.mess.NOTICE(result, 'camera');
      this.location.replaceState("./cameras")
    }
    
    if (cameraId) {
      this.expandDistrict(cameraId);

      setTimeout((cameraId:string) => {
        this.viewportScroller.scrollToAnchor(cameraId)
      }, 100);
    }
    if (filter) {
      this.filterText = filter;
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
    delete this.objectUrl;
    this.exported = true;
    this.cameraService.getCameraCSV().subscribe({
      next: (data:any) => {
        this.objectUrl = URL.createObjectURL(new Blob([data],{type:'text/csv'}));
      }
    });
  }

  trackByFn(item:any) {
    return item;
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
