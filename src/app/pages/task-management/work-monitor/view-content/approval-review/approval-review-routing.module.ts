import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApprovalReviewComponent } from './approval-review.component';

const routes: Routes = [
  { path: '', component: ApprovalReviewComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApprovalReviewComponentRoutingModule { }
