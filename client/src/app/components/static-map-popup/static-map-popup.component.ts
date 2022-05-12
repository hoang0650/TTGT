import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-static-map-popup',
  templateUrl: './static-map-popup.component.html',
  styleUrls: ['./static-map-popup.component.css']
})
export class StaticMapPopupComponent implements OnInit {
  properties: any;
  popupData: any;

  constructor() { }

  ngOnInit(): void {

  }

}
