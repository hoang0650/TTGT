import { Component, Input, OnInit } from '@angular/core';
import _ from 'lodash';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { GroupService } from 'src/app/services/group.service';

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

  constructor(private modalRef:NzModalRef, private groupService:GroupService) { 
    this.permissions.forEach((permission:any) => {
      this.group.permissions[permission.id] = "none"
    })
  }
  

  ngOnInit(): void {
    if (this.editGroup) {
      this.group = _.cloneDeep(this.editGroup)
      this.isCreate = false
    }
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
}
