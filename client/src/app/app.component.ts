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
  idToken ='';
  roles = ['guest'];
  loginInterval?:any
  loginTry = 0;
  constructor(public auth:AuthorizationService, public authservice:AuthService, public admin:AdminService){}

  ngOnInit():void{
    this.loginInterval = setInterval(()=>{
      this.getLogin();
    }, 1000)
   
  }


  getLogin() {
    this.authservice.getUser().subscribe({
      next: (user) => {
        this.profile = user
        
        

        if (this.profile) {
          this.getRoles()
          
          
          this.getIdToken()
          localStorage.setItem('profile',JSON.stringify(this.profile));

          clearInterval(this.loginInterval)
        }
        this.loginTry += 1
        if (this.loginTry >= 10) {
          clearInterval(this.loginInterval)
        }
      },
      error: (err)=>{
        console.log(err);
      },
    });
  }

  getRoles() {
    this.admin.getUser(this.profile.sub).subscribe({
      next: (data:any) => {
        this.roles = data.users.app_metadata.roles
        const accessToken:any = localStorage.getItem('profile');
        const profile = JSON.parse(accessToken);
        
        // const uRoles = profile['roles'] || [];
        // this.roles.forEach((r)=>uRoles.include(r))
      }
    })
  }

  getIdToken() {
    this.authservice.getAccessTokenSilently().subscribe({
      next: (token:string) => {
        this.idToken = token
        localStorage.setItem('id_token',JSON.stringify(this.idToken));
      }
    })
  }


}
