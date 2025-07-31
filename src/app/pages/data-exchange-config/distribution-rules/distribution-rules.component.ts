import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  AppLayoutComponent,
  LayoutConfig,
} from '../../../components/app-layout/app-layout.component';
import { BreadcrumbsComponent } from '../../../components/breadcrumbs/breadcrumbs.component';
import { AddExclusionRuleComponent } from '../add-exclusion-rule/add-exclusion-rule.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DataExchangeConfigService } from '../../../_services/data-exchange-config.service';

@Component({
  selector: 'app-distribution-rules',
  templateUrl: './distribution-rules.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    AppLayoutComponent,
    BreadcrumbsComponent,
    AddExclusionRuleComponent,
    CardModule,
    ButtonModule,
  ],
})
export class DistributionRulesComponent implements OnInit {
  layoutConfig: LayoutConfig;
  officeCode: string;
  langCode: string;
  loading = false;
  showAddRuleModal = false;

  columns: any[] = [
    {
      field: 'originatingOffice',
      header: 'Originating Office',
      display: 'text',
    },
    { field: 'recipientName', header: 'Recipient Name', display: 'text' },
    {
      field: 'ipCategoryTypes',
      header: 'IP Category Types',
      display: 'custom',
    },
    {
      field: 'applicationStatus',
      header: 'Application Status',
      display: 'custom',
    },
    {
      field: 'excludedEventCodes',
      header: 'Excluded Event Codes',
      display: 'custom',
    },
    {
      field: 'excludedDocuments',
      header: 'Excluded Documents',
      display: 'custom',
    },
    {
      field: 'status',
      header: 'Status',
      display: 'custom',
    },
    {
      field: 'actions',
      header: 'Actions',
      display: 'actions',
      actions: [
        {
          label: 'Edit',
          icon: 'pi pi-pencil',
          action: 'edit',
          severity: 'info',
        },
        {
          label: 'Delete',
          icon: 'pi pi-trash',
          action: 'delete',
          severity: 'danger',
        },
      ],
      showAsDropdown: false,
    },
  ];

  // Create a local data signal
  public localData = signal<any>({});

  distributionRulesData = computed(() => {
    const data = this.localData();
    console.log('Local data in computed:', data);

    // Check for both possible property names
    let rules =
      data?.distributionRulesData || data?.distributionExclusionRulesData;

    if (!rules) {
      console.log('No distribution rules data found, returning empty array');
      return [];
    }

    console.log('Distribution Rules Data for table:', rules);
    return rules;
  });

  // Computed properties for template expressions
  activeRulesCount = computed(
    () =>
      this.distributionRulesData().filter((rule) => rule.status === 'active')
        .length
  );

  officesCoveredCount = computed(
    () =>
      new Set(
        this.distributionRulesData().map((rule) => rule.originatingOffice)
      ).size
  );

  totalRulesCount = computed(() => this.distributionRulesData().length);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataExchangeService: DataExchangeConfigService
  ) {
    this.officeCode = this.route.snapshot.params['officeCode'] || 'default';
    this.langCode = this.route.snapshot.params['langCode'] || 'en';

    this.layoutConfig = {
      appTitle: 'Distribution Rules',
      showHeader: true,
      showSidebar: true,
      headerItems: [],
      sidebarItems: [],
      footerText: '© WIPO ' + new Date().getFullYear(),
      fixedHeader: true,
      fixedSidebar: true,
      sidebarCollapsed: false,
      theme: 'light',
      logo: '',
    };

    // Initialize with default data immediately
    this.localData.set({
      distributionRulesData: [
        {
          id: 1,
          originatingOffice: 'USPTO',
          recipientName: 'PATENTSCOPE',
          ipCategoryTypes: ['Patent', 'Trademark'],
          applicationStatus: ['Published', 'Granted'],
          excludedEventCodes: 'None',
          excludedDocuments: 'Disabled',
          status: 'active',
        },
        {
          id: 2,
          originatingOffice: 'EPO',
          recipientName: 'Global Brand Database',
          ipCategoryTypes: ['Patent'],
          applicationStatus: ['Published'],
          excludedEventCodes: 'G10, F10',
          excludedDocuments: 'search_report',
          status: 'active',
        },
        {
          id: 3,
          originatingOffice: 'JPO',
          recipientName: 'ASEAN IP Register',
          ipCategoryTypes: ['Trademark', 'Industrial Design'],
          applicationStatus: ['Registered'],
          excludedEventCodes: 'None',
          excludedDocuments: 'Disabled',
          status: 'inactive',
        },
      ],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;

    // Use setTimeout to simulate API call and ensure loading state is visible
    setTimeout(() => {
      this.dataExchangeService
        .getDataExchangeData('7bnv35u5b6j6mk5pnfb65jqqe6', 'patent', 'JP')
        .subscribe({
          next: (data) => {
            console.log('API Response Data: ', data);

            // Create our comprehensive mock data
            const mockData = {
              distributionRulesData: [
                {
                  id: 1,
                  originatingOffice: 'USPTO',
                  recipientName: 'PATENTSCOPE',
                  ipCategoryTypes: ['Patent', 'Trademark'],
                  applicationStatus: ['Published', 'Granted'],
                  excludedEventCodes: 'None',
                  excludedDocuments: 'Disabled',
                  status: 'active',
                },
                {
                  id: 2,
                  originatingOffice: 'EPO',
                  recipientName: 'Global Brand Database',
                  ipCategoryTypes: ['Patent'],
                  applicationStatus: ['Published'],
                  excludedEventCodes: 'G10, F10',
                  excludedDocuments: 'search_report',
                  status: 'active',
                },
                {
                  id: 3,
                  originatingOffice: 'JPO',
                  recipientName: 'ASEAN IP Register',
                  ipCategoryTypes: ['Trademark', 'Industrial Design'],
                  applicationStatus: ['Registered'],
                  excludedEventCodes: 'None',
                  excludedDocuments: 'Disabled',
                  status: 'inactive',
                },
                {
                  id: 4,
                  originatingOffice: 'CNIPA',
                  recipientName: 'WIPO Global Database',
                  ipCategoryTypes: ['Patent', 'Utility Model'],
                  applicationStatus: ['Published', 'Pending'],
                  excludedEventCodes: 'A01, B02',
                  excludedDocuments: 'examination_report',
                  status: 'active',
                },
                {
                  id: 5,
                  originatingOffice: 'KIPO',
                  recipientName: 'International Patent System',
                  ipCategoryTypes: ['Patent'],
                  applicationStatus: ['Granted'],
                  excludedEventCodes: 'None',
                  excludedDocuments: 'Disabled',
                  status: 'active',
                },
                {
                  id: 6,
                  originatingOffice: 'UKIPO',
                  recipientName: 'European Patent Office',
                  ipCategoryTypes: ['Trademark', 'Design'],
                  applicationStatus: ['Registered', 'Published'],
                  excludedEventCodes: 'C05, D12',
                  excludedDocuments: 'opposition_notice',
                  status: 'inactive',
                },
                {
                  id: 7,
                  originatingOffice: 'CIPO',
                  recipientName: 'Global Patent Index',
                  ipCategoryTypes: ['Patent'],
                  applicationStatus: ['Published'],
                  excludedEventCodes: 'E08, F15',
                  excludedDocuments: 'priority_document',
                  status: 'active',
                },
                {
                  id: 8,
                  originatingOffice: 'INPI',
                  recipientName: 'International Trademark System',
                  ipCategoryTypes: ['Trademark'],
                  applicationStatus: ['Registered'],
                  excludedEventCodes: 'None',
                  excludedDocuments: 'Disabled',
                  status: 'active',
                },
                {
                  id: 9,
                  originatingOffice: 'DPMA',
                  recipientName: 'European Union IP Office',
                  ipCategoryTypes: ['Patent', 'Trademark', 'Design'],
                  applicationStatus: ['Published', 'Registered'],
                  excludedEventCodes: 'G20, H25',
                  excludedDocuments: 'translation_document',
                  status: 'active',
                },
                {
                  id: 10,
                  originatingOffice: 'IP Australia',
                  recipientName: 'Pacific IP Network',
                  ipCategoryTypes: ['Patent', 'Trademark'],
                  applicationStatus: ['Granted', 'Registered'],
                  excludedEventCodes: 'I30, J35',
                  excludedDocuments: 'certificate_document',
                  status: 'inactive',
                },
                {
                  id: 11,
                  originatingOffice: 'Rospatent',
                  recipientName: 'Eurasian Patent Organization',
                  ipCategoryTypes: ['Patent'],
                  applicationStatus: ['Published'],
                  excludedEventCodes: 'K40, L45',
                  excludedDocuments: 'search_report',
                  status: 'active',
                },
                {
                  id: 12,
                  originatingOffice: 'INPI Brazil',
                  recipientName: 'Latin American IP Network',
                  ipCategoryTypes: ['Patent', 'Trademark', 'Industrial Design'],
                  applicationStatus: ['Published', 'Registered'],
                  excludedEventCodes: 'None',
                  excludedDocuments: 'Disabled',
                  status: 'active',
                },
              ],
            };

            // Merge API data with our mock data if API returns data
            if (data && Object.keys(data).length > 0) {
              // If API has distributionExclusionRulesData, merge it
              if (data.distributionExclusionRulesData) {
                console.log(
                  'API returned exclusion rules data, merging with mock data'
                );
                // You could merge the API data here if needed
              }
            }

            // Always use our comprehensive mock data for now
            this.localData.set(mockData);
            this.loading = false;
            console.log('Data loaded successfully, loading set to false');
          },
          error: (error) => {
            console.error('Error loading data:', error);
            // Set mock data even on error
            const mockData = {
              distributionRulesData: [
                {
                  id: 1,
                  originatingOffice: 'USPTO',
                  recipientName: 'PATENTSCOPE',
                  ipCategoryTypes: ['Patent', 'Trademark'],
                  applicationStatus: ['Published', 'Granted'],
                  excludedEventCodes: 'None',
                  excludedDocuments: 'Disabled',
                  status: 'active',
                },
                {
                  id: 2,
                  originatingOffice: 'EPO',
                  recipientName: 'Global Brand Database',
                  ipCategoryTypes: ['Patent'],
                  applicationStatus: ['Published'],
                  excludedEventCodes: 'G10, F10',
                  excludedDocuments: 'search_report',
                  status: 'active',
                },
              ],
            };
            this.localData.set(mockData);
            this.loading = false;
            console.log('Mock data set due to error, loading set to false');
          },
        });
    }, 500); // Small delay to show loading state
  }

  addRule() {
    console.log('Opening add rule modal...');
    this.showAddRuleModal = true;
  }

  onFormSubmitted = () => {
    this.showAddRuleModal = false; // close modal on submit
    // Optionally refresh the data after adding a rule
    this.loadData();
  };

  onModalHide() {
    this.showAddRuleModal = false;
  }

  onActionClick(event: { action: string; item: any }) {
    console.log('Action clicked:', event);

    if (event.action === 'edit') {
      const basePath = `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard`;
      this.router.navigate([`${basePath}/edit-rule/${event.item.id}`]);
    } else if (event.action === 'delete') {
      // Handle delete action
      this.deleteRule(event.item);
    }
  }

  clear(table: any) {
    table.clear();
  }

  private deleteRule(rule: any) {
    console.log('Deleting rule:', rule);
    // Update local data to remove the rule
    this.localData.update((current) => ({
      ...current,
      distributionRulesData: current.distributionRulesData.filter(
        (r) => r.id !== rule.id
      ),
    }));
  }

  getBreadcrumbItems() {
    return [
      {
        label: 'Configuration',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration`,
      },
      {
        label: 'Data Exchange',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard`,
      },
      {
        label: 'Distribution Rules',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/distribution-rules`,
      },
    ];
  }
}
