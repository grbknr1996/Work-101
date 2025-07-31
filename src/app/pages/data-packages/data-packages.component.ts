import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { packagesData } from '../../../assets/data';
import { SidebarMenuService } from '../../_services/sidebar-menu.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PackageStatsComponent } from 'src/app/components/package-stats/package-stats.component';
import { BreadcrumbsComponent } from 'src/app/components/breadcrumbs/breadcrumbs.component';
import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { TableComponent } from 'src/app/components/table/table.component';
import { MechanicsService } from 'src/app/_services/mechanics.service';
//import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
//import { DatePickerModule } from 'primeng/datepicker';

interface IpType {
    name: string;
    code: string;
}

@Component({
  selector: 'app-data-packages',
  templateUrl: './data-packages.component.html',
  imports: [
    PackageStatsComponent,
    BreadcrumbsComponent,
    AppLayoutComponent,
    TableComponent,
    FormsModule,
//    Select,
//    DatePickerModule,
  ],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataPackagesComponent implements OnInit {
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
  globalFilterFields = ['ipType', 'fileName', 'status'];

  tableColumns = [
    { field: 'ipType', header: 'IP Right Category', sortable: true, },
    {
      field: 'fileName',
      header: 'File name',
      sortable: true,
    },
    { field: 'sharedDate', header: 'Shared Date', },
    { field: 'processedDate', header: 'Processed Date' },
    {
      field: 'status',
      header: 'Status',
      display: 'tag',
//      filterType: 'dropdown',
      severity: (value) => {
        if (value === 'Processed') {
          return 'success';
        } else if (value === 'Failed') {
          return 'danger';
        } else if(value === 'Partial') { 
          return 'warn';
        } else {
          return 'info';
        }
      },
    },
    { field: 'totalCount', header: 'Total Count' },
    { field: 'processedCount', header: 'Processed Count' },
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

  tableData = packagesData;

//  ipTypes: IpType[] | undefined;

//  selectedIpType: IpType | undefined;

//  date: Date | undefined;

//  maxDate: Date;

//  defaultMaxDate: Date;

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

      const officeCodeParam = this.route.snapshot.params['office'];

      console.log('officeCodeParam ',officeCodeParam);

      if(officeCode=='default' && (officeCodeParam==null || officeCodeParam==undefined || officeCodeParam=='')){
        this.router.navigate(['select-office'], { relativeTo: this.route });
      }


      if(officeCode=='default'){
        this.breadcrumbItems = [
          {
            label: 'Offices',
            routerLink: `/${officeCode}/${langCode}/data-packages/select-office`,
          },
          {
            label: 'Data Sharing',
            routerLink: `/${officeCode}/${langCode}/data-packages`,
          },
        ];
      } else {
        this.breadcrumbItems = [
          {
            label: 'Data Sharing',
            routerLink: `/${officeCode}/${langCode}/data-packages`,
          },
        ];
      }


      // Trigger change detection after updating breadcrumbs
      this.cdr.markForCheck();
    });

//    this.ipTypes = [
//      { name: 'Trademarks', code: 'trademarks' },
//      { name: 'Patents', code: 'patents' },
//      { name: 'Industrial Designs', code: 'designs' },
//      { name: 'Copyright', code: 'copyright' },
//      { name: 'Geographical Indications', code: 'gi' },
//    ];

    let today = new Date();
    
//    this.maxDate = new Date();
//    this.maxDate.setDate(today.getDate() + 1);
//    this.defaultMaxDate = this.maxDate;

    let startDate = new Date();
    startDate.setMonth(today.getMonth() - 1);
    this.tableData = packagesData.filter(item => new Date(item.sharedDate) >= startDate);
  }

//  onDateSelect(event: any) {
//    console.log('Selected Date:', this.date);
//
//    if(this.date[0]!=null){
//      let newStartDate = this.date[0];
//      let dateToSet = newStartDate.getDate();
//      dateToSet = dateToSet + 90;
//      this.maxDate.setFullYear(newStartDate.getFullYear());
//      this.maxDate.setMonth(newStartDate.getMonth());
//      this.maxDate.setDate(dateToSet);
//
//      //if(this.maxDate>this.defaultMaxDate){
//      //  this.maxDate = this.defaultMaxDate;
//      //}
//    }
//
//    if(this.date[0]!=null && this.date[1]!=null){
//       this.tableData = packagesData.filter(item => new Date(item.sharedDate) >= this.date[0] && new Date(item.sharedDate) <= this.date[1]);
//    }
//
//  }

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

    if(startDate==null){
      this.tableData = packagesData;
    }else{
      this.tableData = packagesData.filter(item => new Date(item.sharedDate) >= startDate);
    }
  }

//  onIpTypeChange(event: any) {
//    console.log('Selected IpType:', this.selectedIpType);
//    this.filtering();
//  }

//  filtering(){
//    let tempData = packagesData;
//    if(this.selectedIpType!=null && this.selectedIpType!=undefined&& this.selectedIpType.name!=null && this.selectedIpType.name!='') {
//      tempData = tempData.filter(item => item.ipType == this.selectedIpType.name);
//    }    
//    this.tableData = tempData;
//  }

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
    this.router.navigate(['authority-files'], { relativeTo: this.route });
  }

}
