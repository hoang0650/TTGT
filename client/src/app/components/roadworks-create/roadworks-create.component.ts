import { animate, state, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import L from 'leaflet';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AppComponent } from 'src/app/app.component';
import { ConfigureService } from 'src/app/services/configure.service';
import { MessageService } from 'src/app/services/message.service';
import { RoadworkService } from 'src/app/services/roadwork.service';
import { StaticService } from 'src/app/services/static.service';
import { AdminConfigConfirmComponent } from '../admin-config-confirm/admin-config-confirm.component';

@Component({
  selector: 'app-roadworks-create',
  templateUrl: './roadworks-create.component.html',
  styleUrls: ['./roadworks-create.component.css'],
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
export class RoadworksCreateComponent implements OnInit {
  sideMap: any;
  listRoads: any;
  button: any;
  typeToClassName:any;
  allGeoStyle: any;
  hoverStyle: any;
  mapurl: string;
  selectedStyle: any;
  selected: any;
  validateRoadwork: string[];
  inputChange: boolean;
  searchText: string;
  isCreate: boolean;
  error: any;
  newRoadwork: any;
  markers: any;
  districtList: any;
  typeList: any;
  statusList: any;
  options: any;

  constructor(private messageService:MessageService, public configure:ConfigureService, private staticData:StaticService, private router:Router, private modalService:NzModalService, private roadworkService:RoadworkService, private route:ActivatedRoute, private location:Location,public appCom:AppComponent, private cdRef: ChangeDetectorRef) {
    this.button = messageService.getMessageObj().BUTTON;
    this.hoverStyle = configure.itemHoverStyle;
    this.selectedStyle = configure.itemSelectedStyle;
    this.mapurl = configure.livemap;
    this.inputChange = false;
    this.validateRoadwork = ['name', 'road', 'ownerBy', 'performBy', 'dist', 'tmpLocation', 'type', 'status', 'startAt', 'finishPlan'];
    this.searchText = ""
    this.isCreate = !this.route.snapshot.paramMap.get('id')
    this.typeList = configure.roadworkTypeList;
    this.statusList = configure.roadworkStatusList;
    this.markers = {}
    this.error = {}

    this.allGeoStyle = {
      color: '#00D',
      fillColor: 'red',
      weight: 5,
      opacity: 0.5,
      fillOpacity: 0.2
    };

    this.typeToClassName = {
      'Sửa đường': 'marker-roadwork-roadwork',
      'Sửa hệ thống thoát nước': 'marker-roadwork-water_pipes_on_road',
      'Lễ hội': 'marker-roadwork-event_on_road',
      'Lắp camera': 'marker-roadwork-camera_on_road'
    };

    this.newRoadwork = {
      dist: "",
      status: "",
      values: {},
      type:"Sửa đường",
      featureCollection: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              id: 'marker'
            },
            geometry: {
              type: 'Point',
              coordinates: []
            }
          },
          {
            type: 'Feature',
            properties: {
              id: 'geo'
            },
            geometry: {
              type: 'GeometryCollection',
              geometries: []
            }
          }
        ]
      },
    };

    this.staticData.loadDistrictAPI().subscribe({
      next:(hcmDistricts) => {
        this.districtList = hcmDistricts;
      }
    })
  }
  
  ngOnInit(): void {
    
  }

  initMap(map:any) {
    this.sideMap = map

    this.createGeoForAnotherRoadwork();
    if (!this.isCreate) {
      this.loadRoadworkByID(this.route.snapshot.paramMap.get('id'));
      this.location.replaceState("./roadworks/update")
    }
    // eventListenerForMap();
  }

  trackByFn(item:any) {
    return item;
  }

  selectPosition(event:any) {
    if (!this.selected) {
      this.updateNewRoadwork(event.latlng)
      this.inputChange = true;
    }
  }

  typeListToIcon(type:string) {
    return L.divIcon({
      className: ['marker-roadwork', this.typeToClassName[type], 'selected'].join(' '),
      iconSize: [33.5, 40],
      iconAnchor: [16.5, 36.5]
    })
  }

  typeToGeoJsonIcon(type:string) {
    return L.divIcon({
      className: ['marker-roadwork', this.typeToClassName[type]].join(' '),
      iconSize: [33.5, 40],
      iconAnchor: [16.5, 36.5]
    });
  }

  modal(type:string) {
    // return this.modalService.show(AdminConfigConfirmComponent, {
    //   initialState: {
    //     type:type
    //   },
    //   backdrop: true
    // })
  }

  validateError(newRoadwork:any) {
    this.validateRoadwork.forEach((element) => {
      if (newRoadwork) {
        if (!newRoadwork[element]) {
          this.error[element] = this.messageService.WARNING.fieldRequire;
        } else {
          delete this.error[element];
        }
      } else {
        this.error[element] = this.messageService.WARNING.fieldRequire;
      }
    });
  }

  validateTime(a:any, b:any) {
    if (a && b) {
      if (a >= b) {
        this.error.startAt = this.messageService.WARNING.timeInvalid;
      } else {
        delete this.error.startAt;
      }
    }
  }

  changeType() {
    if (this.newRoadwork['type'] && this.markers['newMarker']) {
      this.markers.newMarker.icon = this.typeListToIcon(this.newRoadwork.type);
    }
    this.inputChangeMethod()
  }

  changeStatus() {
    if (this.newRoadwork.status === 'Đã hoàn thành') {
      this.validateRoadwork.push('finishAt');
    } else if (this.validateRoadwork.indexOf('finishAt') > -1) {
      this.validateRoadwork.splice(this.validateRoadwork.indexOf('finishAt'), 1);
      delete this.error.finishAt;
    }
    this.inputChangeMethod()
  }

  saveRoadwork(newRoadwork:any) {
    var currentDate = new Date();
    var dateString = currentDate.getHours() + ':' + currentDate.getMinutes() + ' Ngày: ' + currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear();
    
    var profile = JSON.parse(localStorage.getItem('profile') || "");
    newRoadwork.loc = newRoadwork.featureCollection.features[0].geometry;
    if (this.isCreate) {
        newRoadwork.values.log = ['Được tạo bởi: ' + profile.nickname + ' - Vào lúc: ' + dateString];
        this.roadworkService.save(newRoadwork).subscribe({
          next: (res:any) => {
            this.router.navigate(['/roadworks'], {queryParams: {
              result: "create",
              id: res.id
            }})

          }, error: (err) => {

          }
          
        })
    } else {
      newRoadwork.values.log.push('Cập nhật bởi: ' + profile.nickname + ' - Vào lúc: ' + dateString);
      this.roadworkService.update(newRoadwork._id,newRoadwork).subscribe({
        next: (res:any) => {
          this.router.navigate(['/roadworks'], {queryParams: {
            result: "update",
            id: res.id
          }})
        }, error: (err) => {

        }
      })
    }
  }

  save(newRoadwork:any) {
    this.validateError(newRoadwork);
    this.validateTime(newRoadwork.startAt, newRoadwork.finishPlan);
    this.validateTime(newRoadwork.startAt, newRoadwork.finishAt);

    if (Object.keys(this.error).length > 0) {
      return;
    }
    if (!this.markers.newMarker) {
      return;
    }

    this.saveRoadwork(newRoadwork);
  }

  back() {
    if (this.inputChange) {
      var modalInstance = this.modal('back');
      // modalInstance.onHidden?.subscribe({
      //   next: (reponse:string) => {
      //     if (reponse === 'yes') {
      //       this.router.navigateByUrl('/roadworks')
      //     }
      //   }
      // })
    } else {
      this.router.navigateByUrl('/roadworks')
    }
  }

  deleteRoadwork(roadwork:any) {
    var modalInstance = this.modal('remove');
    // modalInstance.onHidden?.subscribe({
    //   next: (response:string) => {
    //     if (response === 'yes') {
    //       this.roadworkService.delete(roadwork._id).subscribe({
    //         next: (res) => {
    //           this.router.navigate(['/roadworks'], {queryParams: {result:"remove"}})
    //         }
    //       })
    //     }
    //   }
    // })
  }

  getPosition() {
    var options = {
      enableHighAccuracy: true,
      timeout: 10000
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.sideMap.flyTo([position.coords.latitude, position.coords.longitude])

        this.updateNewRoadwork({lat:position.coords.latitude, lng:position.coords.longitude})

        this.newRoadwork.featureCollection.features[0].geometry.coordinates = [position.coords.longitude, position.coords.latitude];
      }, (err) => {
        console.warn('ERROR(' + err.code + '): ' + err.message);
      }, options);
    } else {
      window.alert('Browser is not support getting location!!!');
    }
  }
  
  doesNotChangeValue() {
    if (!this.markers['newMarker']) {
      this.newRoadwork['tmpLocation'] = '';
    } else {
      this.newRoadwork['tmpLocation'] = this.markers['newMarker']._latlng.lat.toFixed(4) + ' , ' + this.markers['newMarker']._latlng.lng.toFixed(4);
    }
  }

  loadRoadworkByID(id:string | null) {
    if (id) {
      this.roadworkService.get(id).subscribe({
        next: (roadwork:any) => {
          this.newRoadwork = roadwork

          this.newRoadwork.startAt = new Date(this.newRoadwork.startAt)
          this.newRoadwork.finishPlan = new Date(this.newRoadwork.finishPlan)
          if (this.newRoadwork.finishAt) {
            this.newRoadwork.finishAt = new Date(this.newRoadwork.finishAt)
          }

          var latlng = L.latLng([this.newRoadwork.loc.coordinates[1], this.newRoadwork.loc.coordinates[0]])
          this.updateNewRoadwork(latlng)

          this.sideMap.flyTo(latlng, 15)
        }
      })
    }
  }

  createGeoForAnotherRoadwork() {
    this.roadworkService.query().subscribe({
      next: (roadworks:any) => {
        roadworks.forEach((roadwork:any) => {
          if (!this.route.snapshot.paramMap.get('id')) {
            var latlng = {
              lat: roadwork.featureCollection.features[0].geometry.coordinates[1],
              lng: roadwork.featureCollection.features[0].geometry.coordinates[0],
            }
            this.markers[roadwork._id] = L.marker(latlng, {
              draggable: false,
              icon: this.typeToGeoJsonIcon(roadwork.type),
              zIndexOffset: 10000,
            })
          }
        });
      }
    })
  }


  searchRoad(geo:any) {
    this.sideMap.flyTo(geo.geometry)
    this.searchText = geo.properties.name;
  }

  inputChangeMethod() {
    this.inputChange = true;
    this.updateNewRoadwork()
  };

  updateNewRoadwork(latlng?:any) {
    
    if (this.markers['newMarker']?._latlng || latlng) {
      
      this.markers['newMarker'] = L.marker(latlng || this.markers['newMarker']._latlng, {
        draggable: true,
        icon: this.newRoadwork['type'] ? this.typeListToIcon(this.newRoadwork.type) : undefined,
        zIndexOffset: 10000,
      })

      this.markers['newMarker'].on("dragend", (event:any) => {
        this.updateNewRoadwork(event.target._latlng)
      })

      if (latlng) {
        this.newRoadwork['tmpLocation'] = latlng.lat.toFixed(4) + ' , ' + latlng.lng.toFixed(4);
        this.newRoadwork.featureCollection.features[0].geometry.coordinates = [latlng.lng, latlng.lat];
      }
    }
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
