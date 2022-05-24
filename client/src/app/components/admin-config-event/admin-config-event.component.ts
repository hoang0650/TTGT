import { Component, OnInit } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { AdminComponent } from '../admin/admin.component';

@Component({
  selector: 'app-admin-config-event',
  templateUrl: './admin-config-event.component.html',
  styleUrls: ['./admin-config-event.component.css'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class AdminConfigEventComponent implements OnInit {

  constructor(public admin:AdminComponent) { }

  ngOnInit(): void {
  }

}
