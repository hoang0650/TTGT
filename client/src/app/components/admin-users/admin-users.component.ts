import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  isUsersLoading: boolean = true;
  users: any = [];
  lastUsersUpdated: Date = new Date();
  selectedUsers: any = [];
  searchnickname:string = "";
  payload: object ={};
  constructor(private admin:AdminService) { }

  ngOnInit(): void {
    //Gọi API lấy về mảng user
    this.admin.getUsers().subscribe({
      next: (data:any) => {
        this.users = data.users;
        this.lastUsersUpdated = new Date();
        this.isUsersLoading = false;
      },
      error: err => {
        console.log(err)
      },
    });

  }

  userIndexOf(users:any, user:any) {
    for (var i = 0; i < users.length; i++) {
      var u = users[i];
      if (u.user_id === user.user_id) {
        return i;
      }
    }
    return -1;
  }

  toggleUser(user:any, event:any) {
    event.stopPropagation();

    //Being selected
    var index = this.userIndexOf(this.selectedUsers, user);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
      user.isSelected = false;
    } else {
      this.selectedUsers.push(user);
      user.isSelected = true;
    }
  }

  selectUser(user:any) {
    this.selectedUsers.forEach((selected:any) => {
      selected.isSelected = false;
    });

    this.selectedUsers = [user];
    user.isSelected = true;
  }

  getUserByRole(role:string) {
    return this.users.filter((user: any) => 
      user.app_metadata.roles.includes(role)
    )
  }

  getUserByBlocked(blocked:boolean) {
    return this.users.filter((user: any) => 
      user.blocked === blocked
    )
  }

  // changeUserBlocked(action:string){
  //   if(action==='block'){
  //     this.admin.blockUser(id:user_id)
  //   }
  // }

  	// function changeUserBlocked(user, action, cb) {
		// 	if (action === 'block') {
		// 		admin.blockUser({ id: user.user_id }, function (user) {
		// 			cb(user);
		// 			_this.lastUsersUpdated = new Date();
		// 		});

		// 	} else if (action === 'unblock') {
		// 		admin.unblockUser({ id: user.user_id }, function (user) {
		// 			cb(user);
		// 			_this.lastUsersUpdated = new Date();
		// 		});
		// 	}


		// }


  changeUsersBlocked(action:string,data:object) {
    this.selectedUsers.forEach((selected:any, index:number) => {

      
      if (action == 'block') {
      this.selectedUsers[index].loading = true;
      this.payload = data
      this.admin.blockUser(selected.user_id, action, data = {"blocked":true}).subscribe({
        next: (user:any) => {
          this.selectedUsers[index].blocked = user.blocked;
          this.selectedUsers[index].loading = false;
          this.lastUsersUpdated = new Date();
        },
        error: (err) => {
          console.log(err)
          this.selectedUsers[index].loading = false;
          this.lastUsersUpdated = new Date();
        }
      })
    } else if (action == 'unblock'){
      this.selectedUsers[index].loading = true;
      this.payload = data
      this.admin.unblockUser(selected.user_id, action, data = {"blocked":false}).subscribe({
        next: (user:any) => {
          this.selectedUsers[index].blocked = user.blocked;
          this.selectedUsers[index].loading = false;
          this.lastUsersUpdated = new Date();
        },
        error: (err) => {
          console.log(err)
          this.selectedUsers[index].loading = false;
          this.lastUsersUpdated = new Date();
        }
      })
    }

   
  });
}

blockUsers() {
  return this.changeUsersBlocked('block', this.payload);
};
unblockUsers() {
  return this.changeUsersBlocked('unblock', this.payload);
};


// change user role

changeUsersRole(action:string,data:object) {
		
  this.selectedUsers.forEach((selected:any, index:number) => {

    

    if (action == 'guest') {
      this.selectedUsers[index].loading = true;
      this.payload = data
      this.admin.changeToGuest(selected.user_id, action, data={'app_metadata':{"roles":"guest"}}).subscribe({
        next: (user:any) => {
          this.selectedUsers[index].app_metadata = user.app_metadata;
          this.selectedUsers[index].loading = false;
          this.lastUsersUpdated = new Date();
        },
        error: (err:any) => {
          console.log(err);
          this.selectedUsers[index].loading = false;
          this.lastUsersUpdated = new Date();
        }
      })
    } else if (action == 'user'){
      this.selectedUsers[index].loading = true;
      this.payload = data
      this.admin.unblockUser(selected.user_id, action, data={'app_metadata':{"roles":"user"}}).subscribe({
        next: (user:any) => {
          this.selectedUsers[index].app_metadata = user.app_metadata
          this.selectedUsers[index].loading = false;
          this.lastUsersUpdated = new Date();
        },
        error: (err) => {
          console.log(err)
          this.selectedUsers[index].loading = false;
          this.lastUsersUpdated = new Date();
        }
      })
    } else if (action =='admin'){
      this.selectedUsers[index].loading = true;
      this.payload = data
      this.admin.unblockUser(selected.user_id, action, data={'app_metadata':{"roles":"admin"}}).subscribe({
        next: (user:any) => {
          this.selectedUsers[index].app_metadata = user.app_metadata
          this.selectedUsers[index].loading = false;
          this.lastUsersUpdated = new Date();
        },
        error: (err) => {
          console.log(err)
          this.selectedUsers[index].loading = false;
          this.lastUsersUpdated = new Date();
        }
      })
    }

   
  });

}

	// 	//Change Role of users
		changeUserToGuest() 
    {
			return this.changeUsersRole('guest',this.payload);
		};

    changeUserToUser() 
    {
			return this.changeUsersRole('user',this.payload);
		};

    changeUserToAdmin() 
    {
			return this.changeUsersRole('admin',this.payload);
		};


  appMetadataToRoleName(metadata:any) {
    if (metadata && metadata.roles) {
      if (metadata.roles.indexOf('superadmin') > -1) {
        return 'Quản trị viên';
      }
      if (metadata.roles.indexOf('admin') > -1) {
        return 'Quản lý';
      }
      if (metadata.roles.indexOf('user') > -1) {
        return 'Người dùng';
      }
      if (metadata.roles.indexOf('guest') > -1) {
        return 'Khách';
      }
    }
    return 'Không xác định';
  }

  appMetadataToStar(metadata:any) {
    if (metadata && metadata.roles) {
      if (metadata.roles.indexOf('superadmin') > -1) {
        return 'red star';
      }
      if (metadata.roles.indexOf('admin') > -1) {
        return 'purple star';
      }
      if (metadata.roles.indexOf('user') > -1) {
        return 'yellow star';
      }
      if (metadata.roles.indexOf('guest') > -1) {
        return 'yellow outline star';
      }
    }
    return 'grey empty star';
  }

  gotoInfo() {
    window.scrollTo(0, 0);
  }



	// 	this.gotoInfo = gotoInfo;
}