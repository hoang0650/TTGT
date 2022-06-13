import { Component } from '@angular/core';
import 'leaflet-sidebar-v2';
import 'leaflet-rotatedmarker';
import { AuthorizationService } from './services/authorization.service';
import {AuthService} from '@auth0/auth0-angular';
import { AdminService } from './services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { GroupService } from './services/group.service';


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
  permissions:string[] = []

  constructor(private groupService: GroupService,public auth:AuthorizationService, public authservice:AuthService, public admin:AdminService, private router:Router, private nzMessage:NzMessageService){
  }
  
  ngOnInit():void{
    this.authservice.error$.subscribe((error) => {
      if (error.message == "user is blocked") {
        this.nzMessage.error("Tài khoản bạn đã bị khóa!")
      }
    }); 

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
          this.groupService.getUserPermissions().subscribe({
            next: (data:any) => {
              console.log(data);
              
              if (data) {
                this.permissions = data
              }
            },
            error: (err:any) => {
              this.permissions = []
            }
          });
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

  checkPermission(permissions:string[]) {
    if (this.roles.includes("superadmin")) {
      return true
    }

    if(this.roles.includes("admin")){

      var ok = false
      permissions.forEach((permission:string) => {
        var tmpPermission:any = permission.split(":")
  
        if (this.permissions[tmpPermission[0]] == tmpPermission[1]) {
          ok = true
          return
        }
      })
  
      if (ok) {
        return true
      }
    }

    return false
  }

}
