//ANGULAR CORE
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//COMPONENTS
import { StatisticsComponent } from './statistics.component';
import { TrendsComponent } from './trends/trends.component';

const routes: Routes = [
  { path: '', redirectTo: 'application-count', pathMatch: 'full' },
  { path: 'application-count', component: StatisticsComponent },
  { path: 'trends', component: TrendsComponent },
  { path: '*', redirectTo: 'application-count' }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class StatisticsModule { }