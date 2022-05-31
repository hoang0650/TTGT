import { Component, Input, OnInit, ViewChild } from '@angular/core';
import _ from 'lodash';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-static-map-modal',
  templateUrl: './static-map-modal.component.html',
  styleUrls: ['./static-map-modal.component.css']
})
export class StaticMapModalComponent implements OnInit {
  @Input() type?: string;
  @Input() listColumn: any;

  listColumnType: any;
  column: any;
  newColumn: any;
  deleteMode: boolean;
  response: any;
  errorIdMessage?: string;

  constructor(private modalRef:NzModalRef) { 
    this.deleteMode = false;

    this.listColumnType = [
      {
        name: 'Chữ',
        type: 'text'
      },
      {
        name: 'Đường',
        type: 'road'
      }
    ];
  }

  ngOnInit(): void {
    this.newColumn = this.column ? _.cloneDeep(this.column) : {};
  }

  // $scope.newColumn = angular.copy(column);
  
  // if (!$scope.newColumn.type) {
  //     $scope.newColumn.type = 'text';
  // }

  // $scope.type = type;



  idChange(id: string) {
      delete this.errorIdMessage;
      
      this.listColumn.forEach((column:any) => {
        
          if (id === column.id) {
            this.errorIdMessage = 'Mã cột bị trùng';
          }
      });
  }

  ok() {
    if (!this.errorIdMessage) {
      if (!this.column) {
        this.modalRef.close({
          action: "create",
          column: this.newColumn
        })
      } else {
        this.modalRef.close({
          action: "update",
          column: this.newColumn
        })
      }
      this.response = {
        result: this.newColumn
      }
    }
  }

  cancel() {
    this.modalRef.close("cancel")
  }

  deleteColumn() {    
    this.modalRef.close({
      action: "remove",
      column: this.column
    })
  }

  changeMode() {
    this.deleteMode = !this.deleteMode;
  }
}
