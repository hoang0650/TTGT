import { Component, OnInit } from '@angular/core';
import { AdminComponent } from '../admin/admin.component';

@Component({
  selector: 'app-admin-config-test',
  templateUrl: './admin-config-test.component.html',
  styleUrls: ['./admin-config-test.component.css']
})
export class AdminConfigTestComponent implements OnInit {

  constructor(public admin:AdminComponent) { }

  ngOnInit(): void {
  }

}
