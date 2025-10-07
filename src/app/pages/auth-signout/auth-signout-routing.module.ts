import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthSignoutComponent } from './auth-signout.component';

const routes: Routes = [
  { path: '', component: AuthSignoutComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthSignoutComponentRoutingModule { }
