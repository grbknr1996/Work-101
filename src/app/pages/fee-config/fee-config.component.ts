import { ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CustomerService } from 'src/app/_services/customerservice';
import { Customer, Representative } from 'src/app/schemas/customer-schema';
import { CommonModule } from '@angular/common';
import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SidebarMenuService } from 'src/app/_services/sidebar-menu.service';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { BreadcrumbsComponent } from 'src/app/components/breadcrumbs/breadcrumbs.component';

@Component({
  selector: 'app-fee-config',
  standalone: true,
  imports: [
    CardModule,
    TableModule,
    InputTextModule,
    TagModule,
    SelectModule,
    MultiSelectModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    CommonModule,
    AppLayoutComponent,
    BreadcrumbsComponent
  ],
  templateUrl: './fee-config.component.html',
})
export class FeeConfigComponent implements OnInit, OnChanges {
  customers!: Customer[];

  breadcrumbItems = [];

  categories!: any[];

  statuses!: any[];

  loading: boolean = true;

  activityValues: number[] = [0, 100];

  searchValue: string | undefined;

  feeStats = [];

  constructor(
    private customerService: CustomerService,
    private menuService: SidebarMenuService,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    const currentPath = this.router.url;
    const menuItems = this.menuService.generateUserManagementMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);
    // Optionally, dynamically set menu items here
    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      this.breadcrumbItems = [
        {
          label: 'System Configuration',
          routerLink: `/${officeCode}/${langCode}/system-configuration`,
        },
        {
          label: 'Fee Configuration',
          routerLink: `/${officeCode}/${langCode}/system-configuration/fee-config`,
        },
      ];

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });
    this.customerService.getCustomersLarge().then((customers) => {
      this.customers = customers;
      this.loading = false;

      this.customers.forEach((customer) => (customer.date = new Date(<Date>customer.date)));
      console.log("customers: ", this.customers);
    });

    this.categories = [
      { label: 'Copyright', value: 'copyright' },
      { label: 'Gi', value: 'gi' },
      { label: 'Trademark', value: 'trademark' },
      { label: 'Post Qualified', value: 'post-qualified' },
      { label: 'Industrial Design', value: 'industrial-design' },
      { label: 'Patent', value: 'patent' }
    ];

    this.statuses = [
      { label: 'Active', value: 'active' },
      { label: 'Under Review', value: 'under-review' }
    ]

    this.initialFeeStats();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initialFeeStats();
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = ''
  }

  getSeverity(status: string) {
    switch (status.toLowerCase()) {
      case 'copyright':
        return 'danger';

      case 'gi':
        return 'success';

      case 'trademark':
        return 'info';

      case 'post-qualified':
        return 'warn';

      case 'industrial-design':
        return 'help';
        
      case 'patent':
        return 'secondary';
    }
  }

  getActiveStatus(status: string) {
    switch (status.toLowerCase()) {
      case 'under-review':
        return 'danger';

      case 'active':
        return 'success';
    }
  }

  initialFeeStats() {
    this.feeStats = [
      {
        label: "TOTAL SERVICES",
        count: "42",
        color: "#3949AB", // Indigo color
        icon: "pi pi-bars",
      },
      {
        label: "ACTIVE SERVICES",
        count: "38",
        color: "#2E7D32", // Green color
        icon: "pi pi-check",
      },
      {
        label: "AVERAGE FEE",
        count: "89.50$",
        color: "#D32F2F", // Red color
        icon: "pi pi-dollar",
      }
    ];
  }
}
