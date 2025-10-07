import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeeConfigComponent } from './fee-config.component';

const routes: Routes = [
  { path: '', component: FeeConfigComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeeConfigComponentRoutingModule { }
