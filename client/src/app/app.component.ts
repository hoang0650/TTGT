import { ChangeDetectorRef, Component } from '@angular/core';
import 'leaflet-rotatedmarker';
import { AuthorizationService } from './services/authorization.service';
import {AuthService} from '@auth0/auth0-angular';
import { AdminService } from './services/admin.service';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { GroupService } from './services/group.service';
import { AuthGuard } from './shared/auth.guard';


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
  permissions:any = {}

  constructor(private groupService: GroupService,public auth:AuthorizationService, public authservice:AuthService, public admin:AdminService, private router:Router, private nzMessage:NzMessageService, authGuard:AuthGuard, private cdRef:ChangeDetectorRef){
    authGuard.setComponent(this)
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
              if (data) {
                this.permissions = data
              } else {
                this.permissions = {}
              }
            },
            error: (err:any) => {
              this.permissions = {}
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
    this.admin.getUserInfo().subscribe({
      next: (data:any) => {
        this.roles = data.roles
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

  checkRoles(roles:string[]) {
    var ok = false;
    roles.forEach((role:string) => {
      if (this.roles.includes(role)) {
        ok = true
        return
      }
    })
    return ok
  }

  checkPermission(permissions:string[]) {
    if(this.roles.includes('superadmin')){
      return true;
    }

    var permissionAction = ['none', 'read', 'update', 'manage']
    var ok = false
    permissions.forEach((permission:string) => {
      var tmpPermission:any = permission.split(":")
      if (tmpPermission.length > 1) {
        var userActionLevel = permissionAction.indexOf(this.permissions[tmpPermission[0]])
        var requiredLevel = permissionAction.indexOf(tmpPermission[1])
        if (userActionLevel >= requiredLevel) {
          ok = true
          return
        }
      }
    })

    if (ok) {
      return true
    }

    return false
  }

  errorHandler(err:any) {
    if (err?.status == 401) {
      this.router.navigate(['unauthorized'])
    } else if (err?.status == 403) {
      this.authservice.logout({
        returnTo: "http://localhost:9000/home?message=blocked"
      })
    } else if (err?.status == 413) {
      this.nzMessage.error("File tải lên quá lớn")
    } else {
      this.nzMessage.error("Lỗi không xác định")
    }
  }
}
