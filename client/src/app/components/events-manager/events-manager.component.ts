import { ChangeDetectorRef, Component, ComponentFactoryResolver, Injector, OnDestroy, OnInit } from '@angular/core';
import L from 'leaflet';
import _ from 'lodash';
import { Subscription } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { EventService } from 'src/app/services/event.service';
import { MarkerService } from 'src/app/services/marker.service';
import { EventsManagerPopupComponent } from '../events-manager-popup/events-manager-popup.component';
import { MapComponent } from '../map/map.component';

declare var $:any;

@Component({
  selector: 'app-events-manager',
  host: {
    class: 'map-layout-info-container'
  },
  templateUrl: './events-manager.component.html',
  styleUrls: ['./events-manager.component.css'],
})
export class EventsManagerComponent implements OnInit, OnDestroy {
  statusList: any;
  statusListArray: any;
  status: string;
  sideMap: any;
  listEventType: any;
  listEvents: any;
  listEventsForFilter: any;
  chooseEventId: any;
  filter: any;
  isLoadingStatus: boolean;
  markers: any;
  eventPopup: any;
  selectedEvent: any;
  sidebar: any;
  component: any;


  constructor(public mapCom:MapComponent, private eventService:EventService, private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector, public appCom:AppComponent, private cdRef:ChangeDetectorRef, private markerService:MarkerService) {
    this.status = "all"
    this.filter = {status:this.status}
    this.markers = {}
    this.isLoadingStatus = false;
    this.listEvents = []
    this.listEventsForFilter = []

    this.statusList = {
      all: {
        id: 'all',
        name: 'Tất cả'
      },
      created: {
        id: 'created',
        name: 'Mới',
        icon: 'star',
        color: 'blue'
      },
      approved: {
        id: 'approved',
        name: 'Đã duyệt',
        icon: 'check',
        color: 'green'
  
      },
      rejected: {
        id: 'rejected',
        name: 'Không duyệt',
        icon: 'remove',
        color: 'red'
      },
      expired: {
        id: 'expired',
        name: 'Hết hạn',
        icon: 'hourglass end',
        color: 'red'
      },
      editing: {
        id: 'editing',
        name: 'Đang sửa',
        icon: 'pen',
        color: 'blue'
      },
    };

    this.statusListArray = [
      {
        id: 'all',
        name: 'Tất cả'
      },
      {
        id: 'created',
        name: 'Mới',
      },
      {
        id: 'approved',
        name: 'Đã duyệt',
      },
      {
        id: 'rejected',
        name: 'Không duyệt',
      },
      {
        id: 'expired',
        name: 'Hết hạn',
      },
    ]

    this.sideMap = mapCom.sideMap
    this.markers = mapCom.markers
  }


  ngOnInit(): void {
    this.refresh()
    this.mapCom.toggleLayout(true)

    this.mapCom.subscriptions.add(this.receiveEventStream())
  }

  ngOnDestroy(): void {
    this.mapCom.removeLayers()
    this.mapCom.toggleLayout(false)
  }

  receiveEventStream() {
    return this.eventService.streamEvent().subscribe({
      next: (data:any) => {
        if (!this.isLoadingStatus) {
          
          if (data.type && data.data) {
            
            let newEvent = data.data
            newEvent.color = this.listEventType[newEvent.type].color;

            if (data.type == "updatedEvent") {
              delete this.markers[data.previousEventId]
              this.listEvents = this.listEvents.filter((event:any) => {
                return event._id != data.previousEventId && event._id != newEvent._id
              })
            } else if (data.type == "approvedEvent" || data.type == "rejectedEvent" || data.type == "expiredEvent") {
              this.listEvents = this.listEvents.filter((event:any) => {
                return event._id != newEvent._id
              })
            } 

           
            delete this.markers[newEvent._id]
            if (newEvent.status == this.status || this.status == 'all') {
              this.drawMarker(newEvent)
            }

            this.listEvents.push(newEvent)
            this.filterListEvent()
          }
        }
      }
    })
  }
  
  createNewMarkerEvent(event:any) {
    var icon = _.cloneDeep(this.markerService.jamIcon[event.type])

    
    icon.html +=  `<div class="circle-cluster blue"><i class="pen icon m-0 mt-1"></i></div>`

    icon.className = 'creEventMarker';
    if (this.statusList[event.status].color == 'blue' || this.statusList[event.status].color == 'red') {
      icon.className += ' opacity';
    }

    return L.marker([event.loc.coordinates[1], event.loc.coordinates[0]], {
      zIndexOffset: 1000,
      icon: L.divIcon(icon),
      draggable: true
    })
  };

  createMarkerEvent(event:any) {
    var icon = _.cloneDeep(this.markerService.jamIcon[event.type])
    icon.html +=  `<div class="circle-cluster ${this.statusList[event.status].color}"><i class="${this.statusList[event.status].icon} icon m-auto"></i></div>`
    icon.className = 'creEventMarker';
    if (this.statusList[event.status].color == 'blue' || this.statusList[event.status].color == 'red') {
      icon.className += ' opacity';
    }
    
    return L.marker([event.loc.coordinates[1], event.loc.coordinates[0]], {
      zIndexOffset: 1000,
      icon: L.divIcon(icon),
      draggable: false
    })
  };

  drawMarker(event:any) {
    if (this.markers[event._id]) {
      delete  this.markers[event._id]
    }

    this.markers[event._id] = this.createMarkerEvent(event);
    var popupComponent = this.createCustomPopup(event)
    var popup = L.popup({
      closeButton:false,
      className:'stis-create-incident-popup'
    }).setContent(popupComponent.location.nativeElement)
    
    event.popupComponent = popupComponent

    this.markers[event._id].bindPopup(popup).on({
      popupopen: () => {        
        
        this.chooseEventId = event._id
        this.cdRef.detectChanges()
        document.getElementById("incident_"+event._id)?.scrollIntoView({
          behavior:'smooth',
          block: 'end',
        })

        setTimeout(() => $(".ui.dropdown").dropdown(), 250)
      },
      dragend: (target:any) => {
        if (event.popupComponent.instance.tmpEvent) {
          var latlng = target.target._latlng
          event.popupComponent.instance.tmpEvent.loc.coordinates[1] = latlng.lat
          event.popupComponent.instance.tmpEvent.loc.coordinates[0] = latlng.lng
        }
      }
    })
  }

  drawMarkers(listEvents:any) {
    this.removeMarkers()
    listEvents.forEach((event:any) => {
      this.markers[event._id] = this.createMarkerEvent(event);
      var popupComponent = this.createCustomPopup(event)
      var popup = L.popup({
        closeButton:false,
        className:'stis-create-incident-popup'
      }).setContent(popupComponent.location.nativeElement)

      event.popupComponent = popupComponent

      this.markers[event._id].bindPopup(popup).on({
        popupopen: () => {        
          
          this.chooseEventId = event._id
          this.cdRef.detectChanges()
          document.getElementById("incident_"+event._id)?.scrollIntoView({
            behavior:'smooth',
            block: 'end'
          })

          setTimeout(() => $(".ui.dropdown").dropdown(), 250)
        },
        dragend: (target:any) => {
          if (event.popupComponent.instance.tmpEvent) {
            var latlng = target.target._latlng
            event.popupComponent.instance.tmpEvent.loc.coordinates[1] = latlng.lat
            event.popupComponent.instance.tmpEvent.loc.coordinates[0] = latlng.lng
          }
        }
      })

    });
  };

  filterListEvent(color?:string) {
    var tmpColor = this.filter['color']

    if (color) {
      if (color != tmpColor) {
        tmpColor = color
      } else {
        tmpColor = ""
      }
    }

    
    if (this.status === 'all') {
      this.filter = {}
    } else {
      this.filter = {status: this.status};
    }

    if (tmpColor) {
      this.filter['color'] = tmpColor
    }
    
    if (this.listEvents) {
      this.listEventsForFilter = _.filter(this.listEvents, this.filter);
    }
  };

  getAllEventInData() {
    this.mapCom.subscriptions.add(this.eventService.getAllEventInData().subscribe({
      next: (res:any) => {
        
        this.listEvents = res
        
        this.listEvents.forEach((event:any) => {
          event.color = this.listEventType[event.type].color;
        })
        this.isLoadingStatus = false
        this.filterListEvent()
          
        this.drawMarkers(this.listEventsForFilter);
      },
      error: (err) => {
        this.appCom.errorHandler(err)
      }
    }))
  };

  removeMarkers() {
    if (this.markers) {
      Object.keys(this.markers).forEach((id:string) => {
        this.markers[id].closePopup()
      })
      this.mapCom.markers = {}
      this.markers = this.mapCom.markers
    }
  }

  getAllType() {
    this.mapCom.subscriptions.add(this.eventService.getAllType().subscribe({
      next: (res:any) => {
        this.listEventType = res
        
        this.getAllEventInData();
      },
      error: (err) => {
        this.appCom.errorHandler(err)
      }
    }))
  };

  refresh() {
    this.listEventsForFilter = []
    this.isLoadingStatus = true;
    this.getAllType();
  };

  chooseEvent(event:any) {
    if (this.selectedEvent === event) {
    } else {
      this.selectedEvent = event;
    }

    if (this.chooseEventId && this.markers[this.chooseEventId]) {
      this.markers[this.chooseEventId].zIndexOffset = 1000;
    }
    this.chooseEventId = event._id;
    this.mapCom.flyToBounds([[event.loc.coordinates[1], event.loc.coordinates[0]]]);
    this.markers[event._id].openPopup()
  };

  editEvent(event:any) {
    event.popupComponent.instance.openEditor()
    this.markers[event._id].openPopup()
    this.mapCom.detectChanges()
  }

  approveEvent(event:any) {
    var updateEvent = _.cloneDeep(event)
    delete updateEvent['popupComponent']

    this.eventService.approveEvent(updateEvent._id, updateEvent).subscribe({
      next: () => {
        event['tmpStatus'] = 'approved'
      },
      error: (err) => {
        this.appCom.errorHandler(err)
      }
    })
  };

  rejectEvent(event:any) {
    var updateEvent = _.cloneDeep(event)
    delete updateEvent['popupComponent']
    this.eventService.rejectEvent(updateEvent._id, updateEvent).subscribe({
      next: () => {
        event['tmpStatus'] = 'rejected'
      },
      error: (err) => {
        this.appCom.errorHandler(err)
      }
    })
  };

  updateEvent(event:any) {
    var updateEvent = _.cloneDeep(event)
    delete updateEvent['popupComponent']
    this.eventService.updateEvent(updateEvent._id, updateEvent).subscribe({
      next: (newEvent:any) => {
        this.filterListEvent()
        this.drawMarkers(this.listEventsForFilter);
      },
      error: (err) => {
        this.appCom.errorHandler(err)
      }
    })
  };

  expireEvent(event:any) {
    var updateEvent = _.cloneDeep(event)
    delete updateEvent['popupComponent']
    this.eventService.expireEvent(updateEvent._id, updateEvent).subscribe({
      next: () => {
        event['tmpStatus'] = 'expired'
      },
      error: (err) => {
        this.appCom.errorHandler(err)
      }
    })
  };

  createCustomPopup(trafficEvent?:any, isEdit=false) { 
    if( this.component) {
      this.component?.destroy()
    }
    const factory = this.componentFactoryResolver.resolveComponentFactory(EventsManagerPopupComponent);

    var component = factory.create(this.injector);
    component.instance.event = trafficEvent
    component.instance.isEdit = isEdit
    component.changeDetectorRef.detectChanges();
    return component

  }

  chooseTypeEvent(event:any) {
    var eventType = this.listEventType[event.type];
    if (eventType) {
      var icon = _.cloneDeep(this.markerService.jamIcon[event.type])
      
      icon.html +=  `<div class="circle-cluster ${this.statusList[event.tmpStatus].color}"><i class="${this.statusList[event.tmpStatus].icon} icon m-auto"></i></div>`
      icon['className'] = 'creEventMarker';
      if (this.statusList[event.status].color == 'blue' || this.statusList[event.status].color == 'red') {
        icon.className += ' opacity';
      }
      
      this.markers[event._id].setIcon(L.divIcon(icon))
    }
    
    this.cdRef.detectChanges();
  }

  setDraggable(event:any, active:boolean) {
    if (this.markers[event._id]) {
      setTimeout(() => $(".ui.dropdown").dropdown(), 150)
      if (active) {
        this.markers[event._id].dragging.enable()
        this.chooseTypeEvent(event)
      } else {
        this.markers[event._id].dragging.disable()
        this.chooseTypeEvent(event)
        this.markers[event._id].setLatLng([event.loc.coordinates[1], event.loc.coordinates[0]])
      }
    }
  }
}
