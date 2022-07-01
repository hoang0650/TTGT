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
    this.event.tmpStatus = 'editing'
    this.eventManager.setDraggable(this.event, true)
    this.tmpEvent = _.cloneDeep(this.event)
    this.isEdit = true
    this.cdRef.detectChanges()
  }

  cancelEditor() {
    this.event.tmpStatus = this.event.status
    this.eventManager.setDraggable(this.event, false)
    delete this.tmpEvent
    this.isEdit = false
    this.cdRef.detectChanges()
  }

  removeEventImage() {
    if (this.tmpEvent) {
      delete this.tmpEvent['snapshot'];
      this.cdRef.detectChanges()
    }
  }

  previewImage(event:any) {
    var imageUpload:any = document.getElementById('imageUpload');
    if (imageUpload != null && typeof (FileReader) !== 'undefined') {
      var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.gif|.png|.bmp)$/;
      var file = imageUpload.files[0];
      if (regex.test(file.name.toLowerCase())) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e:any) => {
          event['snapshot'] = e.currentTarget.result
          this.cdRef.detectChanges()
        };     
      }
    }
    
  }

  closePopup() {
    this.eventManager.markers[this.event?._id]?.closePopup()
  }

  chooseTypeEvent(event:any) {
    var eventType = this.eventManager.listEventType[event.type];
    this.eventManager.chooseTypeEvent(event)
    this.tmpEvent.desc[1] = eventType.name;
    this.cdRef.detectChanges()
  }
}
