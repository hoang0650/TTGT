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
    return this.getPermissions(next)
  }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.getPermissions(next)
  }


  appCom?:AppComponent;
  setComponent(component:AppComponent) {
    this.appCom = component
  }

  getProfile() {
    this.adminService.getUserInfo().subscribe({
      next: (profile:any) => {
        if (profile && this.appCom) {
          this.appCom.profile = profile
          if (profile.blocked) {
            this.nzMessage.error("Tài khoản bạn đã bị khóa!")
            this.auth.logout({
              returnTo: "http://localhost:9000/home?message=blocked"
            })
          }
        } else {
          this.nzMessage.error("Bạn cần đăng nhập!")
          this.auth.loginWithRedirect()
        }
      }
    });
  }

  getPermissions(next: ActivatedRouteSnapshot) {
    const allowedRoles = next.data.allowedRoles ||  [];
    const allowedPermissions = next.data.allowedPermissions || [];
    
    return new Observable<boolean>((obs) => {
      this.auth.getAccessTokenSilently().subscribe({
        next: (token:string) => {
          this.getProfile()
          this.groupService.getUserPermissions().subscribe({
            next: (data) => {
              this.permissions = data || {}
              const isAuthorized = this.isAuthorized(next, token, allowedRoles, allowedPermissions)
              
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
        },
        error: (err) => {
          if (allowedRoles) {
            if (allowedRoles[0] == "guest") {
              obs.next(true)
            } else {
              obs.next(false)
              this.router.navigate(['unauthorized']);
            }
          } else {
            obs.next(false)
            this.router.navigate(['unauthorized']);
          }
        }
      })
    })
  }
  
  isAuthorized(next:ActivatedRouteSnapshot, token:string, allowedRoles:string[], allowedPermissions:string[]): boolean {
    if (allowedRoles[0] == "guest") {
      return true
    }
    
    const decodeToken = this.jwtHelperService.decodeToken(token);
    const checkRole = decodeToken['https://hoang0650.com/app_metadata']['roles'];

    if (!decodeToken) {
      return false;
    }

    console.log(decodeToken);
    
    if(checkRole.includes('superadmin')){
      return true;
    }
     
    if (allowedRoles == null || allowedRoles.length === 0) {
      return false;
    }

    
    return this.checkPermission(allowedPermissions)
  }

  checkPermission(permissions:string[]) {
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
}
