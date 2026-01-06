import {
  Component,
  computed,
  OnInit,
  signal,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { LayoutConfig } from '../../../components/app-layout/app-layout.component';
import { DataExchangeConfigService } from '../../../_services/data-exchange-config.service';
import { LoadingService } from '../../../_services/loading.service';
import { ExclusionRule, Recipient } from '../../../interfaces';
import { HttpClient } from '@angular/common/http';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import {
  FilterConfig,
  FilterValue,
} from '../../../components/configurable-filter/configurable-filter.component';
import { ConfigurableFilterComponent } from '../../../components/configurable-filter/configurable-filter.component';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';

@Component({
  selector: 'app-distribution-rules',
  templateUrl: './distribution-rules.component.html',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DistributionRulesComponent implements OnInit {
  @ViewChild(ConfigurableFilterComponent)
  configurableFilter!: ConfigurableFilterComponent;

  layoutConfig: LayoutConfig;
  officeCode: string;
  langCode: string;
  isWipoAdmin = false;
  tabs: { title: string; value: string; content: any, show: boolean }[] = [];
  selectedTabPanel = "distributionRules";

  // Create a data signal for the rules
  // public rulesData = signal<ExclusionRule[]>([]);

  // Create a data signal for the recipients
  // public recipientsData = signal<Recipient[]>([]);

  // Add signal for configuration data
  // public configData = signal<any>(null);

  // Filter configuration
  filterConfigs = computed((): FilterConfig[] => {
    const baseFilters: FilterConfig[] = [
      {
        key: 'recipientName',
        label: 'Recipient Name',
        type: 'text',
        placeholder: 'Enter recipient name',
        section: 'RECIPIENT',
      },
      {
        key: 'ipCategory',
        label: 'IP Category',
        type: 'dropdown',
        placeholder: 'Select IP category',
        options: [
          { label: 'Patent', value: 'Patent' },
          { label: 'Trademark', value: 'Trademark' },
          { label: 'Design', value: 'Design' },
          { label: 'Copyright', value: 'Copyright' },
        ],
        section: 'IP CATEGORY',
      },
      {
        key: 'unpublishedApplication',
        label: 'Application Type',
        type: 'dropdown',
        placeholder: 'Select application type',
        options: [
          { label: 'Unpublished', value: true },
          { label: 'Published', value: false },
        ],
        section: 'APPLICATION TYPE',
      },
    ];

    // Only add originating office filter for WIPO admins
    if (this.isWipoAdmin) {
      baseFilters.push({
        key: 'originatingOfficeName',
        label: 'Originating Office',
        type: 'dropdown',
        placeholder: 'Select originating office',
        options: [
          { label: 'WIPO', value: 'WIPO' },
          { label: 'ASEAN', value: 'ASEAN' },
          { label: 'BT', value: 'BT' },
          { label: 'KH', value: 'KH' },
          { label: 'VC', value: 'VC' },
        ],
        section: 'OFFICE',
      });
    }

    return baseFilters;
  });

  appliedFilters: FilterValue[] = [];
  searchBar: string = '';

  distributionRulesData = computed(() => {
    const rules = this.dataExchangeService.rulesData();
    console.log('Rules data for table:', rules);
    return rules || [];
  });

  recipientsRulesData = computed(() => {
    const recipients = this.dataExchangeService.recipientsData();
    console.info("Recipients data for table:", recipients);
    return recipients || [];
  })

  // Computed properties for template expressions
  activeRulesCount = computed(
    () =>
      this.distributionRulesData().filter(
        (rule) => rule.unpublishedApplication === true
      ).length
  );

  officesCoveredCount = computed(() => {
    if (this.isWipoAdmin) {
      return new Set(
        this.distributionRulesData().map((rule) => rule.originatingOfficeName)
      ).size;
    }
    return 0; // Don't show offices covered count for non-WIPO admins
  });

  totalRulesCount = computed(() => this.distributionRulesData().length);
  totalRecipientsCount = computed(() => this.recipientsRulesData().length);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private dataExchangeService: DataExchangeConfigService,
    private http: HttpClient,
    private loadingService: LoadingService,
    private sidebarService: SidebarMenuService,
    private cdr: ChangeDetectorRef
  ) {
    this.officeCode = this.route.snapshot.params['officeCode'] || 'default';
    this.langCode = this.route.snapshot.params['langCode'] || 'en';
    this.isWipoAdmin = this.ms.isCurrentUserWipoAdmin();
    console.info("IsWIPOAdmin: ", this.isWipoAdmin);
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
    const currentPath = this.router.url;
    const menuItems = this.sidebarService.generateConfigurationMenu(
      currentPath,
      ''
    );
    this.sidebarService.updateMenuItems(menuItems);
    this.tabs = [
      { title: 'Distribution Rules', value: 'distributionRules', content: this.distributionRulesData, show: true },
      { title: 'Recipients', value: 'recipients', content: this.recipientsRulesData, show: this.isWipoAdmin }
    ];
    this.selectedTabPanel = this.dataExchangeService.tabPanelSelection() ?
      this.dataExchangeService.tabPanelSelection() :
      this.tabs[0].value
  }

  private loadData(): void {
    this.dataExchangeService.setRecipientData([]);
    this.dataExchangeService.setRulesData([]);
    if (!this.isWipoAdmin) {
      this.dataExchangeService.getRecipients();
    }
    this.dataExchangeService.getExclusionRules();
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

  addRecipient() {
    console.log('Navigating to add recipient page...');
    this.loadingService.show('Loading add recipient page...');

    // Navigate to the add-recipient route
    this.router
      .navigate([
        `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/add-recipient`,
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
      this.dataExchangeService.updateRulesData((current) =>
        current.filter((r) => r.recipientClientId !== rule.recipientClientId)
      );
      this.loadingService.hide();
    }, 500);
  }

  getBreadcrumbItems() {
    return [
      {
        label: 'Data Sharing',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard`,
      },
      {
        label: 'Configuration',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/distribution-rules`,
      }
    ];
  }

  onFilterCleared(): void {
    console.log('Filters cleared');
    this.appliedFilters = [];
    this.searchBar = '';
    this.loadData(); // Reload original data
    this.cdr.detectChanges();
  }

  onFilterApplied(filters: FilterValue[]): void {
    console.log('Filters applied:', filters);
    this.appliedFilters = filters;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  onAppliedFiltersChange(filters: FilterValue[]): void {
    this.appliedFilters = filters;
    this.cdr.detectChanges();
  }

  onHasActiveFiltersChange(hasActiveFilters: boolean): void {
    console.log('Has active filters changed:', hasActiveFilters);
    // This will help sync the red dot state
    this.cdr.detectChanges();
  }

  filterSearch(value: string) {
    console.log('Search value:', value);
    this.searchBar = value;
    this.applyFilters();
  }

  private searchByFilter(): void {
    if (!this.searchBar || !this.searchBar.trim()) {
      return;
    }

    const searchTerm = this.searchBar.toLowerCase().trim();
    let filtered = [...this.dataExchangeService.rulesData()];

    filtered = filtered.filter(
      (item) =>
        item.recipientName?.toLowerCase().includes(searchTerm) ||
        item.ipCategory?.toLowerCase().includes(searchTerm) ||
        (this.isWipoAdmin &&
          item.originatingOfficeName?.toLowerCase().includes(searchTerm))
    );

    this.dataExchangeService.setRulesData(filtered);
  }

  removeFilterChip(filterKey: string): void {
    // Remove the filter from applied filters
    this.appliedFilters = this.appliedFilters.filter(
      (f) => f.key !== filterKey
    );

    // Also remove the filter from the configurable filter component to sync state
    if (this.configurableFilter) {
      this.configurableFilter.removeFilterChip(filterKey);
    }

    this.applyFilters();
    this.cdr.detectChanges();
  }

  clearAllFilters(): void {
    // Clear applied filters
    this.appliedFilters = [];
    this.searchBar = '';

    // Clear the configurable filter component's internal state
    if (this.configurableFilter) {
      this.configurableFilter.clearAllFilters();
    }

    // Reload original data
    this.loadData();
    this.cdr.detectChanges();
  }

  onFilterChipRemoved(filterKey: string): void {
    this.removeFilterChip(filterKey);
  }

  onFilterChipsClearAll(): void {
    this.clearAllFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.dataExchangeService.rulesData()];

    // Apply search filter
    if (this.searchBar && this.searchBar.trim()) {
      const searchTerm = this.searchBar.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.recipientName?.toLowerCase().includes(searchTerm) ||
          item.ipCategory?.toLowerCase().includes(searchTerm) ||
          (this.isWipoAdmin &&
            item.originatingOfficeName?.toLowerCase().includes(searchTerm))
      );
    }

    // Apply other filters
    this.appliedFilters.forEach((filter) => {
      switch (filter.key) {
        case 'recipientName':
          if (filter.value && filter.value.trim()) {
            const searchTerm = filter.value.toLowerCase().trim();
            filtered = filtered.filter((item) =>
              item.recipientName?.toLowerCase().includes(searchTerm)
            );
          }
          break;
        case 'ipCategory':
          if (filter.value) {
            filtered = filtered.filter(
              (item) => item.ipCategory === filter.value
            );
          }
          break;
        case 'unpublishedApplication':
          if (filter.value !== undefined && filter.value !== null) {
            filtered = filtered.filter(
              (item) => item.unpublishedApplication === filter.value
            );
          }
          break;
        case 'originatingOfficeName':
          if (filter.value && this.isWipoAdmin) {
            filtered = filtered.filter(
              (item) => item.originatingOfficeName === filter.value
            );
          }
          break;
      }
    });

    // Update the computed data
    this.dataExchangeService.setRulesData(filtered);
  }

  getFilterDisplayValue(filter: FilterValue): string {
    const filterConfig = this.filterConfigs().find((f) => f.key === filter.key);
    if (filterConfig) {
      if (filterConfig.type === 'dropdown' && filterConfig.options) {
        const option = filterConfig.options.find(
          (opt) => opt.value === filter.value
        );
        return option ? option.label : filter.value;
      }
      return filter.value;
    }
    return filter.key;
  }
}
