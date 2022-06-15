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
  { path: 'home', component:MainComponent, canActivate:[AuthGuard], data:{ allowedRoles:["guest"] } },
  { path: 'map', component: MapComponent,
    children: [
      { path: '', component:MapInformationComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:['cameras:read','parkings:read','roadevents:read','roadworks:read','staticmaps:read','trafficevents:read'] } },
      { path: 'events',
        children: [
          { path: '', component: EventsManagerComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["trafficevents:read"] } },
          { path: 'stats', component: StatsEventsComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["trafficevents:read"] } },
        ] 
      },

      { path: 'cameras',
        children: [
          { path: '', component: CamerasComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["cameras:read"] }  },
          { path: 'create', component: CamerasCreateComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["cameras:manage"] } },
          { path: 'groups', component: CameraGroupsComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["cameras:update"] } },
          { path: ':id/update', component: CamerasCreateComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["cameras:update"] } },
          { path: '**', redirectTo: '' },
        ] 
      },

      { path: 'roadworks', 
        children: [
          { path: '', component: RoadworksComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["roadworks:read"] }   },
          { path: 'create', component: RoadworksCreateComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["roadworks:manage"] }   },
          { path: ':id/update', component: RoadworksCreateComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["roadworks:update"] }   },
          { path: '**', redirectTo:'' },
        ] 
      },

      { path: 'parkings',
        children: [
          { path: '', component: ParkingsComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["parkings:read"] } },
          { path: 'create', component: ParkingsCreateComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["parkings:manage"] } },
          { path: ':id/update', component: ParkingsCreateComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["parkings:update"] } },
          { path: '**', redirectTo:'' },
        ] 
      },

      { path: 'roadevents',
        children: [
          { path: '', component: RoadeventsComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["roadevents:read"] } },
          { path: 'create', component: RoadeventsCreateComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["roadevents:manage"] } },
          { path: ':id/update', component: RoadeventsCreateComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["roadevents:update"] } },
          { path: '**', redirectTo:'' },
        ] 
      },

      { path: 'staticmaps',
        children: [
          { path: '', component: StaticMapComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["staticmaps:read"] } },
          { path: 'create', component: StaticMapCreateComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["staticmaps:manage"] } },
          { path: ':id/update', component: StaticMapCreateComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["staticmaps:update"] } },
          { path: '**', redirectTo:'' },
        ] 
      },
    ]
  },
  { path: 'config', component:AdminComponent,
    children:[
      { path: '', redirectTo: 'camera', pathMatch: 'full'},
      { path: 'camera', component: AdminConfigCameraComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["settings:update"] }, },
      { path: 'traffic', component: AdminConfigTrafficComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["settings:update"] }, },
      { path: 'event', component: AdminConfigEventComponent, canActivate:[AuthGuard], data:{ allowedRoles:['user', 'admin'], allowedPermissions:["settings:update"] }, },
   ],
  },
  {
    path: 'users', component: AdminUsersComponent, canActivate:[AuthGuard], data:{ allowedRoles:['admin'], allowedPermissions:["settings:manage"] }
  },
  { path: 'unauthorized', component:UnauthorizedComponent },
  { path: 'notfound',component:NotFoundComponent},
  { path: '**', redirectTo: 'notfound'}
];

@NgModule({ 
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
