import { Component } from '@angular/core';
import 'leaflet-sidebar-v2';
import 'leaflet-rotatedmarker';
import { AuthorizationService } from './services/authorization.service';
import {AuthService} from '@auth0/auth0-angular';
import { AdminService } from './services/admin.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'client';
  profile?:any;
  constructor(public auth:AuthorizationService, public authservice:AuthService, public admin:AdminService){}

  ngOnInit():void{
    setTimeout(()=>{
      this.getLogin();
    },2000)
   
  }

  getLogin() {
    this.authservice.getUser().subscribe({
      next: (user:any) => {
        // const accessToken = localStorage.getItem('access_token');
        // if (!accessToken) {
        //   throw new Error('Access token must exist to fetch profile');
        // }
        this.profile = user
        if(this.profile){
          this.auth.userHasRoles
          this.auth.authorize
          localStorage.setItem('profile', JSON.stringify(this.profile));
          
        }
      },
      error: (err)=>{
        return err;
      },
    });
  }


}
