import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NZ_I18N, vi_VN } from 'ng-zorro-antd/i18n';
import { registerLocaleData  } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { FormsModule } from '@angular/forms';
import { CellDirective } from './modules/directive/cell.directive';
import { ColumnDirective } from './modules/directive/column.directive';
import { HeaderDirective } from './modules/directive/header.directive';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MapComponent } from './components/map/map.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { StaticMapPopupComponent } from './components/static-map-popup/static-map-popup.component';
import { MapPopupCreateEventComponent } from './components/map-popup-create-event/map-popup-create-event.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { SearchFilterPipe } from './pipes/search-filter.pipe';
import { MomentModule } from 'ngx-moment';
import { OrderByPipe } from './pipes/order-by.pipe';
import { JwtModule } from '@auth0/angular-jwt';
import { SearchRoadsDirective } from './directives/search-roads.directive';
// import Nz-zorro
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { HeaderComponent } from './components/header/header.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule} from 'ng-zorro-antd/layout';
import { NzMenuModule} from 'ng-zorro-antd/menu';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
//
import { AuthModule, AuthHttpInterceptor} from '@auth0/auth0-angular';
import { AdminComponent } from './components/admin/admin.component';


registerLocaleData(vi);
export function tokenGetters() {
  return localStorage.getItem('id_token');
}
@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    StaticMapPopupComponent,
    MapPopupCreateEventComponent,
    SearchFilterPipe,
    OrderByPipe,
    SearchRoadsDirective,
    HeaderComponent,
    CellDirective,
    ColumnDirective,
    HeaderDirective,
    AdminComponent,
 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    NzModalModule,
    NzInputModule,
    LeafletModule,
    MomentModule,
    NzButtonModule,
    NzIconModule,
    NzDropDownModule,
    NzTypographyModule,
    NzLayoutModule,
    NzMenuModule,
    NzDropDownModule,
    NzImageModule,
    NzFormModule,
    NzBreadCrumbModule,
    NzDividerModule,
    NzCardModule,
    NzCheckboxModule,
    JwtModule,
    AuthModule.forRoot({
      domain: 'https://dev-0gy0vn9g.us.auth0.com',
      clientId: '4iTVIOrKT5vVjBvDK0felIGt4TqCfOLV',
      audience: 'https://dev-0gy0vn9g.us.auth0.com/api/v2/',
      scope: 'openid profile app_metadata roles name email username',
      redirectUri: window.location.origin,
      responseType:'token id_token',
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
      httpInterceptor:{
      allowedList:[
          'http://localhost:3000/api/admin',
          'http://localhost:3000/api/admin/*',
          'http://localhost:3000/api/setting',
          'http://localhost:3000/api/setting/getimageerror',
          'http://localhost:3000/api/setting/*',
          'http://localhost:3000/api/parking',
          'http://localhost:3000/api/parking/*',
          'http://localhost:3000/api/cameras',
          'http://localhost:3000/api/cameras/*',
          'http://localhost:3000/api/roadwork',
          'http://localhost:3000/api/roadwork/*',
          'http://localhost:3000/api/roadevent',
          'http://localhost:3000/api/roadevent/*',
          'http://localhost:3000/api/snapshot',
          'http://localhost:3000/api/snapshot/*',
          'http://localhost:3000/api/staticmap',
          'http://localhost:3000/api/staticmap/*',
          'http://localhost:3000/api/cameras/groups',
          'http://localhost:3000/api/cameras/groups/*',
          'http://localhost:3000/api/groups',
          'http://localhost:3000/api/groups/*',
          'http://localhost:3000/api/staticmap',
          'http://localhost:3000/api/staticmap/*',
          'http://localhost:3000/api/stats',
          'http://localhost:3000/api/stats/heatmap',
          'http://localhost:3000/api/stats/events',
          'http://localhost:3000/api/stats/events/*',
          'http://localhost:3000/api/event',
          'http://localhost:3000/api/event/*',
          'http://localhost:3000/api/news',
          'http://localhost:3000/api/news/*',
          'http://localhost:3000/api/user',
          'http://localhost:3000/api/user/*',
          '/api',
          '/api/setting/getimageerror',
          '/api/*',
          {
            uri: 'https://dev-0gy0vn9g.us.auth0.com/api/v2/*',
            tokenOptions:{
              audience: 'https://dev-0gy0vn9g.us.auth0.com/api/v2',
              scope: 'openid profile app_metadata roles name email username'
            }
          }
        ],
      }

    }),
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetters,
        allowedDomains: ["localhost:3000/api/admin","localhost:3000/api/admin/*"],    
      },
    }),
  ],
  providers: [
     { provide: NZ_I18N, useValue: vi_VN },
     {provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi:true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
