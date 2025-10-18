//ANGULAR CORE
import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

//TRANSLATE
import { TranslateService } from '@ngx-translate/core';
import { MechanicsService } from 'src/app/_services/mechanics.service';

//UTILITY
import { UtilityService } from 'src/app/_services/utility.service';

//CHART FILTER MODEL
import { chartFilterConfig } from '../chart-filter/chart-filter.model';

//CUSTOM INTERFACES
import { LayoutConfig } from 'src/app/components/app-layout/app-layout.component';
import { MenuItem } from 'primeng/api';
interface BreadcrumbItem extends MenuItem {
  routerLink?: any[] | string;
  label: string;
}

//SERVICE
import { ChartService } from '../chart.service';

@Component({
  standalone: false,
  selector: 'app-origins',
  templateUrl: './origins.component.html'
})
export class OriginsComponent implements OnInit {
  //ELEMENTS
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  //DI
  private http = inject(HttpClient);
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
  IPCategory = new Map();
  currentIPCategory: string = '';

  fontFamily = '';
  chartHeight: any = 600;
  chartWidth: any = 1100;
  resizeObserver!: ResizeObserver;
  chartInstance: any;
  chartOption: any;
  chartLegendSelected: any;
  currentLegend1: string = 'R_NR';
  currentLegend2: string = 'accounted_application';

  //COMMONS
  filters!: chartFilterConfig[];
  /*
  filters: chartFilterConfig[] = [
    { include: true, key: 'compare', type: 'checkbox', model: false },
    { include: true, key: 'yearRange', type: 'yearrange', model: [new Date(), new Date()], minDate: new Date(), maxDate: new Date() },
    { include: true, key: 'type', type: 'radio', model: 'M', options: [{ label: 'Male', value: 'M' }, { label: 'Female', value: 'F' }] },
    { include: true, key: 'IPType', type: 'dropdown', model: 'D', options: [{ label: 'Breakfast', value: 'B' }, { label: 'Lunch', value: 'L' }, { label: 'Dinner', value: 'D' }] }
  ];
  */
  showFilter: boolean = false;
  //CHART-NAVBAR
  onFilter() { this.showFilter = !this.showFilter; }
  onReset() {
    this.currentIPCategory = '';
    this.currentLegend1 = 'R_NR';
    this.currentLegend2 = 'accounted_application';
    this.setSeriesData('accounted_application', 'R_NR'); //DEFAULT CHART DATA
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
        this.setSeriesData(this.currentLegend2, this.currentLegend1); //ENTER ZOOM-IN VIEW
      }
    }
    if (type === 'chartLegendSelectChanged') {
      let legendSelected = '';
      this.translationMap.forEach((value, key) => { if (value === event.name) legendSelected = key; });
      this.currentLegend1 = legendSelected; //To Use Later
      this.chartInstance.dispatchAction({
        type: 'legendUnSelect',
        name: (legendSelected === '_R') ? this.translationMap.get('_NR') : this.translationMap.get('_R')
      })
      this.chartInstance.dispatchAction({
        type: 'legendSelect',
        name: (legendSelected === '_R') ? this.translationMap.get('_R') : this.translationMap.get('_NR')
      })
      this.setSeriesData(this.currentLegend2, this.currentLegend1);
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
        bottom: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        triggerEvent: true,
        axisLabel: {
          fontWeight: 'bold',
          fontFamily: this.fontFamily,
          fontSize: 18,
          formatter: (params: string) => {
            return params.split(' ').join('\n');
          }
        }
      },
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
          return `<span style="font-size:14px;">${params.seriesName}: ${params.data}</span>`
        }
      },
      series: [
        {
          name: this.translationMap.get('_R'),
          type: 'bar'
        },
        {
          name: this.translationMap.get('_NR'),
          type: 'bar'
        }
      ],
      color: ['#ffb55a', '#bd7ebe']
    };
  }
  chartHeightFunc() { return this.chartHeight; }
  chartWidthFunc() { return this.chartWidth; }
  resizeChartInDiv(chartDiv: HTMLElement) {
    this.chartHeight = chartDiv.offsetHeight;
    this.chartWidth = chartDiv.offsetWidth;
    requestAnimationFrame(() => { if (this.chartInstance) this.chartInstance.resize(); });
  }

  ngOnInit(): void {
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
      },
      {
        label: this.ms.translate('charts.statistics.commons.menu2'),
        routerLink: `/${officeCode}/${langCode}/statistics/origins`
      }
    ];

    this.fontFamily = this.getGlobalFont();
    this.chartSettings();
    this.translate.get([
      'charts.statistics.application_count.D',
      'charts.statistics.application_count.P',
      'charts.statistics.application_count.T',
      'charts.statistics.application_count.accounted_application',
      'charts.statistics.application_count.active_application',
      'charts.statistics.origins.compare',
      'charts.statistics.origins._R',
      'charts.statistics.origins._NR'
    ]).subscribe((translations) => {
      this.translationMap.set("D", translations['charts.statistics.application_count.D']);
      this.translationMap.set("P", translations['charts.statistics.application_count.P']);
      this.translationMap.set("T", translations['charts.statistics.application_count.T']);
      this.translationMap.set("accounted_application", translations['charts.statistics.application_count.accounted_application']);
      this.translationMap.set("active_application", translations['charts.statistics.application_count.active_application']);
      this.translationMap.set("_R", translations['charts.statistics.origins._R']);
      this.translationMap.set("_NR", translations['charts.statistics.origins._NR']);

      //COMMUNICATE WITH COMMON
      this.chartService.setChartID(2);
      this.chartService.setChartTheme(translations['charts.statistics.origins.compare']);

      this.getAccountedApplications();
      this.getActiveApplications();
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

  getAccountedApplications() {
    this.http.get('assets/statistics-data/jo-app-origins.json').subscribe({
      next: (response) => {
        console.log("Response - getAccountedApplications()", response);
        this.accountedData = response;
        this.transformApplications(this.accountedData, 'accounted_application');
      },
      error: (error) => { console.log("Error - getAccountedApplications()", error); }
    });
  }
  getActiveApplications() {
    this.http.get('assets/statistics-data/jo-app-origins-active.json').subscribe({
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
      if (type === 'accounted_application') this.accountedDataMap.set(IP.ipCategory, IP.totalQuantity);
      if (type === 'active_application') this.activeDataMap.set(IP.ipCategory, IP.totalQuantity);
      for (let applications of IP.dataBag) {
        if (type === 'accounted_application') (applications.applicationOrigin === 'Residents') ? this.accountedDataMap.set(IP.ipCategory + '_R', applications.count) : this.accountedDataMap.set(IP.ipCategory + '_NR', applications.count);
        if (type === 'active_application') (applications.applicationOrigin === 'Residents') ? this.activeDataMap.set(IP.ipCategory + '_R', applications.count) : this.activeDataMap.set(IP.ipCategory + '_NR', applications.count);
      }
    }
    if (type === 'accounted_application') this.setSeriesData(type, 'R_NR'); //DEFAULT CHART DATA
  }

  //CHART SERIES DATA
  setSeriesData(seriesCode: string, originType: string) {
    //CHART SERIES
    let seriesData1 = [], seriesData2 = [];
    let chartDataMap = (seriesCode === 'accounted_application') ? this.accountedDataMap : this.activeDataMap;
    if (this.currentIPCategory.length === 0) {
      for (let IP of this.IPCategory.keys()) {
        seriesData1.push(chartDataMap.get(`${IP}_R`));
        seriesData2.push(chartDataMap.get(`${IP}_NR`));
      }
    }
    else {
      seriesData1.push(chartDataMap.get(`${this.currentIPCategory}_R`));
      seriesData2.push(chartDataMap.get(`${this.currentIPCategory}_NR`));
    }

    //CHART LEGEND
    this.chartLegendSelected = {
      [this.translationMap.get('_R')]: (originType === 'R_NR' || originType === '_R') ? true : false,
      [this.translationMap.get('_NR')]: (originType === 'R_NR' || originType === '_NR') ? true : false
    }

    //DYNAMIC CHART HEIGHT
    this.chartHeightFunc();
    this.chartWidthFunc();

    setTimeout(() => {
      //2DBAR
      this.chartInstance.setOption({
        xAxis: {
          data: (this.currentIPCategory.length === 0) ? Array.from(this.IPCategory.values()) : [this.translationMap.get(this.currentIPCategory)]
        },
        yAxis: {
          max: this.calculateSpacing(Math.max(...seriesData1, ...seriesData2)).max,
          interval: this.calculateSpacing(Math.max(...seriesData1, ...seriesData2)).interval
        },
        legend:
        {
          data: [this.translationMap.get('_R'), this.translationMap.get('_NR')],
          selected: this.chartLegendSelected
        },
        series: [
          { name: this.translationMap.get('_R'), data: seriesData1 },
          { name: this.translationMap.get('_NR'), data: seriesData2 }
        ],
        notMerge: false
      }, { devicePixelRatio: this.utility.findPixelRatio() })
    }, 100);
  }

  calculateSpacing(maximumData: number) {
    if (maximumData === 0) return { max: 1, interval: 1 };

    const magnitude = Math.pow(10, Math.floor(Math.log10(maximumData)));
    const roundedMax = Math.ceil(maximumData / magnitude) * magnitude;
    const interval = roundedMax / 5;

    return { max: roundedMax, interval: interval };
  }

  ngOnDestroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    window.removeEventListener('resize', () => this.resizeChartInDiv(this.chartContainer.nativeElement));
  }
}