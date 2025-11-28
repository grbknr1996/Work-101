import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DistributionRulesComponent } from './distribution-rules/distribution-rules.component';
import { AddExclusionRuleComponent } from './add-exclusion-rule/add-exclusion-rule.component';
import { DataExchangeConfigService } from 'src/app/_services/data-exchange-config.service';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'distribution-rules',
    pathMatch: 'full',
  },
  {
    path: 'distribution-rules',
    component: DistributionRulesComponent,
  },
  {
    path: 'add-rule',
    component: AddExclusionRuleComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  providers: [DataExchangeConfigService],
})
export class DataExchangeConfigModule {}
