//ANGULAR CORE
import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
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
  //|//
  IPCategoryCount = new Map();
  currentIPCategory: string = '';
  IPAppMap = new Map();

  fontFamily = '';
  chartHeight: any = 600;
  chartWidth: any = 1100;
  resizeObserver!: ResizeObserver;
  chartInstance: any;
  chartOption: any;
  chartLegendSelected: any;
  currentLegend: string = 'accounted_active_application';

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
      if (this.showFilter) this.updateFilterNGModel('IPType', this.currentIPCategory); //INITIAL
    }
    else {
      this.currentIPCategory = '';
      if (this.showFilter) this.updateFilterNGModel('IPType', 'all'); //INITIAL
    }
    this.currentLegend = 'accounted_active_application';
    this.setSeriesData(); //DEFAULT CHART DATA
  }
  //CHART-FILTER
  anyFilterEvent(filter: any) {
    if (filter.key === 'IPType') {
      if (filter.model === 'all') this.onReset();
      else {
        this.currentIPCategory = filter.model;
        this.currentLegend = 'accounted_active_application';
        this.setSeriesData();
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
      if (event.componentType === 'yAxis' && this.accountedDataMap.size <= 5) {
        this.currentIPCategory = '';
        this.IPCategory.forEach((value, key) => { if (value === event.value.split('\n\n')[0]) this.currentIPCategory = key; }); //To Use Later
        this.setSeriesData();
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
      this.setSeriesData();
    }
  }
  chartSettings() {
    this.chartOption = {
      textStyle: {
        fontFamily: this.fontFamily,
        fontWeight: 500
      },
      grid: {
        top: '30',
        left: '5',
        right: '20%',
        bottom: '30',
        containLabel: true
      },
      xAxis: {
        name: 'Application Count',
        nameLocation: 'middle',
        nameGap: 10,
        nameTextStyle: {
          fontWeight: 'bold',
          fontFamily: this.fontFamily,
          fontSize: 12
        },
        type: 'value',
        min: 0,
        max: 0,
        interval: 0,
        axisLabel: {
          fontFamily: this.fontFamily,
          fontSize: 12
        },
        splitLine: {
          show: false
        }
      },
      yAxis: [
        {
          type: 'category',
          triggerEvent: true,
          offset: 0,
          axisLabel: {
            fontFamily: this.fontFamily,
            fontSize: 12,
            formatter: (params: string) => {
              return params.split(' ').join('\n');
            }
          },
          splitLine: {
            show: true
          }
        }
      ],
      legend: {
        data: [],
        selected: [],
        itemGap: 10,
        textStyle: {
          fontWeight: 'bold',
          fontSize: 12
        }
      },
      label: {
        show: true,
        position: 'right',
        fontFamily: this.fontFamily,
        fontSize: 13,
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
      'charts.statistics.application_count.D',
      'charts.statistics.application_count.P',
      'charts.statistics.application_count.T',
      'charts.statistics.application_count.accounted_application',
      'charts.statistics.application_count.active_application',
      'charts.statistics.application_count.inactive_application'
    ]).subscribe((translations) => {
      this.translationMap.set("D", translations['charts.statistics.application_count.D']);
      this.translationMap.set("P", translations['charts.statistics.application_count.P']);
      this.translationMap.set("T", translations['charts.statistics.application_count.T']);
      this.translationMap.set("accounted_application", translations['charts.statistics.application_count.accounted_application']);
      this.translationMap.set("active_application", translations['charts.statistics.application_count.active_application']);
      this.translationMap.set("inactive_application", translations['charts.statistics.application_count.inactive_application']);

      //COMMUNICATE WITH COMMON
      this.chartService.setChartID(0);
      this.chartService.setChartTheme(translations['charts.statistics.application_count.name']);

      this.fetchApplicationCount('accounted_applications');
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

  fetchApplicationCount(key: string) {
    this.chartService.getApplicationCount(key).subscribe({
      next: (response) => {
        console.log("Response - fetchApplicationCount()", response);
        let data: any = response;
        (data.sectionBag.section).forEach((item: any) => {
          if (item.dataCategory === 'total') { this.accountedData = item.data; this.transformApplications(this.accountedData, 'accounted_application'); }
          if (item.dataCategory === 'active') { this.activeData = item.data; this.transformApplications(this.activeData, 'active_application'); }
          if (item.dataCategory === 'inactive') { this.inActiveData = item.data; this.transformApplications(this.inActiveData, 'inactive_application'); }
        })
      },
      error: (error) => { console.log("Error - fetchApplicationCount()", error); }
    });
  }
  transformApplications(inputData, type: string) {
    let recordIPCategory = new Map();
    if (type === 'accounted_application') {
      for (let IP of inputData.applicationBag) {
        recordIPCategory.set(IP.ipCategory, this.translationMap.get(IP.ipCategory));
        this.IPCategoryCount.set(IP.ipCategory, IP.dataBag.length); //L1
        let codes = [];
        for (let applications of IP.dataBag) codes.push(applications.applicationCategory); //L2
        //SORT - L2
        codes = codes.sort(([a], [b]) => (a.localeCompare(b)));
        this.IPAppMap.set(IP.ipCategory, codes);
      }
      //SORT - IPCategory
      let order = ['T', 'P', 'D'], result1 = new Map(), result2 = new Map();
      for (let item of order) {
        if (recordIPCategory.has(item)) result1.set(item, recordIPCategory.get(item));
        else result2.set(item, recordIPCategory.get(item));
      }
      this.IPCategory = new Map([...result1, ...result2]);
      //SORT - L1
      this.IPCategoryCount = new Map([...this.IPCategoryCount].sort(([a], [b]) => a.localeCompare(b)));
    }
    if (this.IPCategoryCount.size !== 0) {
      for (let IP of this.IPCategoryCount.keys()) {
        let block = [];
        (inputData.applicationBag).forEach((item: any) => { if (IP === item.ipCategory) block = item.dataBag; });
        for (let codeOrder of this.IPAppMap.get(IP)) {
          let value = 0;
          block.forEach((applications: any) => { if (codeOrder === applications.applicationCategory) value = applications.quantity; });
          if (type === 'accounted_application') this.accountedDataMap.set(codeOrder, value);
          if (type === 'active_application') this.activeDataMap.set(codeOrder, value);
          if (type === 'inactive_application') this.inActiveDataMap.set(codeOrder, value);
        }
      }
      if (this.IPCategory.size !== 0) {
        if (this.accountedDataMap.size > 5) this.currentIPCategory = this.IPCategory.keys().next().value;
      }
      this.setSeriesData(); //DEFAULT CHART DATA
    }
  }

  //CHART SERIES DATA
  setSeriesData() {
    //CHART SERIES
    let seriesData1 = [], seriesData2 = [], seriesData3 = [];

    if (seriesData1.length === 0) {
      if (this.currentIPCategory.length === 0) {
        for (let [key, value] of this.accountedDataMap) {
          seriesData1.push([key, value]);
        }
      }
      else {
        this.accountedData?.applicationBag.forEach((item: any) => {
          if (item.ipCategory === this.currentIPCategory) {
            for (let items of item.dataBag) {
              seriesData1.push([items.applicationCategory, this.accountedDataMap.get(items.applicationCategory)]);
            }
          }
        });
      }
      //SECONDARY Y-AXIS DATA
      if (seriesData1.length !== 0 && this.currentIPCategory.length === 0) {
        for (let set of this.IPAppMap) {
          seriesData1.forEach((item: any) => { if (item[0] === set[1][set[1].length - 1]) item[0] = `${this.IPCategory.get(set[0])}\n\n${item[0]}`; });
        }
      }
    }
    if (seriesData2.length === 0) {
      if (this.currentIPCategory.length === 0) {
        for (let [key, value] of this.activeDataMap) {
          seriesData2.push([key, value]);
        }
      }
      else {
        this.activeData?.applicationBag.forEach((item: any) => {
          if (item.ipCategory === this.currentIPCategory) {
            for (let items of item.dataBag) {
              seriesData2.push([items.applicationCategory, this.activeDataMap.get(items.applicationCategory)]);
            }
          }
        });
      }
    }
    if (seriesData3.length === 0) {
      if (this.currentIPCategory.length === 0) {
        for (let [key, value] of this.inActiveDataMap) {
          seriesData3.push([key, value]);
        }
      }
      else {
        this.inActiveData?.applicationBag.forEach((item: any) => {
          if (item.ipCategory === this.currentIPCategory) {
            for (let items of item.dataBag) {
              seriesData3.push([items.applicationCategory, this.inActiveDataMap.get(items.applicationCategory)]);
            }
          }
        });
      }
    }

    //CHART LEGEND
    if (this.currentLegend === 'accounted_active_application') {
      this.chartLegendSelected = {
        [this.translationMap.get('accounted_application')]: true,
        [this.translationMap.get('active_application')]: true,
        [this.translationMap.get('inactive_application')]: true
      }
    }
    else {
      if (this.chartLegendSelected == null) this.chartLegendSelected = { [this.translationMap.get('accounted_application')]: true, [this.translationMap.get('active_application')]: true, [this.translationMap.get('inactive_application')]: true }; //INITIALIZE
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
          max: (this.currentIPCategory.length === 0) ? this.calculateSpacing([Math.max(...seriesData1.map(d => d[1]), ...seriesData2.map(d => d[1]), ...seriesData3.map(d => d[1]))]).max : this.calculateSpacing((seriesData1.map(d => d[1]))).max,
          interval: (this.currentIPCategory.length === 0) ? this.calculateSpacing([Math.max(...seriesData1.map(d => d[1]), ...seriesData2.map(d => d[1]), ...seriesData3.map(d => d[1]))]).interval : this.calculateSpacing((seriesData1.map(d => d[1]))).interval
        },
        yAxis: [
          {
            data: seriesData1.map(d => d[0])
          }
        ],
        legend: {
          data: [this.translationMap.get('accounted_application'), this.translationMap.get('active_application'), this.translationMap.get('inactive_application')],
          selected: this.chartLegendSelected
        },
        series: [
          {
            name: this.translationMap.get('accounted_application'),
            data: seriesData1.map(d => d[1])
          },
          {
            name: this.translationMap.get('active_application'),
            data: seriesData2.map(d => d[1])
          },
          {
            name: this.translationMap.get('inactive_application'),
            data: seriesData3.map(d => d[1])
          },
        ],
        notMerge: false
      }, { devicePixelRatio: this.utility.findPixelRatio() }),
        this.adjustChartHeight();
    }, 100);
  }

  adjustChartHeight() {
    const barWidth = 20 + 5 + 10;
    let data = (this.currentIPCategory.length === 0) ? this.accountedDataMap.size : this.IPCategoryCount.get(this.currentIPCategory);
    const adjustedHeight = (data * 3) * barWidth + 170;
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
    return { max: Math.round((givenHundred * scale)), interval: Math.round((givenHundred * scale)) };
  }

  ngOnDestroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    window.removeEventListener('resize', () => this.resizeChartInDiv(this.chartContainer.nativeElement));
  }
}