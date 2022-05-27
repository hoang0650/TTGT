import { Injectable } from '@angular/core';
import {AuthService} from '@auth0/auth0-angular';
import { AdminService } from './admin.service';
import { Router, ActivatedRoute } from '@angular/router';
import {JwtHelperService} from '@auth0/angular-jwt';
import { NzMessageService } from 'ng-zorro-antd/message';
@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  idToken ='';
  constructor(public auth:AuthService, public admin:AdminService,private jwtHelper:JwtHelperService,private route: ActivatedRoute, private message:NzMessageService) { }

  get userProfile(): any {
    if (this.isAuthenticated()) {
      const accessToken:any = localStorage.getItem('profile');
      return JSON.parse(accessToken);
    } else {
      return {};
    }
  }
  aud='https://dev-0gy0vn9g.us.auth0.com';
  scop = 'openid profile app_metadata roles name email username';
  
  roles:any = {
    admin: 'admin',
    user: 'user',
    superadmin: 'superadmin'
  };

  authorize() {
    return this.auth.getAccessTokenSilently().subscribe({
      next: (token:string)=>{
        this.idToken = token;
        localStorage.setItem('id_token',JSON.stringify(this.idToken))
      }
    })
    // this.auth.getIdTokenClaims({audience:this.aud,scope:this.scop}).subscribe({
    //   next: (data)=>{
    //     console.log(data);
    //     this.setSession(data);
    //     this.router.navigate(['/home']);
    //     this.profile(()=>{});
    //   },
    //   error: (err)=>{
    //     this.router.navigate(['/home']);
    //     console.log(err);
    //   }
    // })
  }


  login() {
    
    this.auth.loginWithRedirect();
    var queryParam = this.route.snapshot.queryParamMap;
    var result = queryParam.get('blocked');
    localStorage.getItem('id_token');
    if(result){
      console.log('something went wrong')
      this.message.create('blocked','Tài khoản của bạn đang bị khóa');
    }
    // return this.auth0.handleAuthentication()
    
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
