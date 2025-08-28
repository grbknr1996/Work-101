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
import { LoadingService } from '../../../_services/loading.service';
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
      field: 'unpublishedApplication',
      header: 'Included Application Type',
      display: 'custom',
    },
    {
      field: 'documentList',
      header: 'Documents Included',
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
        (rule) => rule.unpublishedApplication === true
      ).length
  );

  officesCoveredCount = computed(
    () =>
      new Set(
        this.distributionRulesData().map((rule) => rule.originatingOfficeName)
      ).size
  );

  totalRulesCount = computed(() => this.distributionRulesData().length);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataExchangeService: DataExchangeConfigService,
    private http: HttpClient,
    private loadingService: LoadingService
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
    this.loadingService.show('Loading distribution exclusion rules...');

    // Load exclusion rules from service for the table
    this.dataExchangeService.getExclusionRules().subscribe({
      next: (rules) => {
        console.log('API Response (ExclusionRule[]): ', rules);
        this.rulesData.set(rules || []);
        this.loadingService.hide();
        console.log('Data loaded successfully, loading set to false');
      },
      error: (error) => {
        console.error('Error loading data from API:', error);
        this.rulesData.set([]);
        this.loadingService.hide();
      },
    });
  }

  addRule() {
    console.log('Navigating to add exclusion rule page...');
    this.loadingService.show('Loading add rule page...');

    // Navigate to the add-exclusion-rule route
    this.router
      .navigate([
        `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/add-rule`,
      ])
      .then(() => {
        this.loadingService.hide();
      });
  }

  onActionClick(event: { action: string; item: any }) {
    console.log('Action clicked:', event);

    if (event.action === 'edit') {
      this.loadingService.show('Loading edit rule page...');
      const basePath = `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard`;
      this.router
        .navigate([`${basePath}/edit-rule/${event.item.recipientClientId}`])
        .then(() => {
          this.loadingService.hide();
        });
    } else if (event.action === 'delete') {
      // Handle delete action
      this.deleteRule(event.item);
    }
  }

  private deleteRule(rule: any) {
    console.log('Deleting rule:', rule);
    this.loadingService.show('Deleting rule...');

    // Simulate API call delay (replace with actual API call)
    setTimeout(() => {
      // Update local data to remove the rule
      this.rulesData.update((current) =>
        current.filter((r) => r.recipientClientId !== rule.recipientClientId)
      );
      this.loadingService.hide();
    }, 500);
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
