# Thông tin giao thông 🚦

## 🎉 Giới thiệu

Đây là dự án thông tin giao thông tại Bình Định sử dụng hệ thống camera được thiết lập sẵn để hỗ trợ các công ty và chính phủ trong việc kiểm soát an ninh và tình trạng giao thông trong khu vực.

## ✨ Các tính năng

- Đăng ký, đăng nhập, đăng xuất người dùng với Auth0
- Xác thực người dùng: 
+ Phân quyền, bảo vệ `route` theo quyền được cho phép. 
+ Kiểm tra nếu không có quyền được cho phép thì sẽ chuyển hướng đến trang `/unauthorized`.
+ Kiểm tra xem người dùng có bị khóa hay không, nếu có thì sẽ hiển thị thông báo cho người dùng biết tài khoản đã bị khóa.
+ Bản đồ: xem tổng quan các thông tin về cảnh báo giao thông, camera giao thông, công trình thi công, bãi đỗ xe, phân luồng giao thông và thông tin tĩnh. 
- Quản lý:
+ ` Cảnh báo giao thông:` tạo cảnh báo, hiển thị các cảnh báo mới
+ ` Camera giao thông:` hiển thị danh sách các camera theo khu vực, thêm - xóa - sửa camera và nhóm camera theo quyền `admin` hoặc `superadmin`, xuất dữ liệu: csv, excel, json theo quyền `admin` hoặc `superadmin`
+ ` Công trình thi công:` hiển thị danh sách các công trình thi công, thêm - xóa - sửa dữ liệu công trình theo quyền `admin` hoặc `superadmin`, xuất dữ liệu: csv, excel, json theo quyền `admin` hoặc `superadmin`
+ ` Bãi đỗ xe:` hiển thị danh sách các bãi đỗ xe, thêm - xóa - sửa dữ liệu bãi đỗ xe theo quyền `admin` hoặc `superadmin`, xuất dữ liệu: csv, excel, json theo quyền `admin` hoặc `superadmin`
+ ` Phân luồng giao thông:` hiển thị danh sách phân luồng giao thông, thêm - xóa - sửa dữ liệu phân luồng giao thông theo quyền `admin` hoặc `superadmin`, xuất dữ liệu: csv, excel, json theo quyền `admin` hoặc `superadmin`
+ ` Lớp thông tinh tĩnh:` hiển thị danh sách thông tin tĩnh, thêm - xóa - sửa dữ liệu lớp thông tin tĩnh theo quyền `admin` hoặc `superadmin`, xuất dữ liệu: csv, excel, json theo quyền `admin` hoặc `superadmin`
- Quản trị:
+ ` Cấu hình:` cấu hình tình trạng camera, tình trạng giao thông, sự kiện giao thông theo quyền `admin` hoặc `superadmin` .
+ ` Người dùng:` hiển thị danh sách người dùng trong hệ thống, thống kê tài khoản, chỉnh sửa quyền người dùng: `khách`, `người dùng`, `quản lý`. `Khóa` và `mở khóa` người dùng
+ ` Nhóm người dùng:` hiển thị danh sách nhóm người dùng, thêm nhóm người dùng và thiết lập quyền được cho phép: `không có quyền`, `truy cập`, `chỉnh sửa`, `quản lý` vào các tài nguyên hệ thống.
- Thống kê:
+ `Thống kê cảnh báo:` hiển thị biểu đồ các cảnh báo theo `ngày`, `hàng tuần`, `hàng tháng`.

## 💻 Công nghệ sử dụng
- [Angular](https://angular.io/)
- [NodeJS](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.com/)
- [Auth0](https://auth0.com/)
- và các công nghệ khác

## 👤 Phía người dùng

Dự án được tạo với [Angular CLI](https://github.com/angular/angular-cli)  v13.2.5.
Để chạy dự án bạn cần phải cài đặt các module, bạn cần sử dụng câu lệnh `npm install`, sau đó sử dụng câu lệnh `npm start` để chạy dự án phía người dùng

### ⚙️ Thiết lập Auth0
- Sử dụng câu lệnh để cài đặt module Auth0: `npm install @auth0/auth0-angular`
- Mở file `app.module.ts` sau đó cấu hình theo dưới đây:

```
 import { BrowserModule } from '@angular/platform-browser';
 import { NgModule } from '@angular/core';
 import { AuthModule } from '@auth0/auth0-angular';
 import { AppComponent } from './app.component';

 @NgModule({
   declarations: [AppComponent],
   imports: [
     BrowserModule,
     AuthModule.forRoot({
       domain: 'YOUR_DOMAIN',
       clientId: 'YOUR_CLIENT_ID'
     }),
   ],
   bootstrap: [AppComponent],
 })
 export class AppModule {}
 ```
 
- Để cấu hình Auth0 quyền người cần làm theo các bước sau đây:
+ Vào trang Auth0: Chọn Auth Pipeline ==> chọn Rule ==> Chọn Create ==> Empty Rule ==> Tạo Name và dán đoạn mã sau đây vào Script:

``` 
function (user, context, callback) {
  user.app_metadata = user.app_metadata || {};
  // You can add a Role based on what you want
  // In this case I check domain
  var addRolesToUser = function(user, cb) { 
    if (user.app_metadata.roles) {
      return cb(null, user.app_metadata.roles);
    } else {
      return cb(null, ['guest']);
    }
  };

  addRolesToUser(user, function(err, roles) {
    if (err) {
      callback(err);
    } else {
      user.app_metadata.roles = roles;
      auth0.users.updateAppMetadata(user.user_id, user.app_metadata)
        .then(function(){
        context.idToken.roles = user.app_metadata.roles; 
        user.roles = roles;
          callback(null, user, context);
        })
        .catch(function(err){
          callback(err);
        }); 
    }
  });
}
```

Sau đó nhấn Save change.

- Để cấu hình Auth0 trả về `appmetadata` trong `access token` ta làm các bước như cấu hình quyền người dùng với Auth Pipeline ở trên:
+ dán đoạn mã sau đây vào Script:

```
function (user, context, callback) {
  const namespace = 'https://hoang0650.com';
  const assignedRoles = (context.authorization || {}).roles;
  let idTokenClaims = context.idToken || {};
  let accessTokenClaims = context.accessToken || {};
  idTokenClaims[`${namespace}/roles`] = assignedRoles;
  accessTokenClaims[`${namespace}/roles`] = assignedRoles;
  context.idToken = idTokenClaims;
  context.accessToken = accessTokenClaims;
  if (context.idToken && user.user_metadata) {
     context.idToken[namespace + '/user_metadata'] = user.user_metadata;
  }
   if (context.idToken && user.app_metadata) {
     context.idToken[namespace + '/app_metadata'] = user.app_metadata;
  }

 return callback(null, user, context);
}
```

Sau đó nhấn Save change.

- Để cấu hình Auth0 trả về name và appmetadata trong `access token`:
+ dán đoạn mã sau đây vào Script:

```
function (user, context, callback) {
  var namespace = "https://hoang0650.com";
  user.app_metadata = user.app_metadata || {};
  user.permissions = user.permissions || {};
  //var appmeta = (context.authorization || {}).app_metadata;
  user.name = user.name || {};
  context.accessToken[`${namespace}/app_metadata`] = user.app_metadata; 
  context.accessToken[`${namespace}/name`] = user.name;
  context.accessToken[`${namespace}/permission`] = user.permissions;
  callback(null, user, context);
}
```

Sau đó nhấn Save change.

## 🖥 Phía máy chủ

- Dự án được tạo với [NodeJS](https://nodejs.org/en/)  v14.15.4.
- Để chạy dự án bạn cần phải cài đặt các module, bạn cần sử dụng câu lệnh `npm install`, sau đó sử dụng câu lệnh `npm start` để chạy dự án phía máy chủ

## ✅ Kiểm thử
- Tài khoản dành cho `khách`: `email` guest@gmail.com `password` Guest123@
- Tài khoản dành cho `người dùng`: `email` user@gmail.com `password` User123@
- Tài khoản dành cho `quản lý`: `email` admin@gmail.com `password` Admin123@
- Tài khoản dành cho `siêu quản lý`: `email` superadmin@gmail.com `password` Superadmin123@  

