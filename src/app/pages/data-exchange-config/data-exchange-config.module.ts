import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DataExchangeConfigComponent } from './data-exchange-config.component';
import { DistributionExclusionRulesComponent } from './data-exclusion-rules/distribution-exclusion-rules.component';
import { DataExchangeConfigService } from 'src/app/_services/data-exchange-config.service';
import { provideHttpClient } from '@angular/common/http';

const routes: Routes = [
  {
    path: '',
    component: DataExchangeConfigComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DistributionExclusionRulesComponent,
  ],
  exports: [RouterModule],
  providers: [
    DataExchangeConfigService,
    provideHttpClient()
  ]
})
export class DataExchangeConfigModule {}
