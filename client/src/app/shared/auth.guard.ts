import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import _ from 'lodash';
import { JwtHelperService } from '@auth0/angular-jwt';
import { GroupService } from '../services/group.service';
import { AdminService } from '../services/admin.service';
import { AuthService } from '@auth0/auth0-angular';
import { AppComponent } from '../app.component';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  permissions:any = {}

  constructor(private auth:AuthService, private router:Router, private jwtHelperService: JwtHelperService, private groupService:GroupService, private adminService:AdminService, private nzMessage:NzMessageService){}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.getPermissions(next, state)
  }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.getPermissions(next, state)
  }


  appCom?:AppComponent;
  setComponent(component:AppComponent) {
    this.appCom = component
  }

  getPermissions(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const allowedRoles = next.data.allowedRoles ||  [];
    const allowedPermissions = next.data.allowedPermissions || [];

    if (allowedRoles[0] == "guest") {
      return true
    }

    return new Observable<boolean>((obs) => {
      if (!this.checkRoles(allowedRoles)) {
        obs.next(false)
        this.router.navigate(['unauthorized']);
      }

      this.groupService.getUserPermissions().subscribe({
        next: (data) => {
          this.permissions = data || {}
         
          const isAuthorized = this.checkPermission(allowedPermissions)

          if (this.appCom) {
            this.appCom.permissions = this.permissions
          }

          obs.next(isAuthorized)

          if (!isAuthorized) {
            this.router.navigate(['unauthorized']);
          }
        }, 
        error: (err) => {
          obs.next(false)
          this.router.navigate(['unauthorized']);
        }
      })

      this.adminService.getUserInfo().subscribe({
        next: (userInfo:any) => {
          if (userInfo) {
            if (userInfo['blocked']) {
              this.auth.logout({
                returnTo: "http://localhost:9000/home?message=blocked"
              })
            } else {
              if (this.appCom) {
                this.appCom.roles = userInfo['roles'] || ['guest']
                if (this.appCom?.roles.includes("superadmin")) {
                  obs.next(true)
                  this.router.navigate([state.url])
                }
              }
              if (this.checkRoles(allowedRoles) && this.checkPermission(allowedPermissions)) {
                obs.next(true)
                this.router.navigate([state.url])
              }

              if (!this.checkRoles(allowedRoles)) {
                obs.next(false)
                this.router.navigate(['unauthorized']);
              }
            }
          } else {
            this.nzMessage.error("Bạn cần đăng nhập!")
            this.auth.loginWithRedirect()
          }
        }
      }) 
    })
  }

  checkRoles(allowedRoles:string[]) {
    if (allowedRoles == null || allowedRoles.length === 0) {
      return false;
    }

    const checkRole = this.appCom?.['roles'] || ['guest']  

    if(checkRole.includes('superadmin') || allowedRoles.includes(checkRole[0])){
      return true;
    }

    return false
  }

  checkPermission(permissions:string[]) {
    const checkRole = this.appCom?.['roles'] || ['guest']
    if(checkRole.includes('superadmin')){
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
    return ok
  }
}
