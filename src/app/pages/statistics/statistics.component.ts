//ANGULAR CORE
import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';


//TRANSLATE
import { TranslateService } from '@ngx-translate/core';

//UTILITY
import { UtilityService } from 'src/app/_services/utility.service';



//CUSTOM INTERFACES
import { LayoutConfig } from 'src/app/components/app-layout/app-layout.component';
import { MenuItem } from 'primeng/api';
interface BreadcrumbItem extends MenuItem {
  routerLink?: any[] | string;
  label: string;
}

//SERVICE
import { ChartService } from './chart.service';

@Component({
  standalone: false,
  selector: 'app-statistics',
  templateUrl: './statistics.component.html'
})
export class StatisticsComponent implements OnInit {

  //DI
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private utility = inject(UtilityService);
  //SERVICE
  private chartService = inject(ChartService);

  //Header | Footer
  layout: LayoutConfig;
  //Breadcrumbs
  home: MenuItem = { icon: "pi pi-home", routerLink: "/" };
  items: BreadcrumbItem[] = [];

  //Property Declarations
  translationMap = new Map();
  accountedData: any;
  accountedDataMap = new Map();
  activeData: any;
  activeDataMap = new Map();
  IPCategory = new Map();
  IPCategoryCount = new Map(); //TO DEVELOP
  currentIPCategory: string = '';

  fontFamily = '';
  chartHeight: any;
  chartInstance: any;
  chartOption: any;
  seriesData: any = [];
  chartLegendSelected: any;
  currentLegend: string = 'accounted_application';

  /*
  //Filter Properties
  showDrawer: boolean = false;
  minDate: Date = new Date(1990, 0, 1);
  maxDate: Date = new Date();
  dateRange = [this.minDate, this.maxDate];
  originOptions = ['All', 'Domestic Filings', 'Foreign Filings'];
  selectedOrigin = 'All';
  */

  onReset() {
    this.currentIPCategory = '';
    this.currentLegend = 'accounted_application';
    this.setSeriesData('accounted_application'); //DEFAULT CHART DATA
  }

  //CHART EVENTS
  getGlobalFont(): string { return getComputedStyle(document.body).getPropertyValue('font-family').trim(); }
  onChartEvent(event: any, type: string) {
    console.log("Event, Type", event, type);

    if (type === 'chartInit') this.chartInstance = event;
    if (type === 'chartClick') {
      //IP Categories - Axis Drilldown
      if (event.componentType === 'xAxis') {
        this.currentIPCategory = '';
        this.IPCategory.forEach((value, key) => { if (value === event.value) this.currentIPCategory = key; }); //To Use Later
        this.setSeriesData('accounted_active_application'); //ENTER COMPARISON VIEW
      }
      //Application Categories - Bar Drilldown
      if (event.componentType === 'series') {
        this.router.navigate(['/vc/en/statistics/trends']);
      }
    }
    if (type === 'chartLegendSelectChanged') {
      let legendSelected = '';
      this.translationMap.forEach((value, key) => { if (value === event.name) legendSelected = key; });
      this.currentLegend = legendSelected; //To Use Later
      this.chartInstance.dispatchAction({
        type: 'legendUnSelect',
        name: (legendSelected === 'accounted_application') ? this.translationMap.get('active_application') : this.translationMap.get('accounted_application')
      })
      this.chartInstance.dispatchAction({
        type: 'legendSelect',
        name: (legendSelected === 'accounted_application') ? this.translationMap.get('accounted_application') : this.translationMap.get('active_application')
      })
      this.setSeriesData(this.currentLegend);
    }
  }
  chartSettings() {
    this.chartOption = {
      textStyle: {
        fontFamily: this.fontFamily,
        fontWeight: 500
      },
      grid: {
        top: '15%',
        left: '15%',
        right: '15%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          triggerEvent: false,
          offset: 0,
          axisLabel: {
            fontFamily: this.fontFamily,
            fontSize: 16,
            formatter: (params: string) => {
              return params.split(' ').join('\n');
            }
          }
        },
        {
          type: 'category',
          triggerEvent: true,
          position: 'bottom',
          offset: 80,
          axisLabel: {
            fontWeight: 'bold',
            fontFamily: this.fontFamily,
            fontSize: 18
          }
        }
      ],
      yAxis: {
        name: 'Application Count',
        nameLocation: 'end',
        nameGap: 35,
        nameTextStyle: {
          fontWeight: 'bold',
          fontFamily: this.fontFamily,
          fontSize: 16
        },
        type: 'value',
        min: 0,
        max: 0,
        interval: 0,
        axisLabel: {
          fontFamily: this.fontFamily,
          fontSize: 16
        }
      },
      legend: {
        data: [],
        selected: [],
        itemGap: 40,
        textStyle: {
          fontWeight: 'bold',
          fontSize: 15
        }
      },
      label: {
        show: true,
        position: 'top',
        fontFamily: this.fontFamily,
        fontSize: 15,
        color: '#000'
      },
      tooltip: {
        trigger: 'item',
        textStyle: {
          fontFamily: this.fontFamily,
          fontSize: 15
        },
        formatter: function (params: any) {
          return `<span style="font-size:14px;">${params.value[0]}: ${params.value[1]}</span>`
        }
      },
      series: [
        {
          name: this.translationMap.get('accounted_application'),
          type: 'bar'
        },
        {
          name: this.translationMap.get('active_application'),
          type: 'bar'
        }
      ]
    };
  }
  chartHeightFunc() { return this.chartHeight; }
  chartWidthFunc() { return 1100; }

  ngOnInit() {
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
      }
    ];

    this.chartService.setChartID(0);
    this.chartService.setChartTheme('STATISTICS OVERVIEW');

    this.fontFamily = this.getGlobalFont();
    this.chartSettings();
    this.translate.get([
      'charts.statistics.application_count.ID-ND',
      'charts.statistics.application_count.ID-NI',
      'charts.statistics.application_count.PA-NP',
      'charts.statistics.application_count.PA-PT',
      'charts.statistics.application_count.TM-PR',
      'charts.statistics.application_count.D',
      'charts.statistics.application_count.P',
      'charts.statistics.application_count.T',
      'charts.statistics.application_count.accounted_application',
      'charts.statistics.application_count.active_application'
    ]).subscribe((translations) => {
      this.translationMap.set("ID-ND", translations['charts.statistics.application_count.ID-ND']);
      this.translationMap.set("ID-NI", translations['charts.statistics.application_count.ID-NI']);
      this.translationMap.set("PA-NP", translations['charts.statistics.application_count.PA-NP']);
      this.translationMap.set("PA-PT", translations['charts.statistics.application_count.PA-PT']);
      this.translationMap.set("TM-PR", translations['charts.statistics.application_count.TM-PR']);
      this.translationMap.set("D", translations['charts.statistics.application_count.D']);
      this.translationMap.set("P", translations['charts.statistics.application_count.P']);
      this.translationMap.set("T", translations['charts.statistics.application_count.T']);
      this.translationMap.set("accounted_application", translations['charts.statistics.application_count.accounted_application']);
      this.translationMap.set("active_application", translations['charts.statistics.application_count.active_application']);

      this.getAccountedApplications();
      this.getActiveApplications();
    })
  }

  getAccountedApplications() {
    this.http.get('assets/statistics-data/jo-app.json').subscribe({
      next: (response) => {
        console.log("Response - getAccountedApplications()", response);
        this.accountedData = response;
        this.transformApplications(this.accountedData, 'accounted_application');
      },
      error: (error) => { console.log("Error - getAccountedApplications()", error); }
    });
  }
  getActiveApplications() {
    this.http.get('assets/statistics-data/jo-app-active.json').subscribe({
      next: (response) => {
        console.log("Response - getActiveApplications()", response);
        this.activeData = response;
        this.transformApplications(this.activeData, 'active_application');
      },
      error: (error) => { console.log("Error - getActiveApplications()", error); }
    });
  }
  transformApplications(inputData, type: string) {
    for (let IP of inputData.applicationBag) {
      this.IPCategory.set(IP.ipCategory, this.translationMap.get(IP.ipCategory));
      this.IPCategoryCount.set(IP.ipCategory, IP.dataBag.length);
      for (let applications of IP.dataBag) {
        if (type === 'accounted_application') this.accountedDataMap.set(applications.applicationCategory, applications.count);
        if (type === 'active_application') this.activeDataMap.set(applications.applicationCategory, applications.count);
      }
    }
    if (type === 'accounted_application') this.setSeriesData(type); //DEFAULT CHART DATA
  }

  //CHART SERIES DATA
  setSeriesData(seriesCode: string) {
    //CHART SERIES
    this.seriesData = [];
    let seriesData1 = [], seriesData2 = [];
    if (this.currentIPCategory.length === 0) {
      let chartDataMap = (seriesCode === 'accounted_application') ? this.accountedDataMap : this.activeDataMap;
      for (let key of chartDataMap.keys()) this.seriesData.push([this.translationMap.get(key), chartDataMap.get(key)]);
    }
    else {
      this.accountedData?.applicationBag.forEach((item: any) => {
        if (item.ipCategory === this.currentIPCategory) {
          for (let items of item.dataBag) {
            seriesData1.push([this.translationMap.get(items.applicationCategory), this.accountedDataMap.get(items.applicationCategory)]);
          }
        }
      });
      this.activeData?.applicationBag.forEach((item: any) => {
        if (item.ipCategory === this.currentIPCategory) {
          for (let items of item.dataBag) {
            seriesData2.push([this.translationMap.get(items.applicationCategory), this.activeDataMap.get(items.applicationCategory)]);
          }
        }
      });
    }

    //CHART LEGEND
    if (seriesCode === 'accounted_active_application') {
      this.chartLegendSelected = {
        [this.translationMap.get('accounted_application')]: true,
        [this.translationMap.get('active_application')]: true
      }
    }
    else {
      this.chartLegendSelected = {
        [this.translationMap.get('accounted_application')]: (seriesCode === 'accounted_application') ? true : false,
        [this.translationMap.get('active_application')]: (seriesCode === 'active_application') ? true : false
      }
    }

    //DYNAMIC CHART HEIGHT
    this.chartHeight = 500;
    this.chartHeightFunc();
    setTimeout(() => { this.chartInstance.resize(); }, 1000);

    setTimeout(() => {
      //2DBAR
      this.chartInstance.setOption({
        xAxis: [
          {
            data: (this.currentIPCategory.length === 0) ? this.seriesData.map(d => d[0]) : seriesData1.map(d => d[0])
          },
          {
            data: Array.from(this.IPCategory.values())
          }
        ],
        yAxis: {
          max: (this.currentIPCategory.length === 0) ? this.calculateSpacing((this.seriesData.map(d => d[1]))).max : this.calculateSpacing((seriesData1.map(d => d[1]))).max,
          interval: (this.currentIPCategory.length === 0) ? this.calculateSpacing((this.seriesData.map(d => d[1]))).interval : this.calculateSpacing((seriesData1.map(d => d[1]))).interval
        },
        legend: {
          data: [this.translationMap.get('accounted_application'), this.translationMap.get('active_application')],
          selected: this.chartLegendSelected
        },
        series: [
          {
            name: this.translationMap.get('accounted_application'),
            data: (seriesCode === 'accounted_active_application') ? seriesData1 : (seriesCode === 'accounted_application' && this.currentIPCategory.length !== 0) ? seriesData1 : this.seriesData
          },
          {
            name: this.translationMap.get('active_application'),
            data: (seriesCode === 'accounted_active_application') ? seriesData2 : (seriesCode === 'active_application' && this.currentIPCategory.length !== 0) ? seriesData2 : this.seriesData
          }
        ],
        notMerge: false
      }, { devicePixelRatio: this.utility.findPixelRatio() })
    }, 100);
  }

  //?
  calculateSpacing(input: number[], minTicks = 5) {
    if (!input || input.length === 0) return { max: 0, interval: 0 };

    const maximumData = Math.max(...input);
    if (maximumData === 0) return { max: 1, interval: 1 };

    const magnitude = Math.pow(10, Math.floor(Math.log10(maximumData)));
    let roundedMax = Math.ceil(maximumData / magnitude) * magnitude;

    const niceFractions = [1, 2, 5, 10];
    let interval = magnitude;

    for (const frac of niceFractions) {
      console.log("frac, roundedMax, magnitude", frac, roundedMax, magnitude);
      const tickCount = Math.ceil(roundedMax / (frac * magnitude));
      console.log("tickCount", tickCount);
      if (tickCount <= minTicks) {
        interval = frac * magnitude;
        console.log("interval", interval);
        break;
      }
    }
    const ticks = Math.ceil(roundedMax / interval);
    if (ticks < minTicks) {
      roundedMax = interval * minTicks;
    }

    return { max: roundedMax, interval: interval };
  }
}