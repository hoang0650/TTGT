import { Component, OnInit, Output,EventEmitter} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { AdminService } from 'src/app/services/admin.service';
import { GroupService } from 'src/app/services/group.service';
import { AdminGroupsEditComponent } from '../admin-groups-edit/admin-groups-edit.component';
import { AdminUsersComponent } from '../admin-users/admin-users.component';

declare var $:any; 

@Component({
  selector: 'app-admin-groups',
  templateUrl: './admin-groups.component.html',
  styleUrls: ['./admin-groups.component.css']
})
export class AdminGroupsComponent implements OnInit {
  @Output() userGroup = new EventEmitter<any>();
  isUsersLoading: boolean =false;
  lastResult:any;
  groups:any;
  users = [];
  currentUsers = []
  selectGroups:any = [];
  lastUsersUpdated: Date = new Date();
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

  permissionToText:any= {
    cameras: 'Camera giao thông',
    staticmaps: 'Bản đồ tĩnh',
    parkings: 'Bãi đỗ xe',
    roadworks: 'Công trình giao thông',
    trafficevents: 'Cảnh báo',
    roadevents: 'Thông tin phân luồng',
    settings: 'Cấu hình'

  };

  roleToText:any = {
    none: 'Không có quyền',
    read: 'Truy cập',
    update: 'Cập nhật',
    manage: 'Quản lý'
  };



  constructor(public admin:AdminService, public modalService:NzModalService, private groupsService:GroupService, private nzMessage:NzMessageService, private userCom:AdminUsersComponent) {
    userCom.groupCom = this
   }

  ngOnInit(): void {
    this.isUsersLoading = true;
    this.admin.getUsers().subscribe({
      next: (data:any) => {
        this.users = data.users;
        this.currentUsers = data.users;
        
        this.lastUsersUpdated = new Date();
        this.isUsersLoading = false;
        this.getGroup();
        // this.setLocalPermission
        // console.log(this.setLocalPermission);
      },
      error: err => {
        console.log(err)
      },
    });
  }


  getGroup(){
    this.groups = [];
    this.groupsService.query().subscribe({
      next: (groups:any) => {
        groups.forEach((group:any)=>{
          group.users = group.users.map((guser:any)=>{
            var fuser = {};
            this.users.some((user:any)=>{
              fuser = user;
              return guser === user.user_id;
            });
            return fuser;
          });

          group.users.forEach((guser:any) => {
            this.currentUsers = this.currentUsers.filter((curUser:any) => {
              return curUser.user_id != guser.user_id
            })
          })
          // localStorage.setItem('permissions',JSON.stringify(group.permissions))
          
        
          group.permissionsStats = {};

          for(var key in group.permissions){
            var value = group.permissions[key];
            group.permissionsStats[value] = (group.permissionsStats[value] || 0)+1;
            group.permissionsStats.total = (group.permissionsStats.total ||0)+1;
          }
          console.log(group.permissionsStats);
          
        });

        this.groups = groups
    
      }
    })
  }


  selectGroup(group:any){
    if(group.isSelected){
      this.selectGroups = [];
      group.isSelected = false;
    } else {
      this.selectGroups.forEach((selected:any)=>{
        selected.isSelected = false;
      });
      this.selectGroups = [group];
      group.isSelected = true;
    }
  }

  

  toggleEdit(group:any, event:any){
    event.stopPropagation();
    this.openEdit(group);
  }

  toggleGroup(group:any, event:any) {
    event.stopPropagation();
    // this.selectGroup(group)
  }
  openEdit(group?:any){
    var modalRef = this.modalService.create({
      nzContent: AdminGroupsEditComponent,
      nzComponentParams: {
        users: this.currentUsers,
        editGroup: group
      },
      nzWidth: 900
    })

    setTimeout(() => {
      $(".ui.dropdown").dropdown()
    }, 100)

    modalRef.afterClose.subscribe({
      next: (res) => {
        if (res == 'created') {
          this.nzMessage.create('success', 'Đã tạo nhóm mới')
        } else if (res == 'updated') {
          this.nzMessage.create('success', 'Đã cập nhật nhóm mới')
        } else if (res == 'removed') {
          this.nzMessage.create('success', 'Đã xóa nhóm')
        }
        this.getGroup()
      }
    })
  }
}
