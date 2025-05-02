import { NgModule } from "@angular/core";
import { UserAccountsComponent } from "./user-accounts.component";
import { AppLayoutComponent } from "../../../components/app-layout/app-layout.component";
import { BreadcrumbsComponent } from "../../../components/breadcrumbs/breadcrumbs.component";
import { TableComponent } from "../../../components/table/table.component";
import { UserStatsComponent } from "../../../components/user-stats/user-stats.component";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [{ path: "", component: UserAccountsComponent }];

@NgModule({
  imports: [UserAccountsComponent, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserAccountsModule {
  constructor() {
    console.log("UserAccountsModule loaded");
  }
}
