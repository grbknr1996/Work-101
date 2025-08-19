//ANGULAR CORE
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

//ECHART MODULE
import { EChartsModule } from '../../shared/echarts.module';
//PRIME MODULE
import { PrimeNGModule } from '../../shared/prime.module';

//TRANSLATE
import { TranslateService } from '@ngx-translate/core';

//UTILITY
import { UtilityService } from 'src/app/_services/utility.service';

//CUSTOM COMPONENTS
import { AppLayoutComponent } from 'src/app/components/app-layout/app-layout.component';
import { BreadcrumbsComponent } from 'src/app/components/breadcrumbs/breadcrumbs.component';
//STATS-CARD-GROUP
import { CardGroupComponent } from '../categories/card-group/card-group.component';

//CUSTOM INTERFACES
import { LayoutConfig } from 'src/app/components/app-layout/app-layout.component';
import { MenuItem } from 'primeng/api';

@Component({
  standalone: true,
  selector: 'app-trends',
  imports: [
    FormsModule,
    CommonModule,
    EChartsModule,
    PrimeNGModule,
    AppLayoutComponent,
    BreadcrumbsComponent,
    CardGroupComponent
  ],
  templateUrl: './trends.component.html'
})
export class TrendsComponent implements OnInit {

  //DI
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private utility = inject(UtilityService);

  //Header | Footer
  layout: LayoutConfig;
  //Breadcrumbs
  home: MenuItem = { icon: "pi pi-home", routerLink: "/" };
  items = [];

  //Property Declarations
  chartHeight: any;
  chartInstance: any;
  chartOption: any;

  //Filter Properties
  showDrawer: boolean = false;
  topics = [
    { label: 'Technology', value: 'option1' },
    { label: 'Origin', value: 'option2' }
  ]
  selectedTopic = 'option1';
  minDate: Date = new Date(1990, 0, 1);
  maxDate: Date = new Date();
  dateRange = [this.minDate, this.maxDate];
  originOptions = ['All', 'Domestic Filings', 'Foreign Filings'];
  selectedOrigin = 'All';
  onReset() { }

  //CHART EVENTS
  onChartEvent(event: any, type: string) {
    console.log("Event, Type", event, type);

    if (type === 'chartInit') this.chartInstance = event;
  }
  chartSettings() {
    this.chartOption = {
      title: {
        text: `TOTAL\n\nWORLD TRADEMARKS\n\n3,552,000`,
        left: '31%',
        top: 'middle',
        textStyle: {
          fontSize: 11,
          fontWeight: 'bold'
        }
      },
      color: ['#0EA5E9', '#4EABD5', '#B9E2F4', '#D6F1FF', '#EAF8FF', '#F5FCFF'],
      colorBy: 'data',
      legend: {
        orient: 'vertical',
        top: 'center',
        right: '30%',
        itemGap: 30
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          return `<span style="font-size:12px;">${params.name}: ${params.value}%</span>`
        }
      },
      series: [
        {
          name: 'T_tech',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'inside',
            formatter: '{c}%',
            color: '#3f3f3f',
            fontWeight: 'bold'
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 47.2, name: 'COMPUTER TECHNOLOGY' },
            { value: 16.8, name: 'DIGITAL COMMUNICATION' },
            { value: 8.4, name: 'ELECTRICAL MACHINERY' },
            { value: 6.8, name: 'MEDICAL TECHNOLOGY' },
            { value: 5.6, name: 'SEMICONDUCTORS' }
          ]
        }
      ]
    };
  }
  chartHeightFunc() { return this.chartHeight; }

  ngOnInit(): void {
    this.layout = {
      appTitle: 'IPAS Central',
      showHeader: true,
      showSidebar: false,
      headerItems: [],
      sidebarItems: [],
      footerText: '© WIPO ' + new Date().getFullYear(),
      fixedHeader: true,
      fixedSidebar: false,
      sidebarCollapsed: false,
      theme: 'light',
      logo: ''
    };
    let officeCode = this.route.snapshot.params['officeCode'] || 'default';
    let langCode = this.route.snapshot.params['langCode'] || 'en';
    this.home = {
      icon: "pi pi-home",
      label: `${officeCode}`,
      routerLink: `/${officeCode}/${langCode}/dashboard`
    };
    this.items = [
      {
        label: "Statistics",
        routerLink: `/${officeCode}/${langCode}/statistics`
      },
      {
        label: "Trends",
        routerLink: `/${officeCode}/${langCode}/trends`
      }
    ];

    this.chartSettings();

    //DYNAMIC CHART HEIGHT
    this.chartHeight = 500;
    this.chartHeightFunc();
    setTimeout(() => { this.chartInstance.resize(); }, 100);
  }
}