import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import {Auth0Client} from '@auth0/auth0-spa-js';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { Observable, of} from 'rxjs';
// import { profile } from 'console';

export function returnToken(){
  return localStorage.getItem('id_token');
}

@Injectable({
  providedIn: 'root'
})

export class Auth0Service {
  private headers: HttpHeaders = new HttpHeaders();
  // private profile;
  // private permission;
  constructor(public router: Router, private http:HttpClient) { this.headers.append(`Authorization`,`Bearer ${returnToken}`) }
  auth0 = new Auth0Client({
    domain: environment.auth0.domain,
    client_id: environment.auth0.clientID,
    redirect_uri: environment.auth0.callback,
    responseType:'token id_token',
    audience: environment.auth0.audience,
    scope:'openid profile app_metadata roles name email app_metadata username'
  })
  

  // get userProfile(): any {
  //   if (this.profile) {
  //     return this.profile;
  //   } else {
  //     if (this.isAuthenticated()) {
  //       const profile = JSON.parse(localStorage.getItem('profile') || '{}');
  //       if (profile) {
  //         profile.picture = profile.picture || 'https://ui-avatars.com/api/?name=' + profile.name;
  //         return profile;
  //       } else {
  //         return {};
  //       }
  //     } else {
  //       return {};
  //     }
  //   }
  // }



  public login(){
    this.auth0.loginWithRedirect();
  }

  public logout(){
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('profile');
    localStorage.removeItem('sessionObject');
    this.auth0.logout({returnTo: document.location.origin})
  }

  public handleAuthentication():void{
    this.auth0.getIdTokenClaims().then((authResult)=>{
      console.log(authResult);
      if(authResult && authResult['access_token'] && authResult['id_token']){
        window.location.hash = '';
        this.setSession(authResult);
        this.router.navigate(['/']);
        // this.getProfiles(()=>{});
      }
    }).catch(err=>{
      this.router.navigate(['/'])
      console.log(err);
    })
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '{}')
    // this.getProfile(() => {});
    return new Date().getTime() < expiresAt;
  }

  private setSession(authResult:any): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify(authResult.expiresIn * 1000 + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }


  public getProfile():void{
    const accessToken = localStorage.getItem('access_token');
    if(!accessToken){
      throw new Error('Access token must exit to fetch profile');
    }
    this.auth0.getUser().then(profile=>{
      localStorage.setItem('profile', JSON.stringify(profile))
    }).catch(err=>console.log(err))
  }

  // public getPermission(cb:any, options?: { sync: boolean }): any | Observable<any> {
  //   const url = `${this.api}permission`;
  //   const permission$ = this.http.get<any>(url).pipe(
  //     switchMap((permission) => {
  //       localStorage.setItem('permission', JSON.stringify(permission));
  //       return of(permission);
  //     }),
  //     tap((permission) => {
  //       cb(null, permission);
  //     }),
  //     catchError((err) => {
  //       cb(err, null);
  //       return err;
  //     })
  //   );
  //   if (this.isAuthenticated()) {
  //     if (options && options.sync) {
  //       return permission$;
  //     }
  //     permission$.subscribe();
  //   } else {
  //     cb(null, null);
  //     if (options && options.sync) {
  //       return of(null);
  //     }
  //   }
  // }


  public userHasRoles(roles:string[]| string):boolean{
    if(!Array.isArray(roles)){
      roles = [roles];
    }

    if(this.isAuthenticated()){
      const profile = JSON.parse(localStorage.getItem('profile') || '{}');
      const uRoles = profile['roles'] || [];
      return roles.every(r=>uRoles.includes(r));
    }
    return false;
  }

  // public isAdmin(){
  //   return(
  //     this.userProfile && this.userProfile['roles'] && this.userProfile['roles'].indexOf('admin')>-1
  //   )
  // }

}


