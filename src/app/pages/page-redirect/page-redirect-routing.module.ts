import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageRedirectComponent } from './page-redirect.component';

const routes: Routes = [
  { path: '', component: PageRedirectComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageRedirectRoutingModule { }
