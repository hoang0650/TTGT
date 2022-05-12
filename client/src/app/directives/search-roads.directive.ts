import { Directive, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import * as _ from 'lodash'
import { ConfigureService } from '../services/configure.service';
import { GeocodingService } from '../services/geocoding.service';

@Directive({
  selector: '[appSearchRoads]'
})

export class SearchRoadsDirective {
  @Output() newListRoads: EventEmitter<any> = new EventEmitter<any>()
  @Output() isSearch: EventEmitter<boolean> = new EventEmitter<boolean>()
  @Input() appSearchRoadsText = ""
  
  debounce = _.debounce(() => {
    this.searchRoad()
  },500)
  center: any;

  constructor(public geocoding:GeocodingService,  public el: ElementRef, public configure:ConfigureService) {
    this.center = configure.baselayer.location.center
   }

  @HostListener("keyup") search() {
    if (this.appSearchRoadsText.length > 0) {
      this.debounce.cancel()
      this.debounce()
    } else {
      this.isSearch.emit(false)
    }
  }

  searchRoad() {
    this.geocoding.geocodingByText({q:this.appSearchRoadsText, lat:this.center[1], lon:this.center[0], limit:5}).subscribe({
      next: (res:any) => {
        if (res?.features?.length >= 0) {
          this.newListRoads.emit(res.features)
          this.isSearch.emit(true)
        } else {
          this.isSearch.emit(false)
        }
      }
    })
  }
}
