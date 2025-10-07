import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyPendingTasksComponent } from './my-tasks.component';

const routes: Routes = [
  { path: '', component: MyPendingTasksComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyPendingTasksComponentRoutingModule { }
