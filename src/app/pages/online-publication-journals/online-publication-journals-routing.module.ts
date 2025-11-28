import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnlinePublicationJournalsComponent } from './online-publication-journals.component';

const routes: Routes = [
  { path: '', component: OnlinePublicationJournalsComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnlinePublicationJournalsComponentRoutingModule { }
