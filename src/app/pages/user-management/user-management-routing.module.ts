import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "src/app/_guards/auth.guard";
import { UserAccountsModule } from "./user-accounts/user-accounts.module";
import { UserAccountsComponent } from "./user-accounts/user-accounts.component";

const routes: Routes = [
  {
    path: "user-accounts",
    component: UserAccountsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "user-accounts/create-user-account",
    loadComponent: () =>
      import("./create-user-account/create-user-account.component").then(
        (m) => m.CreateUserAccountComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "user-accounts/edit-user-account/:userId",
    loadComponent: () =>
      import("./create-user-account/create-user-account.component").then(
        (m) => m.CreateUserAccountComponent
      ),
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserManagementRoutingModule {}
