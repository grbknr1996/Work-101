import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./_guards/auth.guard";
import { DefaultRedirectComponent } from "./components/default-redirect/default-redirect.component";

const routes: Routes = [
  // Auth routes with office and language parameters
  {
    path: ":officeCode/:langCode/sign-in",
    loadComponent: () =>
      import("./pages/sign-in/sign-in.component").then(
        (m) => m.SignInComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ":officeCode/:langCode/sign-up",
    loadComponent: () =>
      import("./pages/sign-up/sign-up.component").then(
        (m) => m.SignUpComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ":officeCode/:langCode/forgot-password",
    loadComponent: () =>
      import("./pages/forgot-password/forgot-password.component").then(
        (m) => m.ForgotPasswordComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ":officeCode/:langCode/force-change-password",
    loadComponent: () =>
      import(
        "./pages/force-change-password/force-change-password.component"
      ).then((m) => m.ForceChangePasswordComponent),
    canActivate: [AuthGuard],
  },
  {
    path: ":officeCode/:langCode/logged-out",
    loadComponent: () =>
      import("./pages/auth-signout/auth-signout.component").then(
        (m) => m.AuthSignoutComponent
      ),
  },
  // Main application routes with office and language parameters
  {
    path: ":officeCode/:langCode/dashboard",
    loadChildren: () =>
      import("./pages/dashboard/dashboard.module").then((m) => {
        return m.DashboardModule;
      }),
    canActivate: [AuthGuard],
  },
  // Public pages
  {
    path: ":officeCode/:langCode/about",
    loadChildren: () =>
      import("./pages/page-about/page-about.module").then(
        (m) => m.PageAboutModule
      ),
  },

  // Redirects for office/:langCode pattern
  {
    path: ":officeCode/:langCode",
    component: DefaultRedirectComponent,
    pathMatch: "full",
  },
  // Specific instance handlers - asean instance
  {
    path: "asean",
    component: DefaultRedirectComponent,
    pathMatch: "full",
  },
  // General redirects for office pattern - set default language
  {
    path: ":officeCode",
    component: DefaultRedirectComponent,
    pathMatch: "full",
  },
  // Root redirect - set default office and language
  {
    path: "",
    component: DefaultRedirectComponent,
    pathMatch: "full",
  },
  // {
  //   path: ":officeCode/:langCode/user-management",
  //   redirectTo: ":officeCode/:langCode/user-management/user-accounts",
  //   pathMatch: "full",
  // },
  // {
  //   path: ":officeCode/:langCode/user-management/user-accounts/create-user-account",
  //   loadComponent: () =>
  //     import(
  //       "./pages/user-management/create-user-account/create-user-account.component"
  //     ).then((m) => m.CreateUserAccountComponent),
  //   canActivate: [AuthGuard],
  // },
  // {
  //   path: ":officeCode/:langCode/user-management/user-accounts",
  //   loadChildren: () =>
  //     import("./pages/user-management/user-accounts/user-accounts.module").then(
  //       (m) => m.UserAccountsModule
  //     ),
  //   canActivate: [AuthGuard],
  // },
  {
    path: ":officeCode/:langCode/user-management",
    loadChildren: () =>
      import("./pages/user-management/user-management.module").then(
        (m) => m.UserManagementModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ":officeCode/:langCode/configuration/data-exchange/dashboard",
    loadChildren: () =>
      import("./pages/data-exchange-config/data-exchange-config.module").then(
        (m) => m.DataExchangeConfigModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ":officeCode/:langCode/notfound",
    loadChildren: () =>
      import("./pages/page-notfound/page-notfound.module").then(
        (m) => m.PageNotfoundModule
      ),
  },

  // {
  //   path: "**",
  //   redirectTo: "default/en/notfound",
  // },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false,
      initialNavigation: "enabledBlocking",
      scrollPositionRestoration: "enabled",
      paramsInheritanceStrategy: "always",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
