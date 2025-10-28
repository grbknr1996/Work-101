import { Route } from '@angular/router';

export const WORK_IN_PROGRESS_ROUTES: Route[] = [
  {
    path: ':officeCode/:langCode/filing-dashboard',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/new-filings',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/deliveries',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/groups',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/data-capture/documents',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/data-capture/daily-logs',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/reception/new',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/reception/pending',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/reception/dashboard',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/configurations',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/efiling/review',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/stakeholders',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/register',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/email-register',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/publication/notifications',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/mailmerge',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/custom-content',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/performance',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/job-scheduler',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/health-check',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/transactions',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/bank-details',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/payment-status',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
  {
    path: ':officeCode/:langCode/system-configuration',
    redirectTo: ':officeCode/:langCode/work-in-progress',
    pathMatch: 'full',
  },
];

