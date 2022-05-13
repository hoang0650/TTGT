import { Component, OnInit , ViewChild} from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  isCollapsed = false;
  constructor() { }
  @ViewChild('configForm', { static: true })configForm:any;
  ngOnInit(): void {
  }

}
