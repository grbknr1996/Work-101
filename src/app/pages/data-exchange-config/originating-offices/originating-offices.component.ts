import { Component, OnInit, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  LayoutConfig,
} from '../../../components/app-layout/app-layout.component';
import { MechanicsService } from '../../../_services/mechanics.service';

interface Office {
  code: string;
  name: string;
}

@Component({
  selector: 'app-originating-offices',
  standalone: false,
  providers: [],
  templateUrl: './originating-offices.component.html',
})
export class OriginatingOfficesComponent implements OnInit {
  layoutConfig: LayoutConfig;
  officeCode: string;
  langCode: string;

  offices = signal<Office[]>([]);
  filteredOffices = computed(() => this.offices());

  // Computed property for total originating offices count
  totalOfficesCount = computed(() => this.filteredOffices().length);

  // Current office information
  currentOffice = signal<Office | null>(null);

  columns = [
    { field: 'code', header: 'Office Code', display: 'text' },
    { field: 'name', header: 'Office Name', display: 'text' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private mechanicsService: MechanicsService
  ) {
    this.officeCode = this.route.snapshot.params['officeCode'] || 'default';
    this.langCode = this.route.snapshot.params['langCode'] || 'en';

    this.layoutConfig = {
      appTitle: 'Originating Offices',
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
    this.loadCurrentOffice();
  }

  private loadCurrentOffice(): void {
    // Get current office details from environment using MechanicsService
    const currentOfficeData: Office = {
      code: this.mechanicsService.getCurrentOffice(),
      name: this.mechanicsService.getOfficeName(),
    };

    this.currentOffice.set(currentOfficeData);
    this.offices.set([currentOfficeData]);
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
        label: 'Originating Offices',
        routerLink: `/${this.officeCode}/${this.langCode}/configuration/data-exchange/originating-offices`,
      },
    ];
  }
}
