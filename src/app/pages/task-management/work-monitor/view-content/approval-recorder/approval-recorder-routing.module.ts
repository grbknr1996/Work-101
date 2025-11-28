import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApprovalRecorderComponent } from './approval-recorder.component';

const routes: Routes = [
  { path: '', component: ApprovalRecorderComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApprovalRecorderComponentRoutingModule { }
    