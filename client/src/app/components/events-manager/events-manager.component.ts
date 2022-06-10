import { ChangeDetectorRef, Component, ComponentFactoryResolver, Injector, OnDestroy, OnInit } from '@angular/core';
import L from 'leaflet';
import _ from 'lodash';
import { ConfigureService } from 'src/app/services/configure.service';
import { EventService } from 'src/app/services/event.service';
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
  jamIcon: any;
  eventPopup: any;
  selectedEvent: any;
  sidebar: any;
  component: any;


  constructor(public mapCom:MapComponent, private configure:ConfigureService, private eventService:EventService, private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector, private cdRef:ChangeDetectorRef) {
    this.status = "created"
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
      }
    };

    this.statusListArray = [
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
        id: 'all',
        name: 'Tất cả'
      },
    ]

    this.jamIcon = {
      normal: {
        html: '<div class="marker-jam-normal"></div>',
        iconSize: null,
        popupAnchor: [0, -52.5]
      },
      congestion: {
        html: '<div class="marker-jam-moderate"></div>',
        iconSize: null,
        popupAnchor: [0, -52.5]
      },
      incident: {
        html: '<div class="marker-jam-incident"></div>',
        iconSize: null,
        popupAnchor: [0, -52.5]
      },
      jam: {
        html: '<div class="marker-jam-extreme"></div>',
        iconSize: null,
        popupAnchor: [0, -52.5]
      },
      flood: {
        html: '<div class="marker-jam-flood"></div>',
        iconSize: null,
        popupAnchor: [0, -52.5]
      },
      default: {
        html: '<div class="marker-jam-default"></div>',
        iconSize: null,
        popupAnchor: [0, -52.5]
      }
    };

    this.sideMap = mapCom.sideMap
    this.markers = mapCom.markers
  }


  ngOnInit(): void {
    $(".ui.dropdown").dropdown()
    this.refresh()
    this.mapCom.toggleLayout(true)
  }

  ngOnDestroy(): void {
    this.mapCom.removeLayers()
    this.mapCom.toggleLayout(false)
  }
  

  createMarkerEvent(event:any) {
    return L.marker([event.loc.coordinates[1], event.loc.coordinates[0]], {
      zIndexOffset: 1000,
      icon: L.divIcon(this.jamIcon[event.type]),
      draggable: false
    })
    // return {
    //   lat: event.loc.coordinates[1],
    //   lng: event.loc.coordinates[0],
    //   zIndexOffset: 1000,
    //   icon: jamIcon[event.type],
    //   draggable: false,
    //   event: event
    // };
  };

  drawMarker(listEvents:any) {
    this.removeMarkers()
    listEvents.forEach((event:any) => {
      this.markers[event._id] = this.createMarkerEvent(event);
      var popup = L.popup({
        closeButton:false,
        className:'stis-create-incident-popup'
      }).setContent(this.createCustomPopup(event))


      this.markers[event._id].bindPopup(popup)

    });
  };

  filterListEvent() {
    if (this.status === 'all') {
      this.filter = {}
    } else {
      this.filter = {status: this.status};
    }

    if (this.listEvents) {
      this.listEventsForFilter = _.filter(this.listEvents, this.filter);
      
      this.drawMarker(this.listEventsForFilter);
    }
  };

  getAllEventInData() {
    this.eventService.getAllEventInData().subscribe({
      next: (res:any) => {
        
        this.listEvents = res
        
        this.listEvents.forEach((event:any, index:number) => {
          event.color = this.listEventType[event.type].color;
        })
        this.isLoadingStatus = false
        this.filterListEvent()
      }
    })
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

  drawMarkers() {
    this.removeMarkers()
    
    this.listEvents.forEach((trafficEvent:any) => {
      var latlng = [trafficEvent.loc.coordinates[1], trafficEvent.loc.coordinates[0]]
      
      var popup = L.popup({
        closeButton:false,
        className:'stis-create-incident-popup'
      }).setContent(this.createCustomPopup(trafficEvent))

      var marker = this.createTrafficEventMarker(latlng, trafficEvent.type).bindPopup(popup).on({
        popupopen: () => {
          // this.sidebar?.open("incidents")
          // this.chooseIncident(trafficEvent)
        }
      })

      this.sideMap?.addLayer(marker)
      this.markers[trafficEvent._id] = marker
    }) 
  }

  createTrafficEventMarker(latlng:any, type:string) {
    var icon = this.jamIcon[type]
    icon.iconSize = [33.5, 40]
    icon.iconAnchor = [0, 0]

    return L.marker(latlng, {
      icon: L.divIcon(icon),
      draggable: false,
    })
  }

  getAllType() {
    this.eventService.getAllType().subscribe({
      next: (res:any) => {
        this.listEventType = res
        
        this.getAllEventInData();
      }
    })
  };

  refresh() {
    this.listEventsForFilter = []
    this.isLoadingStatus = true;
    this.getAllType();
  };

  chooseEvent(event:any) {
    if (this.selectedEvent === event) {
      // createEventPopup(L.latLng(event.loc.coordinates[1], event.loc.coordinates[0]), currentMode);
    } else {
      this.selectedEvent = event;
      // createEventPopup(L.latLng(event.loc.coordinates[1], event.loc.coordinates[0]), 'view');
    }

    if (this.chooseEventId && this.markers[this.chooseEventId]) {
      this.markers[this.chooseEventId].zIndexOffset = 1000;
    }
    this.chooseEventId = event._id;
    this.sideMap.flyTo([event.loc.coordinates[1], event.loc.coordinates[0]]);
    this.markers[event._id].openPopup()
  };

  approveEvent(event:any) {
    this.eventService.approveEvent(event._id, event).subscribe({
      next: (res) => {
        event['tmpStatus'] = 'approved'
      }
    })
  };

  rejectEvent(event:any) {
    this.eventService.rejectEvent(event._id, event).subscribe({
      next: (res) => {
        event['tmpStatus'] = 'rejected'
      }
    })
  };

  updateEvent(event:any) {
    this.eventService.updateEvent(event._id, event).subscribe({
      next: (res) => {
        this.getAllType();
      }
    })
  };

  expireEvent(event:any) {
    this.eventService.expireEvent(event._id, event).subscribe({
      next: (res) => {
        event['tmpStatus'] = 'expired'
      }
    })
  };

  createCustomPopup(trafficEvent?:any, isNew=false) { 
    if( this.component && isNew) {
      this.component?.destroy()
    }
    const factory = this.componentFactoryResolver.resolveComponentFactory(EventsManagerPopupComponent);
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
}
