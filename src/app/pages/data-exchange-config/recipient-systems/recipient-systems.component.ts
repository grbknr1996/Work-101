import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  LayoutConfig,
} from '../../../components/app-layout/app-layout.component';
import {
  ModalConfig,
} from '../../../components/modal/modal.component';
import { HttpClient } from '@angular/common/http';

interface DocumentType {
  documentCode: string;
  documentName: string;
}

interface EventType {
  eventCode: string;
  eventLabel: string;
}

interface IpTypeCategory {
  ipTypeCategory: string;
  ipTypeLabel: string;
  documentTypeBag: DocumentType[];
  eventTypes: EventType[];
}

interface RecipientSystem {
  recipientCode: string;
  recipientName: string;
  ipTypeCategoryBag: IpTypeCategory[];
}

@Component({
  selector: 'app-recipient-systems',
  standalone: false,
  providers: [],
  templateUrl: './recipient-systems.component.html',
})
export class RecipientSystemsComponent implements OnInit {
  layoutConfig: LayoutConfig;
  officeCode: string;
  langCode: string;

  systems = signal<RecipientSystem[]>([]);
  filteredSystems = computed(() => this.systems());

  // Add expandable rows tracking
  expandedRows = signal<Set<string>>(new Set());

  // Computed properties for template expressions
  totalSystemsCount = computed(() => this.filteredSystems().length);

  totalIpTypesCount = computed(() => {
    const allIpTypes = new Set<string>();
    this.filteredSystems().forEach((system) => {
      system.ipTypeCategoryBag.forEach((category) => {
        allIpTypes.add(category.ipTypeCategory);
      });
    });
    return allIpTypes.size;
  });

  totalEventTypesCount = computed(() => {
    let total = 0;
    this.filteredSystems().forEach((system) => {
      system.ipTypeCategoryBag.forEach((category) => {
        total += category.eventTypes.length;
      });
    });
    return total;
  });

  totalDocumentTypesCount = computed(() => {
    let total = 0;
    this.filteredSystems().forEach((system) => {
      system.ipTypeCategoryBag.forEach((category) => {
        total += category.documentTypeBag.length;
      });
    });
    return total;
  });

  showInfoDialog = false;
  loading = false;

  // Modal configuration
  modalConfig: ModalConfig = {
    header: 'Information',
    content:
      '<h3>Update Recipient Systems</h3><p>To update recipient system configurations, please contact your system administrator.</p>',
    showIcon: true,
    iconClass: 'pi pi-info-circle',
    iconColor: '#2196f3',
    iconSize: '3rem',
    showCloseButton: true,
    closeButtonText: 'Close',
    width: '500px',
  };

  // Tooltip configuration for better mobile experience
  tooltipOptions = {
    tooltipPosition: 'top',
    tooltipEvent: 'hover',
    appendTo: 'body',
    autoHide: true,
    showDelay: 200,
    hideDelay: 100,
    tooltipStyleClass: 'mobile-friendly-tooltip',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.officeCode = this.route.snapshot.params['officeCode'] || 'default';
    this.langCode = this.route.snapshot.params['langCode'] || 'en';

    this.layoutConfig = {
      appTitle: 'Recipient Systems',
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
    this.loadSystems();
  }

  private loadSystems(): void {
    this.loading = true;

    // Load data from the JSON configuration file
    this.http.get<any>('/assets/configuration/data-exchange.json').subscribe({
      next: (data) => {
        if (data.recipientSystems) {
          // Transform the data to include computed counts
          const transformedSystems = data.recipientSystems.map(
            (system: RecipientSystem) => ({
              ...system,
              ipTypeCount: system.ipTypeCategoryBag.length,
              eventTypesCount: system.ipTypeCategoryBag.reduce(
                (total, category) => total + category.eventTypes.length,
                0
              ),
              documentTypesCount: system.ipTypeCategoryBag.reduce(
                (total, category) => total + category.documentTypeBag.length,
                0
              ),
            })
          );
          this.systems.set(transformedSystems);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading recipient systems:', error);
        this.loading = false;
        // Fallback to empty array
        this.systems.set([]);
      },
    });
  }

  showInfoMessage(): void {
    this.showInfoDialog = true;
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
        label: 'Recipient Systems',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration/data-exchange/recipient-systems`,
      },
    ];
  }

  getEventTypesTooltip(category: IpTypeCategory): string {
    const eventLabels = category.eventTypes.map((event) => event.eventLabel);
    return `Event Types:\n${eventLabels.join('\n')}`;
  }

  getDocumentTypesTooltip(category: IpTypeCategory): string {
    const docLabels = category.documentTypeBag.map(
      (doc) => `${doc.documentCode}: ${doc.documentName}`
    );
    return `Document Types:\n${docLabels.join('\n')}`;
  }

  // Expandable rows methods
  isRowExpanded(systemCode: string): boolean {
    return this.expandedRows().has(systemCode);
  }

  toggleRowExpansion(systemCode: string): void {
    const currentExpanded = this.expandedRows();
    const newExpanded = new Set(currentExpanded);

    if (newExpanded.has(systemCode)) {
      newExpanded.delete(systemCode);
    } else {
      newExpanded.add(systemCode);
    }

    this.expandedRows.set(newExpanded);
  }

  getExpandedRowKey(system: RecipientSystem): string {
    return system.recipientCode;
  }
}
