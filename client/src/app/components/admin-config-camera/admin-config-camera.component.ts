import { Component, OnInit } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { AdminComponent } from '../admin/admin.component';
@Component({
  selector: 'app-admin-config-camera',
  templateUrl: './admin-config-camera.component.html',
  styleUrls: ['./admin-config-camera.component.css'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class AdminConfigCameraComponent implements OnInit {
  mess: any;
  constructor(public admin:AdminComponent) { }

  ngOnInit(): void {
  }

}
