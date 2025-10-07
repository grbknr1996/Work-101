import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkMonitorComponent } from './work-monitor.component';

const routes: Routes = [
  { path: '', component: WorkMonitorComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkMonitorComponentRoutingModule { }
