import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/_guards/auth.guard';
import { AripoNotificationsComponent } from './aripo-notifications.component';

const routes: Routes = [
  {
    path: 'aripo-notifications',
    component: AripoNotificationsComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AripoNotificationsRoutingModule {}
