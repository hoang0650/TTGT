import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminConfigCameraComponent } from './components/admin-config-camera/admin-config-camera.component';
const routes: Routes = [
  { path: 'map', component: MapComponent },
  { path: 'admin', component:AdminComponent,
  children:[
    {path: '', redirectTo: 'configCamera', pathMatch: 'full'},
    {path: 'configCamera', component: AdminConfigCameraComponent
 
  }
  //   {path: 'event', component: AdminConfigEventComponent

  // },
  //   {path: 'traffic', component: AdminConfigTrafficComponent
 
  // },
  ]
}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
