import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent implements OnInit {

  constructor(private message: NzMessageService) { }

  ngOnInit(): void {
    this.message.create('warning', 'Bạn không có quyền truy cập vô trang này!!!');
  }

}
