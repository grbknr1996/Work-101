import { DashboardWidget } from '../interfaces';

export const PERMISSION_SETS = {
  ADMINISTRATION: '1',
  RECEPTION_CORE: '2',
  RECEPTION_ADVANCE: '3',
  DATACAPTURE: '4',
  EXAMINATION: '5',
  PUBLICATION: '6',
  LEGAL_PROCEEDING: '7',
  REPORTING: '8',
  PUBLISHED_DATA_VIEW: '9',
  AGENT_MANAGEMENT: '10',
  EFILING: '11',
  TRADEMARK_FULL_VIEW: '12',
  PATENT_FULL_VIEW: '13',
  DESIGN_FULL_VIEW: '14',
  USERDOC_FULL_VIEW: '15',
};

export const DASHBOARD_WIDGETS: DashboardWidget[] = [
  {
    id: 'workspace',
    title: 'My Workspace',
    icon: 'pi-briefcase',
    requiredPermissions: [],
    items: [
      {
        icon: 'pi-objects-column',
        label: 'Filing Dashboard',
        link: '/filing-dashboard',
        requiredPermissions: [],
      },
      {
        icon: 'pi-plus-circle',
        label: 'New filings',
        link: '/new-filings',
        requiredPermissions: [],
      },
      {
        icon: 'pi-bell',
        label: 'Notifications',
        link: '/notifications/aripo-incoming',
        requiredPermissions: [],
      },
    ],
  },
  {
    id: 'task-management',
    title: 'Task Management',
    icon: 'pi-check-square',
    requiredPermissions: ['pending_request_view'],
    items: [
      {
        icon: 'pi-calendar-clock',
        label: 'Pending Requests',
        link: '/requests',
        requiredPermissions: ['pending_request_view'],
      },
      {
        icon: 'pi-list-check',
        label: 'Pending Tasks',
        link: '/tasks/pending',
        requiredPermissions: ['pending_task_allocation'],
      },
      {
        icon: 'pi-truck',
        label: 'Physical Deliveries',
        link: '/deliveries',
        requiredPermissions: ['physical_delivery_record'],
      },
      {
        icon: 'pi-users',
        label: 'Process Groups',
        link: '/groups',
        requiredPermissions: [],
      },
    ],
  },
  {
    id: 'data-capture',
    title: 'Data Capture',
    icon: 'pi-file-import',
    requiredPermissions: ['pending_data_capture_view'],
    items: [
      {
        icon: 'pi-pencil',
        label: 'Pending Data Capture',
        link: '/data-capture/pending',
        requiredPermissions: ['pending_data_capture_view'],
      },
      {
        icon: 'pi-file',
        label: 'Pending Document Capture',
        link: '/data-capture/documents',
        requiredPermissions: ['pending_doc_capture_view'],
      },
      {
        icon: 'pi-calendar',
        label: 'Pending Daily Logs',
        link: '/data-capture/daily-logs',
        requiredPermissions: ['pending_daily_log_view'],
      },
    ],
  },
  {
    id: 'reception-operations',
    title: 'Reception Operations',
    icon: 'pi-inbox',
    requiredPermissions: ['reception_dashboard_view'],
    items: [
      {
        icon: 'pi-plus',
        label: 'New Reception',
        link: '/reception/new',
        requiredPermissions: ['reception_batch_open'],
      },
      {
        icon: 'pi-hourglass',
        label: 'Pending Reception',
        link: '/reception/pending',
        requiredPermissions: ['reception_batch_view'],
      },
      {
        icon: 'pi-chart-pie',
        label: 'Dashboard',
        link: '/dashboard',
        requiredPermissions: ['reception_dashboard_view'],
      },
      {
        icon: 'pi-sliders-h',
        label: 'Configurations',
        link: '/configurations',
        requiredPermissions: ['system_config_view'],
      },
      {
        icon: 'pi-eye',
        label: 'e Filing Review',
        link: '/efiling/review',
        requiredPermissions: ['efiling_dashboard_view'],
      },
    ],
  },
  {
    id: 'stakeholders-registry',
    title: 'Stakeholders Registry',
    icon: 'pi-id-card',
    requiredPermissions: ['person_manage_view'],
    items: [
      {
        icon: 'pi-user-plus',
        label: 'Stakeholders',
        link: '/stakeholders',
        requiredPermissions: ['person_manage_view'],
      },
      {
        icon: 'pi-address-book',
        label: 'Register View',
        link: '/register',
        requiredPermissions: ['person_manage_view'],
      },
      {
        icon: 'pi-envelope',
        label: 'Email Register',
        link: '/email-register',
        requiredPermissions: ['email_receipients_view'],
      },
    ],
  },
  {
    id: 'publication-workflow',
    title: 'Publication Workflow',
    icon: 'pi-book',
    requiredPermissions: ['publication_dashboard_view'],
    items: [
      {
        icon: 'pi-file-edit',
        label: 'Pending Publication',
        link: '/publication/pending',
        requiredPermissions: ['publication_dashboard_view'],
      },
      {
        icon: 'pi-bell',
        label: 'Notifications',
        link: '/publication/notifications',
        requiredPermissions: ['pending_doc_notif_view'],
      },
    ],
  },
  {
    id: 'data-services',
    title: 'Data Services',
    icon: 'pi-server',
    requiredPermissions: [],
    items: [
      {
        icon: 'pi-database',
        label: 'Data Exchange Configuration',
        link: '/configuration/data-exchange/dashboard',
        requiredPermissions: [],
      },
      {
        icon: 'pi-box',
        label: 'Data Sharing',
        link: '/data-packages',
        requiredPermissions: [],
      },
    ],
  },
  {
    id: 'system-settings',
    title: 'System Settings',
    icon: 'pi-cog',
    requiredPermissions: [],
    items: [
      {
        icon: 'pi-cog',
        label: 'System Configuration',
        link: '/system-configuration',
        requiredPermissions: ['system_config_view'],
      },
      {
        icon: 'pi-money-bill',
        label: 'Fee Configuration',
        link: '/system-configuration/fee-config',
        requiredPermissions: [],
      },
      {
        icon: 'pi-send',
        label: 'Mailmerge Configuration',
        link: '/mailmerge',
        requiredPermissions: ['mailmerge_config_view'],
      },
      {
        icon: 'pi-file-word',
        label: 'Custom Content',
        link: '/custom-content',
        requiredPermissions: ['resource_text_translate'],
      },
    ],
  },
  {
    id: 'annuity-monitoring',
    title: 'Annuity Monitoring',
    icon: 'pi-calendar',
    requiredPermissions: ['annuity_projection_view'],
    items: [
      {
        icon: 'pi-calendar-plus',
        label: 'Annuities',
        link: '/annuities',
        requiredPermissions: ['annuity_projection_view'],
      },
      {
        icon: 'pi-refresh',
        label: 'Renewals',
        link: '/renewals',
        requiredPermissions: ['renewal_projection_view'],
      },
      {
        icon: 'pi-chart-bar',
        label: 'Performance',
        link: '/performance',
        requiredPermissions: ['process_performance_view'],
      },
      {
        icon: 'pi-chart-line',
        label: 'Statistics',
        link: '/statistics',
        requiredPermissions: ['filing_stats_view'],
      },
    ],
  },
  {
    id: 'administrative-tools',
    title: 'Administrative Tools',
    icon: 'pi-shield',
    requiredPermissions: [],
    items: [
      {
        icon: 'pi-users',
        label: 'User Management',
        link: '/user-management/user-accounts',
        requiredPermissions: ['user_management_view'],
      },
      {
        icon: 'pi-clock',
        label: 'Job Scheduler',
        link: '/job-scheduler',
        requiredPermissions: ['task_scheduler_view'],
      },
      {
        icon: 'pi-check-circle',
        label: 'Health Check',
        link: '/health-check',
        requiredPermissions: ['healthcheck_dashboard_view'],
      },
    ],
  },
  {
    id: 'payment-management',
    title: 'Payment Management',
    icon: 'pi-wallet',
    requiredPermissions: ['payment_fee_search'],
    items: [
      {
        icon: 'pi-credit-card',
        label: 'Transactions',
        link: '/transactions',
        requiredPermissions: ['payment_fee_search'],
      },
      {
        icon: 'pi-building',
        label: 'Bank Details',
        link: '/bank-details',
        requiredPermissions: ['bankdriver_config_edit'],
      },
      {
        icon: 'pi-receipt',
        label: 'Payment Status',
        link: '/payment-status',
        requiredPermissions: ['payment_status_check'],
      },
    ],
  },
];
