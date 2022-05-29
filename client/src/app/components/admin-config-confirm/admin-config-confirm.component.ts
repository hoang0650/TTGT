import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-admin-config-confirm',
  templateUrl: './admin-config-confirm.component.html',
  styleUrls: ['./admin-config-confirm.component.css']
})
export class AdminConfigConfirmComponent implements OnInit {
  adminConfirm = true;
  @Input() form?: any;
  @Input() isMessage?: any;

  constructor(private modalRef:NzModalRef) {
    
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
