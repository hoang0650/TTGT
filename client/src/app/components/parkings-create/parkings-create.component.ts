import { animate, state, style, transition, trigger } from '@angular/animations';
import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import L from 'leaflet';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ConfigureService } from 'src/app/services/configure.service';
import { MessageService } from 'src/app/services/message.service';
import { ParkingService } from 'src/app/services/parking.service';
import { StaticService } from 'src/app/services/static.service';
import { AdminConfigConfirmComponent } from '../admin-config-confirm/admin-config-confirm.component';

@Component({
  selector: 'app-parkings-create',
  templateUrl: './parkings-create.component.html',
  styleUrls: ['./parkings-create.component.css'],
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
export class ParkingsCreateComponent implements OnInit {
  searchText = "";
  listRoads: any;
  sideMap: any;
  markers: any;
  isCreate: boolean;
  button: any;
  inputChange: boolean;
  newParking: any;
  error: any;
  markerParkingIconSelected: any;
  validateParking: any;
  districtList: any;

  constructor(public configure:ConfigureService, private messageService:MessageService, private router:Router, private staticData:StaticService, private parkingService:ParkingService, private route:ActivatedRoute, private location:Location, private cdRef:ChangeDetectorRef, private nzModalService:NzModalService) { 
    this.isCreate = !this.route.snapshot.paramMap.get('id')
    this.inputChange = false;
    this.button = this.messageService.getMessageObj().BUTTON;
    this.error = {}
    this.markers = {}

    this.validateParking = ['name', 'addr', 'dist', 'tmpLocation', 'cap', 'price_details', 'worktime_details']

    this.newParking = {
      vehicle_type: {},
      price: {
        car: {},
        bike: {}
      },
      worktime: {},
      dist: ""
    }

    this.markerParkingIconSelected = L.divIcon({
      className: ['marker-parking', 'selected'].join(' '),
      iconSize: [33.5, 40],
      iconAnchor: [16.5, 36.5]
    })
  }

  ngOnInit(): void {
  
  }

  initMap(map:any) {
    this.sideMap = map

    this.staticData.loadDistrictAPI().subscribe({
      next: (hcmDistricts) => {
        this.districtList = hcmDistricts;
      }
    });

    if (!this.isCreate) {
      this.loadParkingByID(this.route.snapshot.paramMap.get('id'));
      this.location.replaceState("./parkings/update")
    }
  }

  loadParkingByID(id:string | null) {
    if (id) {
      this.parkingService.get(id).subscribe({
        next: (parking:any) => {
          this.newParking = parking
          
          if (!this.newParking['vehicle_type']) {
            this.newParking['vehicle_type'] = {}
          }

          if (!this.newParking['worktime']) {
            this.newParking['worktime'] = {}
          }

          if (!this.newParking['price']) {
            this.newParking['price'] = {
              car: {},
              bike: {}
            }
          }

          var latlng = L.latLng([this.newParking.loc.coordinates[1], this.newParking.loc.coordinates[0]])
          this.updateNewParking(latlng)

          this.sideMap.flyTo(latlng, 15)
        }
      })
    }
  };

  selectPosition(event:any) {
    this.updateNewParking(event.latlng)
    this.inputChange = true;
  }

  doesNotChangeValue() {
    if (!this.markers['newMarker']) {
      this.newParking['tmpLocation'] = '';
    } else {
      this.newParking['tmpLocation'] = this.markers['newMarker']._latlng.lat.toFixed(4) + ' , ' + this.markers['newMarker']._latlng.lng.toFixed(4);
    }
  }

  modal(type:string) {
    var form = this.messageService.getMessageObj().POPUP(type,'');
    return this.nzModalService.create({
      nzContent: AdminConfigConfirmComponent,
      nzComponentParams: {
        form: form
      }
    })
  }

   validateError (prk:any) {
    this.validateParking.forEach((element:string) => {
      if (prk) {
        if (!prk[element]) {
          this.error[element] = this.messageService.WARNING.fieldRequire;
        } else {
          delete this.error[element];
        }
      } else {
        this.error[element] = this.messageService.WARNING.fieldRequire;
      }
    });
  };

  validateFieldInvalid(parking:any) {
    if (parking.worktime) {
      if (parking.worktime.startWorking >= parking.worktime.endWorking) {
        this.error.working = this.messageService.WARNING.timeInvalid;
      } else {
        delete this.error.working;
      }
    }
    if (!parking.vehicle_type.car) {
        delete this.error.priceCar;
    } else {
      if (parking.price) {
        if (!parking.price.car) {
          this.error.priceCar = this.messageService.WARNING.fieldRequire;
        } else {
          if (parking.price.car.min === undefined || parking.price.car.max === undefined || parking.price.car.min === null || parking.price.car.max === null) {
            this.error.priceCar = this.messageService.WARNING.fieldRequire;
          } else {
            delete this.error.priceCar;
          }
        }
      } else {
        delete this.error.priceCar;
      }
    }
    if (parking.vehicle_type.bike) {
      if (parking.price) {
        if (parking.price.bike) {
            if (parking.price.bike.min === undefined || parking.price.bike.max === undefined || parking.price.bike.min === null || parking.price.bike.max === null) {
              this.error.priceBike = this.messageService.WARNING.fieldRequire;
            } else {
              delete this.error.priceBike;
            }
        } else {
          this.error.priceBike = this.messageService.WARNING.fieldRequire;
        }
      } else {
        delete this.error.priceBike;
      }
    } else {
      delete this.error.priceBike;
    }
  };


  create(parking:any) {
    this.validateError(parking);
    this.validateFieldInvalid(parking);
    if (Object.keys(this.error).length > 0) {
      return;
    }

    var loc = {
        type: 'Point',
        coordinates:
        [
          this.markers['newMarker']._latlng.lng,
          this.markers['newMarker']._latlng.lat,
        ]
    };

    parking.loc = loc;


    if (this.isCreate) {
        this.parkingService.save(parking).subscribe({
          next: (res) => {
            this.router.navigate(['/parkings'], {
              queryParams: {
                result: "create",
                id: parking._id
              }
            });
            // this.noti.showNotification('top','center');
            
          }, error: (err) => {
            // this.noti.dangerNotification('top','center');
          }
        })
    } else {
      this.parkingService.update(parking._id, parking).subscribe({
        next: (res) => {
          this.router.navigate(['/parkings'], {
            queryParams: {
              result: "update",
              id: parking._id
            }
          });
          // this.noti.showNotification('top','center');
        }, error: (err) => {
          // this.noti.dangerNotification('top','center');
        }
      })
    }

  };

  deleteParking(parking:any) {
    var modalInstance = this.modal('remove');
    modalInstance.afterClose.subscribe({
      next: (res) => {
        if (res === 'yes') {
          this.parkingService.delete(parking._id).subscribe({
            next: (res) => {
              this.router.navigate(['/parkings'], {
                queryParams: {
                  result:"remove"
                }
              });
              // this.noti.showNotification('top','center');
            }, error: (err)=>{
              // this.noti.dangerNotification('top','center');
            }
          })
        }
      }
    })
  };

  back() {
    if (this.inputChange) {
      var modalInstance = this.modal('back');
      // modalInstance.onHidden?.subscribe({
      //   next: (reponse:string) => {
      //     if (reponse === 'yes') {
      //       this.router.navigateByUrl('/parkings')
      //     }
      //   }
      // })
    } else {
      this.router.navigateByUrl('/parkings')
    }
  }

  inputChangeMethod() {
    this.inputChange = true;
    this.updateNewParking()
  };

  updateNewParking(latlng?:any) {
    
    if (this.markers['newMarker']?._latlng || latlng) {
      
      this.markers['newMarker'] = L.marker(latlng || this.markers['newMarker']._latlng, {
        draggable: true,
        icon: this.markerParkingIconSelected,
        zIndexOffset: 10000,
      })

      this.markers['newMarker'].on("dragend", (event:any) => {
        this.updateNewParking(event.target._latlng)
      })

      if (latlng) {
        this.newParking['tmpLocation'] = latlng.lat.toFixed(4) + ' , ' + latlng.lng.toFixed(4);
      }
    }
  }

  getPosition() {
    var options = {
      enableHighAccuracy: true,
      timeout: 10000
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.sideMap.flyTo([position.coords.latitude, position.coords.longitude])

        this.updateNewParking({lat:position.coords.latitude, lng:position.coords.longitude})
      }, (err) => {
        console.warn('ERROR(' + err.code + '): ' + err.message);
      }, options);
    } else {
      window.alert('Browser is not support getting location!!!');
    }
  }

  searchRoad(geo:any) {
    this.sideMap.flyTo([geo.geometry.coordinates[1], geo.geometry.coordinates[0]], 15)
    this.searchText = geo.properties.name;
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
