import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './components/map/map.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminConfigCameraComponent } from './components/admin-config-camera/admin-config-camera.component';
import { AdminConfigTrafficComponent } from './components/admin-config-traffic/admin-config-traffic.component';
import { AdminConfigEventComponent } from './components/admin-config-event/admin-config-event.component';
import { EventsManagerComponent } from './components/events-manager/events-manager.component';
import { CamerasComponent } from './components/cameras/cameras.component';
import { RoadworksComponent } from './components/roadworks/roadworks.component';
import { ParkingsComponent } from './components/parkings/parkings.component';
import { StaticMapComponent } from './components/static-map/static-map.component';
import { RoadeventsComponent } from './components/roadevents/roadevents.component';
import { StatsEventsComponent } from './components/stats-events/stats-events.component';
import { AdminConfigTestComponent } from './components/admin-config-test/admin-config-test.component';
import { MainComponent } from './components/main/main.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminGroupsComponent } from './components/admin-groups/admin-groups.component';
import { CamerasCreateComponent } from './components/cameras-create/cameras-create.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
// import { AuthGuard } from '@auth0/auth0-angular';
import { AuthGuard } from './shared/auth.guard';
const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', component:MainComponent},
  { path: 'map', component: MapComponent , canActivate:[AuthGuard], data:{allowedRoles:['superadmin']}},
  { path: 'config', component:AdminComponent, canActivate:[AuthGuard], data:{allowedRoles:['admin','superadmin']},
    children:[
      { path: '', redirectTo: 'camera', pathMatch: 'full'},
      { path: 'camera', component: AdminConfigCameraComponent, canActivateChild:[AuthGuard], data:{allowedRoles:['admin','superadmin']} },
      { path: 'traffic', component: AdminConfigTrafficComponent, canActivate:[AuthGuard], data:{allowedRoles:['superadmin']}},
      { path: 'event', component: AdminConfigEventComponent, canActivate:[AuthGuard], data:{allowedRoles:['superadmin']}},
      { path: 'test', component: AdminConfigTestComponent },
   ],
  },
  {
    path: 'users', component: AdminUsersComponent
  },
  {
    path: 'groups', component: AdminGroupsComponent
  },
  { path: 'events',
    children: [
      { path: '', component:EventsManagerComponent },
      { path: 'stats', component:StatsEventsComponent }
    ]
  },
  { path: 'cameras',
    children: [
      { path: '', component:CamerasComponent },
      { path: 'create', component: CamerasCreateComponent },
      { path: ':id/update', component: CamerasCreateComponent },
      { path: '**', redirectTo:'' }
    ]
  },
  { path: 'roadworks', component:RoadworksComponent },
  { path: 'parkings', component:ParkingsComponent },
  { path: 'staticmaps', component:StaticMapComponent },
  { path: 'roadevents', component:RoadeventsComponent },
  { path: 'unauthorized', component:UnauthorizedComponent },
  { path: 'notfound', component:NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
