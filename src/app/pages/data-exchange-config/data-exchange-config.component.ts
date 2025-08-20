import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppLayoutComponent, LayoutConfig } from '../../components/app-layout/app-layout.component';
import { BreadcrumbsComponent } from '../../components/breadcrumbs/breadcrumbs.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';

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
  officeCode: string;
  langCode: string;

  // Summary cards for the dashboard
  summaryCards = [
    {
      icon: 'pi pi-building',
      title: 'Originating Offices',
      description: 'Total IP offices providing data',
      count: 1, // Set to 1 for office users
      color: '#1976d2',
      clickable: true,
    },
    {
      icon: 'pi pi-database',
      title: 'Recipient Systems',
      description: 'Systems receiving data',
      count: 0, // Will be loaded from assets configuration
      color: '#1565c0',
      clickable: true,
    },
    {
      icon: 'pi pi-shield',
      title: 'Distribution Exclusion Rules',
      description: 'Active exclusion rules',
      count: null, // No count displayed for distribution rules
      color: '#0d47a1',
      clickable: true,
    },
  ];

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
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
  }

  ngOnInit(): void {
    // Load recipient systems count from assets configuration
    this.loadRecipientSystemsCount();
  }

  private loadRecipientSystemsCount(): void {
    // Load recipient systems count from assets data exchange configuration
    this.http.get<any>('/assets/configuration/data-exchange.json').subscribe({
      next: data => {
        if (data.recipientSystems && Array.isArray(data.recipientSystems)) {
          const recipientSystemsCount = data.recipientSystems.length;

          // Update the recipient systems count in summary cards
          const recipientSystemsCard = this.summaryCards.find(
            card => card.title === 'Recipient Systems'
          );
          if (recipientSystemsCard) {
            recipientSystemsCard.count = recipientSystemsCount;
          }

          // Trigger change detection to update the UI
          this.cdr.detectChanges();
        }
      },
      error: error => {
        // Keep default count of 0
      },
    });
  }

  // Summary card click handler
  onSummaryCardClick(card: any): void {
    const basePath = `/${this.officeCode}/${this.langCode}/configuration/data-exchange/dashboard`;

    if (card.title === 'Distribution Exclusion Rules') {
      // Navigate to exclusion rules page
      const targetPath = `${basePath}/distribution-rules`;
      this.router.navigate([targetPath]);
    } else if (card.title === 'Recipient Systems') {
      // Navigate to recipient systems page
      const targetPath = `${basePath}/recipient-systems`;
      this.router.navigate([targetPath]);
    } else if (card.title === 'Originating Offices') {
      // Navigate to originating offices page
      const targetPath = `${basePath}/originating-offices`;
      this.router.navigate([targetPath]);
    } else if (card.title === 'Active Connections') {
      // Navigate to connections page
      const targetPath = `${basePath}/connections`;
      this.router.navigate([targetPath]);
    }
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
