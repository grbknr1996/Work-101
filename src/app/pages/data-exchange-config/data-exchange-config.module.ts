import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from "@angular/router";

import { AppLayoutComponent } from "../../components/app-layout/app-layout.component";
import { DataExchangeConfigComponent } from "./data-exchange-config.component";
import { DistributionExclusionRulesComponent } from "./data-exclusion-rules/distribution-exclusion-rules.component";

const routes: Routes = [
  {
    path: "",
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
})
export class DataExchangeConfigModule {}
