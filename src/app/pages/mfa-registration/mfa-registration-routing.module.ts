import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MfaRegistrationComponent } from './mfa-registration.component';

const routes: Routes = [{ path: '', component: MfaRegistrationComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MfaRegistrationComponentRoutingModule {}




