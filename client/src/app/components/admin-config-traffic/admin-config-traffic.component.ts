import { Component, OnInit } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { AdminComponent } from '../admin/admin.component';

@Component({
  selector: 'app-admin-config-traffic',
  templateUrl: './admin-config-traffic.component.html',
  styleUrls: ['./admin-config-traffic.component.css'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class AdminConfigTrafficComponent implements OnInit {

  constructor(public admin:AdminComponent) { }

  ngOnInit(): void {
  }

}
