import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { MessageService } from 'src/app/services/message.service';
@Component({
  selector: 'app-admin-config-confirm',
  templateUrl: './admin-config-confirm.component.html',
  styleUrls: ['./admin-config-confirm.component.css']
})
export class AdminConfigConfirmComponent implements OnInit {
  adminConfirm = true;
  @Input() form?: any;

  constructor(private modalRef:NzModalRef,private modalService:NzModalService) {
    
  }

  ngOnInit(): void {
    
  }

  yes() {
    this.modalRef.close('yes')
  };

  no() {
    this.modalRef.close('no')
  };

}
