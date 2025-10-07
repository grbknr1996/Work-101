import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AssignTasksComponent } from './assign-tasks.component';

const routes: Routes = [
  { path: '', component: AssignTasksComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssignTasksComponentRoutingModule { }
