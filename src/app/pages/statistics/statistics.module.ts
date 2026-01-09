//ANGULAR CORE
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//COMPONENTS
import { StatisticsComponent } from './statistics.component';
import { TrendsComponent } from './trends/trends.component';
import { TrendsHistoryComponent } from './trends/trends-history/trends-history.component';
import { OriginsComponent } from './origins/origins.component';
import { TopTenComponent } from './top-ten/top-ten.component';

//?
//REMOVE_LATER
import { WorkInProgressComponent } from '../work-in-progress/work-in-progress.component';
//?

const routes: Routes = [
  { path: '', redirectTo: 'applications', pathMatch: 'full' },
  { path: 'applications', component: StatisticsComponent },
  { path: 'trends', component: TrendsComponent },
  { path: 'trends/tech-timeline', component: TrendsHistoryComponent },
  { path: 'origins', component: OriginsComponent },
  { path: 'applicants', component: TopTenComponent },
  { path: 'representatives', component: TopTenComponent },

  //?
  { path: 'fees', component: WorkInProgressComponent }, //REMOVE_LATER
  { path: 'productivity', component: WorkInProgressComponent }, //REMOVE_LATER
  //?

  { path: '*', redirectTo: 'applications' }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class StatisticsModule { }