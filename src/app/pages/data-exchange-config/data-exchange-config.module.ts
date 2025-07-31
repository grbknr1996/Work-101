import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DataExchangeConfigComponent } from './data-exchange-config.component';
import { DistributionRulesComponent } from './distribution-rules/distribution-rules.component';
import { AddExclusionRuleComponent } from './add-exclusion-rule/add-exclusion-rule.component';
import { OriginatingOfficesComponent } from './originating-offices/originating-offices.component';
import { RecipientSystemsComponent } from './recipient-systems/recipient-systems.component';
import { DataExchangeConfigService } from 'src/app/_services/data-exchange-config.service';
import { provideHttpClient } from '@angular/common/http';

const routes: Routes = [
  {
    path: '',
    component: DataExchangeConfigComponent,
  },
  {
    path: 'dashboard',
    component: DataExchangeConfigComponent,
  },
  {
    path: 'originating-offices',
    component: OriginatingOfficesComponent,
  },
  {
    path: 'recipient-systems',
    component: RecipientSystemsComponent,
  },
  {
    path: 'distribution-rules',
    component: DistributionRulesComponent,
  },
  {
    path: 'add-exclusion-rule',
    component: AddExclusionRuleComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DistributionRulesComponent,
    AddExclusionRuleComponent,
    OriginatingOfficesComponent,
    RecipientSystemsComponent,
  ],
  exports: [RouterModule],
  providers: [DataExchangeConfigService, provideHttpClient()],
})
export class DataExchangeConfigModule {}
