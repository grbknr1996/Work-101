import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './_guards/auth.guard';
import { WORK_IN_PROGRESS_ROUTES } from './_constants/work-in-progress-routes.constant';

const routes: Routes = [
  // Auth callback route - handles redirect from AWS Cognito
  {
    path: 'auth-callback',
    loadChildren: async () =>
      (await import('./pages/auth-callback/auth-callback.module'))
        .AuthCallbackComponentModule,
  },
  {
    path: 'mfa-registration',
    loadChildren: async () =>
      (await import('./pages/mfa-registration/mfa-registration.module'))
        .MfaRegistrationModule,
    canActivate: [AuthGuard],
  },
  {
    path: 'cognito-sync',
    loadChildren: async () =>
      (await import('./pages/cognito-sync/cognito-sync.module'))
        .CognitoSyncModule,
    canActivate: [AuthGuard],
  },
  // Logged-out route - handles logout redirect
  {
    path: 'logged-out',
    loadChildren: async () =>
      (await import('./pages/auth-signout/auth-signout.module'))
        .AuthSignoutComponentModule,
  },
  // Simple sign-in route - redirects to hosted UI
  {
    path: 'sign-in',
    loadChildren: async () =>
      (await import('./pages/sign-in/sign-in.module')).SignInComponentModule,
  },
  {
    path: 'platform-selection',
    loadChildren: async () =>
      (await import('./pages/platform-selection/platform-selection.module'))
        .PlatformSelectionComponentModule,
    canActivate: [AuthGuard],
  },
  // Auth routes with office and language parameters
  {
    path: ':officeCode/:langCode/sign-in',
    loadChildren: async () =>
      (await import('./pages/sign-in/sign-in.module')).SignInComponentModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/signup',
    loadChildren: async () =>
      (await import('./pages/signup/signup.module')).SignupComponentModule,
  },

  {
    path: ':officeCode/:langCode/logged-out',
    loadChildren: async () =>
      (await import('./pages/auth-signout/auth-signout.module'))
        .AuthSignoutComponentModule,
  },
  // Main application routes with office and language parameters
  {
    path: ':officeCode/:langCode/dashboard',
    loadChildren: async () =>
      (await import('./pages/dashboard/dashboard.module')).DashboardModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/profile',
    loadChildren: async () =>
      (await import('./pages/profile/profile.module')).ProfileModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/statistics',
    loadChildren: async () =>
      (await import('./pages/statistics/statistics.module')).StatisticsModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/user-management',
    loadChildren: async () =>
      (await import('./pages/user-management/user-management.module'))
        .UserManagementModule,
    canActivate: [AuthGuard],
    data: {
      permissions: [],
    },
  },
  {
    path: ':officeCode/:langCode/configuration/data-exchange/dashboard',
    loadChildren: async () =>
      (await import('./pages/data-exchange-config/data-exchange-config.module'))
        .DataExchangeConfigModule,
    canActivate: [AuthGuard],
    data: {
      //permissions: ['system_config_view'],
      // permissionSet: '1',
    },
  },
  {
    path: ':officeCode/:langCode/data-packages',
    loadChildren: async () =>
      (await import('./pages/data-packages/data-packages.module'))
        .DataPackageModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/notifications',
    loadChildren: async () =>
      (await import('./pages/aripo-notifications/aripo-notifications.module'))
        .AripoNotificationsModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/acknowledge-notifications',
    loadChildren: async () =>
      (
        await import(
          './pages/acknowledge-notifications/acknowledge-notifications.module'
        )
      ).AcknowledgeNotificationsModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/renewal-reminder',
    loadChildren: async () =>
      (await import('./pages/renewal-reminder/renewal-reminder.module'))
        .RenewalReminderModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/data-capture/dashboard',
    loadChildren: async () =>
      (await import('./pages/data-capture/data-capture.module'))
        .DataCaptureModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/system-configuration/fee-config',
    loadChildren: async () =>
      (await import('./pages/fee-config/fee-config.module'))
        .FeeConfigComponentModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/system-configuration/fee-config/calculator',
    loadChildren: async () =>
      (await import('./pages/fee-calculator/fee-calculator.module'))
        .FeeCalculatorComponentModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/publication/pending',
    loadChildren: async () =>
      (await import('./pages/journal-publication/journal-publication.module'))
        .JournalPublicationComponentModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/publication/journals',
    loadChildren: async () =>
      (
        await import(
          './pages/online-publication-journal/online-publication-journal.module'
        )
      ).OnlinePublicationJournalComponentModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/task-management/work-monitor',
    loadChildren: async () =>
      (await import('./pages/task-management/work-monitor/work-monitor.module'))
        .WorkMonitorComponentModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/task-management/my-tasks',
    loadChildren: async () =>
      (await import('./pages/task-management/my-tasks/my-tasks.module'))
        .MyPendingTasksComponentModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/task-management/work-monitor/task-assignment',
    loadChildren: async () =>
      (
        await import(
          './pages/task-management/work-monitor/assign-tasks/assign-tasks.module'
        )
      ).AssignTasksComponentModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/task-management/work-monitor/task-assignment/record-action',
    loadChildren: async () =>
      (
        await import(
          './pages/task-management/work-monitor/view-content/record-action/record-action.module'
        )
      ).RecordActionComponentModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/task-management/work-monitor/tasks-distribution',
    loadChildren: async () =>
      (
        await import(
          './pages/task-management/work-monitor/tasks-distribution/tasks-distribution.module'
        )
      ).TasksDistributionComponentModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/task-management/work-monitor/task-assignment/view-content/:documentId',
    loadChildren: async () =>
      (
        await import(
          './pages/task-management/work-monitor/view-content/view-content.module'
        )
      ).ViewContentComponentModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/task-management/work-monitor/task-assignment/:documentId/history',
    loadChildren: async () =>
      (
        await import(
          './pages/task-management/work-monitor/view-content/history/task-history.module'
        )
      ).TaskHistoryComponentModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/stakeholders-registry/auxiliary-register',
    loadChildren: async () =>
      (await import('./pages/auxiliary-register/auxiliary-register.module'))
        .AuxiliaryRegisterModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/notfound',
    loadChildren: async () =>
      (await import('./pages/page-notfound/page-notfound.module'))
        .PageNotfoundModule,
  },
  {
    path: ':officeCode/:langCode/unauthorized',
    loadChildren: async () =>
      (await import('./pages/unauthorized/unauthorized.module'))
        .UnauthorizedComponentModule,
  },
  {
    path: ':officeCode/:langCode/work-in-progress',
    loadChildren: async () =>
      (await import('./pages/work-in-progress/work-in-progress.module'))
        .WorkInProgressModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/data-capture/documents',
    loadChildren: async () =>
      (await import('./pages/document-capture/document-capture.module'))
        .DocumentCaptureModule,
    canActivate: [AuthGuard],
  },
  {
    path: ':officeCode/:langCode/data-capture/documents/:batchId',
    loadChildren: async () =>
      (
        await import(
          './pages/document-capture/indexation-view/indexation-view.module'
        )
      ).ViewIndexationDocumentModule,
    canActivate: [AuthGuard],
  },
  // Work in Progress - Undeveloped Widget Routes
  ...WORK_IN_PROGRESS_ROUTES,
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
export class AppRoutingModule {}
