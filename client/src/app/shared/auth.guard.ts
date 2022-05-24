import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree,Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Auth0Service } from './auth0.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth:Auth0Service, public router:Router){}
  async canActivate(route: ActivatedRouteSnapshot,state: RouterStateSnapshot){
    if(this.auth.isAuthenticated()){
      await this.auth.getProfile()
      return true;
    } else {
      localStorage.setItem('redirect_url', state.url);
      this.router.navigate(['welcome']);
      return false;
    }
  }
  
}
