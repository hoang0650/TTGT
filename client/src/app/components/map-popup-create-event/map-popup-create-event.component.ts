import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MapInformationComponent } from '../map-information/map-information.component';
import { MapComponent } from '../map/map.component';

declare var $: any;

@Component({
  selector: 'app-map-popup-create-event',
  templateUrl: './map-popup-create-event.component.html',
  styleUrls: ['./map-popup-create-event.component.css']
})
export class MapPopupCreateEventComponent implements OnInit {
  event: any;
  
  constructor(public map:MapInformationComponent, public cdRef:ChangeDetectorRef) {

  }

  ngOnInit(): void {
    setTimeout(() => {
      this.cdRef.detectChanges()
    }, 300)
  }

  closePopup() {
    this.map.incidents[this.event?._id].closePopup()
  }
}
