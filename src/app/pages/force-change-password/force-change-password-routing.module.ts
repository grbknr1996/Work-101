import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForceChangePasswordComponent } from './force-change-password.component';

const routes: Routes = [
  { path: '', component: ForceChangePasswordComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForceChangePasswordComponentRoutingModule { }
