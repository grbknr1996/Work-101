import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DistributionRulesComponent } from './distribution-rules/distribution-rules.component';
import { AddExclusionRuleComponent } from './add-exclusion-rule/add-exclusion-rule.component';
import { DataExchangeConfigService } from 'src/app/_services/data-exchange-config.service';
import { AddRecipientComponent } from './add-recipient/add-recipient.component';

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
  {
    path: 'add-recipient',
    component: AddRecipientComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  providers: [DataExchangeConfigService],
})
export class DataExchangeConfigModule {}
