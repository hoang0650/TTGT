import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import { Auth0Service } from './auth0.service';
import { AuthService } from '@auth0/auth0-angular';
import { AuthorizationService } from '../services/authorization.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private auth:Auth0Service, private router:Router, private author: AuthorizationService){}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const allowedRoles = next.data.allowedRoles;
      const isAuthorized = this.auth.isAuthorized(allowedRoles);

    if (!isAuthorized) {

        this.router.navigate(['unauthorized']);
        
      }
    
    return isAuthorized;
  }

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const allowedRoles = next.data.allowedRoles;
    const isAuthorized = this.auth.isAuthorized(allowedRoles);
    
  if (!isAuthorized) {
      this.router.navigate(['unauthorized']);
      // this.message.create('warning', 'Quyền truy cập bị giới hạn');
    }
  
  return isAuthorized
  }
  

}
