import { Component, OnInit } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { MessageService } from 'src/app/services/message.service';
@Component({
  selector: 'app-admin-config-confirm',
  templateUrl: './admin-config-confirm.component.html',
  styleUrls: ['./admin-config-confirm.component.css']
})
export class AdminConfigConfirmComponent implements OnInit {
  adminConfirm = true;
  getPopup:any
  type?:string;
  form: any;
  isVisible:boolean=true;
  isConfirmLoading:boolean=true;
  constructor(public message:MessageService,private modalRef:NzModalRef,private modalService:NzModalService) {
    this.getPopup = this.message.getMessageObj();
   }

  ngOnInit(): void {
    this.form = this.getPopup.POPUP(this.type,'')
  }
  yes() {
    this.modalService.confirm({nzClosable:true,nzAutofocus:'ok'},'confirm');
    this.modalRef.close('yes')
  };

  no() {
    this.modalService.confirm({nzClosable:true,nzAutofocus:'cancel'},'confirm');
    this.modalRef.close('no')
  };

}
