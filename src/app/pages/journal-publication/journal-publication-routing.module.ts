import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JournalPublicationComponent } from './journal-publication.component';

const routes: Routes = [
  { path: '', component: JournalPublicationComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JournalPublicationComponentRoutingModule { }
