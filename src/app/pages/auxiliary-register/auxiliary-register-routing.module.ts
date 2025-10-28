import { NgModule } from '@angular/core';
import { AuxiliaryRegisterComponent } from './auxiliary-register.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: AuxiliaryRegisterComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuxiliaryRegisterRoutingModule { }
