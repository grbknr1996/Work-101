import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewContentComponent } from './view-content.component';

const routes: Routes = [
  { path: '', component: ViewContentComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewContentComponentRoutingModule { }
