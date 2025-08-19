//ANGULAR CORE
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//COMPONENTS
import { StatisticsComponent } from './statistics.component';
import { TrendsComponent } from './trends/trends.component';

const routes: Routes = [
  { path: '', component: StatisticsComponent },
  { path: 'trends', component: TrendsComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class StatisticsModule { }