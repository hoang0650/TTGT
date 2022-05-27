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
    this.message.create('warning', 'Quyền truy cập bị giới hạn');
  }

}
