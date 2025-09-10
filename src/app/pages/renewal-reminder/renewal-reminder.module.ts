import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RenewalReminderComponent } from './renewal-reminder.component';
import { provideHttpClient } from '@angular/common/http';

const routes: Routes = [
  {
    path: '',
    component: RenewalReminderComponent,
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
export class RenewalReminderModule {}
