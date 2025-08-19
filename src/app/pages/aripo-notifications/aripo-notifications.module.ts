import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AripoNotificationsComponent } from './aripo-notifications.component';
import { provideHttpClient } from '@angular/common/http';

const routes: Routes = [
  {
    path: '',
    component: AripoNotificationsComponent,
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
