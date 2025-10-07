import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TasksDistributionComponent } from './tasks-distribution.component';

const routes: Routes = [
  { path: '', component: TasksDistributionComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksDistributionComponentRoutingModule { }
