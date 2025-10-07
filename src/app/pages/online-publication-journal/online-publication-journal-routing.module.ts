import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OnlinePublicationJournalComponent } from './online-publication-journal.component';

const routes: Routes = [
  { path: '', component: OnlinePublicationJournalComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnlinePublicationJournalComponentRoutingModule { }
