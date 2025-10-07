import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecordActionComponent } from './record-action.component';

const routes: Routes = [
  { path: '', component: RecordActionComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecordActionComponentRoutingModule { }
