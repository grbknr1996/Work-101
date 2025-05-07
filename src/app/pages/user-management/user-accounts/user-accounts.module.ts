import { NgModule } from "@angular/core";
import { UserAccountsComponent } from "./user-accounts.component";
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
