//ANGULAR CORE
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//COMPONENTS
import { StatisticsComponent } from './statistics.component';
import { TrendsComponent } from './trends/trends.component';
import { TrendsHistoryComponent } from './trends/trends-history/trends-history.component';
import { OriginsComponent } from './origins/origins.component';
import { TopTenComponent } from './top-ten/top-ten.component';

const routes: Routes = [
  { path: '', redirectTo: 'application-count', pathMatch: 'full' },
  { path: 'application-count', component: StatisticsComponent },
  { path: 'trends', component: TrendsComponent },
  { path: 'trends/tech-timeline', component: TrendsHistoryComponent },
  { path: 'origins', component: OriginsComponent },
  { path: 'applicants', component: TopTenComponent },
  { path: 'representatives', component: TopTenComponent },
  { path: '*', redirectTo: 'application-count' }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class StatisticsModule { }