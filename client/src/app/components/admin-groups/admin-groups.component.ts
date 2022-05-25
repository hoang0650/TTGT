import { Component, OnInit } from '@angular/core';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { AdminService } from 'src/app/services/admin.service';
import { GroupService } from 'src/app/services/group.service';
import { AdminGroupsEditComponent } from '../admin-groups-edit/admin-groups-edit.component';

declare var $:any; 

@Component({
  selector: 'app-admin-groups',
  templateUrl: './admin-groups.component.html',
  styleUrls: ['./admin-groups.component.css']
})
export class AdminGroupsComponent implements OnInit {
  isUsersLoading: boolean =false;
  lastResult:any;
  groups:any = [];
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

  permissionToText:any = {
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

  constructor(public admin:AdminService, public modalService:NzModalService, private groupsService:GroupService) { }

  ngOnInit(): void {
    this.isUsersLoading = true;
    this.admin.getUsers().subscribe({
      next: (data:any) => {
        this.users = data.users;
        this.currentUsers = data.users;
        
        this.lastUsersUpdated = new Date();
        this.isUsersLoading = false;
        this.getGroup();
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
          console.log(this.currentUsers);
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
          console.log(this.currentUsers);
          

          group.permissionsStats = {};
          for(var key in group.permissions){
            var value = group.permissions[key];
            group.permissionsStats[value] = (group.permissionsStats[value] || 0)+1;
            group.permissionsStats.total = (group.permissionsStats.total ||0)+1;
          }
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
        this.lastResult = res
        this.getGroup()

      }
    })
  }
}
