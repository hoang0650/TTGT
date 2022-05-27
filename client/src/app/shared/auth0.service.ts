import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as _ from 'lodash';
// import { profile } from 'console';

// export function returnToken(){
//   return localStorage.getItem('id_token');
// }

@Injectable({
  providedIn: 'root'
})

export class Auth0Service {
  private headers: HttpHeaders = new HttpHeaders();
  constructor(public router: Router, private http:HttpClient,private jwtHelperService: JwtHelperService) {  }

  isAuthorized(allowedRoles: string[]): boolean {
    // check if the list of allowed roles is empty, if empty, authorize the user to access the page
    if (allowedRoles == null || allowedRoles.length === 0) {
      return false;
    }
  
    // get token from local storage or state management
    var token: string = localStorage.getItem('id_token') || '{}';
  
    // decode token to read the payload details
    var decodeToken = this.jwtHelperService.decodeToken(token);
  // check if it was decoded successfully, if not the token is not valid, deny access
    if (!decodeToken) {
      console.log('Invalid token');
      return false;
    }
    // const sort = decodeToken['https://hoang0650.com/roles'].indexOf(allowedRoles);
    const checkRole = _.union(allowedRoles,decodeToken['https://hoang0650.com/roles']);
    // [admin],[admin,superadmin].includes('admin')
    if(!checkRole){
      console.log('Invalid role');
      return false;
    }

    return true;

  }
}


