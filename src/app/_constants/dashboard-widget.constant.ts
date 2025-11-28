import { environment } from '../../environments/environment';
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
    title: 'dashboard.widgets.workspace.title',
    icon: 'pi-briefcase',
    requiredPermissions: [],
    items: [
      {
        icon: 'pi-eye',
        label: 'dashboard.widgets.receptionOperations.items.efilingReview',
        link: environment.efillingUrl,
        requiredPermissions: ['efiling_dashboard_view'],
        isExternal: true,
      },
      {
        icon: 'pi-list-check',
        label: 'dashboard.widgets.taskManagement.items.myTasks',
        link: '/task-management/my-tasks',
        requiredPermissions: ['pending_task_allocation'],
      },
    ],
  },
  {
    id: 'notifications',
    title: 'dashboard.widgets.notifications.title',
    icon: 'pi-bell',
    requiredPermissions: [],
    items: [
      {
        icon: 'pi-globe',
        label: 'dashboard.widgets.notifications.items.aripo',
        link: '/notifications/aripo-dashboard',
        requiredPermissions: [],
      },
      {
        icon: 'pi-building',
        label: 'dashboard.widgets.notifications.items.hague',
        link: '/notifications/hague-dashboard',
        requiredPermissions: [],
      },
      {
        icon: 'pi-flag',
        label: 'dashboard.widgets.notifications.items.madrid',
        link: '/notifications/madrid-dashboard',
        requiredPermissions: [],
      },
      {
        icon: 'pi-home',
        label: 'dashboard.widgets.notifications.items.office',
        link: '/notifications/office-dashboard',
        requiredPermissions: [],
      },
    ],
  },
  {
    id: 'task-management',
    title: 'dashboard.widgets.taskManagement.title',
    icon: 'pi-check-square',
    requiredPermissions: ['pending_request_view'],
    items: [
      {
        icon: 'pi-truck',
        label: 'dashboard.widgets.taskManagement.items.physicalDeliveries',
        link: '/deliveries',
        requiredPermissions: ['physical_delivery_record'],
      },
      {
        icon: 'pi-microchip',
        label: 'dashboard.widgets.taskManagement.items.processGroups',
        link: '/groups',
        requiredPermissions: [],
      },
      {
        icon: 'pi-calendar-clock',
        label: 'dashboard.widgets.taskManagement.items.workMonitor',
        link: 'task-management/work-monitor',
        requiredPermissions: ['pending_request_view'],
      },
    ],
  },
  {
    id: 'reception-operations',
    title: 'dashboard.widgets.receptionOperations.title',
    icon: 'pi-inbox',
    requiredPermissions: ['reception_dashboard_view'],
    items: [
      {
        icon: 'pi-sliders-h',
        label: 'dashboard.widgets.receptionOperations.items.configuration',
        link: '/configurations',
        requiredPermissions: ['system_config_view'],
      },
      {
        icon: 'pi-chart-pie',
        label: 'dashboard.widgets.receptionOperations.items.dashboard',
        link: '/reception/dashboard',
        requiredPermissions: ['reception_dashboard_view'],
      },
      {
        icon: 'pi-plus',
        label: 'dashboard.widgets.receptionOperations.items.newReception',
        link: '/reception/new',
        requiredPermissions: ['reception_batch_open'],
      },
      {
        icon: 'pi-hourglass',
        label: 'dashboard.widgets.receptionOperations.items.pendingReception',
        link: '/reception/pending',
        requiredPermissions: ['reception_batch_view'],
      },
    ],
  },
  {
    id: 'data-capture',
    title: 'dashboard.widgets.dataCapture.title',
    icon: 'pi-file-import',
    requiredPermissions: ['pending_data_capture_view'],
    items: [
      {
        icon: 'pi-pencil',
        label: 'dashboard.widgets.dataCapture.items.pendingDataCapture',
        link: '/data-capture/dashboard',
        requiredPermissions: ['pending_data_capture_view'],
      },
      {
        icon: 'pi-file',
        label: 'dashboard.widgets.dataCapture.items.pendingDocumentCapture',
        link: '/data-capture/documents',
        requiredPermissions: ['pending_doc_capture_view'],
      },
    ],
  },
  {
    id: 'publication',
    title: 'dashboard.widgets.publication.title',
    icon: 'pi-book',
    requiredPermissions: ['publication_dashboard_view'],
    items: [
      {
        icon: 'pi-file-edit',
        label: 'dashboard.widgets.publication.items.pendingJournals',
        link: '/publications/journals',
        requiredPermissions: ['publication_dashboard_view'],
      },
      {
        icon: 'pi-clock',
        label: 'dashboard.widgets.publication.items.pendingPublications',
        link: '/publications/pending',
        requiredPermissions: ['publication_dashboard_view'],
      },
      {
        icon: 'pi-globe',
        label: 'dashboard.widgets.publication.items.onlinePublications',
        link: '/publications/online-journals',
        requiredPermissions: ['publication_dashboard_view'],
      },
    ],
  },
  {
    id: 'annuity-monitoring',
    title: 'dashboard.widgets.annuityMonitoring.title',
    icon: 'pi-calendar',
    requiredPermissions: ['annuity_projection_view'],
    items: [
      {
        icon: 'pi-calendar-plus',
        label: 'dashboard.widgets.annuityMonitoring.items.annuitiesOrRenewals',
        link: '/renewal-reminder',
        requiredPermissions: ['renewal_projection_view'],
      },
      {
        icon: 'pi-chart-bar',
        label: 'dashboard.widgets.annuityMonitoring.items.performance',
        link: '/performance',
        requiredPermissions: ['process_performance_view'],
      },
      {
        icon: 'pi-chart-line',
        label: 'dashboard.widgets.annuityMonitoring.items.statistics',
        link: '/statistics',
        requiredPermissions: ['filing_stats_view'],
      },
    ],
  },
  {
    id: 'stakeholders-registry',
    title: 'dashboard.widgets.stakeholdersRegistry.title',
    icon: 'pi-id-card',
    requiredPermissions: ['person_manage_view'],
    items: [
      {
        icon: 'pi-receipt',
        label: 'dashboard.widgets.stakeholdersRegistry.items.auxiliaryRegister',
        link: '/stakeholders-registry/auxiliary-register',
        requiredPermissions: ['email_receipients_view'],
      },
      {
        icon: 'pi-envelope',
        label: 'dashboard.widgets.stakeholdersRegistry.items.emailRegister',
        link: '/email-register',
        requiredPermissions: ['email_receipients_view'],
      },
      {
        icon: 'pi-user-plus',
        label: 'dashboard.widgets.stakeholdersRegistry.items.stakeholders',
        link: '/stakeholders',
        requiredPermissions: ['person_manage_view'],
      },
    ],
  },
  {
    id: 'system-settings',
    title: 'dashboard.widgets.systemSettings.title',
    icon: 'pi-cog',
    requiredPermissions: [],
    items: [
      {
        icon: 'pi-file-word',
        label: 'dashboard.widgets.systemSettings.items.customContent',
        link: '/custom-content',
        requiredPermissions: ['resource_text_translate'],
      },
      {
        icon: 'pi-money-bill',
        label: 'dashboard.widgets.systemSettings.items.feeConfiguration',
        link: '/system-configuration/fee-config',
        requiredPermissions: [],
      },
      {
        icon: 'pi-send',
        label: 'dashboard.widgets.systemSettings.items.mailmergeConfiguration',
        link: '/mailmerge',
        requiredPermissions: ['mailmerge_config_view'],
      },
      {
        icon: 'pi-cog',
        label: 'dashboard.widgets.systemSettings.items.systemConfiguration',
        link: '/system-configuration',
        requiredPermissions: ['system_config_view'],
      },
    ],
  },
  {
    id: 'administrative-tools',
    title: 'dashboard.widgets.administrativeTools.title',
    icon: 'pi-shield',
    requiredPermissions: [],
    items: [
      {
        icon: 'pi-heart',
        label: 'dashboard.widgets.administrativeTools.items.healthCheck',
        link: '/health-check',
        requiredPermissions: ['healthcheck_dashboard_view'],
      },
      {
        icon: 'pi-clock',
        label: 'dashboard.widgets.administrativeTools.items.jobScheduler',
        link: '/job-scheduler',
        requiredPermissions: ['task_scheduler_view'],
      },
      {
        icon: 'pi-users',
        label: 'dashboard.widgets.administrativeTools.items.userManagement',
        link: '/user-management/user-accounts',
        requiredPermissions: ['user_management_view'],
      },
    ],
  },
  {
    id: 'payment-management',
    title: 'dashboard.widgets.paymentManagement.title',
    icon: 'pi-wallet',
    requiredPermissions: ['payment_fee_search'],
    items: [
      {
        icon: 'pi-building',
        label: 'dashboard.widgets.paymentManagement.items.bankDetails',
        link: '/bank-details',
        requiredPermissions: ['bankdriver_config_edit'],
      },
      {
        icon: 'pi-receipt',
        label: 'dashboard.widgets.paymentManagement.items.paymentStatus',
        link: '/payment-status',
        requiredPermissions: ['payment_status_check'],
      },
    ],
  },
  {
    id: 'data-services',
    title: 'dashboard.widgets.dataServices.title',
    icon: 'pi-server',
    requiredPermissions: [],
    items: [
      {
        icon: 'pi-database',
        label: 'dashboard.widgets.dataServices.items.dataExchangeConfiguration',
        link: '/configuration/data-exchange/dashboard',
        requiredPermissions: [],
      },
      {
        icon: 'pi-box',
        label: 'dashboard.widgets.dataServices.items.dataSharing',
        link: '/data-packages',
        requiredPermissions: [],
      },
    ],
  },
];
