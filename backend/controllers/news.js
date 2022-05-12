// var fs = require('fs');
// var path = require('path');

// var getFile = (absPath, cb) => {
// 	var filePath = path.join(__dirname, `../${absPath}`);
// 	fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => { cb(err, data); });
// };
const New = require('../models/news');

let MOCK_NEWS = [
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

function findAll(req, res){
    New.find({ status: { $ne: 'deleted' } }).exec()
        .then(n => (n && n.length > 0) && res.status(200).send(n) || res.status(200).json(MOCK_NEWS), () => res.status(500).end());
};

module.exports ={findAll};