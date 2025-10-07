import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeeCalculatorComponent } from './fee-calculator.component';

const routes: Routes = [
  { path: '', component: FeeCalculatorComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeeCalculatorComponentRoutingModule { }
