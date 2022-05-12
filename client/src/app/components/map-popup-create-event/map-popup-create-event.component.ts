import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MapComponent } from '../map/map.component';

declare var $: any;

@Component({
  selector: 'app-map-popup-create-event',
  templateUrl: './map-popup-create-event.component.html',
  styleUrls: ['./map-popup-create-event.component.css']
})
export class MapPopupCreateEventComponent implements OnInit {
  event: any;
  
  constructor(public map:MapComponent, public cdRef:ChangeDetectorRef) {

  }

  ngOnInit(): void {
    
  }

  closePopup() {
    this.map.markers['incidents'][this.event?._id].closePopup()
  }
}
