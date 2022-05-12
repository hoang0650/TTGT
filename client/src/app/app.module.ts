import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NZ_I18N } from 'ng-zorro-antd/i18n';
import { en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MapComponent } from './components/map/map.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { StaticMapPopupComponent } from './components/static-map-popup/static-map-popup.component';
import { MapPopupCreateEventComponent } from './components/map-popup-create-event/map-popup-create-event.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { SearchFilterPipe } from './pipes/search-filter.pipe';
import { MomentModule } from 'ngx-moment';
import { OrderByPipe } from './pipes/order-by.pipe';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { SearchRoadsDirective } from './directives/search-roads.directive';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    StaticMapPopupComponent,
    MapPopupCreateEventComponent,
    SearchFilterPipe,
    OrderByPipe,
    SearchRoadsDirective,
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
    NzTypographyModule
  ],
  providers: [{ provide: NZ_I18N, useValue: en_US }],
  bootstrap: [AppComponent]
})
export class AppModule { }
