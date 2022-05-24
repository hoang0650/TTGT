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
const routes: Routes = [
  { path: 'map', component: MapComponent },
  { path: 'home', component:MainComponent},
  { path: 'config', component:AdminComponent,
    children:[
      { path: '', redirectTo: 'camera', pathMatch: 'full'},
      { path: 'camera', component: AdminConfigCameraComponent },
      { path: 'traffic', component: AdminConfigTrafficComponent },
      { path: 'event', component: AdminConfigEventComponent },
   ],
  },
  
  { path: 'events',
    children: [
      { path: '', component:EventsManagerComponent },
      { path: 'stats', component:StatsEventsComponent }
    ]
  },
  { path: 'cameras', component:CamerasComponent },
  { path: 'roadworks', component:RoadworksComponent },
  { path: 'parkings', component:ParkingsComponent },
  { path: 'staticmaps', component:StaticMapComponent },
  { path: 'roadevents', component:RoadeventsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
