import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { authorityData } from '../../../../assets/data';
import { SidebarMenuService } from '../../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BreadcrumbsComponent } from 'src/app/components/breadcrumbs/breadcrumbs.component';
import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { TableComponent } from 'src/app/components/table/table.component';
import { MechanicsService } from 'src/app/_services/mechanics.service';
import { FormsModule } from '@angular/forms';

interface IpType {
    name: string;
    code: string;
}

@Component({
  selector: 'app-authority-files',
  templateUrl: './authority-files.component.html',
  imports: [
    BreadcrumbsComponent,
    AppLayoutComponent,
    TableComponent,
    FormsModule,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthorityFilesComponent implements OnInit {
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

  // Static Package stats for demo
  totalPackages = 1580;
  yearPackages = 1180;
  monthPackages = 480;
  weekPackages = 300;
  globalFilterFields = ['applicationNumber', 'publicationNumber'];

  tableColumns = [
    { field: 'applicationNumber', header: 'Application Number', sortable: true, },
    { field: 'filingDate', header: 'Filing Date', },
    { field: 'publicationNumber', header: 'Publication Number', sortable: true, },
    { field: 'publicationDate', header: 'Publication Date' },
    { field: 'kindCode', header: 'Publication Kind Code' },
    {
      field: 'actions',
      header: 'Actions',
      display: 'actions',
      actions: [
        {
          label: 'Download Details',
          icon: 'pi pi-download',
          action: 'download',
          severity: 'info',
        },
      ],
    },
  ];

  tableData = authorityData;

  constructor(
    private menuService: SidebarMenuService,
    private router: Router,
    private route: ActivatedRoute,
    public ms: MechanicsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const currentPath = this.router.url;
    const menuItems = this.menuService.generateConfigurationMenu(currentPath);
    this.menuService.updateMenuItems(menuItems);
    // Optionally, dynamically set menu items here

    this.route.params.subscribe((params) => {
      const officeCode =
        params['officeCode'] || this.ms.getCurrentOffice() || 'default';
      const langCode = params['langCode'] || 'en';

      if(officeCode=='default'){
        this.breadcrumbItems = [
          {
            label: 'Offices',
            routerLink: `/${officeCode}/${langCode}/data-packages`,
          },
          {
            label: 'Data Sharing',
            routerLink: `/${officeCode}/${langCode}/data-packages`,
          },
          {
            label: 'Authority Files',
            routerLink: `/${officeCode}/${langCode}/data-packages/authority-files`,
          },
        ];
      } else {
        this.breadcrumbItems = [
          {
            label: 'Data Sharing',
            routerLink: `/${officeCode}/${langCode}/data-packages`,
          },
          {
            label: 'Authority Files',
            routerLink: `/${officeCode}/${langCode}/data-packages/authority-files`,
          },
        ];
      }


      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });

    let today = new Date();
    
    let startDate = new Date();
    startDate.setMonth(today.getMonth() - 1);
    //this.tableData = packagesData.filter(item => new Date(item.sharedDate) >= startDate);
  }

  onStatSelect(statLabel: string){
    console.log('Stats Selected:', statLabel);

    let endDate = new Date();

    let startDate = new Date();
    if(statLabel=='TOTAL IN YEAR'){
      startDate.setFullYear(endDate.getFullYear()-1);
    }else if(statLabel=='TOTAL IN MONTH'){
      startDate.setMonth(endDate.getMonth()-1);
    }else if(statLabel=='TOTAL IN WEEK'){
      startDate.setDate(endDate.getDate()-7);
    }else {
      //TOTAL COUNT
      startDate = null;
    }

    //if(startDate==null){
    //  this.tableData = packagesData;
    //}else{
    //  this.tableData = packagesData.filter(item => new Date(item.sharedDate) >= startDate);
    //}
  }

  onActionClick(action: string, item: any) {
    console.log('Action clicked:', action, item);
    switch (action) {
      case 'download':
        this.downloadDetails(item);
        break;
    }
  }

  downloadDetails(user: any) {
    // this.router.navigate(['edit-user-account', user.id], {
    //   relativeTo: this.route,
    // });
    // TODO: Implement edit user functionality
    console.log('Download details:', user);
    //this.router.navigate(['user-management/user-accounts/create-user-account'], { relativeTo: this.route });
  }

}
