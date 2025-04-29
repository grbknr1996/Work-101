import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './_guards/auth.guard';
import { DefaultRedirectComponent } from './components/default-redirect/default-redirect.component';

const routes: Routes = [
  // Auth routes with office and language parameters
  {
    path: ':officeCode/:langCode/sign-in',
    loadComponent: () =>
      import('./pages/sign-in/sign-in.component').then(
        (m) => m.SignInComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/sign-up',
    loadComponent: () =>
      import('./pages/sign-up/sign-up.component').then(
        (m) => m.SignUpComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/force-change-password',
    loadComponent: () =>
      import(
        './pages/force-change-password/force-change-password.component'
      ).then((m) => m.ForceChangePasswordComponent),
    canActivate: [AuthGuard],
  },
  // Main application routes with office and language parameters
  {
    path: ':officeCode/:langCode/dashboard',
    loadChildren: () =>
      import('./pages/dashboard/dashboard.module').then((m) => {
        return m.DashboardModule;
      }),
    canActivate: [AuthGuard],
  },
  // Public pages
  {
    path: ':officeCode/:langCode/about',
    loadChildren: () =>
      import('./pages/page-about/page-about.module').then(
        (m) => m.PageAboutModule
      ),
  },
  {
    path: ':officeCode/:langCode/notfound',
    loadChildren: () =>
      import('./pages/page-notfound/page-notfound.module').then(
        (m) => m.PageNotfoundModule
      ),
  },
  // Redirects for office/:langCode pattern
  {
    path: ':officeCode/:langCode',
    component: DefaultRedirectComponent,
    pathMatch: 'full',
  },
  // Specific instance handlers - asean instance
  {
    path: 'asean',
    redirectTo: 'asean/fr', // fr is the default language for asean
    pathMatch: 'full',
  },
  // General redirects for office pattern - set default language
  {
    path: ':officeCode',
    component: DefaultRedirectComponent,
    pathMatch: 'full',
  },
  // Root redirect - set default office and language
  {
    path: '',
    component: DefaultRedirectComponent,
    pathMatch: 'full',
  },
  // Wildcard route for 404
  {
    path: '**',
    redirectTo: 'default/en/notfound',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false,
      initialNavigation: 'enabledBlocking',
      scrollPositionRestoration: 'enabled',
      paramsInheritanceStrategy: 'always',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
