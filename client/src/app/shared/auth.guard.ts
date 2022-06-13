import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import _ from 'lodash';
import { JwtHelperService } from '@auth0/angular-jwt';
import { GroupService } from '../services/group.service';
import { AuthService } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  permissions:any = {}

  constructor(private auth:AuthService, private router:Router, private jwtHelperService: JwtHelperService, private groupService:GroupService){}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.getPermissions(next)
  }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.getPermissions(next)
  }


  
  getPermissions(next: ActivatedRouteSnapshot) {
    const allowedRoles = next.data.allowedRoles;
    const allowedPermissions = next.data.allowedPermissions;
    return new Observable<boolean>((obs) => {
      this.auth.getAccessTokenSilently().subscribe({
        next: (token:string) => {
          this.groupService.getUserPermissions().subscribe({
            next: (data) => {
              this.permissions = data
              const isAuthorized = this.isAuthorized(next, token, allowedRoles, allowedPermissions)
              console.log(isAuthorized);
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
          obs.next(false)
          this.router.navigate(['unauthorized']);
        }
      })
    })
  }
  
  isAuthorized(next:ActivatedRouteSnapshot, token:string, allowedRoles:string[], allowedPermissions:string[]): boolean {

    
    const decodeToken = this.jwtHelperService.decodeToken(token);
    const checkRole = decodeToken['https://hoang0650.com/app_metadata']['roles'];

    if (!decodeToken) {
      return false;
    }

    console.log(checkRole);
    
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
    console.log(permissions);
    console.log(this.permissions);
    
    
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
