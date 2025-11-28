import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PendingPublicationsComponent } from './pending-publications-journals.component';

const routes: Routes = [
  { path: '', component: PendingPublicationsComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PendingPublicationsRoutingModule { }
