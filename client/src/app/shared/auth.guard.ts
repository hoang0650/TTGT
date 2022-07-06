import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
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
  currentState?:string;
  currentResult = false

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
    

    if (this.currentState == state.url) {
      return false
    } else {
      this.currentState = state.url

      return new Observable<boolean>((obs) => {
        forkJoin([this.groupService.getUserPermissions(), this.adminService.getUserInfo()]).subscribe({
          next: (data:any) => {
            this.permissions = data[0] || {}
            var userInfo = data[1]
            if (userInfo) {         
              if (userInfo['blocked']) {
                this.auth.logout({
                  returnTo: "http://localhost:9000/home?message=blocked"
                })
              } else {
                if (this.appCom) {
                  this.appCom.roles = userInfo['roles'] || ['guest']
                  this.appCom.permissions = this.permissions
                }
  
                var isAuthorized = this.checkPermission(allowedPermissions) && this.checkRoles(allowedRoles)
  
                if (isAuthorized) {
                  obs.next(true)
                } else {
                  obs.next(false)
                  this.router.navigate(['unauthorized']);
                }
              }
            } else {
              this.nzMessage.error("Bạn cần đăng nhập!")
              this.auth.loginWithRedirect()
            }
            this.currentState = undefined
          },
          error: (err) => {
            obs.next(false)
            this.router.navigate(['unauthorized']);
          }
        })
      })
    }
  }

  checkRoles(allowedRoles:string[]) {
    if (allowedRoles == null || allowedRoles.length === 0) {
      return false;
    }

    const checkRole = this.appCom?.['roles'] || ['guest']  

    if(allowedRoles.includes(checkRole[0])){
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
