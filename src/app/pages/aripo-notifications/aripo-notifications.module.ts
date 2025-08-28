import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AripoNotificationsComponent } from './aripo-notifications.component';
import { HagueNotificationsComponent } from './hague-notifications.component';
import { MadridNotificationsComponent } from './madrid-notifications.component';
import { provideHttpClient } from '@angular/common/http';

const routes: Routes = [
  {
    path: '',
    component: AripoNotificationsComponent,
  },
  {
    path: 'aripo-incoming',
    component: AripoNotificationsComponent,
  },
  {
    path: 'aripo-outgoing',
    component: AripoNotificationsComponent,
  },
  {
    path: 'aripo-dashboard',
    component: AripoNotificationsComponent,
  },
  {
    path: 'hague-incoming',
    component: HagueNotificationsComponent,
  },
  {
    path: 'hague-outgoing',
    component: HagueNotificationsComponent,
  },
  {
    path: 'hague-dashboard',
    component: HagueNotificationsComponent,
  },
  {
    path: 'madrid-incoming',
    component: MadridNotificationsComponent,
  },
  {
    path: 'madrid-outgoing',
    component: MadridNotificationsComponent,
  },
  {
    path: 'madrid-dashboard',
    component: MadridNotificationsComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  providers: [
    provideHttpClient()
  ]
})
export class AripoNotificationsModule {}
