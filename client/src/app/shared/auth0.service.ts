import { Injectable } from '@angular/core';
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
  constructor(public router: Router,private jwtHelperService: JwtHelperService) {  }
  isAuthorized(allowedRoles: string[]): boolean {
    // check if the list of allowed roles is empty, if empty, authorize the user to access the page
    if (allowedRoles == null || allowedRoles.length === 0) {
      return false;
    }
    
    // get token from local storage or state management
    const token: string = localStorage.getItem('id_token') || '{}';
 
    // decode token to read the payload details
    const decodeToken = this.jwtHelperService.decodeToken(token);
    // const decodeToken1 = this.jwtHelperService.decodeToken(token1);
    const checkRole = _.intersection(allowedRoles,decodeToken['https://hoang0650.com/app_metadata']['roles']);
    
    // check if it was decoded successfully, if not the token is not valid, deny access
    if (!decodeToken) {
      return false;
    }

    if(checkRole.includes('superadmin') || checkRole.includes('admin')){
      return true;
    }else {
      return false;
    }


  }
}


