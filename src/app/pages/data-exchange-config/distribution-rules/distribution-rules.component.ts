import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  AppLayoutComponent,
  LayoutConfig,
} from '../../../components/app-layout/app-layout.component';
import { BreadcrumbsComponent } from '../../../components/breadcrumbs/breadcrumbs.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DataExchangeConfigService } from '../../../_services/data-exchange-config.service';
import { ExclusionRule } from '../../../interfaces';
import { HttpClient } from '@angular/common/http';

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
    CardModule,
    ButtonModule,
  ],
})
export class DistributionRulesComponent implements OnInit {
  layoutConfig: LayoutConfig;
  officeCode: string;
  langCode: string;
  loading = false;

  columns: any[] = [
    {
      field: 'originatingOfficeName',
      header: 'Originating Office',
      display: 'text',
    },
    { field: 'recipientName', header: 'Recipient Name', display: 'text' },
    {
      field: 'ipCategory',
      header: 'IP Category',
      display: 'text',
    },
    {
      field: 'applicationStatus',
      header: 'Application Status',
      display: 'custom',
    },
    {
      field: 'publishDocuments',
      header: 'Unpublished Documents',
      display: 'custom',
    },
    {
      field: 'documentList',
      header: 'Documents Excluded',
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

  // Create a data signal for the rules
  public rulesData = signal<ExclusionRule[]>([]);

  // Add signal for configuration data
  public configData = signal<any>(null);

  distributionRulesData = computed(() => {
    const rules = this.rulesData();
    console.log('Rules data for table:', rules);
    return rules || [];
  });

  // Computed properties for template expressions
  activeRulesCount = computed(
    () =>
      this.distributionRulesData().filter(
        (rule) => rule.publishDocuments === true
      ).length
  );

  officesCoveredCount = computed(
    () =>
      new Set(
        this.distributionRulesData().map((rule) => rule.originatingOfficeName)
      ).size
  );

  totalRulesCount = computed(() => this.distributionRulesData().length);

  // Helper method to get application status text and styling
  getApplicationStatus(rule: any): {
    text: string;
    class: string;
    bgColor: string;
    textColor: string;
    icon: string;
  } {
    if (!rule.applicationPublished) {
      return {
        text: 'Unpublished',
        class: 'status-inactive',
        bgColor: '#ffebee',
        textColor: '#c62828',
        icon: 'pi pi-eye-slash',
      };
    }

    if (rule.ipRightsGranted) {
      return {
        text: 'Published & Granted',
        class: 'status-active',
        bgColor: '#e8f5e8',
        textColor: '#2e7d32',
        icon: 'pi pi-check-circle',
      };
    }

    return {
      text: 'Published',
      class: 'status-active',
      bgColor: '#e3f2fd',
      textColor: '#1976d2',
      icon: 'pi pi-eye',
    };
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataExchangeService: DataExchangeConfigService,
    private http: HttpClient
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
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading = true;

    // Always load JSON config for the add exclusion rule component
    this.loadFromJsonConfig();

    // Load exclusion rules from service for the table
    this.dataExchangeService.getExclusionRules().subscribe({
      next: (rules) => {
        console.log('API Response (ExclusionRule[]): ', rules);
        this.rulesData.set(rules || []);
        this.loading = false;
        console.log('Data loaded successfully, loading set to false');
      },
      error: (error) => {
        console.error('Error loading data from API:', error);
        this.rulesData.set([]);
        this.loading = false;
      },
    });
  }

  private loadFromJsonConfig(): void {
    console.log('Loading JSON configuration...');
    // Load data from the JSON configuration file
    this.http.get<any>('/assets/configuration/data-exchange.json').subscribe({
      next: (data) => {
        console.log('JSON config loaded successfully:', data);
        if (data.recipientSystems) {
          // Store the full configuration data for add exclusion rule component
          this.configData.set(data);
          console.log('ConfigData signal set with:', data);
        } else {
          console.log('No recipient systems found in JSON configuration');
          this.configData.set(null);
        }
      },
      error: (error) => {
        console.error('Error loading JSON configuration:', error);
        this.configData.set(null);
      },
    });
  }

  addRule() {
    console.log('Navigating to add exclusion rule page...');
    // Navigate to the add-exclusion-rule route
    this.router.navigate([
      `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/add-exclusion-rule`,
    ]);
  }

  onActionClick(event: { action: string; item: any }) {
    console.log('Action clicked:', event);

    if (event.action === 'edit') {
      const basePath = `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard`;
      this.router.navigate([
        `${basePath}/edit-rule/${event.item.recipientClientId}`,
      ]);
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
    this.rulesData.update((current) =>
      current.filter((r) => r.recipientClientId !== rule.recipientClientId)
    );
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
