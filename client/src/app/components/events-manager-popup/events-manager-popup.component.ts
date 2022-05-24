import { Component, OnInit } from '@angular/core';
import { EventsManagerComponent } from '../events-manager/events-manager.component';

@Component({
  selector: 'app-events-manager-popup',
  templateUrl: './events-manager-popup.component.html',
  styleUrls: ['./events-manager-popup.component.css']
})
export class EventsManagerPopupComponent implements OnInit {
  event: any;

  constructor(public eventManager:EventsManagerComponent) { }

  ngOnInit(): void {
  }

  closePopup() {
    this.eventManager.markers[this.event?._id]?.closePopup()
  }
}
