import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminConfigCameraComponent } from './components/admin-config-camera/admin-config-camera.component';
import { AdminConfigTrafficComponent } from './components/admin-config-traffic/admin-config-traffic.component';
import { AdminConfigEventComponent } from './components/admin-config-event/admin-config-event.component';
const routes: Routes = [
  { path: 'map', component: MapComponent },
  { path: 'admin', component:AdminComponent,
  children:[
    {path: '', redirectTo: 'configCamera', pathMatch: 'full'},
    {path: 'configCamera', component: AdminConfigCameraComponent},
    {path: 'configTraffic', component: AdminConfigTrafficComponent

  },
    {path: 'configEvent', component: AdminConfigEventComponent
 
  },
  ]
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
