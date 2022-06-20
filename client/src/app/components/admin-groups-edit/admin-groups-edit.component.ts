import { Component, Input, OnInit,Output,EventEmitter } from '@angular/core';
import _ from 'lodash';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { AdminService } from 'src/app/services/admin.service';
import { GroupService } from 'src/app/services/group.service';
import { MessageService } from 'src/app/services/message.service';
import { AdminGroupsComponent } from '../admin-groups/admin-groups.component';

@Component({
  selector: 'app-admin-groups-edit',
  templateUrl: './admin-groups-edit.component.html',
  styleUrls: ['./admin-groups-edit.component.css']
})
export class AdminGroupsEditComponent implements OnInit {

  @Input() users: any;
  @Input() editGroup: any;
  group:any = {
    permissions: {
    },
    users: []
  }
  error: any;
  payload: object ={};
  isRemoving:boolean = false;
  isCreate: boolean = true;
  
  
  permissions:any = [
    {
      name: 'Camera giao thông',
      id: 'cameras'
    },
    {
      name: 'Bản đồ tĩnh',
      id: 'staticmaps'
    },
    {
      name: 'Bãi đỗ xe',
      id: 'parkings'
    },
    {
      name: 'Công trình giao thông',
      id: 'roadworks'
    },
    {
      name: 'Cảnh báo',
      id: 'trafficevents'
    },
    {
      name: 'Thông tin phân luồng',
      id: 'roadevents'
    },
    {
      name: 'Cấu hình',
      id: 'settings'
    }
  ];

  constructor(private modalRef:NzModalRef, private groupService:GroupService, private admin:AdminService,private messageService:MessageService) { 
    this.permissions.forEach((permission:any) => {
      this.group.permissions[permission.id] = "none"
    })
  }
  

  ngOnInit(): void {
    if (this.editGroup) {
      this.group = _.cloneDeep(this.editGroup)
      
      this.isCreate = false
    }
    // this.currentGroup.emit(this.group);
  }

  filterUsers(users:any){
    return users.filter((currentUser:any)=>{
      this.group.users.forEach((user:any)=>{
        if(user.user_id === currentUser.user_id) return false;
        return true;
      })
    })
  }

  addUser(currentUser:any) { 
    this.users = this.users.filter((user:any) => {
      return user.user_id != currentUser.user_id
    })
    this.group.users.push(currentUser);


  }

  removeUser(currentUser:any){
    this.group.users = this.group.users.filter((user:any) => {
      return user.user_id != currentUser.user_id
    })
    
    this.users =  this.users.concat([currentUser])
  }

  submit(){
    this.groupService.save(this.group).subscribe({
      next: (res) => {    
        this.modalRef.close("created")   
      }
    })
    
    // var newGroup = new Groups(_this.group);
    //   newGroup.$save(function (group) {
    //     var result = {
    //         action: 'update',
    //         result: group
    //     };

    //     $uibModalInstance.close(result);
    // });
  }

  update(){
    this.groupService.update(this.group._id,this.group).subscribe({
      next: (res) => {
        // console.log('group',this.group);
        const permissions:any = localStorage.getItem('permissions');
        this.admin.changePermissions(this.group._id,permissions).subscribe({
          next: (user:any) => {
            console.log(user)
          },
          error: (err) => {
            console.log(err)
          }
        })
        this.modalRef.close("updated")

      }
    })
  }
  
  remove() {
    this.isRemoving = true;
  }
  
  trackByFn(item:any) {
    return item;
  }
  
  confirmRemove() {
    this.groupService.delete(this.group._id).subscribe({
      next: (res:any) => {
        this.isRemoving = true
        this.modalRef.close("removed")
      }
    })
  }
  
  cancel() {
    this.modalRef.close();
  }
  
  abortRemove() {
    this.isRemoving = false;
  }
  
  

  // change user role
  
  // changeUsersRole(action:string,data:object) {
    
  //   this.selectedUsers.forEach((selected:any, index:number) => {
  //     if (action == 'guest') {
  //       this.selectedUsers[index].loading = true;
  //       this.payload = data
  //       this.admin.changeToGuest(selected.user_id, action, data={'app_metadata':{"roles":"guest"}}).subscribe({
  //         next: (user:any) => {
  //           this.selectedUsers[index].app_metadata = user.app_metadata;
  //           this.selectedUsers[index].loading = false;
  //           this.lastUsersUpdated = new Date();
  //         },
  //         error: (err:any) => {
  //           console.log(err);
  //           this.selectedUsers[index].loading = false;
  //           this.lastUsersUpdated = new Date();
  //         }
  //       })
  //     } else if (action == 'user'){
  //       this.selectedUsers[index].loading = true;
  //       this.payload = data
  //       this.admin.unblockUser(selected.user_id, action, data={'app_metadata':{"roles":"user"}}).subscribe({
  //         next: (user:any) => {
  //           this.selectedUsers[index].app_metadata = user.app_metadata
  //           this.selectedUsers[index].loading = false;
  //           this.lastUsersUpdated = new Date();
  //         },
  //         error: (err) => {
  //           console.log(err)
  //           this.selectedUsers[index].loading = false;
  //           this.lastUsersUpdated = new Date();
  //         }
  //       })
  //     } else if (action =='admin'){
  //       this.selectedUsers[index].loading = true;
  //       this.payload = data
  //       this.admin.unblockUser(selected.user_id, action, data={'app_metadata':{"roles":"admin"}}).subscribe({
  //         next: (user:any) => {
  //           this.selectedUsers[index].app_metadata = user.app_metadata
  //           this.selectedUsers[index].loading = false;
  //           this.lastUsersUpdated = new Date();
  //         },
  //         error: (err) => {
  //           console.log(err)
  //           this.selectedUsers[index].loading = false;
  //           this.lastUsersUpdated = new Date();
  //         }
  //       })
  //     }
  
   
  //   });
  
  // }
}
