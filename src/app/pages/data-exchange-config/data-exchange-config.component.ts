import { Component, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import {
  AppLayoutComponent,
  LayoutConfig,
} from '../../components/app-layout/app-layout.component';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DataExchangeConfigService } from 'src/app/_services/data-exchange-config.service';

@Component({
  selector: 'app-data-exchange-config',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AppLayoutComponent,
    BreadcrumbsComponent,
    CardModule,
    ButtonModule,
    ProgressBarModule,
  ],
  templateUrl: './data-exchange-config.component.html',
})
export class DataExchangeConfigComponent implements OnInit {
  layoutConfig: LayoutConfig;
  dataExchangeData = signal<any>({});
  officeCode: string;
  langCode: string;

  // Summary cards for the dashboard
  summaryCards = [
    {
      icon: 'pi pi-building',
      title: 'Originating Offices',
      description: 'Total IP offices providing data',
      count: 10,
      color: '#1976d2',
      clickable: true,
    },
    {
      icon: 'pi pi-database',
      title: 'Recipient Systems',
      description: 'Systems receiving data',
      count: 5,
      color: '#1565c0',
      clickable: true,
    },
    {
      icon: 'pi pi-shield',
      title: 'Distribution Exclusion Rules',
      description: 'Active exclusion rules',
      count: 20,
      color: '#0d47a1',
      clickable: true,
    },
  ];

  // Navigation cards for different sections
  navigationCards = [
    {
      icon: 'pi pi-building',
      title: 'Originating Offices',
      description: 'Manage IP offices that provide data to the system',
      route: 'originating-offices',
      color: '#1976d2',
      stats: {
        total: 0,
        active: 0,
        inactive: 0,
      },
    },
    {
      icon: 'pi pi-database',
      title: 'Recipient Systems',
      description: 'Configure systems that receive data from IP offices',
      route: 'recipient-systems',
      color: '#e91e63',
      stats: {
        total: 0,
        active: 0,
        inactive: 0,
      },
    },
    {
      icon: 'pi pi-shield',
      title: 'Distribution Rules',
      description: 'Define exclusion rules for data distribution',
      route: 'distribution-rules',
      color: '#ff9800',
      stats: {
        total: 0,
        active: 0,
        inactive: 0,
      },
    },
    {
      icon: 'pi pi-link',
      title: 'Active Connections',
      description: 'Monitor active data exchange connections',
      route: 'connections',
      color: '#9c27b0',
      stats: {
        total: 0,
        active: 0,
        inactive: 0,
      },
    },
  ];

  constructor(
    private dataExchangeService: DataExchangeConfigService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.officeCode = this.route.snapshot.params['officeCode'] || 'default';
    this.langCode = this.route.snapshot.params['langCode'] || 'en';

    this.layoutConfig = {
      appTitle: 'Data Exchange Configuration',
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

    effect(() => {
      this.updateStats();
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.dataExchangeService
      .getDataExchangeData('7bnv35u5b6j6mk5pnfb65jqqe6', 'patent', 'JP')
      .subscribe((data) => {
        console.log('ExchangeData: ', data);
        if (!data || Object.keys(data).length === 0) {
          data = {
            originatingOfficesData: [
              {
                code: 'USPTO',
                name: 'United States Patent and Trademark Office',
                status: 'active',
              },
              { code: 'EPO', name: 'European Patent Office', status: 'active' },
              { code: 'JPO', name: 'Japan Patent Office', status: 'active' },
            ],
            recipientSystemsData: [
              { name: 'PATENTSCOPE', status: 'active' },
              { name: 'Global Brand Database', status: 'active' },
            ],
            distributionExclusionRulesData: [
              {
                originatingOffice: 'USPTO',
                recipientName: 'PATENTSCOPE',
                status: 'active',
              },
              {
                originatingOffice: 'EPO',
                recipientName: 'Global Brand Database',
                status: 'active',
              },
            ],
          };
        }
        this.dataExchangeData.set(data);

        this.updateStats();
      });
  }

  private updateStats(): void {
    const data = this.dataExchangeData();
    console.log('Updating stats with data:', data);
    if (data) {
      // Update navigation card stats
      this.navigationCards[0].stats.total =
        data.originatingOfficesData?.length || 0;
      this.navigationCards[1].stats.total =
        data.recipientSystemsData?.length || 0;
      this.navigationCards[2].stats.total =
        data.distributionExclusionRulesData?.length || 0;
    }
  }

  // Summary card click handler
  onSummaryCardClick(card: any): void {
    const basePath = `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard`;
    console.log('Card clicked:', card.title);
    console.log('Base path:', basePath);

    if (card.title === 'Distribution Exclusion Rules') {
      // Navigate to exclusion rules page
      const targetPath = `${basePath}/distribution-rules`;
      console.log('Navigating to:', targetPath);
      this.router.navigate([targetPath]);
    } else if (card.title === 'Recipient Systems') {
      // Navigate to recipient systems page
      const targetPath = `${basePath}/recipient-systems`;
      console.log('Navigating to:', targetPath);
      this.router.navigate([targetPath]);
    } else if (card.title === 'Originating Offices') {
      // Navigate to originating offices page
      const targetPath = `${basePath}/originating-offices`;
      console.log('Navigating to:', targetPath);
      this.router.navigate([targetPath]);
    } else if (card.title === 'Active Connections') {
      // Navigate to connections page
      const targetPath = `${basePath}/connections`;
      console.log('Navigating to:', targetPath);
      this.router.navigate([targetPath]);
    }
  }

  // Recipient systems methods
  onRecipientSystemAction(event: any): void {
    console.log('Recipient system action:', event);
    const basePath = `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/recipient-systems`;

    // Handle different actions like edit, delete, etc.
    if (event.action === 'edit') {
      // Navigate to edit page
      this.router.navigate([`${basePath}/${event.data.id}/edit`]);
    } else if (event.action === 'delete') {
      // Handle delete action
      console.log('Delete recipient system:', event.data);
    }
  }

  onAddSystemClick(): void {
    console.log('Add system clicked');
    // Navigate to add system page
    const basePath = `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/recipient-systems`;
    this.router.navigate([`${basePath}/add`]);
  }

  // Originating offices methods
  onOriginatingOfficeAction(event: any): void {
    console.log('Originating office action:', event);
    const basePath = `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/originating-offices`;

    // Handle different actions like edit, delete, etc.
    if (event.action === 'edit') {
      // Navigate to edit page
      this.router.navigate([`${basePath}/${event.data.code}/edit`]);
    } else if (event.action === 'delete') {
      // Handle delete action
      console.log('Delete originating office:', event.data);
    }
  }

  onAddOfficeClick(): void {
    console.log('Add office clicked');
    // Navigate to add office page
    const basePath = `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard/originating-offices`;
    this.router.navigate([`${basePath}/add`]);
  }

  onCardClick(card: any): void {
    console.log('Navigating to:', card.route);
    // Navigate to the child route relative to current path
    this.router.navigate([card.route], { relativeTo: this.route });
  }

  getBreadcrumbItems() {
    const basePath = `/${this.officeCode}/${this.langCode}`;

    return [
      {
        label: 'Configuration',
        routerLink: `${basePath}/configuration`,
      },
      {
        label: 'Data Exchange',
        routerLink: `${basePath}/configuration/data-exchange`,
      },
    ];
  }
}
