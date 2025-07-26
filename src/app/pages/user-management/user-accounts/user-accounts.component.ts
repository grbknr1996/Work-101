import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { tableData } from '../../../../assets/data';
import { SidebarMenuService } from '../../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserStatsComponent } from 'src/app/components/user-stats/user-stats.component';
import { BreadcrumbsComponent } from 'src/app/components/breadcrumbs/breadcrumbs.component';
import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { TableComponent } from 'src/app/components/table/table.component';
import { MechanicsService } from 'src/app/_services/mechanics.service';

@Component({
  selector: 'app-user-accounts',
  templateUrl: './user-accounts.component.html',
  imports: [
    UserStatsComponent,
    BreadcrumbsComponent,
    AppLayoutComponent,
    TableComponent,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAccountsComponent implements OnInit {
  layoutConfig = {
    appTitle: 'WIPO IPAS Central',
    showHeader: true,
    showSidebar: true,
    headerItems: [],
    sidebarItems: [],
    footerText: 'WIPO',
    fixedHeader: true,
    fixedSidebar: true,
    sidebarCollapsed: false,
    theme: 'light',
    logo: '',
  };

  breadcrumbItems = [];

  // Static user stats for demo
  totalUsers = 100;
  activeUsers = 80;
  inactiveUsers = 15;
  unconfirmedUsers = 5;
  globalFilterFields = ['username', 'email', 'status'];

  tableColumns = [
    {
      field: 'username',
      header: 'Username',
      filterType: 'text',
      sortable: true,
    },
    { field: 'imageUrl', header: 'Avatar', display: 'avatar' },
    { field: 'email', header: 'Email' },
    {
      field: 'status',
      header: 'Status',
      display: 'tag',
      severity: (value) => {
        if (value === 'Active') {
          return 'success';
        } else if (value === 'Inactive') {
          return 'danger';
        } else {
          return 'warning';
        }
      },
    },
    { field: 'createdOn', header: 'Created On' },
    { field: 'updatedOn', header: 'Updated On' },
    {
      field: 'actions',
      header: 'Actions',
      display: 'actions',
      actions: [
        {
          label: 'Edit User',
          icon: 'pi pi-pencil',
          action: 'edit',
          severity: 'info',
        },
        {
          label: 'Deactivate User',
          icon: 'pi pi-ban',
          action: 'deactivate',
          severity: 'warning',
          visible: (item) => item.status === 'Active',
        },
        {
          label: 'Resend Activation Email',
          icon: 'pi pi-envelope',
          action: 'resendActivation',
          severity: 'help',
          visible: (item) => item.status === 'Unconfirmed',
        },
      ],
    },
  ];

  tableData = tableData;

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
          label: 'User Management',
          routerLink: `/${officeCode}/${langCode}/user-management`,
        },
        {
          label: 'User Accounts',
          routerLink: `/${officeCode}/${langCode}/user-management/user-accounts`,
        },
      ];

      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });
  }

  onActionClick(action: string, item: any) {
    console.log('Action clicked:', action, item);
    switch (action) {
      case 'edit':
        this.editUser(item);
        break;
      case 'deactivate':
        this.deactivateUser(item);
        break;
      case 'resendActivation':
        this.resendActivationEmail(item);
        break;
    }
  }

  editUser(user: any) {
    this.router.navigate(['edit-user-account', user.id], {
      relativeTo: this.route,
    });
    // TODO: Implement edit user functionality
    console.log('Edit user:', user);
  }

  deactivateUser(user: any) {
    // TODO: Implement deactivate user functionality
    console.log('Deactivate user:', user);
  }

  resendActivationEmail(user: any) {
    // TODO: Implement resend activation email functionality
    console.log('Resend activation email to:', user);
  }

  onCreateUser() {
    // Placeholder for create user action
    this.router.navigate(['create-user-account'], { relativeTo: this.route });
  }
}
