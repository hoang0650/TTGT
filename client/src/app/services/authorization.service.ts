import { Injectable } from '@angular/core';
import {AuthService} from '@auth0/auth0-angular';
import { AdminService } from './admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import {JwtHelperService} from '@auth0/angular-jwt';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  idToken ='';
  constructor(public auth:AuthService, public admin:AdminService) { }
  
  get userProfile(): any {
    if (this.isAuthenticated()) {
      const accessToken:any = localStorage.getItem('profile');
      return JSON.parse(accessToken);
    } else {
      return {};
    }
  }
 
  authorize() {
    return this.auth.getAccessTokenSilently().subscribe({
      next: (token:string)=>{
        this.idToken = token;
        localStorage.setItem('id_token',JSON.stringify(this.idToken))
      }
    })
  }
 

  login() {
    this.auth.loginWithRedirect({fragment:'home'})
    localStorage.getItem('id_token'); 
  }
 
  blocked(){
    return this.auth.logout({
      returnTo: "http://localhost:9000/home?message=blocked"
    })
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('profile');
    localStorage.removeItem('sessionObject');
    this.auth.logout({returnTo: document.location.origin})
  }

  public setSession(authResult:any): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
    localStorage.setItem('access_token', JSON.stringify(authResult.accessToken));
    localStorage.setItem('id_token', JSON.stringify(authResult.idToken));
    localStorage.setItem('expires_at', expiresAt);
  }


  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    const access_token:any = localStorage.getItem('expires_at');
    const expiresAt = JSON.parse(access_token);

    // this.getProfile(() => { });
    return new Date().getTime() < expiresAt;
    
  }

  public profile(data:any): void{
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('Access token must exist to fetch profile');
    }
    this.auth.getUser().subscribe({
      next: (profile:any)=>{
        this.userHasRoles
        this.authorize
        localStorage.setItem('profile', JSON.stringify(profile));
        return data.profile;
      },
      error: (err:any)=>{
        return err;
      }
    })
  }


  public userHasRoles(roles: string[] | string): boolean {
    if (!Array.isArray(roles)) {
      roles = [roles];
    }

    if (this.isAuthenticated()) {
      const accessToken:any = localStorage.getItem('profile');
      const profile = JSON.parse(accessToken);
      const uRoles = profile['roles'] || [];
      return roles.every((r) => uRoles.includes(r));
    }
    return false;
  }

  public isAdmin() {
    // return true;
    return (
      this.userProfile &&
      this.userProfile['roles'] &&
      this.userProfile['roles'].indexOf('admin') > -1
    );
  }
}
