import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrademarkSimilaritySearchComponent } from './similarity-search.component';

const routes: Routes = [
  { path: '', component: TrademarkSimilaritySearchComponent }, // Actually a sub-path of `**`
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrademarkSimilaritySearchRoutingModule { }
