import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { GroupService } from '../services/group.service';
import * as _ from 'lodash';
import { AppComponent } from '../app.component';


// import { profile } from 'console';

// export function returnToken(){
//   return localStorage.getItem('id_token');
// }

@Injectable({
  providedIn: 'root'
})
export class Auth0Service {
  // permissions:any = {}
 
  constructor(public router: Router,private jwtHelperService: JwtHelperService) {
    // this.permissions = JSON.parse(localStorage.getItem("permissions") || "{}")
    // console.log(this.permissions);
   

  }

  isAuthorized(allowedRoles: string[], allowedPermissions: string[]): boolean {
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
    
    const permissions: string = localStorage.getItem("permissions") || '{}';

    console.log('permissiosn',permissions);
    const checkPermission = _.intersection(allowedPermissions,permissions);
    console.log('checkPermissions',checkPermission);
    // check if it was decoded successfully, if not the token is not valid, deny access
    if (!decodeToken) {
      return false;
    }

    if(checkRole.includes('superadmin')){
     return true;
    }
    if(checkPermission){
      return true
    }
    
    
    return this.checkPermission(allowedPermissions)
    // return false;
  }

  checkPermission(permissions:string[]) {
    var permissionAction = ['none', 'read', 'update', 'manage']
    var ok = false
    console.log('permissions',permissions);
    permissions.forEach((permission:string) => {
      var tmpPermission:any = permission.split(":")
      if (tmpPermission.length > 1) {
        var userActionLevel = permissionAction.indexOf(permissions[tmpPermission[0]])
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


