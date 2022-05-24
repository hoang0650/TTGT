import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-admin-notification',
  templateUrl: './admin-notification.component.html',
  styleUrls: ['./admin-notification.component.css']
})
export class AdminNotificationComponent implements OnInit {
  @Input() currentSession?:string;

  constructor(private modalRef:NzModalRef) { }

  ngOnInit(): void {
    
  }

  close() {
    this.modalRef.close()
  }
}
