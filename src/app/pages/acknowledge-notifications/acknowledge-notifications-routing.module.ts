import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/_guards/auth.guard';
import { AcknowledgeNotificationsComponent } from './acknowledge-notifications.component';

const routes: Routes = [
  {
    path: 'acknowledge-notifications',
    component: AcknowledgeNotificationsComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AcknowledgeNotificationsRoutingModule {}
