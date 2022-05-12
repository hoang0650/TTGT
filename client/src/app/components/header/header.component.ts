import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { AuthService } from '@auth0/auth0-angular';
import { AppComponent } from 'src/app/app.component';
// import {Menu} from 'ng-zorro-antd';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isCollapsed = false;
  constructor(public auth:AuthorizationService, public auth0:AuthService, public appCom:AppComponent) { }

  ngOnInit(): void {
  }
  
  login(){
    return this.auth.login();
  }

  logout(){
    return this.auth.logout();
  }

  // getProFile(){
  //   return this.auth.profile;
  // }


  

}
