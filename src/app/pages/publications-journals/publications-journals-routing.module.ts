import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicationsJournalsComponent } from './publications-journals.component';

const routes: Routes = [
  { path: '', component: PublicationsJournalsComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicationsJournalsRoutingModule { }
