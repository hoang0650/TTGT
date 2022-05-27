import { Component, OnInit,Input } from '@angular/core';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { Location } from '@angular/common'
import { AppComponent } from 'src/app/app.component';
// import {Menu} from 'ng-zorro-antd';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() roles:string[] = []
  isCollapsed = false;
  constructor(public auth:AuthorizationService, public appCom:AppComponent, private location:Location) { }

  ngOnInit(): void {
  }
  
  login(){
    return this.auth.login();
  }

  logout(){
    return this.auth.logout();
  }

  isActive(viewLocation: string) {
    return this.location.path() == viewLocation;
  }

  isActiveList(viewLocationList: string[]) {
    for (let viewLocation of viewLocationList) {
      if (viewLocation.includes('*')) {
        if (this.location.path().startsWith(viewLocation.slice(0, -2))) {

          return true
        }
      }
    }
    return viewLocationList.includes(this.location.path());
  }

  // getProFile(){
  //   return this.auth.profile;
  // }


  

}
