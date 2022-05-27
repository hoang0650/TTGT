import { Component, OnInit } from '@angular/core';
import { ConfigureService } from 'src/app/services/configure.service';
import { MapService } from 'src/app/services/map.service';
import { AppComponent } from 'src/app/app.component';
import { NewService } from 'src/app/services/new.service';
import * as AOS from 'aos';
declare var $: any;
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  isScrolled:boolean = false;
  currentState:boolean = false;
  active = 0;
  noWrapSlides:boolean = true;
  contents:any;
  favoriteList: any;
  // imageError = configure.backend + 'api/setting/getimageerror';
  backend!: string;
  listEventType:any;
  listEvent: any;

  constructor(public appCom: AppComponent,private configure:ConfigureService, private mapService:MapService, private newService:NewService) { }

  ngOnInit(): void {
    AOS.init();
    this.getAllType()
    this.getInfoOfUser()
    this.newService.getNew().subscribe({
      next: (res:any) => {

        
      }
    })
  }

  imageError(event:any) {
    event.target.src = this.configure.backend + 'api/setting/getimageerror'
  }
  
  // NewServices.getNew(function(res) {
  //     _this.contents = res;
  // }) ;

  getInfoOfUser() {
    this.mapService.getInfoOfUser().subscribe({
      next: (res:any) => {
        this.favoriteList = []
        res.favorite.forEach((item:any) => {
          if (item.fType == 'camera') {
            this.favoriteList.push(item)
          }
        })
        console.log(this.favoriteList)
      }
    });
  }

  pullDown() {
    $('html, body').animate({ scrollTop: window.innerHeight - 50 });
  }


  getAllEvent() {
    this.mapService.getAllEvent().subscribe({
      next: (res) => {
        this.listEvent = res
        
        if (this.listEventType) {
          this.listEvent.forEach((event:any) => {
            event.color = this.listEventType[event.type].color;
          });
        }
      }
    })
  }


  getAllType() {
    this.mapService.getAllType().subscribe({
      next: (res) => {
        this.listEventType = res;
        this.getAllEvent();
      }
    })
  }

}
