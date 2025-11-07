import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewIndexationDocumentComponent } from './indexation-view.component';

const routes: Routes = [
  { path: '', component: ViewIndexationDocumentComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewIndexationDocumentRoutingModule { }
