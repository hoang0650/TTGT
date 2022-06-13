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
import { MainComponent } from './components/main/main.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminGroupsComponent } from './components/admin-groups/admin-groups.component';
import { CamerasCreateComponent } from './components/cameras-create/cameras-create.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
// import { AuthGuard } from '@auth0/auth0-angular';
import { AuthGuard } from './shared/auth.guard';
import { RoadworksCreateComponent } from './components/roadworks-create/roadworks-create.component';
import { ParkingsCreateComponent } from './components/parkings-create/parkings-create.component';
import { RoadeventsCreateComponent } from './components/roadevents-create/roadevents-create.component';
import { StaticMapCreateComponent } from './components/static-map-create/static-map-create.component';
import { CameraGroupsComponent } from './components/camera-groups/camera-groups.component';
import { MapInformationComponent } from './components/map-information/map-information.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full'},
  { path: 'home', component:MainComponent},
  { path: 'map', component: MapComponent , canActivate:[AuthGuard], data:{allowedRoles:['superadmin','admin']},
    children: [
      { path: '', component:MapInformationComponent },
      { path: 'events', 
        children: [
          { path: '', component: EventsManagerComponent },
          { path: 'stats', component: StatsEventsComponent },
        ] 
      },

      { path: 'cameras',
        children: [
          { path: '', component: CamerasComponent },
          { path: 'create', component: CamerasCreateComponent },
          { path: 'groups', component: CameraGroupsComponent },
          { path: ':id/update', component: CamerasCreateComponent },
          { path: '**', redirectTo: '' },
        ] 
      },

      { path: 'roadworks', 
        children: [
          { path: '', component: RoadworksComponent },
          { path: 'create', component: RoadworksCreateComponent },
          { path: ':id/update', component: RoadworksCreateComponent },
          { path: '**', redirectTo:'' },
        ] 
      },

      { path: 'parkings', 
        children: [
          { path: '', component: ParkingsComponent },
          { path: 'create', component: ParkingsCreateComponent },
          { path: ':id/update', component: ParkingsCreateComponent },
          { path: '**', redirectTo:'' },
        ] 
      },

      { path: 'roadevents', 
        children: [
          { path: '', component: RoadeventsComponent },
          { path: 'create', component: RoadeventsCreateComponent },
          { path: ':id/update', component: RoadeventsCreateComponent },
          { path: '**', redirectTo:'' },
        ] 
      },

      { path: 'staticmaps', 
        children: [
          { path: '', component: StaticMapComponent },
          { path: 'create', component: StaticMapCreateComponent },
          { path: ':id/update', component: StaticMapCreateComponent },
          { path: '**', redirectTo:'' },
        ] 
      },
    ]
  },
  { path: 'config', component:AdminComponent, canActivate:[AuthGuard], data:{allowedRoles:['admin','superadmin']},
    children:[
      { path: '', redirectTo: 'camera', pathMatch: 'full'},
      { path: 'camera', component: AdminConfigCameraComponent, canActivateChild:[AuthGuard], data:{allowedRoles:['admin','superadmin']} },
      { path: 'traffic', component: AdminConfigTrafficComponent, canActivateChild:[AuthGuard], data:{allowedRoles:['admin','superadmin']} },
      { path: 'event', component: AdminConfigEventComponent, canActivateChild:[AuthGuard], data:{allowedRoles:['admin','superadmin']} },
   ],
  },
  {
    path: 'users', component: AdminUsersComponent,canActivate:[AuthGuard], data:{allowedRoles:['admin','superadmin']}
  },
  {
    path: 'groups', component: AdminGroupsComponent,canActivate:[AuthGuard], data:{allowedRoles:['admin','superadmin']}
  },
  { path: 'unauthorized', component:UnauthorizedComponent },
  { path: 'notfound',component:NotFoundComponent}
];

@NgModule({ 
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
