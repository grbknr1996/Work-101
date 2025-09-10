import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/_guards/auth.guard';
import { RenewalReminderComponent } from './renewal-reminder.component';

const routes: Routes = [
  {
    path: 'renewal-reminder',
    component: RenewalReminderComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RenewalReminderRoutingModule {}
