import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './_guards/auth.guard';
import { PermissionGuard } from './_guards/permission.guard';

const routes: Routes = [
  // Auth callback route - handles redirect from AWS Cognito
  {
    path: 'auth-callback',
    loadComponent: () =>
      import('./components/auth-callback/auth-callback.component').then(
        (m) => m.AuthCallbackComponent
      ),
  },
  // Logged-out route - handles logout redirect
  {
    path: 'logged-out',
    loadComponent: () =>
      import('./pages/auth-signout/auth-signout.component').then(
        (m) => m.AuthSignoutComponent
      ),
  },
  // Simple sign-in route - redirects to hosted UI
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./pages/sign-in/sign-in.component').then(
        (m) => m.SignInComponent
      ),
  },
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
    path: ':officeCode/:langCode/signup',
    loadComponent: () =>
      import('./pages/signup/signup.component').then((m) => m.SignupComponent),
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
  {
    path: ':officeCode/:langCode/logged-out',
    loadComponent: () =>
      import('./pages/auth-signout/auth-signout.component').then(
        (m) => m.AuthSignoutComponent
      ),
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
  {
    path: ':officeCode/:langCode/statistics',
    loadChildren: () => import('./pages/statistics/statistics.module').then((m) => m.StatisticsModule),
    canActivate: [AuthGuard]
  },
  {
    path: ':officeCode/:langCode/user-management',
    loadChildren: () =>
      import('./pages/user-management/user-management.module').then(
        (m) => m.UserManagementModule
      ),
    canActivate: [AuthGuard],
    data: {
      permissions: [],
    },
  },
  {
    path: ':officeCode/:langCode/configuration/data-exchange/dashboard',
    loadChildren: () =>
      import('./pages/data-exchange-config/data-exchange-config.module').then(
        (m) => m.DataExchangeConfigModule
      ),
    canActivate: [AuthGuard],
    data: {
      //permissions: ['system_config_view'],
      // permissionSet: '1',
    },
  },
  {
    path: ':officeCode/:langCode/data-packages',
    loadChildren: () =>
      import('./pages/data-packages/data-packages.module').then(
        (m) => m.DataPackageModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/notifications',
    loadChildren: () =>
      import('./pages/aripo-notifications/aripo-notifications.module').then(
        (m) => m.AripoNotificationsModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/acknowledge-notifications',
    loadChildren: () =>
      import('./pages/acknowledge-notifications/acknowledge-notifications.module').then(
        (m) => m.AcknowledgeNotificationsModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/system-configuration/fee-config',
    loadComponent: () =>
      import('./pages/fee-config/fee-config.component').then(
        (m) => m.FeeConfigComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/system-configuration/fee-config/calculator',
    loadComponent: () =>
      import('./pages/fee-calculator/fee-calculator.component').then(
        (m) => m.FeeCalculatorComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/publication/pending',
    loadComponent: () =>
      import('./pages/journal-publication/journal-publication.component').then(
        (m) => m.JournalPublicationComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/notfound',
    loadChildren: () =>
      import('./pages/page-notfound/page-notfound.module').then(
        (m) => m.PageNotfoundModule
      ),
  },
  {
    path: ':officeCode/:langCode/unauthorized',
    loadComponent: () =>
      import('./pages/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
  },

  // Redirects for office/:langCode pattern
  {
    path: ':officeCode/:langCode',
    redirectTo: ':officeCode/:langCode/dashboard',
    pathMatch: 'full',
  },
  // Specific instance handlers - asean instance
  {
    path: 'asean',
    redirectTo: 'asean/fr/dashboard',
    pathMatch: 'full',
  },
  // General redirects for office pattern - set default language
  {
    path: ':officeCode',
    redirectTo: ':officeCode/en/dashboard',
    pathMatch: 'full',
  },
  // Default redirect - redirect to sign-in
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full',
  },
  // Catch all route - 404
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
export class AppRoutingModule { }