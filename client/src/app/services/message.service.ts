import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() { }
  
  WARNING = {
    fieldRequire: 'Trường này không được để trống',
    priceInvalid: 'Khoảng cách giá không hợp lý',
    timeInvalid: 'Thời gian kết thúc phải lớn hơn thời gian bắt đầu'
  }

  language = 'vi';
  messages:any = {
    vi: {
      
      BUTTON: {
        CREATE: 'Tạo mới',
        UPDATE: 'Cập nhật',
        REMOVE: 'Xóa',
        BACK: 'Quay lại'
      },
      PLACEHOLD: {
        SEARCH: 'Tìm kiếm nhanh'
      },
      POPUP: (type:string, content:string) => {
        var template:any = {
          create: {
            header: 'Tạo mới thành công',
            description: 'Bạn đã tạo ' + content + ' thành công.'
          },
          update: {
            header: 'Cập nhật thành công',
            description: 'Bạn đã cập nhật ' + content + ' thành công.'
          },
          remove: {
            header: 'Xóa ' + content,
            description: 'Bạn có chắc muốn xóa ' + content + ' hay không.'
          },
          save: {
            header: 'Lưu cấu hình',
            description: 'Bạn có chắc muốn lưu cấu hình?'
          },
          cancel: {
            header: 'Hủy',
            description: 'Bạn có chắc muốn hủy những thiệt lập mới?'
          },
          urgentUpdate: {
            header: 'Cập nhật ngay lập tức',
            description: 'Hành động này sẽ ảnh hưởng tới hệ thống, bạn có chắc không?'
          },
          revert: {
            header: 'Tại lại cấu hình đang lưu',
            description: 'Bạn có muốn tải lại cấu hình bạn đã lưu trước đó?'
          },
          expire: {
            header: 'Phiên làm việc đã hết hạn',
            description: 'Bạn có muốn lưu tạm cấu hình để tiếp tục trong phiên làm việc sau?'
          },
          back: {
            header: 'Có thay đổi',
            description: 'Bạn có muốn quay lại trong khi dữ liệu chưa được cập nhật?'
          },
          doneReport: {
            header: 'Hoàn tất',
            description: 'Báo cáo sẽ không thể chỉnh sửa sau khi hoàn tất'
          },
          deleteReport: {
            header: 'Xóa',
            description: 'Bạn có chắc chắn muốn xóa báo cáo này không?'
          },
          deleteStation: {
            header: 'Xóa',
            description: 'Bạn có chắc chắn muốn xóa trạm này không?'
          },
          deleteTemplate: {
            header: 'Xóa',
            description: 'Bạn có chắc chắn muốn xóa quan trắc này không?'
          }
        };
        return template[type];
      },
      NOTICE: (type:string, content:string) => {
        var template:any = {
          create: 'Bạn đã tạo ' + content + ' thành công.',
          update: 'Bạn đã cập nhật ' + content + ' thành công.',
          remove: 'Bạn đã xóa ' + content + ' thành công.'
        };
        return template[type];
      }
  }
  };

  setLanguage(lang:string) {
    if (lang) {
      this.language = lang;
    }
  }

  getMessageObj() {
    return this.messages[this.language];
  }
}