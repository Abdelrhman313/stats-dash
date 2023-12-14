import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { GroupsComponent } from './components/groups/groups.component';
import { VisitDetailsComponent } from './components/visit-details/visit-details.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TrackingComponent } from './components/tracking/tracking.component';
import { IsLogoutGuard } from './guards/is-logout.guard';
import { IsLoginGuard } from './guards/is-login.guard';
import { MapComponent } from './components/map/map.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent, canActivate: [IsLogoutGuard] },
  { path: 'groups', component: GroupsComponent, canActivate: [IsLoginGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [IsLoginGuard] },
  { path: 'visit-details', component: VisitDetailsComponent, canActivate: [IsLoginGuard] },
  { path: 'tracking', component: TrackingComponent, canActivate: [IsLoginGuard] },
  { path: 'map', component: MapComponent, canActivate: [IsLoginGuard] },
  { path: '**', component: GroupsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
