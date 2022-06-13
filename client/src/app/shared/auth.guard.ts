import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import { Auth0Service } from './auth0.service';
import { AuthorizationService } from '../services/authorization.service';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private auth:Auth0Service, private router:Router){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const allowedRoles = next.data.allowedRoles;
      const allowedPermissions = next.data.allowedPermissions;
      const isAuthorized = this.auth.isAuthorized(allowedRoles, allowedPermissions);

    if (!isAuthorized) {
        this.router.navigate(['unauthorized']);      
    }
    
    return isAuthorized;
  }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const allowedRoles = next.data.allowedRoles;
    const allowedPermissions = next.data.allowedPermissions;
    const isAuthorized = this.auth.isAuthorized(allowedRoles, allowedPermissions);
    
    console.log(isAuthorized);
    

  if (!isAuthorized) {
      this.router.navigate(['unauthorized']);
  }
  
  return isAuthorized
  }
  

}
