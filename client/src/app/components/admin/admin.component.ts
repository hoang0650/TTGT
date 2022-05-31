import { Location } from '@angular/common';
import { Component, OnInit , ViewChild} from '@angular/core';
import { SettingService } from 'src/app/services/setting.service';
// import { BsModalService, BsModalRef  } from 'ngx-bootstrap/modal';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal'
import { AdminNotificationComponent } from '../admin-notification/admin-notification.component';
import { AdminConfigConfirmComponent } from '../admin-config-confirm/admin-config-confirm.component';
import { MessageService } from 'src/app/services/message.service';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  editMode!: boolean;
  currentSession:any;
  configValidate: any = {
    errorTime: {
      value: 60,
      regexr: '^([1-9]|[1-5][0-9]|60)$' // 1-60
    },
    refreshCamera: {
      value: 60,
      regexr: '^([1-9]|[1-5][0-9]|60)$' // 1-60
    },
    refreshTime: {
      value: 10,
      regexr: '^([1-9]|10)$' // 1-10
    },
    refreshCameraLayer: {
      value: 10,
      regexr: '^([1-9]|10)$' // 1-10
    },
    refreshTrafix: {
      value: 10,
      regexr: '^([1-9]|10)$' // 1-10
    },
    analyticPeriod: {
      value: 10,
      regexr: '^([1-9]|10)$' // 1-10
    },
    aggregatePeriod: {
      value: 10,
      regexr: '^([1-9]|10)$' // 1-10
    },
    refreshEvent: {
      value: 60,
      regexr: '^([1-9]|[1-5][0-9]|60)$' // 1-60
    },
  };

  timeToUpdate!: Date;
  errorValidate!: boolean;
  toggleMenu: boolean = false;
  // setting:any;
  setting: any = {
    status: "",
    cameraSituations: {
      imageError: {
        imageType: "",
        text: ""
      },
      errorTime: 0,
      refreshCameraLayer: 0,
      refreshTime: 0,
    },
    trafficEvents: {
      refreshTime: 0,
      voiceType: "",
      configVelocity: {
        jam: {
          name: ""
        },
        incident: {
          name: ""
        },
        congestion: {
          name: ""
        },
        flood: {
          name: ""
        },
        normal: {
          name: ""
        }
      }
    },
    trafficSituations: {
      aggregatePeriod: 0,
      analyticPeriod: 0,
      refreshTime: 0,
      configVelocity: {
        jam: {
          name: "",
          speed: 0,
        },
        congestion: {
          name: "",
          speed: 0,
        },
        slow: {
          name: "",
          speed: 0,
        },
        normal: {
          name: "",
          speed: 0,
        }
      },
      mapUrl: {
        name: "",
        mapType: "",
        values: {
          full: "",
          streetName: "",
          street: ""
        }
      }
    }
  };
  @ViewChild('configForm', { static: true })configForm:any;
  @ViewChild('notificationModal', { static: true }) notificationModal:any;
  modalRef?: NzModalRef;
  listMapType:any = [];
  
  constructor(private location:Location, private settingService:SettingService,private modalService:NzModalService, public message:MessageService) { 
    this.editMode = false;

    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 1);
    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    this.getLastSetting();

    this.timeToUpdate = new Date(newDate);
  }

  ngOnInit(): void {
    this.getMapURL()
  }

  chooseConfigPageAble() {
    if (!this.editMode || this.configForm.valid) {
      return true
    } else {
      return false
    }
  };
    
  animateValidate() {
    var configPage:any = document.getElementById('configPage');
    configPage.scrollTop = 0;
    this.errorValidate = true;

    setTimeout(() => {
        this.errorValidate = false;
    }, 300);
  };

  isActive(viewLocation: string) {
    return viewLocation === this.location.path();
  };

  getLastSetting() {
    this.settingService.getLastSetting().subscribe({
      next: (data:any) => {
        this.setting = data;
      },
      error: err => {
        this.setting.status = 'error'
      },
    });
  };

  openPopupConfig(type:string){
    if(this.configForm.valid || (type !== 'save')){
      var form = this.message.getMessageObj().POPUP(type,'');

      var popupConfirm = this.modalService.create({
        nzContent: AdminConfigConfirmComponent,
        nzComponentParams: {
          form: form
        }
      })

      popupConfirm.afterClose.subscribe((reponse:string) => {
        if (type == 'save') {
          if (reponse == 'yes') {
            this.saveSetting()
          }
        } else if (type == 'revert') {
          if (reponse == 'yes') {
            this.loadSettingFromLocal()
          } else {
            this.removeSettingFromLocal()      
          }
        } else if (type == 'expire') {
          if (reponse == 'yes') {
            this.saveSettingToLocal()
          } else {
            this.expiredSession()
          }
        } else {
          if (reponse == 'yes') {
            this.cancelSetting()
          }
        }
      })
    }
  }

  sessionObject:any   = localStorage.getItem('sessionObject') || {};

  getMapURL() {
    this.settingService.getMapUrl().subscribe({
      next: (res) => {
        
        this.listMapType = res;
      }
    }) 
  }

  chooseType(mapType:any) {
      this.setting.trafficSituations.mapUrl.name = this.listMapType[mapType].name;
      this.setting.trafficSituations.mapUrl.mapType = this.listMapType[mapType].mapType;
      if (mapType !== 'custom') {
          this.setting.trafficSituations.mapUrl.values = this.listMapType[mapType].values;
      }
  };

  checkSessionExpire(session:any) {
    if (session.expiredAt) {
      var currentTime = new Date();
      var expireTime = new Date(session.expiredAt);
      return (expireTime.getTime() - currentTime.getTime()) < 0;
    }
    return true;
  };

  openNotification() {
    this.modalRef = this.modalService.create({
      nzContent: AdminNotificationComponent,
      nzComponentParams: {
        currentSession: this.currentSession
      }
    })
    //   {
    //     initialState: {
    //       currentSession: this.currentSession,
    //     },
    //     class: 'modal-dialogue-centered modal-md',
    //     backdrop: 'static',
    //     keyboard: true
    //   }
    // )
  };

  expiredSession() {
    this.editMode = false;
    this.sessionObject = {};
    localStorage.removeItem('sessionObject')
  };

  getSetting() {
    if (localStorage.getItem('setting')) {
      // this.openPopupConfig('revert');
      this.configForm.dirty = true
    } else {
      this.getLastSetting();
    }
    this.editMode = true;
  };

  startSetting() {
    if (this.checkSessionExpire(this.sessionObject)) {
      this.settingService.getSession().subscribe(
        {
          next: (session:any) => {
            if (session.name) {
              this.currentSession = session.name;
              this.openNotification();
            } else {
              this.sessionObject = session;
              localStorage.setItem('sessionObject', JSON.stringify(session));
              this.getSetting();
            }
          }
        }
      )
    } else {
      this.getSetting();
    }
  };

  saveSettingToLocal() {
    localStorage.setItem('setting', JSON.stringify(this.setting));
    this.expiredSession();
  };

  removeSettingFromLocal() {
    localStorage.removeItem('setting');
  };

  loadSettingFromLocal() {
    this.setting = localStorage.getItem('setting');
    this.removeSettingFromLocal();
  };

  saveSetting() {
    this.setting.sessionKey = this.sessionObject.token;
    this.settingService.saveSetting(this.setting).subscribe({
      next: (lastSetting) => {
        this.setting = lastSetting;
        this.expiredSession();
        // this.openPopupConfig('expire');
      }
    })
  };

  cancelSetting() {
    this.settingService.cancelSession({
      sessionKey: this.sessionObject.token
    }).subscribe({
      next: (data) => {
        this.getLastSetting();
        this.expiredSession();
      }
    })
  };


  previewImage() {
      var imageUpload:any = document.getElementById('imageUpload');
      if (imageUpload != null && typeof (FileReader) !== 'undefined') {
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.gif|.png|.bmp)$/;
        var file = imageUpload.files[0];
      if (regex.test(file.name.toLowerCase())) {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e:any) => {
          this.setting.cameraSituations.imageError.image = e.currentTarget.result;
        };
      }
    }
  }

  isCollapsed = false
}
