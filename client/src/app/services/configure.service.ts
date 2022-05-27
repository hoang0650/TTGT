import { Injectable } from '@angular/core';
import { tileLayer } from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class ConfigureService {

  constructor() { }
  
  backend = 'http://localhost:3000/'
  livemap = '//map.thongtingiaothong.vn/'
  mapapi = '//api.thongtingiaothong.vn/'
  realtime = '//localhost:3002/realtime/'

  auth0 = {
      domain: 'ducminhquan.auth0.com',
      clientID: '7wBvhyXrTZ3b2npBB7bjqA6N3MVp8zuv'
  }

  cameraTypeList = [
    'vov',
    'vov_sony',
    'vov_dahua',
    'tth',
    'tth_analog',
    'tth_axis',
    'tth_paragon',
    'udc_foscam',
    'nguyenhue'
  ]

  cameraConnectStatus = [
      { id: 'good', name: 'Tốt' },
      { id: 'not_good', name: 'Chập chờn' },
      { id: 'unknown', name: 'Chưa xác định' }
  ]

  cameraMarkerIcon = {
      type: 'div',
      className: 'marker-camera',
      iconSize: [33.5, 40],
      iconAnchor: [16.5, 36.5]
  }

  cameraMarkerIconOpacit = {
      type: 'div',
      className: ['marker-camera', 'opacity'].join(' '),
      iconSize: [33.5, 40],
      iconAnchor: [16.5, 36.5]
  }

  cameraMarkerIconSelected = {
      type: 'div',
      className: ['marker-camera', 'selected'].join(' '),
      iconSize: [33.5, 40],
      iconAnchor: [16.5, 36.5]
  }

  roadworkTypeList = [
      'Sửa đường',
      'Sửa hệ thống thoát nước',
      'Lễ hội',
      'Lắp camera'
  ]

  roadworkStatusList = [
      'Kế hoạch',
      'Đang thực hiện',
      'Đã hoàn thành'
  ]

  itemSelectedStyle = {
      fillColor: 'green',
      weight: 6,
      opacity: 0.9,
      color: '#db2828',
      dashArray: '3',
      fillOpacity: 0.7
  }

  itemHoverStyle = {
    fillColor: 'green',
    weight: 10,
    opacity: 0.3,
    color: '#db2828',
    dashArray: '3',
    fillOpacity: 0.7
  }

  baselayer = {
    tiles: tileLayer('//map.thongtingiaothong.vn/transport-full/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
    }),
    location:{
      center: [  10.762622, 106.660172 ],
      zoom: 14
    },
  }

  options:any = {
    layers: [
      this.baselayer.tiles,
    ],
    attributionControl:false,
    worldCopyJump: true,
    center: [  10.762622, 106.660172 ],
    zoom: 14,
    zoomControl: false
  }

  center = {
    lng: 106.660172,
    lat: 10.762622,
    zoom: 14
  }

  mapCameraMarkerIcon:any = {
      type: 'div',
      className: 'map-camera-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
  }

  mapCameraErrorMarkerIcon = {
      type: 'div',
      className: 'map-camera-error-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
  }

  mapCameraNewMarkerIcon:any = {
      type: 'div',
      className: 'map-camera-new-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
  }

  mapCameraPTZMarkerIcon:any = {
      type: 'div',
      className: 'map-camera-ptz-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
  }
  
  mapCameraNewPTZMarkerIcon:any = {
      type: 'div',
      className: 'map-camera-ptz-new-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
  }

  mapCameraErrorPTZMarkerIcon = {
      type: 'div',
      className: 'map-camera-error-ptz-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
  }

  mapCameraUndefinedMarkerIcon = {
      type: 'div',
      className: 'map-camera-undefined-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
  }

  mapCameraErrorUndefinedMarkerIcon = {
      type: 'div',
      className: 'map-camera-undefined-error-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
  }

  mapCameraUnknownMarkerIcon = {
      type: 'div',
      className: 'map-camera-unknown-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
  }

  mapCameraUnknownPTZMarkerIcon = {
    type: 'div',
    className: 'map-camera-ptz-unknown-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  }

  mapCameraUnknownUndefinedMarkerIcon = {
    type: 'div',
    className: 'map-camera-undefined-unknown-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  }

  roadEventColor = [
    { id: 'red', code: '#db2828', class: 'roadevent-red', name: 'Đỏ' },
    { id: 'green', code: '#21ba45', class: 'roadevent-green', name: 'Xanh Lá' },
    { id: 'blue', code: '#2185d0', class: 'roadevent-blue', name: 'Xanh Dương' },
    { id: 'purple', code: '#a333c8', class: 'roadevent-purple', name: 'Tím' },
    { id: 'black', code: '#1b1c1d', class: 'roadevent-black', name: 'Đen' }
  ]

  mapConfig = {
    imageErrorText: 'Có lỗi kết nối',
    delayNotification: 0 * 1000,
    refreshForTrafficLayer: 5 * 60 * 1000,
    refreshCameraLayer: 5 * 60 * 1000,
    refreshForEventLayer: 30 * 1000,
    allowedZoomToGetPriviewList: 16,
    refreshCameraTime: 60 * 1000,
    tts: {
      voice: 'both',
      apiKey: '1245be6ae65245ee8c7e3debbf877919'
    },
    mapUrl: {
      mapNoText: '//map.thongtingiaothong.vn/transport-notext/{z}/{x}/{y}.png',
      mapText: '//map.thongtingiaothong.vn/transport-text/{z}/{x}/{y}.png',
      mapFull: '//map.thongtingiaothong.vn/transport-full/{z}/{x}/{y}.png'
    },
    legendTrafficText: {
      jam: 'Ùn tắc',
      congestion: 'Đông xe',
      normal: 'Thông thoáng',
      slow: 'Di chuyển chậm'
    },
    limitHistoryView: 3
  }

  noticeBoard = [
    {
      id: '101',
      name: 'Đường cấm',
      url: 'assets/images/bienbao/101.png'
    },
    {
      id: '102',
      name: 'Cấm đi ngược chiều',
      url: 'assets/images/bienbao/102.png'
    },
    {
      id: '103a',
      name: 'Cấm ôtô',
      url: 'assets/images/bienbao/103a.png'
    },
    {
      id: '104',
      name: 'Cấm xe máy',
      url: 'assets/images/bienbao/104.png'
    },
    {
      id: '105',
      name: 'Cấm ôtô và môtô',
      url: 'assets/images/bienbao/105.png'
    },
    {
        id: '106a',
        name: 'Cấm xe tải',
        url: 'assets/images/bienbao/106a.png'
    },
    {
        id: '110a',
        name: 'Cấm xe đạp',
        url: 'assets/images/bienbao/110a.png'
    },
    {
        id: '111a',
        name: 'Cấm xe gắn máy',
        url: 'assets/images/bienbao/111a.png'
    },
    {
        id: '114',
        name: 'Cấm xe súc vật kéo',
        url: 'assets/images/bienbao/114.png'
    },
    {
        id: '117',
        name: 'Hạn chế chiều cao',
        url: 'assets/images/bienbao/117.png'
    },
    {
        id: '123a',
        name: 'Cấm rẽ trái',
        url: 'assets/images/bienbao/123a.png'
    },
    {
        id: '123b',
        name: 'Cấm rẽ phải',
        url: 'assets/images/bienbao/123b.png'
    },
    {
        id: '124a',
        name: 'Cấm quay đầu',
        url: 'assets/images/bienbao/124a.png'
    },
    {
        id: '125',
        name: 'Cấm vượt',
        url: 'assets/images/bienbao/125.png'
    },
    {
        id: '127',
        name: 'Tốc độ tối đa cho phép 30',
        url: 'assets/images/bienbao/127_30.png'
    },
    {
        id: '127',
        name: 'Tốc độ tối đa cho phép 50',
        url: 'assets/images/bienbao/127_50.png'
    },
    {
        id: '127',
        name: 'Tốc độ tối đa cho phép 70',
        url: 'assets/images/bienbao/127_70.png'
    },
    {
        id: '127',
        name: 'Tốc độ tối đa cho phép 90',
        url: 'assets/images/bienbao/127_90.png'
    },
    {
        id: '130',
        name: 'Cấm dừng và đỗ xe',
        url: 'assets/images/bienbao/130.png'
    },
    {
        id: '131a',
        name: 'Cấm đỗ xe',
        url: 'assets/images/bienbao/131a.png'
    },
    {
        id: '202',
        name: 'Chỗ ngoặt nguy hiểm liên tiếp',
        url: 'assets/images/bienbao/202.png'
    },
    {
        id: '203c',
        name: 'Đường bị hẹp bên phải',
        url: 'assets/images/bienbao/203c.png'
    },
    {
        id: '207a',
        name: 'Giao nhau với đường không ưu tiên',
        url: 'assets/images/bienbao/207a.png'
    },
    {
        id: '208',
        name: 'Giao nhau với đường ưu tiên',
        url: 'assets/images/bienbao/208.png'
    },
    {
        id: '211',
        name: 'Giao nhau với đường sắt không có rao chắn',
        url: 'assets/images/bienbao/211.png'
    },
    {
        id: '214',
        name: 'Cầu cất',
        url: 'assets/images/bienbao/214.png'
    },
    {
        id: '221b',
        name: 'Đường không bằng phẳng',
        url: 'assets/images/bienbao/221b.png'
    },
    {
        id: '222',
        name: 'Đường trơn',
        url: 'assets/images/bienbao/222.png'
    },
    {
        id: '225',
        name: 'Trẻ em',
        url: 'assets/images/bienbao/225.png'
    },
    {
        id: '228',
        name: 'Đá lở',
        url: 'assets/images/bienbao/228.png'
    },
    {
        id: '229',
        name: 'Giải mấy bay lên xuống',
        url: 'assets/images/bienbao/229.png'
    },
    {
        id: '233',
        name: 'Nguy hiểm khác',
        url: 'assets/images/bienbao/233.png'
    },
    {
        id: '245',
        name: 'Đi chậm',
        url: 'assets/images/bienbao/245.png'
    },
    {
        id: '301a',
        name: 'Hướng đi thẳng phải theo',
        url: 'assets/images/bienbao/301a.png'
    },
    {
        id: '301b',
        name: 'Hướng đi phải phải theo',
        url: 'assets/images/bienbao/301b.png'
    },
    {
        id: '301c',
        name: 'Hướng đi trái phải theo',
        url: 'assets/images/bienbao/301c.png'
    },
    {
        id: '301d',
        name: 'Các xe chỉ được rẽ phải',
        url: 'assets/images/bienbao/301d.png'
    },
    {
        id: '301e',
        name: 'Các xe chỉ được rẽ trái',
        url: 'assets/images/bienbao/301e.png'
    },
    {
        id: '301f',
        name: 'Các xe chỉ được đi thẳng và rẽ phải',
        url: 'assets/images/bienbao/301f.png'
    },
    {
        id: '301h',
        name: 'Các xe chỉ được đi thẳng và rẽ trái',
        url: 'assets/images/bienbao/301h.png'
    },
    {
        id: '304',
        name: 'Đường giành cho xe thô sơ',
        url: 'assets/images/bienbao/304.png'
    },
  ]
}
