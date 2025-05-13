import { NgModule, inject } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { configuration } from "src/environments/environment";
import { AuthService } from "./_services/auth.service";
import { authGuard } from "./_guards/auth.guard";

const routes: Routes = [
  // Login route with office and language parameters - redirects to hosted UI
  {
    path: ":officeCode/:langCode/login",
    loadComponent: () =>
      import("./pages/login/login.component").then((m) => m.LoginComponent),
    resolve: {
      auth: () => {
        const authService = inject(AuthService);
        authService.login();
        return true;
      },
    },
  },

  // Main application routes with office and language parameters
  {
    path: ":officeCode/:langCode/dashboard",
    loadComponent: () =>
      import("./pages/dashboard/dashboard.component").then(
        (m) => m.DashboardComponent
      ),
    canActivate: [authGuard],
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
    redirectTo: ":officeCode/:langCode/dashboard",
    pathMatch: "full",
  },

  // General redirects for office pattern - set default language
  {
    path: ":officeCode",
    redirectTo: ":officeCode/en/dashboard",
    pathMatch: "full",
  },

  // Root redirect - set default office and language
  {
    path: "",
    redirectTo: "default/en/dashboard",
    pathMatch: "full",
  },

  // Catch-all route
  {
    path: "**",
    redirectTo: "default/en/dashboard",
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
