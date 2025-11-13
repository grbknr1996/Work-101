//ANGULAR CORE
import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

//TRANSLATE
import { TranslateService } from '@ngx-translate/core';
import { MechanicsService } from 'src/app/_services/mechanics.service';

//UTILITY
import { UtilityService } from 'src/app/_services/utility.service';

//CHART FILTER MODEL
import { chartFilterConfig } from './chart-filter/chart-filter.model';
//CHART FILTER COMPONENT
import { ChartFilterComponent } from './chart-filter/chart-filter.component';

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
  //ELEMENTS
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @ViewChild(ChartFilterComponent, { static: false }) chartFilterC!: ChartFilterComponent;

  //DI
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private ms = inject(MechanicsService);
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
  inActiveData: any;
  inActiveDataMap = new Map();
  IPCategory = new Map();
  IPCategoryCount = new Map(); //TO DEVELOP
  currentIPCategory: string = '';

  fontFamily = '';
  chartHeight: any = 600;
  chartWidth: any = 1100;
  resizeObserver!: ResizeObserver;
  chartInstance: any;
  chartOption: any;
  seriesData: any = [];
  chartLegendSelected: any;
  currentLegend: string = 'accounted_application';

  //COMMONS
  filters: chartFilterConfig[] = [
    { include: false, key: 'compare', type: 'checkbox', model: '' },
    { include: false, key: 'trends_theme', type: 'dropdown', model: '' },
    { include: false, key: 'origin', type: 'dropdown', model: '' },
    { include: false, key: 'type', type: 'dropdown', model: '' }
  ];
  showFilter: boolean = false;
  //CHART-NAVBAR
  onFilter() { this.showFilter = !this.showFilter; }
  onReset() {
    if (this.accountedDataMap.size > 5) {
      this.currentIPCategory = this.IPCategory.keys().next().value;
      this.setSeriesData('accounted_active_application'); //DEFAULT CHART DATA
      if (this.showFilter) this.updateFilterNGModel('IPType', this.currentIPCategory); //INITIAL
    }
    else {
      this.currentIPCategory = '';
      this.currentLegend = 'accounted_application';
      this.setSeriesData('accounted_application'); //DEFAULT CHART DATA
      if (this.showFilter) this.updateFilterNGModel('IPType', 'all'); //INITIAL
    }
  }
  //CHART-FILTER
  anyFilterEvent(filter: any) {
    if (filter.key === 'IPType') {
      if (filter.model === 'all') this.onReset();
      else {
        this.currentIPCategory = filter.model;
        this.setSeriesData('accounted_active_application'); //ENTER COMPARISON VIEW
      }
    }
  }
  updateFilterNGModel(key: string, model: any, options?: any) {
    this.chartFilterC.updateNGModel(key, model, options);
  }

  //CHART EVENTS
  getGlobalFont(): string { return getComputedStyle(document.body).getPropertyValue('font-family').trim(); }
  onChartEvent(event: any, type: string) {
    console.log("Event, Type", event, type);

    if (type === 'chartInit') this.chartInstance = event;
    if (type === 'chartClick') {
      //IP Categories - Axis Drilldown
      if (event.componentType === 'xAxis' && this.accountedDataMap.size <= 5) {
        this.currentIPCategory = '';
        this.IPCategory.forEach((value, key) => { if (value === event.value) this.currentIPCategory = key; }); //To Use Later
        this.setSeriesData('accounted_active_application'); //ENTER COMPARISON VIEW
        if (this.showFilter) this.updateFilterNGModel('IPType', this.currentIPCategory);
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
        top: '10%',
        left: '15%',
        right: '1%',
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        name: 'Application Count',
        nameLocation: 'middle',
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
        },
        splitLine: {
          show: false
        }
      },
      yAxis: [
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
          },
          splitLine: {
            show: true
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
        position: 'right',
        fontFamily: this.fontFamily,
        fontSize: 15,
        color: '#000',
        formatter: (params: any) => {
          if (params.data === 0) return '';
        }
      },
      tooltip: {
        trigger: 'item',
        textStyle: {
          fontFamily: this.fontFamily,
          fontSize: 15
        },
        formatter: function (params: any) {
          return `<span style="font-size:14px;">${params.seriesName}<br>${params.name}: ${params.value}</span>`
        }
      },
      series: [
        {
          name: this.translationMap.get('accounted_application'),
          type: 'bar',
          barWidth: 20,
          barCategoryGap: '15%'
        },
        {
          name: this.translationMap.get('active_application'),
          type: 'bar',
          barWidth: 20,
          barCategoryGap: '15%'
        },
        {
          name: this.translationMap.get('inactive_application'),
          type: 'bar',
          barWidth: 20,
          barCategoryGap: '15%'
        }
      ],
      color: ['#7eb0d5', '#b2e061', '#fd7f6f']
    };
  }
  chartHeightFunc() { return this.chartHeight; }
  chartWidthFunc() { return this.chartWidth; }
  resizeChartInDiv(chartDiv: HTMLElement) {
    this.chartHeight = chartDiv.offsetHeight;
    this.chartWidth = chartDiv.offsetWidth;
    requestAnimationFrame(() => { if (this.chartInstance) this.chartInstance.resize(); });
  }

  ngOnInit() {
    this.layout = {
      showHeader: true,
      headerItems: [],
      fixedHeader: true,
      showSidebar: true
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
        label: this.ms.translate('charts.statistics.commons.menu'),
        routerLink: `/${officeCode}/${langCode}/statistics`
      }
    ];

    this.fontFamily = this.getGlobalFont();
    this.chartSettings();
    this.translate.get([
      'charts.statistics.application_count.name',
      'charts.statistics.application_count.ID-ND',
      'charts.statistics.application_count.ID-NI',
      'charts.statistics.application_count.PA-NP',
      'charts.statistics.application_count.PA-PT',
      'charts.statistics.application_count.TM-PR',
      'charts.statistics.application_count.D',
      'charts.statistics.application_count.P',
      'charts.statistics.application_count.T',
      'charts.statistics.application_count.accounted_application',
      'charts.statistics.application_count.active_application',
      'charts.statistics.application_count.inactive_application'
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
      this.translationMap.set("inactive_application", translations['charts.statistics.application_count.inactive_application']);

      //COMMUNICATE WITH COMMON
      this.chartService.setChartID(0);
      this.chartService.setChartTheme(translations['charts.statistics.application_count.name']);

      this.fetchAccountedApplications();
      this.fetchActiveApplications();
      this.fetchInactiveApplications();
    })
  }
  ngAfterViewInit() {
    const chartDiv = this.chartContainer.nativeElement;
    if (chartDiv) {
      this.resizeObserver = new ResizeObserver(() => this.resizeChartInDiv(chartDiv));
      this.resizeObserver.observe(chartDiv);
      window.addEventListener('resize', () => this.resizeChartInDiv(chartDiv));
    }
  }
  previous: boolean = false;
  ngAfterViewChecked() {
    if (this.showFilter && !this.previous) {
      //HANDLE SHOW/HIDE SYNC
      (this.accountedDataMap.size > 5) ? this.updateFilterNGModel('IPType', this.currentIPCategory, [...this.IPCategory.keys()]) : (this.currentIPCategory.length === 0) ? this.updateFilterNGModel('IPType', 'all') : this.updateFilterNGModel('IPType', this.currentIPCategory);
    }
    this.previous = this.showFilter;
  }

  fetchAccountedApplications() {
    //this.chartService.getApplicationCount('total_applications').subscribe({
    this.http.get('assets/statistics-data/jo-app.json').subscribe({
      next: (response) => {
        console.log("Response - fetchAccountedApplications()", response);
        this.accountedData = response;
        this.transformApplications(this.accountedData, 'accounted_application');
      },
      error: (error) => { console.log("Error - fetchAccountedApplications()", error); }
    });
  }
  fetchActiveApplications() {
    //this.chartService.getApplicationCount('active_applications').subscribe({
    this.http.get('assets/statistics-data/jo-app-active.json').subscribe({
      next: (response) => {
        console.log("Response - fetchActiveApplications()", response);
        this.activeData = response;
        this.transformApplications(this.activeData, 'active_application');
      },
      error: (error) => { console.log("Error - fetchActiveApplications()", error); }
    });
  }
  fetchInactiveApplications() {
    //this.chartService.getApplicationCount('inactive_applications').subscribe({
    this.http.get('assets/statistics-data/jo-app-inactive.json').subscribe({
      next: (response) => {
        console.log("Response - fetchInactiveApplications()", response);
        this.inActiveData = response;
        this.transformApplications(this.inActiveData, 'inactive_application');
      },
      error: (error) => { console.log("Error - fetchInactiveApplications()", error); }
    });
  }
  transformApplications(inputData, type: string) {
    for (let IP of inputData.applicationBag) {
      this.IPCategory.set(IP.ipCategory, this.translationMap.get(IP.ipCategory));
      this.IPCategoryCount.set(IP.ipCategory, IP.dataBag.length);
      for (let applications of IP.dataBag) {
        if (type === 'accounted_application') this.accountedDataMap.set(applications.applicationCategory, applications.quantity);
        if (type === 'active_application') this.activeDataMap.set(applications.applicationCategory, applications.quantity);
        if (type === 'inactive_application') this.inActiveDataMap.set(applications.applicationCategory, applications.quantity);
      }
    }
    if (this.IPCategory.size !== 0) {
      if (this.accountedDataMap.size > 5) this.currentIPCategory = this.IPCategory.keys().next().value;
    }
    (this.currentIPCategory.length === 0) ? this.setSeriesData('accounted_application') : this.setSeriesData('accounted_active_application'); //DEFAULT CHART DATA
  }

  //CHART SERIES DATA
  setSeriesData(seriesCode: string) {
    //CHART SERIES
    this.seriesData = [];
    let seriesData1 = [], seriesData2 = [], seriesData3 = [];
    if (this.currentIPCategory.length === 0) {
      let chartDataMap = (seriesCode === 'accounted_application') ? this.accountedDataMap : (seriesCode === 'active_application') ? this.activeDataMap : this.inActiveDataMap;
      for (let key of chartDataMap.keys()) this.seriesData.push([key, chartDataMap.get(key)]);
    }
    else {
      this.accountedData?.applicationBag.forEach((item: any) => {
        if (item.ipCategory === this.currentIPCategory) {
          for (let items of item.dataBag) {
            seriesData1.push([items.applicationCategory, this.accountedDataMap.get(items.applicationCategory)]);
          }
        }
      });
      this.activeData?.applicationBag.forEach((item: any) => {
        if (item.ipCategory === this.currentIPCategory) {
          for (let items of item.dataBag) {
            seriesData2.push([items.applicationCategory, this.activeDataMap.get(items.applicationCategory)]);
          }
        }
      });
      this.inActiveData?.applicationBag.forEach((item: any) => {
        if (item.ipCategory === this.currentIPCategory) {
          for (let items of item.dataBag) {
            seriesData3.push([items.applicationCategory, this.inActiveDataMap.get(items.applicationCategory)]);
          }
        }
      });
    }

    //SORT
    if (this.seriesData.length !== 0) this.seriesData = new Map([...this.seriesData].sort(([a], [b]) => a.localeCompare(b)));
    if (seriesData1.length !== 0) seriesData1 = [...seriesData1].sort(([a], [b]) => a.localeCompare(b));
    if (seriesData2.length !== 0) seriesData2 = [...seriesData2].sort(([a], [b]) => a.localeCompare(b));
    if (seriesData3.length !== 0) seriesData3 = [...seriesData3].sort(([a], [b]) => a.localeCompare(b));

    //CHART LEGEND
    if (seriesCode === 'accounted_active_application') {
      this.chartLegendSelected = {
        [this.translationMap.get('accounted_application')]: true,
        [this.translationMap.get('active_application')]: true,
        [this.translationMap.get('inactive_application')]: true
      }
    }
    else {
      this.chartLegendSelected[this.translationMap.get(this.currentLegend)] = !this.chartLegendSelected[this.translationMap.get(this.currentLegend)];
    }

    //DYNAMIC CHART HEIGHT
    this.chartHeightFunc();
    this.chartWidthFunc();

    setTimeout(() => {
      //2DBAR
      this.chartInstance.setOption({
        xAxis: {
          name: (this.currentIPCategory.length === 0) ? this.chartOption.xAxis.name : `${this.translationMap.get(this.currentIPCategory)}\n\n${this.chartOption.xAxis.name}`,
          max: (this.currentIPCategory.length === 0) ? this.calculateSpacing((this.seriesData.map(d => d[1]))).max : this.calculateSpacing((seriesData1.map(d => d[1]))).max,
          interval: (this.currentIPCategory.length === 0) ? this.calculateSpacing((this.seriesData.map(d => d[1]))).interval : this.calculateSpacing((seriesData1.map(d => d[1]))).interval
        },
        yAxis: [
          {
            data: (this.currentIPCategory.length === 0) ? this.seriesData.map(d => d[0]) : seriesData1.map(d => d[0])
          },
          {
            show: (this.currentIPCategory.length === 0) ? true : false,
            data: (this.currentIPCategory.length === 0) ? Array.from(this.IPCategory.values()) : []
          }
        ],
        legend: {
          data: [this.translationMap.get('accounted_application'), this.translationMap.get('active_application'), this.translationMap.get('inactive_application')],
          selected: this.chartLegendSelected
        },
        series: [
          {
            name: this.translationMap.get('accounted_application'),
            data: (seriesCode === 'accounted_active_application') ? seriesData1.map(d => d[1]) : (this.currentIPCategory.length !== 0) ? seriesData1.map(d => d[1]) : this.seriesData.map(d => d[1])
          },
          {
            name: this.translationMap.get('active_application'),
            data: (seriesCode === 'accounted_active_application') ? seriesData2.map(d => d[1]) : (this.currentIPCategory.length !== 0) ? seriesData2.map(d => d[1]) : this.seriesData.map(d => d[1])
          },
          {
            name: this.translationMap.get('inactive_application'),
            data: (seriesCode === 'accounted_active_application') ? seriesData3.map(d => d[1]) : (this.currentIPCategory.length !== 0) ? seriesData3.map(d => d[1]) : this.seriesData.map(d => d[1])
          },
        ],
        notMerge: false
      }, { devicePixelRatio: this.utility.findPixelRatio() }),
        this.adjustChartHeight();
    }, 100);
  }

  adjustChartHeight() {
    const barWidth = 20 + 5 + 10;
    const data = this.IPCategoryCount.get(this.currentIPCategory);
    const adjustedHeight = (data * 3) * barWidth + 120;
    const chartDiv = this.chartContainer.nativeElement;
    chartDiv.style.height = adjustedHeight + 'px';
    if (this.chartInstance) this.chartInstance.resize();
  }
  calculateSpacing(input: number[]) {
    if (!input || input.length === 0) return { max: 0, interval: 0 };

    const max = Math.max(...input);
    if (max === 0) return { max: 1, interval: 1 };

    if (max < 100) return { max: 100, interval: (100 / 5) };

    let scale = Math.pow(10, (max.toString().length) - 2);
    let givenHundred = max / scale;
    let check = max % scale;
    if (check !== 0) givenHundred = givenHundred + 1;
    return { max: (givenHundred * scale), interval: (givenHundred * scale) };
  }

  ngOnDestroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    window.removeEventListener('resize', () => this.resizeChartInDiv(this.chartContainer.nativeElement));
  }
}