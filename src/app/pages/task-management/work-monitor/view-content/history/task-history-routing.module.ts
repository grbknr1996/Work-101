import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskHistoryComponent } from './task-history.component';

const routes: Routes = [
  { path: '', component: TaskHistoryComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskHistoryComponentRoutingModule { }
