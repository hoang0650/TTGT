import { Component, OnInit } from '@angular/core';
import { ConfigureService } from 'src/app/services/configure.service';
import { MapService } from 'src/app/services/map.service';
import { AppComponent } from 'src/app/app.component';
import { NewService } from 'src/app/services/new.service';
import { Content } from 'src/app/interfaces/contents';
import * as AOS from 'aos';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
declare var $: any;
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  isScrolled:boolean = false;
  currentState:boolean = false;
  active = 0;
  noWrapSlides:boolean = true;
  contents: Content[]=[
    {
      title: 'Trung tâm Quản lý đường hầm sông Sài Gòn tổ chức thông tin tuyên truyền về tình hình Biển Đông',
      img: 'http://www.hamsongsaigon.com.vn/images/stories/tintuc/tintrungtam/tinchinhquyen/Nam2016/ThongtintuyentruyenvetinhhinhBienDongnam2016-08.07.2016/image004.jpg',
      message: 'Thực hiện Kế hoạch số 57-KH/ĐUTT ngày 20 tháng 6 năm 2016 của Đảng ủy Trung tâm Quản lý đường hầm sông Sài Gòn về tổ chức thông tin tuyên truyền về tình hình biển Đông. Chiều ngày 08/7/2016, Đảng ủy Trung tâm Quản lý đường hầm sông Sài Gòn đã tổ chức buổi thông tin tuyên truyền về tình hình biển Đông cho cán bộ, đảng viên, viên chức, nhân viên Trung tâm.',
      url: 'http://www.hamsongsaigon.com.vn/tin-chinh-quyen/395-thong-tin-tuyen-truyen-ve-tinh-hinh-bien-dong-nam2016.html'
  },
  {
      title: 'Dự án bổ sung, nâng cấp hệ thống Camera đường hầm sông Sài Gòn',
      img: 'http://www.hamsongsaigon.com.vn/images/stories/duan/NangcaphethongCAMERAnam2013/image002.jpg',
      message: 'Nhằm hỗ trợ kịp thời và chính xác cho bộ phận giám sát đường hầm có phương án xử lý, điều tiết lưu lượng kịp thời, đảm bảo an toàn giao thông và hạn chế ùn tắc có thể xảy ra cho các phương tiện khi lưu thông qua đường hầm sông Sài gòn, cũng như đảm bảo các hình ảnh ghi nhận, truy xuất được từ hệ thống đủ căn cứ xử phạt các hành vi vi phạm quy định giao thông và an ninh trật tự tại công trình đường hầm sông Sài Gòn.',
      url: 'http://www.hamsongsaigon.com.vn/du-an/49-du-an/260-nang-cap-he-thong-camera-nam2013.html'
  },
  {
      title: 'Dự án lắp đặt bảng phân làn bằng đèn LED tại hai đầu đường hầm sông Sài Gòn',
      img: 'http://www.hamsongsaigon.com.vn/images/stories/duan/LapdatbangphanlanbangdenLEDnam2013/image001.jpg',
      message: 'Nhằm thông báo kịp thời tình hình giao thông trong đường hầm để các phương tiện điều chỉnh cách thức lưu thông phù hợp cũng như tuân thủ các quy định khi lưu thông trong đường hầm, góp phần hạn chế ùn tắc, tai nạn giao thông; tuyên truyền nâng cao ý thức chấp hành luật giao thông.',
      url: 'http://www.hamsongsaigon.com.vn/du-an/49-du-an/259-du-an-lap-den-led-ham-song-sg-2013.html'
  }
  ];
  favoriteList: any;
  // imageError = configure.backend + 'api/setting/getimageerror';
  backend!: string;
  listEventType:any;
  listEvent: any;

  constructor(public appCom: AppComponent,private configure: ConfigureService, private mapService: MapService, private newService: NewService, private auth: AuthorizationService, private route: ActivatedRoute, private nzMessage: NzMessageService) { }

  ngOnInit(): void {
    var message = this.route.snapshot.queryParamMap.get("message")
    if (message == "blocked") {
      this.nzMessage.error("Tài khoản của bạn đã bị khóa")
    }
    AOS.init();
    this.pullDown();
    this.getAllType()
    this.getInfoOfUser()
  }

  imageError(event:any) {
    event.target.src = this.configure.backend + 'api/setting/getimageerror'
  }

  getInfoOfUser() {
    this.mapService.getInfoOfUser().subscribe({
      next: (res:any) => {
        this.favoriteList = []
        res.favorite.forEach((item:any) => {
          if (item.fType == 'camera') {
            this.favoriteList.push(item)
          }
        })
      }
    });
  }

  pullDown() {
    $(window).on('scroll',function(){
      var scrollToTop = $('.scroll-top-to'),
      scroll = $(window).scrollTop();
      if(scroll >=200){
        scrollToTop.fadeIn(200);
      }else{
        scrollToTop.fadeOut(100);
      }
    });
    $('.scroll-top-to').on('click',function(){
      $('html, body').animate({ scrollTop: 0 },50);
      return false;
    })
  }

  getAllEvent() {
    this.mapService.getAllEvent().subscribe({
      next: (res) => {
        this.listEvent = res
        
        if (this.listEventType) {
          this.listEvent.forEach((event:any) => {
            event.color = this.listEventType[event.type].color;
          });
        }
      }
    })
  }


  getAllType() {
    this.mapService.getAllType().subscribe({
      next: (res) => {
        this.listEventType = res;
        this.getAllEvent();
      }
    })
  }

  login() {
    this.auth.login()
  }
}
