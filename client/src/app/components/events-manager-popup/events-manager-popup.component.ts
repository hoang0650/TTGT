import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import _ from 'lodash';
import { EventsManagerComponent } from '../events-manager/events-manager.component';

@Component({
  selector: 'app-events-manager-popup',
  templateUrl: './events-manager-popup.component.html',
  styleUrls: ['./events-manager-popup.component.css']
})
export class EventsManagerPopupComponent implements OnInit {
  event: any;
  tmpEvent: any;
  isEdit?: boolean;

  constructor(public eventManager:EventsManagerComponent, public cdRef:ChangeDetectorRef) { }

  ngOnInit(): void {
   
  }

  openEditor() {
    this.tmpEvent = _.cloneDeep(this.event)
    this.isEdit = true
  }

  closePopup() {
    this.eventManager.markers[this.event?._id]?.closePopup()
  }
}
