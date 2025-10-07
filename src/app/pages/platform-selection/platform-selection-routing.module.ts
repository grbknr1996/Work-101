import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlatformSelectionComponent } from './platform-selection.component';

const routes: Routes = [
  { path: '', component: PlatformSelectionComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlatformSelectionComponentRoutingModule { }
